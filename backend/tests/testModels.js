const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Initialize the standard OpenAI client but pointed to OpenRouter
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
    'X-Title': process.env.OPENROUTER_APP_NAME || 'Filaha'
  }
});

// The question specifically designed to test Arabic MSA + Agricultural Knowledge
const TEST_PROMPT = `System: You are an agricultural expert. Respond ONLY in Formal Modern Standard Arabic (الفصحى). Never use dialect. Never use English.
User: بناءً على هذه البيانات: درجة الحرارة 34°, الرطوبة 45%, سرعة الرياح 3.2 m/s, إشعاع شمسي 22 MJ/m². المحصول: طماطم في مرحلة النمو. أعطِ توصية بالري بدقة ملم ونسبة ثقة.`;

/**
 * Note on Models: 
 * Many models from your list (like "Gemma 4 31B" or "gpt-oss") are hallucinated/fake 
 * names and do not exist on OpenRouter (or anywhere). 
 * 
 * Below is a curated list of the ACTUAL best FREE models available on OpenRouter 
 * right now that support decent reasoning and Arabic.
 */

const FREE_MODELS_TO_TEST = [
  // ═══════════════════════════════════════════════════════════════
  // TIER S — PRIMARY CHOICES (Arabic MSA + Agriculture + JSON)
  // ═══════════════════════════════════════════════════════════════

  // 1. GOOGLE GEMMA 4 31B — TOP PICK
  // Best formal Arabic MSA in the free tier. Google has dedicated MENA NLP teams.
  // 262k context handles full weather vectors + FAO-56 coefficients + prompt.
  // 18.4B tokens/week ≈ 2.6B/day. At ~4K tokens/call = ~650K calls/day.
  "google/gemma-4-31b-it:free",

  // 2. NVIDIA NEMOTRON 3 SUPER
  // 592B tokens/week = essentially infinite for a 72h hackathon.
  // Enterprise instruction-tuning: follows strict JSON schemas better than most.
  // Strong mathematical reasoning over ET₀ / price data. Slightly less "poetic" MSA than Gemma.
  // UPDATED: 622B → 592B weekly tokens (still massive).
  "nvidia/nemotron-3-super-120b-a12b:free",

  // ═══════════════════════════════════════════════════════════════
  // TIER A — HIGH QUALITY WITH CAVEATS
  // ═══════════════════════════════════════════════════════════════

  // 3. TENCENT HY3 PREVIEW
  // 3.34 TRILLION tokens/week = absolutely unlimited. Massive flagship.
  // WARNING: Test MSA formality first. Chinese labs under-invest in formal Arabic;
  // may drift into simpler structures or subtle dialect leakage.
  "tencent/hy3-preview:free",

  // 4. INCLUSIONAI LING 2.6 1T
  // 1T parameters, "Ling" = language-specialized architecture. 521B tokens/week.
  // WARNING: Unknown provider uptime. Good backup, risky as primary during hackathon.
  "inclusionai/ring-2.6-1t:free",

  // 5. NOUS HERMES 3 405B — QUALITY KING, BUDGET TRAP
  // Fine-tuned Llama 3.1 405B. EXCEPTIONAL Arabic MSA + near-perfect instruction following.
  // WARNING: ~23.5M tokens/week (~3,300 calls at 7K tokens each).
  // Reserve for FINAL DEMO / judge presentations. DO NOT use for daily dev/testing.
  "nousresearch/hermes-3-llama-3.1-405b:free",

  // 6. META LLAMA 3.3 70B INSTRUCT — NEW ENTRY
  // Excellent multilingual performance including Arabic. 70B params = strong reasoning.
  // WARNING: Only 399M tokens/week (~57M/day ≈ 8,000 calls at 7K tokens).
  // Better token budget than Hermes 405B, but still constrained. Use wisely.
  "meta-llama/llama-3.3-70b-instruct:free",

  // ═══════════════════════════════════════════════════════════════
  // TIER B — SOLID BACKUPS
  // ═══════════════════════════════════════════════════════════════

  // 7. OPENAI GPT-OSS 120B
  // Reliable, predictable JSON output. Good multilingual but Arabic is "functional" not "formal".
  // UPDATED: 131B → 147B weekly tokens.
  // Safe choice if Tier S/A are down.
  "openai/gpt-oss-120b:free",

  // 8. OWL ALPHA
  // Unique 1M context window — useful for feeding entire seasonal weather reports or long market data.
  // Unknown Arabic quality. Experimental backup only.
  "openrouter/owl-alpha",

  // 9. Z.AI GLM 4.5 AIR
  // Chinese model (Zhipu AI). Arabic support is historically mediocre; likely awkward MSA register.
  // UPDATED: 81.6B → 84.2B weekly tokens.
  // Use only if better options are unavailable.
  "z-ai/glm-4.5-air:free",

  // 10. MINIMAX M2.5
  // Chinese model — Arabic MSA likely weaker than Google/Meta offerings.
  // UPDATED: 51.8B → 53.3B weekly tokens.
  // Use only if desperate.
  "minimax/minimax-m2.5:free",

  // 11. QWEN3 NEXT 80B A3B INSTRUCT — NEW ENTRY
  // 742M tokens/week, 262k context. Qwen models have decent Arabic but formal MSA register
  // can be inconsistent. Test before relying on it for farmer-facing output.
  "qwen/qwen3-next-80b-a3b-instruct:free",

  // 12. NVIDIA NEMOTRON 3 NANO 30B A3B
  // Same family as Super but smaller (30B). Borderline for complex agri reasoning + formal Arabic together.
  // UPDATED: 37.3B → 39.9B weekly tokens.
  // Good enough for simple irrigation alerts, may struggle with nuanced market analysis.
  "nvidia/nemotron-3-nano-30b-a3b:free",

  // ═══════════════════════════════════════════════════════════════
  // TIER C — EMERGENCY / CONSTRAINED USE
  // ═══════════════════════════════════════════════════════════════

  // 13. OPENAI GPT-OSS 20B
  // Too small for reliable complex reasoning + formal MSA + JSON schema at the same time.
  // UPDATED: 29.2B → 32.3B weekly tokens.
  // Use only if 120B is down and you need a simple alert.
  "openai/gpt-oss-20b:free",

  // 14. GOOGLE GEMMA 4 26B A4B
  // Same family as #1 but only 6.36B tokens/week. You'll hit the limit during active dev.
  // Use sparingly — reserve for specific high-confidence calls.
  "google/gemma-4-26b-a4b-it:free",

  // 15. GOOGLE GEMMA 3 12B
  // Outdated (March 2025), tiny 32k context, only 44.4M tokens/week.
  // Your agricultural prompts with full weather data may not even fit. Last resort.
  "google/gemma-3-12b-it:free",

  // 16. META LLAMA 3.2 3B
  // Far too small for complex agricultural recommendations in formal MSA.
  // UPDATED: 22.4M → 36.8M weekly tokens. Still unusable for FILAHA's needs.
  "meta/llama-3.2-3b-instruct:free",

  // ═══════════════════════════════════════════════════════════════
  // VISION MODELS — PHOTO DIAGNOSIS ONLY (Crop Pest/Disease)
  // These are VLMs for image analysis. Too small for reliable text recommendations.
  // ═══════════════════════════════════════════════════════════════

  // NVIDIA vision model. 14.3B parameters. Better than 1B below but still weak for agri vision.
  // Use for detectionService.analyze() only. Expect lower accuracy than Claude Vision.
  "nvidia/nemotron-nano-12b-2-vl:free",

  // NEW: NVIDIA Llama Nemotron Embed VL 1B V2. Only 1B params + 2.28B tokens/week.
  // Extremely small. Likely unusable for reliable crop diagnosis. Listed for completeness only.
  "nvidia/llama-nemotron-embed-vl-1b-v2:free",

  // ═══════════════════════════════════════════════════════════════
  // EXPLICITLY REMOVED / NOT FREE IN LATEST OPENROUTER CATALOG
  // ═══════════════════════════════════════════════════════════════
  // poolside/laguna-m.1:free     → Removed. Coding-only, poor multilingual.
  // poolside/laguna-xs.2:free    → Removed. Coding-only.
  // sourceful/riverflow-*        → Now PAID ($0.015–$0.075). Removed from free list.
  // black-forest-labs/flux-*     → Now PAID ($0.01–$0.07). Image generation anyway.
  // bytedance/seedream-4.5       → Now PAID ($0.04). Image generation.
  // qwen/qwen3-coder-480b-a35b   → Coder-only. 1.29B tokens, not useful for agri text.
  // liquidai/lfm2.5-1.2b-*       → 1.2B params is tiny. 32k context too small for FAO prompts.
  // venice/uncensored            → 151M tokens, 32k context. "Uncensored" = poor JSON adherence.
  // nvidia/nemotron-3-nano-omni  → No longer listed; replaced by nano-12b-2-vl above.
];

async function testModel(modelId) {
  console.log(`\n⏳ Testing model: \x1b[36m${modelId}\x1b[0m...`);
  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: TEST_PROMPT }],
      max_tokens: 512,
      temperature: 0.3
    });

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
    const content = response.choices[0]?.message?.content?.trim() || "(No content)";
    
    console.log(`✅ \x1b[32mSuccess\x1b[0m (${timeTaken}s)`);
    console.log(`\x1b[90m--------------------------------------------------\x1b[0m`);
    console.log(content);
    console.log(`\x1b[90m--------------------------------------------------\x1b[0m`);
    
    return { model: modelId, status: 'Success', time: timeTaken, response: content };

  } catch (error) {
    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
    
    let errorMsg = error.message;
    if (error.status === 429) errorMsg = "HTTP 429: Rate Limited (Too Many Requests)";
    if (error.status === 404) errorMsg = "HTTP 404: Model Not Found (Invalid ID)";

    console.log(`❌ \x1b[31mFailed\x1b[0m (${timeTaken}s) - ${errorMsg}`);
    
    return { model: modelId, status: 'Failed', time: timeTaken, error: errorMsg };
  }
}

async function runAllTests() {
  console.log("==================================================");
  console.log("🚀 STARTING OPENROUTER FREE MODEL BENCHMARK");
  console.log("==================================================");
  console.log(`Prompt: "${TEST_PROMPT}"\n`);

  const results = [];

  for (const model of FREE_MODELS_TO_TEST) {
    const result = await testModel(model);
    results.push(result);
    
    // Sleep for 2 seconds between requests to help avoid hitting the free tier Rate Limit (429)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n==================================================");
  console.log("📊 FINAL SUMMARY");
  console.log("==================================================");
  
  results.forEach(r => {
    if (r.status === 'Success') {
      console.log(`✅ \x1b[36m${r.model}\x1b[0m - ${r.time}s`);
    } else {
      console.log(`❌ \x1b[36m${r.model}\x1b[0m - ${r.error}`);
    }
  });
}

runAllTests();