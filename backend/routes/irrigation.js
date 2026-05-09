/**
 * Irrigation Routes — MAÏ Service API
 * 
 * Endpoints:
 *   GET  /irrigation/recommend?lat=&lng=&crop=     → Get irrigation recommendation
 *   GET  /irrigation/history?farmId=               → Get irrigation history
 *   POST /irrigation/log                         → Log recommendation to DB
 * 
 * Requires: weatherService, etCalculator, aiTranslator, auth middleware
 */

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const weatherService = require('../services/weatherService');
const etCalculator = require('../services/etCalculator');
const aiTranslator = require('../services/aiTranslator');
const supabase = require('../config/supabase');

/**
 * GET /irrigation/recommend
 * 
 * Query params:
 *   lat (required) — Farm latitude
 *   lng (required) — Farm longitude
 *   crop (optional, default: wheat)
 *   daysAfterPlanting (optional, default: 0)
 * 
 * Returns: { recommendation, waterMm, factors, confidence }
 */
router.get('/recommend', asyncHandler(async (req, res) => {
  const { lat, lng, crop = 'wheat', daysAfterPlanting = 0 } = req.query;
  
  if (!lat || !lng) {
    const error = new Error('lat and lng are required');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const weather = await weatherService.fetchWeather(parseFloat(lat), parseFloat(lng));
  const weatherCheck = weatherService.checkIrrigationWeather(weather);
  
  if (weatherCheck.shouldSkip) {
    return res.json({
      recommendation: checkSkipReason(weatherCheck.reason),
      shouldIrrigate: false,
      waterMm: 0,
      weather: weather.current,
      reason: weatherCheck.reason,
      factors: [],
      confidence: 0.8,
      data_sources: ['open_meteo']
    });
  }
  
  const etResult = etCalculator.calculate(weather, crop);
  
  const contextData = {
    weather: weather.current,
    etResult,
    crop,
    daysAfterPlanting,
    location: { lat: parseFloat(lat), lng: parseFloat(lng) }
  };
  
  let aiResult = null;
  
  try {
    aiResult = await aiTranslator.translate('irrigation', contextData);
  } catch (aiError) {
    console.warn('AI translation failed:', aiError.message);
    aiResult = aiTranslator.getFallbackResponse('irrigation');
  }
  
  res.json({
    recommendation: aiResult.recommendation,
    shouldIrrigate: etResult.shouldIrrigate,
    waterMm: etResult.waterMm,
    waterLitersPerHectare: etResult.waterLitersPerHectare,
    weather: weather.current,
    etResult: { et0: etResult.et0, kc: etResult.kc, etc: etResult.etc, stage: etResult.stage },
    explanation: aiResult.explanation,
    confidence: aiResult.confidence,
    factors: aiResult.factors,
    action_items: aiResult.action_items,
    data_sources: aiResult.data_sources_used
  });
}));

/**
 * GET /irrigation/history?farmId=
 */
router.get('/history', asyncHandler(async (req, res) => {
  const { farmId } = req.query;
  
  if (!farmId) {
    const error = new Error('farmId is required');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const { data, error } = await supabase
    .from('irrigation_logs')
    .select('*')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  
  res.json({
    history: data || [],
    count: data?.length || 0
  });
}));

/**
 * POST /irrigation/log — Log recommendation to DB
 */
router.post('/log', auth.authenticate, asyncHandler(async (req, res) => {
  const { farmId, crop, waterMm, weather, recommendation, confidence } = req.body;
  
  if (!farmId || !waterMm) {
    const error = new Error('farmId and waterMm are required');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const logEntry = {
    farm_id: farmId,
    crop,
    water_mm: waterMm,
    weather_snapshot: weather ? JSON.stringify(weather) : null,
    recommendation,
    confidence,
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('irrigation_logs')
    .insert(logEntry)
    .select()
    .single();
  
  if (error) throw error;
  
  res.json({
    success: true,
    log: data
  });
}));

/**
 * Helper: Map skip reason to Arabic
 */
function checkSkipReason(reason) {
  const reasons = {
    recent_rain: 'لا يوجد ري - أمطار حديثة',
    forecast_rain: 'لا يوجد ري - أمطار متوقعة',
    high_humidity: 'لا يوجد ري - رطوبة عالية'
  };
  return reasons[reason] || 'لا يوجد ري';
}

module.exports = router;