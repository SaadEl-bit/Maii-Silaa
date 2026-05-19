/**
 * testImage.js — Vision Language Model (VLM) Benchmark for Crop Diagnosis
 *
 * Tests models that can ANALYZE images (input: image → output: text diagnosis).
 * This is completely different from image GENERATION models.
 *
 * ⚠️  IMPORTANT NOTE FOR CONTEXT:
 * The original model list in this file (recraft, flux, sourceful/riverflow,
 * seedream) are ALL image GENERATION models — they CREATE images from text.
 * They cannot analyze photos of crops. They have been excluded below.
 *
 * Vision models tested here:
 *  - Claude (Anthropic key) — best quality, already configured
 *  - Free VLMs on OpenRouter (LLaMA Vision, Gemma, Nemotron VL)
 */

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI   = require('openai');
const path     = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ── Clients ────────────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey:  process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
    'X-Title':      process.env.OPENROUTER_APP_NAME  || 'Filaha',
  },
});

// ── Test image (publicly accessible crop disease photo for the benchmark) ─────
// Using a public domain tomato leaf disease image from PlantVillage dataset.
// In production, this will be a Supabase Storage URL from the farmer's upload.
const TEST_IMAGE_URL =
  //'https://static0.backyardbossimages.com/wordpress/wp-content/uploads/2022/07/yellow-curl.jpg?q=50&fit=crop&w=1600&h=900&dpr=1.5' ;
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI0yoYuClnJlI6y-FjeUOEeoRaKPGDbfG6lQ&s' ;
  // 'https://stmaaprodfwsite.blob.core.windows.net/assets/sites/1/261017-Disease1-Eyespot-c-no-credit.jpg' ;

// ── Prompt (same system contract as detectionService.js) ─────────────────────
const SYSTEM_PROMPT =
  'أنت خبير زراعي متخصص في أمراض المحاصيل. حلّل الصورة المرفقة ' +
  'وأعطِ تشخيصًا دقيقًا بالعربية الفصحى. ' +
  'ردّ ONLY as valid JSON (no markdown fences) with this exact schema:\n' +
  '{"diagnosis":"...","severity":"low|medium|high|critical",' +
  '"treatment":"...","confidence":0.0-1.0,"visual_signals":["..."],' +
  '"action_items":["..."]}';

const USER_PROMPT = 'المحصول: طماطم. حلّل الصورة وأعطني التشخيص.';

// ── Vision model cascade ───────────────────────────────────────────────────────
/**
 * Priority-ordered VLM cascade for detectionService.js
 *
 * EXCLUDED (image GENERATION — cannot analyze photos):
 *   recraft/recraft-v4-pro, recraft/recraft-v4, recraft/recraft-v3
 *   sourceful/riverflow-v2-*, black-forest-labs/flux-*, 
 *   bytedance-seed/seedream-4.5
 *
 * These generate images FROM text. They are the opposite of what we need.
 */
const VISION_MODELS = [
  // ─ PRIMARY (Anthropic — your existing key) ─────────────────────────────────
  { id: 'claude-haiku-4-5-20251001', provider: 'anthropic', tier: 'PRIMARY',
    note: 'Best vision quality, cheapest Claude. You already have the key.' },
  { id: 'claude-sonnet-4-6', provider: 'anthropic', tier: 'PRIMARY',
    note: 'Best Claude overall. Use for final hackathon demo if budget allows.' },

  // ─ FREE VLMs via OpenRouter (confirmed from live API 2026-05-08) ───────────
  { id: 'nvidia/nemotron-nano-12b-v2-vl:free', provider: 'openrouter', tier: 'FREE',
    note: 'Only confirmed FREE vision model on OpenRouter right now. (note: v2 not 2)' },

  // ─ CHEAP PAID VLMs (pennies per call — viable for hackathon) ──────────────
  { id: 'google/gemini-2.0-flash-lite-001', provider: 'openrouter', tier: 'PAID-CHEAP',
    note: '$0.075/1M tokens (image). Excellent vision, Google MENA Arabic support.' },
  { id: 'google/gemini-2.5-flash-lite', provider: 'openrouter', tier: 'PAID-CHEAP',
    note: '$0.10/1M tokens. Faster than 2.0, strong Arabic MSA + vision.' },
  { id: 'qwen/qwen3-vl-8b-instruct', provider: 'openrouter', tier: 'PAID-CHEAP',
    note: '$0.08/1M. Alibaba 8B VLM. Decent Arabic, good at structured JSON output.' },
];

// ── Test functions ─────────────────────────────────────────────────────────────
async function testClaude(model) {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: TEST_IMAGE_URL } },
        { type: 'text',  text: SYSTEM_PROMPT + '\n\n' + USER_PROMPT },
      ],
    }],
  });

  const content = response.content[0]?.text;
  if (!content) throw new Error('Empty Claude response');
  return content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
}

async function testOpenRouterVision(model) {
  const response = await openrouter.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: TEST_IMAGE_URL } },
        { type: 'text',      text: SYSTEM_PROMPT + '\n\n' + USER_PROMPT },
      ],
    }],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response');
  return content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
}

async function runTest(entry) {
  console.log(`\n⏳ [${entry.tier}] ${entry.id}`);
  console.log(`   ${entry.note}`);

  const start = Date.now();
  try {
    const raw = entry.provider === 'anthropic'
      ? await testClaude(entry.id)
      : await testOpenRouterVision(entry.id);

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    // Try to parse JSON — check if the model follows the schema
    let parsed = null;
    let jsonValid = false;
    try {
      parsed = JSON.parse(raw);
      jsonValid = ['diagnosis', 'severity', 'confidence', 'treatment'].every(k => k in parsed);
    } catch { /* not JSON */ }

    console.log(`✅ Success (${elapsed}s) | JSON: ${jsonValid ? '✅ valid schema' : '⚠️  not valid JSON'}`);
    console.log('─'.repeat(60));
    console.log(raw.slice(0, 600));
    console.log('─'.repeat(60));

    return { id: entry.id, tier: entry.tier, status: 'Success', elapsed, jsonValid, raw };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    let msg = err.message;
    if (err.status === 429) msg = 'HTTP 429: Rate Limited';
    if (err.status === 404) msg = 'HTTP 404: Model Not Found';
    if (err.status === 400) msg = `HTTP 400: ${err.message.slice(0, 80)}`;

    console.log(`❌ Failed (${elapsed}s) — ${msg}`);
    return { id: entry.id, tier: entry.tier, status: 'Failed', elapsed, error: msg };
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(60));
  console.log('🌿 FILAHA — VISION MODEL BENCHMARK (Crop Diagnosis)');
  console.log('='.repeat(60));
  console.log(`Test image : ${TEST_IMAGE_URL}`);
  console.log(`Task       : Tomato leaf disease diagnosis in Arabic MSA + JSON`);
  console.log(`Models     : ${VISION_MODELS.length} VLMs\n`);

  const results = [];
  for (const entry of VISION_MODELS) {
    const result = await runTest(entry);
    results.push(result);
    await new Promise(r => setTimeout(r, 1500)); // avoid hammering rate limits
  }

  // ── Final ranking ────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('📊  FINAL RESULTS — Best to Worst');
  console.log('='.repeat(60));

  const successes = results.filter(r => r.status === 'Success');
  const failures  = results.filter(r => r.status === 'Failed');

  // Sort: valid JSON first, then by speed
  successes.sort((a, b) => {
    if (a.jsonValid && !b.jsonValid) return -1;
    if (!a.jsonValid && b.jsonValid) return 1;
    return parseFloat(a.elapsed) - parseFloat(b.elapsed);
  });

  let rank = 1;
  for (const r of successes) {
    console.log(`\n${rank++}. ✅ [${r.tier}] ${r.id}`);
    console.log(`   Time: ${r.elapsed}s | JSON schema: ${r.jsonValid ? '✅' : '⚠️  non-JSON text'}`);
  }
  for (const r of failures) {
    console.log(`\n❌ [${r.tier}] ${r.id}`);
    console.log(`   ${r.error}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('💡 Recommendation for detectionService.js:');
  if (successes.length > 0) {
    const best = successes[0];
    console.log(`   Primary model → ${best.id}`);
    if (successes.length > 1) {
      console.log(`   Fallback model → ${successes[1].id}`);
    }
  } else {
    console.log('   No models succeeded. Check API keys and network.');
  }
  console.log('='.repeat(60));
}

main().catch(console.error);