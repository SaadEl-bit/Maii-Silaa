/**
 * AI Translator Service — MAï + SILA + Detection
 *
 * Role: Interface to OpenRouter for AI recommendations in JSON format
 * Dependencies: promptBuilder, msaFallbackTemplates
 *
 * CURRENT PLAN: OpenRouter only (google/gemma-4-31b-it:free).
 * Claude key is kept in .env for future use but is NOT called right now.
 * To re-enable Claude: uncomment the callClaude block inside translate().
 */

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('@openrouter/sdk').default;

require('dotenv').config();

const PROMPT_BUILDER = require('../utils/promptBuilder');
const MSA_FALLBACK = require('../utils/msaFallbackTemplates');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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
 * Send request to AI and get JSON response
 * @param {string} promptType - 'irrigation' | 'market' | 'detection'
 * @param {object} contextData - Data to include in prompt
 * @param {object} options - { forceFallback, temperature, maxTokens }
 * @returns {Promise<object>} Parsed JSON response
 */
async function translate(promptType, contextData, options = {}) {
  const { temperature = 0.1, maxTokens = 1024 } = options;

  const { systemPrompt, userPrompt } = PROMPT_BUILDER[`build${capitalize(promptType)}Prompt`](contextData);

  let result = null;
  const model = process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free';

  // --- Claude disabled for now (key kept in .env for future use) ---
  // if (ANTHROPIC_API_KEY) {
  //   try {
  //     result = await callClaude(systemPrompt, userPrompt, temperature, maxTokens);
  //   } catch (err) {
  //     console.warn('aiTranslator: Claude failed:', err.message);
  //   }
  // }

  // OpenRouter — primary (and currently sole) provider
  if (!result && OPENROUTER_API_KEY) {
    try {
      result = await callOpenRouter(systemPrompt, userPrompt, temperature, maxTokens);
    } catch (error) {
      console.error('aiTranslator: OpenRouter failed:', error.message);
    }
  }

  if (!result) {
    return getFallbackResponse(promptType);
  }

  return {
    ...result,
    model,
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
    system,
    messages: [{ role: 'user', content: user }],
    response_format: { type: 'json_object' }
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
 * Call OpenRouter API
 */
async function callOpenRouter(system, user, temperature, maxTokens) {
  const client = getOpenRouterClient();
  if (!client) throw new Error('No OpenRouter client — check OPENROUTER_API_KEY in .env');

  const model = process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free';

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    // Pass site info as required by OpenRouter's policy
    headers: {
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
      'X-Title': process.env.OPENROUTER_APP_NAME || 'Filaha'
    }
  });

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
      recommendation: MSA_FALLBACK.irrigation.retryLater,
      explanation: MSA_FALLBACK.common.systemError,
      confidence: 0.1,
      factors: [],
      action_items: [],
      data_sources_used: ['fallback']
    },
    market: {
      recommendation: MSA_FALLBACK.market.retryLater,
      explanation: MSA_FALLBACK.common.systemError,
      confidence: 0.1,
      factors: [],
      action_items: [],
      data_sources_used: ['fallback']
    },
    detection: {
      diagnosis: MSA_FALLBACK.detection.retryLater,
      severity: 'unknown',
      treatment: '',
      confidence: 0.1,
      visualSignals: [],
      action_items: [],
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
  callOpenRouter
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = aiTranslator;
}

if (typeof window !== 'undefined') {
  window.aiTranslator = aiTranslator;
}