/**
 * Detection Service — AI Photo Diagnosis (Multi-Model Consensus)
 *
 * Architecture (benchmark-ranked 2026-05-08):
 *   TIER 1: google/gemini-2.5-flash-lite    (3.08s — fast, clean JSON)
 *   TIER 2: qwen/qwen3-vl-8b-instruct       (14.39s — specialist, parallel)
 *   TIER 3: claude-sonnet-4-6               (19.56s — arbitrator, only when T1+T2 disagree)
 *   TIER 4: claude-haiku-4-5-20251001        (5.83s — emergency if T3 fails)
 *
 * Flow:
 *   1. T1 + T2 run in PARALLEL
 *   2. shouldTriggerFallback() checks consensus + confidence
 *   3. If disagreement → T3 (Claude Sonnet) arbitrates with both results as context
 *   4. If T3 fails → T4 (Claude Haiku) as last resort
 *   5. If all fail → MSA static fallback
 *
 * Dependencies: @anthropic-ai/sdk, openai, Supabase
 */

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI    = require('openai');
require('dotenv').config();

const supabase = require('../config/supabase');

// ── Clients ────────────────────────────────────────────────────────────────────
let _anthropic = null;
let _openrouter = null;

function getAnthropic() {
  if (!_anthropic && process.env.ANTHROPIC_API_KEY) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

function getOpenRouter() {
  if (!_openrouter && process.env.OPENROUTER_API_KEY) {
    _openrouter = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey:  process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title':      process.env.OPENROUTER_APP_NAME  || 'Filaha',
      },
    });
  }
  return _openrouter;
}

// ── Model stack (benchmark order 2026-05-08) ──────────────────────────────────
const VISION_STACK = {
  // TIER 1: Fast primary (OpenRouter) — runs first in parallel
  primary: 'google/gemini-2.5-flash-lite',

  // TIER 2: Specialist secondary (OpenRouter) — runs in parallel with T1
  secondary: 'qwen/qwen3-vl-8b-instruct',

  // TIER 3: Arbitrator (Anthropic direct) — ONLY when T1+T2 disagree or uncertain
  fallback: 'claude-sonnet-4-6',

  // TIER 4: Emergency (Anthropic direct) — if T3 fails
  emergency: 'claude-haiku-4-5-20251001',

  // REMOVED: free NVIDIA model dead weight (429 rate-limited in all tests)
};

// ── Prompt ────────────────────────────────────────────────────────────────────
/**
 * System prompt for vision models.
 * Explicitly asks for self-reported confidence score so we can use it
 * in shouldTriggerFallback() without guessing.
 */
const SYSTEM_PROMPT =
  'أنت خبير زراعي متخصص في تشخيص أمراض المحاصيل باستخدام الصور. ' +
  'حلّل الصورة المرفقة وأعطِ تشخيصًا دقيقًا بالعربية الفصحى. ' +
  'قيّم ثقتك في تشخيصك بنفسك: "confidence" يجب أن يعكس يقينك الحقيقي ' +
  '(0.0 = لا أعرف، 1.0 = متأكد تمامًا). لا تبالغ في الثقة. ' +
  'ردّ ONLY as valid JSON (no markdown fences) with this exact schema:\n' +
  '{\n' +
  '  "diagnosis": "وصف دقيق للمرض أو النقص المكتشف",\n' +
  '  "severity": "low|medium|high|critical",\n' +
  '  "treatment": "الخطوات العلاجية التفصيلية",\n' +
  '  "confidence": 0.0-1.0,\n' +
  '  "visual_signals": ["العلامة البصرية 1", "العلامة البصرية 2"],\n' +
  '  "action_items": ["الإجراء 1", "الإجراء 2"]\n' +
  '}';

// ── Core call functions ───────────────────────────────────────────────────────
/**
 * Call a vision model via OpenRouter (T1, T2).
 */
async function callOpenRouterVision(imageUrl, userPrompt, model) {
  const client = getOpenRouter();
  if (!client) throw new Error('OPENROUTER_API_KEY missing');

  const response = await client.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text',      text: SYSTEM_PROMPT + '\n\n' + userPrompt },
      ],
    }],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error(`Empty response from ${model}`);

  return parseVisionJSON(raw, model);
}

/**
 * Call a vision model via Anthropic SDK (T3, T4).
 */
async function callAnthropicVision(imageUrl, userPrompt, model) {
  const client = getAnthropic();
  if (!client) throw new Error('ANTHROPIC_API_KEY missing');

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: imageUrl } },
        { type: 'text',  text: SYSTEM_PROMPT + '\n\n' + userPrompt },
      ],
    }],
  });

  const raw = response.content[0]?.text;
  if (!raw) throw new Error(`Empty response from ${model}`);

  return parseVisionJSON(raw, model);
}

/**
 * Parse and validate the JSON from a VLM response.
 */
function parseVisionJSON(raw, model) {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Invalid JSON from ${model}: ${cleaned.slice(0, 150)}`);
  }

  // Ensure required fields exist with safe defaults
  return {
    diagnosis:     parsed.diagnosis     || 'غير معروف',
    severity:      parsed.severity      || 'unknown',
    treatment:     parsed.treatment     || '',
    confidence:    typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    visual_signals: parsed.visual_signals || [],
    action_items:  parsed.action_items  || [],
    _model: model,
  };
}

// ── Consensus logic ───────────────────────────────────────────────────────────
/**
 * Decide if T3 (Claude arbitrator) should be triggered.
 * Checks: confidence, diagnosis category disagreement, missing visual signals.
 */
function shouldTriggerFallback(primaryResult, secondaryResult) {
  // 1. Low confidence from either model
  if (primaryResult.confidence < 0.75 || secondaryResult.confidence < 0.75) {
    console.warn(`detectionService: low confidence — P:${primaryResult.confidence} S:${secondaryResult.confidence}`);
    return true;
  }

  // 2. Diagnoses fall into different biological categories
  const categories = {
    bacterial: ['بكتيري', 'bacterial', 'speck', 'spot', 'بقعة'],
    fungal:    ['فطري', 'fungal', 'mildew', 'powdery', 'عفن', 'فطر'],
    viral:     ['فيروس', 'viral', 'mosaic', 'curl', 'تجعد', 'فسيفساء'],
    nutrient:  ['نقص', 'deficiency', 'magnesium', 'nitrogen', 'حديد', 'مغنيسيوم'],
  };

  const primaryCat  = detectCategory(primaryResult.diagnosis,  categories);
  const secondaryCat = detectCategory(secondaryResult.diagnosis, categories);

  if (primaryCat && secondaryCat && primaryCat !== secondaryCat) {
    console.warn(`detectionService: category mismatch — P:${primaryCat} S:${secondaryCat}`);
    return true;
  }

  // 3. Visual signals mention curling but diagnoses ignore it
  const allSignals = [
    ...primaryResult.visual_signals,
    ...secondaryResult.visual_signals,
  ].join(' ');
  const hasCurling     = /تجعد|التفاف|curl|twist/i.test(allSignals);
  const mentionsCurling = /تجعد|curl/i.test(primaryResult.diagnosis + secondaryResult.diagnosis);

  if (hasCurling && !mentionsCurling) {
    console.warn('detectionService: curling observed but not diagnosed — triggering arbitrator');
    return true;
  }

  // 4. JSON schema incomplete on either side
  if (!primaryResult.action_items?.length || !secondaryResult.visual_signals?.length) {
    console.warn('detectionService: incomplete schema on one model — triggering arbitrator');
    return true;
  }

  return false;
}

function detectCategory(text, categories) {
  const lower = (text || '').toLowerCase();
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) return cat;
  }
  return null;
}

/**
 * Merge T1 + T2 results when they agree.
 * Uses the higher-confidence result as the base, merges visual_signals & action_items.
 */
function mergeResults(primary, secondary) {
  const base = primary.confidence >= secondary.confidence ? primary : secondary;

  return {
    diagnosis:     base.diagnosis,
    severity:      base.severity,
    treatment:     base.treatment,
    confidence:    (primary.confidence + secondary.confidence) / 2, // averaged
    visual_signals: [...new Set([...primary.visual_signals, ...secondary.visual_signals])],
    action_items:  [...new Set([...primary.action_items,  ...secondary.action_items])],
    _model: `${primary._model} + ${secondary._model}`,
    _consensus: true,
  };
}

// ── Arbitrator prompt (T3) ─────────────────────────────────────────────────────
function buildArbitratorPrompt(userPrompt, primaryResult, secondaryResult) {
  return (
    userPrompt + '\n\n' +
    '--- تقرير النموذج الأول ---\n' +
    `التشخيص: ${primaryResult.diagnosis} | الثقة: ${primaryResult.confidence}\n` +
    `العلامات: ${primaryResult.visual_signals.join(', ')}\n\n` +
    '--- تقرير النموذج الثاني ---\n' +
    `التشخيص: ${secondaryResult.diagnosis} | الثقة: ${secondaryResult.confidence}\n` +
    `العلامات: ${secondaryResult.visual_signals.join(', ')}\n\n` +
    'بناءً على التقريرين أعلاه والصورة، أعطِ التشخيص النهائي الأدق. ' +
    'صحّح أي خطأ إذا كان النموذجان مختلفين. ' +
    'أعطِ ثقتك الحقيقية. ردّ بـ JSON فقط.'
  );
}

// ── Main public API ───────────────────────────────────────────────────────────
/**
 * Analyze a crop photo using the multi-model consensus pipeline.
 *
 * @param {string} photoUrl   - Public URL or Supabase Storage URL
 * @param {object} farmData   - { crop, location, daysAfterPlanting, farmId }
 * @returns {Promise<object>} Diagnosis result
 */
async function analyze(photoUrl, farmData) {
  const { crop, location, daysAfterPlanting } = farmData;

  const userPrompt =
    `المحصول: ${crop}. ` +
    `الموقع: ${location || 'غير محدد'}. ` +
    `عدد الأيام بعد الزراعة: ${daysAfterPlanting || 'غير معروف'}. ` +
    'حلّل الصورة وأعطني التشخيص الكامل.';

  let finalResult = null;
  let pipeline    = 'none';

  // ── STEP 1: Run T1 + T2 in PARALLEL ─────────────────────────────────────────
  console.log('detectionService: running T1 + T2 in parallel…');
  const [t1Result, t2Result] = await Promise.allSettled([
    callOpenRouterVision(photoUrl, userPrompt, VISION_STACK.primary),
    callOpenRouterVision(photoUrl, userPrompt, VISION_STACK.secondary),
  ]);

  const t1 = t1Result.status === 'fulfilled' ? t1Result.value : null;
  const t2 = t2Result.status === 'fulfilled' ? t2Result.value : null;

  if (t1) console.log(`detectionService: T1 (${VISION_STACK.primary}) confidence: ${t1.confidence}`);
  else    console.warn('detectionService: T1 failed —', t1Result.reason?.message);

  if (t2) console.log(`detectionService: T2 (${VISION_STACK.secondary}) confidence: ${t2.confidence}`);
  else    console.warn('detectionService: T2 failed —', t2Result.reason?.message);

  // ── STEP 2: Consensus check ──────────────────────────────────────────────────
  if (t1 && t2 && !shouldTriggerFallback(t1, t2)) {
    finalResult = mergeResults(t1, t2);
    pipeline    = 'T1+T2 consensus';
    console.log('detectionService: consensus reached ✅');
  } else if (t1 && !t2) {
    // Only T1 available — use it if confident, else escalate
    if (t1.confidence >= 0.75) {
      finalResult = t1;
      pipeline    = 'T1 only (T2 failed)';
    }
  } else if (t2 && !t1) {
    if (t2.confidence >= 0.75) {
      finalResult = t2;
      pipeline    = 'T2 only (T1 failed)';
    }
  }

  // ── STEP 3: Escalate to T3 (Claude Sonnet — arbitrator) ─────────────────────
  if (!finalResult) {
    console.log(`detectionService: escalating to T3 (${VISION_STACK.fallback})…`);
    try {
      const arbitratorPrompt = (t1 && t2)
        ? buildArbitratorPrompt(userPrompt, t1, t2)
        : userPrompt;

      finalResult = await callAnthropicVision(photoUrl, arbitratorPrompt, VISION_STACK.fallback);
      pipeline    = 'T3 arbitrator (Claude Sonnet)';
      console.log(`detectionService: T3 confidence: ${finalResult.confidence}`);
    } catch (err) {
      console.error('detectionService: T3 failed —', err.message);
    }
  }

  // ── STEP 4: Emergency — T4 (Claude Haiku) ────────────────────────────────────
  if (!finalResult) {
    console.log(`detectionService: emergency T4 (${VISION_STACK.emergency})…`);
    try {
      finalResult = await callAnthropicVision(photoUrl, userPrompt, VISION_STACK.emergency);
      pipeline    = 'T4 emergency (Claude Haiku)';
    } catch (err) {
      console.error('detectionService: T4 failed —', err.message);
    }
  }

  // ── STEP 5: Hard fallback ─────────────────────────────────────────────────────
  if (!finalResult) {
    console.error('detectionService: all models failed — returning static fallback');
    return {
      diagnosis:      'تعذّر التحليل حالياً. يرجى المحاولة لاحقاً أو التواصل مع خبير زراعي.',
      severity:       'unknown',
      treatment:      '',
      confidence:     0,
      visual_signals: [],
      action_items:   ['تواصل مع خبير زراعي في منطقتك'],
      model:          'fallback',
      pipeline:       'static MSA fallback',
      isFallback:     true,
      farmData,
      timestamp: new Date().toISOString(),
    };
  }

  // ── STEP 6: Enrich and return ─────────────────────────────────────────────────
  return {
    diagnosis:      finalResult.diagnosis,
    severity:       calculateSeverity(finalResult.severity),
    severityLabel:  finalResult.severity,
    treatment:      finalResult.treatment,
    confidence:     finalResult.confidence,
    visual_signals: finalResult.visual_signals,
    action_items:   finalResult.action_items,
    model:          finalResult._model,
    consensus:      finalResult._consensus || false,
    pipeline,
    isFallback:     false,
    farmData,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Upload photo to Supabase Storage, then analyze.
 */
async function analyzeWithUpload(fileBuffer, fileName, farmData) {
  const photoUrl = await uploadPhoto(fileBuffer, fileName, farmData.farmId);

  if (!photoUrl) throw new Error('Failed to upload photo to storage');

  return analyze(photoUrl, farmData);
}

/**
 * Upload photo to Supabase Storage.
 */
async function uploadPhoto(buffer, fileName, farmId) {
  try {
    const filePath = `detections/${farmId}/${Date.now()}_${fileName}`;

    const { error } = await supabase.storage
      .from('photos')
      .upload(filePath, buffer, { contentType: 'image/jpeg', upsert: false });

    if (error) {
      console.error('detectionService: upload error —', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error('detectionService: upload failed —', err.message);
    return null;
  }
}

/**
 * Map severity string to numeric score.
 */
function calculateSeverity(severityStr) {
  const scores = { low: 0.25, medium: 0.50, high: 0.75, critical: 1.0 };
  return scores[severityStr?.toLowerCase()] || 0;
}

/**
 * Get hardcoded treatment suggestion by diagnosis keyword.
 * Used as a last-resort supplement when AI treatment is empty.
 */
function getTreatment(diagnosis) {
  const lower = (diagnosis || '').toLowerCase();
  if (/فطر|fungal|mildew/i.test(lower))      return 'مبيد فطري — أزِل الأجزاء المصابة';
  if (/حشر|pest|آفة/i.test(lower))            return 'مبيد حشرات — عالِج فورًا';
  if (/نقص|deficiency/i.test(lower))          return 'سماد — أضف العنصر الناقص';
  if (/فيروس|viral|mosaic/i.test(lower))      return 'لا علاج للفيروس — أزِل النبتة المصابة';
  if (/سليم|healthy/i.test(lower))            return 'لا معالجة مطلوبة';
  return 'استشر خبيرًا زراعيًا';
}

/**
 * Save detection result to database.
 */
async function saveDetection(farmId, result) {
  try {
    const { data, error } = await supabase
      .from('detections')
      .insert({
        farm_id:      farmId,
        photo_url:    result.farmData?.photoUrl || '',
        diagnosis:    result.diagnosis,
        diagnosis_type: 'other',
        severity:     result.severityLabel || 'low',
        action_text:  result.treatment,
        confidence:   result.confidence,
        confirmed:    false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('detectionService: save error —', err.message);
    return null;
  }
}

// ── Exports ───────────────────────────────────────────────────────────────────
const detectionService = {
  analyze,
  analyzeWithUpload,
  uploadPhoto,
  getTreatment,
  saveDetection,
  // Exposed for testing/debugging
  VISION_STACK,
  shouldTriggerFallback,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = detectionService;
}

if (typeof window !== 'undefined') {
  window.detectionService = detectionService;
}