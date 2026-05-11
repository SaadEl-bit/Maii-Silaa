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
  "google/gemma-3-12b-it:free",
  "openai/gpt-oss-120b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-20b:free",
  "minimax/minimax-m2.5:free"
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

  const fullPrompt = PROMPT_BUILDER[`build${capitalize(promptType)}Prompt`](contextData);
  const systemPrompt = "أنت خبير زراعي ذكي. يجب أن تكون جميع إجاباتك بتنسيق JSON صالح ومطابق تماماً للمطلوب.";
  const userPrompt = fullPrompt;

  let result = null;
  let modelUsed = null;

  // Try Claude as fallback when OpenRouter fails
  if (!result && ANTHROPIC_API_KEY) {
    try { 
      result = await callClaude(systemPrompt, userPrompt, temperature, maxTokens);
      modelUsed = 'claude-3-5-haiku-20241022';
    } catch (e) {
      console.warn('aiTranslator: Claude fallback failed:', e.message);
    }
  }

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
        const skip = error.status >= 400 || 
                     (error.message && (error.message.includes('429') || error.message.includes('404') || error.message.includes('500') || error.message.includes('400')));
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
    return getFallbackResponse(promptType, contextData);
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
 * Get fallback response when AI is unavailable - returns useful recommendations
 */
function getFallbackResponse(promptType, contextData = {}) {
  const fallbacks = {
    irrigation: (ctx) => {
      const etc = ctx?.etResult?.etc || ctx?.etc || 5;
      const temp = ctx?.weather?.temp || 25;
      const humidity = ctx?.weather?.humidity || 60;
      
      let rec = '';
      let action = [];
      
      if (etc > 6) {
        rec = 'يُنصح بالري اليوم نظراً لاحتياجات الماء العالية للمحصول.';
        action = ['أجرِ الري في الصباح الباكر', 'استخدم نظام التنقيط لتوفير الماء', 'تحقق من رطوبة التربة قبل الري'];
      } else if (etc > 3) {
        rec = 'ري معتدل مطلوب اليوم.';
        action = ['أجرِ الري في الصباح', 'انتبه لظروف الطقس'];
      } else {
        rec = 'لا يوجد ري ضروري اليوم.';
        action = ['تحقق من التربة قبل الري', 'راقب الطقس'];
      }
      
      return {
        recommendation: rec,
        explanation: `بناءً على ET₀ = ${etc.toFixed(1)} مم/يوم ودرجة الحرارة ${temp}°C ورطوبة ${humidity}%.`,
        confidence: 0.7,
        factors: [
          { factor: 'et0', weight: 0.5, value: etc.toFixed(1) },
          { factor: 'temperature', weight: 0.3, value: temp },
          { factor: 'humidity', weight: 0.2, value: humidity }
        ],
        action_items: action,
        data_sources_used: ['open_meteo', 'fao_56_fallback']
      };
    },
    market: (ctx) => {
      const price = ctx?.price?.current || 0;
      const trend = ctx?.price?.trend || 'stable';
      
      let rec = trend === 'up' ? 'السعر في ارتفاع - يُنصح بالانتظار.' : 
                trend === 'down' ? 'السعر منخفض - يُنصح بالبيع الآن.' : 
                'السعر مستقر.';
      
      return {
        recommendation: rec,
        explanation: `السعر الحالي ${price} درهم. الاتجاه: ${trend}.`,
        confidence: 0.6,
        factors: [],
        action_items: ['راقب الأسعار بانتظام', 'قارن بين plusieurs تجار'],
        data_sources_used: ['price_seed_fallback']
      };
    },
    detection: () => ({
      diagnosis: 'تعذر التحليل - تأكد من اتصال الإنترنت وحاول مرة أخرى.',
      severity: 'unknown',
      treatment: 'حاول رفع صورة أوضح مع إضاءة جيدة.',
      confidence: 0.1,
      visualSignals: [],
      action_items: ['تحقق من جودة الصورة', 'حاول في إضاءة أفضل'],
      data_sources_used: ['fallback']
    })
  };
  
  const fallbackFn = fallbacks[promptType] || fallbacks.irrigation;
  const result = typeof fallbackFn === 'function' ? fallbackFn(contextData) : fallbackFn;
  
  return {
    ...result,
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