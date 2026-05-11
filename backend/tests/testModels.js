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

const REAL_PROMPT = `أنت مهندس زراعي رقمي في منصة "فلاحة" للذكاء الزراعي الأفريقي.

ROLE: You are Filaha's irrigation advisor (MAÏ module).
TASK: Give the farmer a clear irrigation recommendation in Modern Standard Arabic (MSA / الفصحى).

FARM DATA:
- Crop: Tomato
- Growth stage: Initial
- Country: MA
- Field Size: 5 hectares

WEATHER TODAY:
- Temperature: 18.8°C
- Humidity: 59%
- Wind speed: 5.4 m/s
- Rain today: 0 mm
- Solar radiation: 425 W/m²

ET CALCULATION:
- ET₀ (reference): 3.32 mm/day
- Kc (crop coefficient): 0.6
- ETc (crop-specific): 1.99 mm/day
- Should irrigate: false
- Water needed: 2 mm (99,460 L/day for 5 hectares)

RULES:
1. Respond ONLY in valid JSON (no markdown, no fences).
2. All text fields (recommendation, explanation, action_items) MUST be in Modern Standard Arabic (MSA / الفصحى). Never use Darija or dialect.
3. Confidence must be a number between 0.0 and 1.0.
4. List ALL data sources you used in data_sources_used[].

REQUIRED JSON FORMAT:
{
  "recommendation": "string (MSA — main advice)",
  "explanation": "string (MSA — why this advice)",
  "confidence": 0.0,
  "factors": [{"factor": "name", "weight": 0.0, "value": 0}],
  "action_items": ["خطوة 1", "خطوة 2"],
  "data_sources_used": ["open_meteo", "fao_56"]
}`;


/**
 * Note on Models: 
 * Many models from your list (like "Gemma 4 31B" or "gpt-oss") are hallucinated/fake 
 * names and do not exist on OpenRouter (or anywhere). 
 * 
 * Below is a curated list of the ACTUAL best FREE models available on OpenRouter 
 * right now that support decent reasoning and Arabic.
 */

const FREE_MODELS_TO_TEST = [
  "google/gemma-3-12b-it:fre",
  "openai/gpt-oss-120b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-20b:free",
  "minimax/minimax-m2.5:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];

async function testModel(modelId) {
  console.log(`\n⏳ Testing model: \x1b[36m${modelId}\x1b[0m...`);
  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: REAL_PROMPT }],
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
  console.log(`Prompt: "${REAL_PROMPT}"\n`);

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