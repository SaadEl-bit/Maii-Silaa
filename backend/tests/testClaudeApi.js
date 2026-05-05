/**
 * Smoke test: Anthropic Claude API — MSA agronomy prompt, strict JSON validation.
 * Usage: from `backend/`, copy `.env.example` to `.env`, set ANTHROPIC_API_KEY, then:
 *   node tests/testClaude.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-haiku-20241022';

const SYSTEM_PROMPT = `You are Filaha, an ethical agricultural AI advisor for African smallholders.
Rules:
- Use Modern Standard Arabic (MSA / العربية الفصحى) for all Arabic text. Never use dialect.
- Be concise, factual, and transparent.
- Always follow the exact JSON format requested by the user.
- Never wrap JSON in markdown code fences.`;

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.startsWith('sk-ant')) {
    console.error('❌ [testClaude] Invalid or missing ANTHROPIC_API_KEY in .env');
    console.error('   Expected format: sk-ant-api03-...');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const userPayload = `Respond ONLY with a single JSON object. Do NOT use markdown code fences.
Required JSON structure:
{
  "summary_ms_ar": "string: one sentence irrigation hint in Modern Standard Arabic (العربية الفصحى)",
  "summary_fr": "string: one sentence in French",
  "explainability_note_en": "string: one sentence explaining WHY this advice was given, in English",
  "weather_assumption_en": "string: what weather data you assumed, in English",
  "confidence_score": number between 0.0 and 1.0
}

Context: tomato crop, growth stage mid-season, light water stress, location: Marrakech region Morocco.`;

  console.log('🚀 [testClaude] Sending request to Claude...\n');

  const started = Date.now();

  let message;
  try {
    message = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      temperature: 0.2, // Lower = more deterministic, good for JSON
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPayload }],
    });
  } catch (err) {
    console.error('❌ [testClaude] API request failed:');
    console.error('   Status:', err.status);
    console.error('   Error:', err.error?.error?.message || err.message);
    
    // Common error hints
    if (err.status === 401) console.error('   💡 Hint: Check your ANTHROPIC_API_KEY');
    if (err.status === 429) console.error('   💡 Hint: Rate limit hit. Wait a moment.');
    if (err.status === 529) console.error('   💡 Hint: Claude is overloaded. Retry in a few seconds.');
    
    process.exit(1);
  }

  const latencyMs = Date.now() - started;
  const textBlock = message.content.find((b) => b.type === 'text');
  let raw = textBlock?.text?.trim() || '';

  // Strip markdown fences if Claude ignored instructions
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    raw = fenceMatch[1].trim();
    console.log('⚠️  [testClaude] Claude wrapped JSON in markdown. Stripped fences.\n');
  }

  console.log('--- Claude Response ---');
  console.log('Model:', MODEL);
  console.log('Latency:', `${latencyMs}ms`);
  console.log('Stop reason:', message.stop_reason);
  console.log('Input tokens:', message.usage?.input_tokens);
  console.log('Output tokens:', message.usage?.output_tokens);
  
  // Rough cost estimate (Haiku: $0.80 / 1M input, $4.00 / 1M output)
  const inputCost = (message.usage?.input_tokens || 0) * 0.80 / 1e6;
  const outputCost = (message.usage?.output_tokens || 0) * 4.00 / 1e6;
  console.log('Est. cost:', `$${(inputCost + outputCost).toFixed(6)}`);
  console.log('------------------------\n');

  console.log('--- Raw text ---');
  console.log(raw);
  console.log('----------------\n');

  // Parse and validate
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('❌ [testClaude] JSON parse failed:', err.message);
    console.error('   Raw response was:', raw.substring(0, 200));
    process.exit(1);
  }

  // Validate required keys
  const requiredKeys = ['summary_ms_ar', 'summary_fr', 'explainability_note_en', 'weather_assumption_en', 'confidence_score'];
  const missing = requiredKeys.filter(k => !(k in parsed));
  
  if (missing.length > 0) {
    console.error('❌ [testClaude] Missing required keys:', missing.join(', '));
    console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
    process.exit(1);
  }

  // Validate confidence score
  if (typeof parsed.confidence_score !== 'number' || parsed.confidence_score < 0 || parsed.confidence_score > 1) {
    console.error('❌ [testClaude] confidence_score must be a number between 0 and 1');
    process.exit(1);
  }

  // Validate Arabic text is actually Arabic (basic check)
  const arabicRegex = /[\u0600-\u06FF]/;
  if (!arabicRegex.test(parsed.summary_ms_ar)) {
    console.warn('⚠️  [testClaude] summary_ms_ar does not contain Arabic script. Possible dialect or wrong language.');
  }

  console.log('✅ [testClaude] All validations passed!\n');
  console.log('--- Parsed JSON ---');
  console.log(JSON.stringify(parsed, null, 2));

  // Pretty-print the MSA text for quick review
  console.log('\n--- MSA Summary ---');
  console.log(parsed.summary_ms_ar);
  console.log('--- French Summary ---');
  console.log(parsed.summary_fr);
}

main();