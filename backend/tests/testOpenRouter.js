/**
 * Smoke test: OpenRouter chat completions (e.g. free Gemma) — same narrative contract as Claude test.
 * Usage: from `backend/`, set OPENROUTER_API_KEY in `.env`, then:
 *   npm run test:openrouter
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-2-9b-it:free';

const SYSTEM_PROMPT = `You are an agricultural advisor for African smallholders. Reply with factual, ethical, concise guidance.
When the user asks for Arabic text, use Modern Standard Arabic (MSA), not dialect.
Always follow the response format requested in the user message.`;

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.error('[testOpenRouter] Missing OPENROUTER_API_KEY in .env (see .env.example).');
    process.exit(1);
  }

  const userPayload = `Respond ONLY with a single JSON object (no markdown fence), keys:
{
  "summary_ms_ar": string (one sentence irrigation hint in Modern Standard Arabic),
  "summary_fr": string (one sentence in French),
  "explainability_note_en": string (why this advice, one sentence in English for logs),
  "weather_assumption_en": string (what data you assumed)
}
Context: tomato crop, growth stage mid-season, light water stress.`;

  const body = {
    model: MODEL,
    max_tokens: 512,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPayload },
    ],
  };

  const started = Date.now();

  let res;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
        'X-Title': process.env.OPENROUTER_APP_NAME || 'Filaha',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('[testOpenRouter] Network error:', err.message || err);
    process.exit(1);
  }

  const ms = Date.now() - started;
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error('[testOpenRouter] HTTP', res.status, json.error || json);
    process.exit(1);
  }

  const raw =
    json.choices &&
    json.choices[0] &&
    json.choices[0].message &&
    json.choices[0].message.content
      ? json.choices[0].message.content
      : '';

  console.log('--- OpenRouter smoke test ---');
  console.log('Model:', MODEL);
  console.log('Latency_ms:', ms);
  console.log('Usage:', json.usage || '(not reported)');
  console.log('--- Raw text ---');
  console.log(raw);

  try {
    const parsed = JSON.parse(String(raw).trim());
    console.log('--- Parsed JSON OK ---');
    console.log(JSON.stringify(parsed, null, 2));
  } catch {
    console.warn('[testOpenRouter] Response was not valid JSON; model may need a stricter prompt.');
  }
}

main();
