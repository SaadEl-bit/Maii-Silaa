/**
 * Detection Service — AI Photo Diagnosis
 * 
 * Role: Analyze crop photos → diagnosis + treatment
 * Dependencies: aiTranslator, Supabase Storage
 */

const aiTranslator = require('./aiTranslator');
const supabase = require('../config/supabase');

/**
 * Analyze crop photo
 * @param {string} photoUrl - URL or base64
 * @param {object} farmData - { crop, location, daysAfterPlanting }
 * @returns {Promise<object>} diag nosis result
 */
async function analyze(photoUrl, farmData) {
  const { crop, location, daysAfterPlanting } = farmData;
  
  const contextData = {
    crop,
    location,
    daysAfterPlanting,
    photoUrl
  };
  
  const result = await aiTranslator.translate('detection', contextData);
  
  const parsed = parseDetectionResult(result);
  const severity = calculateSeverity(parsed.severity);
  
  return {
    ...parsed,
    severity,
    confidence: result.confidence || 0.5,
    model: result.model,
    isFallback: result.isFallback,
    farmData,
    timestamp: new Date().toISOString()
  };
}

/**
 * Analyze with file upload to Supabase Storage first
 */
async function analyzeWithUpload(fileBuffer, fileName, farmData) {
  const photoUrl = await uploadPhoto(fileBuffer, fileName, farmData.farmId);
  
  if (!photoUrl) {
    throw new Error('Failed to upload photo');
  }
  
  return analyze(photoUrl, farmData);
}

/**
 * Upload photo to Supabase Storage
 */
async function uploadPhoto(buffer, fileName, farmId) {
  try {
    const filePath = `detections/${farmId}/${Date.now()}_${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (error) {
      console.error('Detection upload error:', error);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Photo upload failed:', error);
    return null;
  }
}

/**
 * Parse AI response to diagnosis
 */
function parseDetectionResult(result) {
  return {
    diagnosis: result.diagnosis || 'غير معروف',
    severity: result.severity || 'unknown',
    treatment: result.treatment || '',
    visualSignals: result.visual_signals || result.visualSignals || [],
    action_items: result.action_items || result.actionItems || [],
    confidence: result.confidence || 0.5,
    data_sources_used: result.data_sources_used || ['ai_vision']
  };
}

/**
 * Calculate severity score
 */
function calculateSeverity(severityStr) {
  const scores = {
    low: 0.25,
    medium: 0.50,
    high: 0.75,
    critical: 1.0
  };
  
  return scores[severityStr?.toLowerCase()] || 0;
}

/**
 * Get treatment recommendations
 */
function getTreatment(diagnosis) {
  const treatments = {
    fungus: 'م fungicide - remove affected parts',
    pest: 'مبيد حشرات - treat immediately',
    deficiency: 'سماد nitrogen - apply fertilizer',
    healthy: 'لا معالجة مطلوبة',
    unknown: 'استشر خبيرًا زراعيا'
  };
  
  return treatments[diagnosis?.toLowerCase()] || treatments.unknown;
}

/**
 * Save detection to database
 */
async function saveDetection(farmId, result) {
  try {
    const { data, error } = await supabase
      .from('detections')
      .insert({
        farm_id: farmId,
        diagnosis: result.diagnosis,
        severity: result.severity,
        confidence: result.confidence,
        treatment: result.treatment,
        photo_url: result.photoUrl,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Save detection error:', error);
    return null;
  }
}

const detectionService = {
  analyze,
  analyzeWithUpload,
  uploadPhoto,
  getTreatment,
  saveDetection
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = detectionService;
}

if (typeof window !== 'undefined') {
  window.detectionService = detectionService;
}