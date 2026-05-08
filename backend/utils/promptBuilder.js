// Builds structured LLM prompts with agronomy context and ethical rules.

/**
 * Build a prompt for the MAÏ irrigation recommendation.
 * Gives Claude all the data it needs to make a decision.
 */
function buildIrrigationPrompt({ crop, stage, weather, etResult, country }) {
  return `أنت مهندس زراعي رقمي في منصة "فلاحة" للذكاء الزراعي الأفريقي.

ROLE: You are Filaha's irrigation advisor (MAÏ module).
TASK: Give the farmer a clear irrigation recommendation in Modern Standard Arabic (MSA / الفصحى).

FARM DATA:
- Crop: ${crop}
- Growth stage: ${stage}
- Country: ${country || 'MA'}

WEATHER TODAY:
- Temperature: ${weather.temp}°C
- Humidity: ${weather.humidity}%
- Wind speed: ${weather.wind} m/s
- Rain today: ${weather.rain} mm
- Solar radiation: ${weather.solar || 'N/A'} MJ/m²

ET CALCULATION:
- ET₀ (reference): ${etResult.eto} mm/day
- ETc (crop-specific): ${etResult.etc} mm/day
- Should irrigate: ${etResult.shouldIrrigate}
- Water needed: ${etResult.waterMm} mm
- Irrigation duration: ${etResult.waterHours} hours

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
}

/**
 * Build a prompt for the SILA sell/hold recommendation.
 */
function buildMarketPrompt({ crop, currentPrice, priceHistory, storageLife, country }) {
  return `أنت مستشار أسواق زراعية رقمي في منصة "فلاحة".

ROLE: You are Filaha's market advisor (SILA module).
TASK: Tell the farmer whether to sell now or wait, in Modern Standard Arabic.

MARKET DATA:
- Crop: ${crop}
- Country: ${country || 'MA'}
- Current price: ${currentPrice.price_per_kg} ${currentPrice.currency}/kg
- Market: ${currentPrice.market_name}
- Remaining shelf life: ${storageLife} days

PRICE HISTORY (last entries):
${priceHistory.map(p => `  - ${p.date}: ${p.price_per_kg} ${p.currency}/kg (${p.market_name})`).join('\n')}

RULES:
1. Respond ONLY in valid JSON (no markdown, no fences).
2. All text fields MUST be in Modern Standard Arabic (MSA). Never Darija.
3. Confidence must be 0.0–1.0.
4. Consider shelf life — if the crop will expire soon, recommend selling.

REQUIRED JSON FORMAT:
{
  "recommendation": "string (MSA — sell now or wait)",
  "explanation": "string (MSA — why)",
  "confidence": 0.0,
  "factors": [{"factor": "name", "weight": 0.0, "value": 0}],
  "action_items": ["خطوة 1", "خطوة 2"],
  "data_sources_used": ["source1", "source2"]
}`;
}

/**
 * Build a prompt for photo-based crop diagnosis.
 */
function buildDiagnosisPrompt({ crop, photoDescription, country }) {
  return `أنت طبيب نباتات رقمي في منصة "فلاحة".

ROLE: You are Filaha's crop doctor (Detection module).
TASK: Diagnose the crop issue from the photo description and recommend treatment in MSA.

FARM DATA:
- Crop: ${crop}
- Country: ${country || 'MA'}
- Photo observation: ${photoDescription}

RULES:
1. Respond ONLY in valid JSON (no markdown).
2. All text in Modern Standard Arabic (MSA). Never Darija.
3. Confidence 0.0–1.0.

REQUIRED JSON FORMAT:
{
  "recommendation": "string (MSA — diagnosis + treatment)",
  "explanation": "string (MSA — what visual signals indicate this)",
  "confidence": 0.0,
  "factors": [{"factor": "name", "weight": 0.0, "value": 0}],
  "action_items": ["خطوة 1", "خطوة 2"],
  "data_sources_used": ["source1"]
}`;
}

module.exports = {
  buildIrrigationPrompt,
  buildMarketPrompt,
  buildDiagnosisPrompt,
};