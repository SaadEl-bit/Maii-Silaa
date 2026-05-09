/**
 * AI Translator/Mind/Service — MAï + SILA + Detection
 *
 * Role: Interface to OpenRouter for AI recommendations in JSON format
 * Dependencies: promptBuilder, msaFallbackTemplates
 *
 * CURRENT PLAN: OpenRouter only.
 * Models are tried in priority order (benchmark-ranked). On 429/404 the next
 * model in the list is tried automatically. Claude key is kept in .env for
 * future use but is NOT active. To re-enable: uncomment callClaude block.
 */

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

require('dotenv').config();

const PROMPT_BUILDER = require('../utils/promptBuilder');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Priority-ordered model cascade (benchmark: 2026-05-08, Arabic MSA + Agriculture).
 * aiTranslator.js will try each in order and skip to the next on 429 / 404 / empty.
 * If OPENROUTER_MODEL is set in .env, it is prepended and tried first.
 *
 * Tier S  — Preferred (best Arabic MSA + scientific reasoning + JSON)
 * Tier A  — Proven in benchmark test
 * Tier B  — Backups (connected but some returned empty in test)
 * Tier C  — Emergency (too small or invalid in current catalog)
 * Vision  — detectionService.js only, NOT used for text prompts
 */
const MODEL_PRIORITY_LIST = [
  // ─ TIER S ———————————————————————————─
  'google/gemma-4-31b-it:free',               // #1 paper-best, 429 during heavy traffic
  'nvidia/nemotron-3-super:free',             // #2 enterprise JSON, unlimited tokens
  // ─ TIER A (BENCHMARK PROVEN) ———————————─
  'minimax/minimax-m2.5:free',               // 🏆 Benchmark WINNER (FAO-56 math, full tables)
  'openai/gpt-oss-120b:free',               // Benchmark #2: 6.25s, 92% conf, clean MSA
  'openai/gpt-oss-20b:free',                // Benchmark #3: acceptable, 92% conf
  // ─ TIER A (HIGH QUALITY, CAVEATS) ——————─
  'tencent/hy3-preview:free',               // Unlimited tokens — returned empty in test, retry-worthy
  'nousresearch/hermes-3-llama-3.1-405b:free', // Best MSA quality, LOW token budget
  'meta-llama/llama-3.3-70b-instruct:free', // Strong multilingual, limited budget
  // ─ TIER B (SOLID BACKUPS) ——————————─
  'openrouter/owl-alpha:free',              // 1M context window, unknown Arabic quality
  'z-ai/glm-4.5-air:free',                 // Connected, returned empty in test — worth retry
  'qwen/qwen3-next-80b-a3b-instruct:free', // 429 in test, decent Arabic when available
  'nvidia/nemotron-3-nano-30b-a3b:free',   // Connected, returned empty in test — worth retry
  // ─ TIER C (EMERGENCY) ————————————─
  'google/gemma-4-26b-a4b-it:free',        // Same family as #1, very limited tokens/week
  'google/gemma-3-12b-it:free',            // Outdated, tiny context
  'meta-llama/llama-3.2-3b-instruct:free', // Too small for agri + MSA + JSON together
];

// NOTE: Vision models are managed entirely by detectionService.js (its own VISION_STACK).
// aiTranslator.js handles text-only prompts: irrigation, market, community.

let anthropicClient = null;
let openrouterClient = null;

function getAnthropicClient() {
  if (!anthropicClient && ANTHROPIC_API_KEY) {
    anthropicClient = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function getOpenRouterClient() {
  if (!openrouterClient && OPENROUTER_API_KEY) {
    openrouterClient = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENROUTER_API_KEY
    });
  }
  return openrouterClient;
}

/**
 * Send request to AI and get JSON response.
 * Automatically tries models in MODEL_PRIORITY_LIST order.
 * Skips to next model on 429 (rate limit) or 404 (invalid ID).
 * @param {string} promptType - 'irrigation' | 'market' | 'detection'
 * @param {object} contextData - Data to include in prompt
 * @param {object} options - { forceFallback, temperature, maxTokens }
 * @returns {Promise<object>} Parsed JSON response
 */
async function translate(promptType, contextData, options = {}) {
  const { temperature = 0.1, maxTokens = 1024 } = options;

  const { systemPrompt, userPrompt } = PROMPT_BUILDER[`build${capitalize(promptType)}Prompt`](contextData);

  let result = null;
  let modelUsed = null;

  // Claude is disabled (key kept in .env for future use)
  // if (ANTHROPIC_API_KEY) {
  //   try { result = await callClaude(systemPrompt, userPrompt, temperature, maxTokens); } catch (e) {}
  // }

  // Build the cascade: env override first, then the full priority list
  const envModel = process.env.OPENROUTER_MODEL;
  const cascade = envModel
    ? [envModel, ...MODEL_PRIORITY_LIST.filter(m => m !== envModel)]
    : MODEL_PRIORITY_LIST;

  if (!result && OPENROUTER_API_KEY) {
    for (const model of cascade) {
      try {
        result = await callOpenRouter(systemPrompt, userPrompt, temperature, maxTokens, model);
        modelUsed = model;
        break; // success — stop cascade
      } catch (error) {
        const skip = error.status === 429 || error.status === 404 ||
                     (error.message && (error.message.includes('429') || error.message.includes('404')));
        if (skip) {
          console.warn(`aiTranslator: skipping ${model} (${error.status || error.message.slice(0, 40)})`);
          continue;
        }
        console.error(`aiTranslator: non-retryable error on ${model}:`, error.message);
        break;
      }
    }
  }

  if (!result) {
    return getFallbackResponse(promptType);
  }

  return {
    ...result,
    model: modelUsed,
    isFallback: false
  };
}

/**
 * Call Anthropic Claude API
 */
async function callClaude(system, user, temperature, maxTokens) {
  const client = getAnthropicClient();
  if (!client) throw new Error('No Anthropic client');
  
  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: maxTokens,
    temperature,
    system: system + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown fences.',
    messages: [{ role: 'user', content: user }]
    // Note: Anthropic does not support response_format — JSON enforced via system prompt
  });
  
  const content = response.content[0]?.text;
  if (!content) throw new Error('Empty Claude response');
  
  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Invalid JSON from Claude');
  }
}

/**
 * Call OpenRouter API with a specific model.
 * @param {string} model - The OpenRouter model ID to use
 */
async function callOpenRouter(system, user, temperature, maxTokens, model) {
  const client = getOpenRouterClient();
  if (!client) throw new Error('No OpenRouter client — check OPENROUTER_API_KEY in .env');

  const response = await client.chat.completions.create(
    {
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    },
    {
      // OpenRouter attribution headers — passed as SDK request options, not body keys
      headers: {
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_APP_NAME || 'Filaha'
      }
    }
  );

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty OpenRouter response');

  // Strip markdown fences if model wraps JSON in ```json ... ```
  const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Invalid JSON from OpenRouter — raw: ' + cleaned.slice(0, 200));
  }
}

/**
 * Get fallback response when AI is unavailable
 */
function getFallbackResponse(promptType) {
  const fallbacks = {
    irrigation: {
      recommendation: 'يرجى المحاولة لاحقاً.',
      explanation: 'عذراً، لم نتمكن من حساب التوصية الآن.',
      confidence: 0.1,
      factors: [],
      action_items: ['تحقق من الاتصال وحاول مرة أخرى.'],
      data_sources_used: ['fallback']
    },
    market: {
      recommendation: 'يرجى المحاولة لاحقاً.',
      explanation: 'عذراً، لم نتمكن من حساب التوصية الآن.',
      confidence: 0.1,
      factors: [],
      action_items: ['تحقق من الاتصال وحاول مرة أخرى.'],
      data_sources_used: ['fallback']
    },
    detection: {
      diagnosis: 'يرجى المحاولة لاحقاً.',
      severity: 'unknown',
      treatment: 'عذراً، لم نتمكن من التشخيص الآن.',
      confidence: 0.1,
      visualSignals: [],
      action_items: ['تحقق من الاتصال وحاول مرة أخرى.'],
      data_sources_used: ['fallback']
    }
  };
  
  return {
    ...fallbacks[promptType] || fallbacks.irrigation,
    model: 'fallback',
    isFallback: true
  };
}

/**
 * Validate JSON response matches expected schema
 * @param {object} response
 * @param {string} type
 * @returns {object} { valid, errors }
 */
function validateResponse(response, type) {
  const schemas = {
    irrigation: ['recommendation', 'explanation', 'confidence', 'factors', 'action_items', 'data_sources_used'],
    market: ['recommendation', 'explanation', 'confidence', 'factors', 'action_items', 'data_sources_used'],
    detection: ['diagnosis', 'severity', 'treatment', 'confidence', 'visualSignals', 'action_items']
  };
  
  const required = schemas[type] || [];
  const errors = required.filter(field => !response[field]);
  
  return {
    valid: errors.length === 0,
    errors,
    missing: errors
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const aiTranslator = {
  translate,
  validateResponse,
  callClaude,
  callOpenRouter,
  getFallbackResponse
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = aiTranslator;
}

if (typeof window !== 'undefined') {
  window.aiTranslator = aiTranslator;
}