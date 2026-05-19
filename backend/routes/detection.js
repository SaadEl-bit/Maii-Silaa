/**
 * Detection Routes — AI Photo Diagnosis API
 * 
 * Endpoints:
 *   POST /detection/analyze     → Analyze uploaded photo
 *   GET  /detection/history    → Get detection history for farm
 * 
 * Requires: auth (farmer or distributor)
 */

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { requireFarmer } = require('../middleware/roleCheck');
const { asyncHandler } = require('../middleware/errorHandler');
const detectionService = require('../services/detectionService');
const supabase = require('../config/supabase');

/**
 * POST /detection/analyze
 * 
 * Body (JSON):
 *   {
 *     photoUrl: "https://...",     // or base64
 *     farmId: "uuid",
 *     crop: "tomato",
 *     location: { lat: 34.0, lng: -6.8 }
 *   }
 * 
 * Returns: { diagnosis, severity, treatment, confidence }
 */
router.post('/analyze', auth.authenticate, requireFarmer, asyncHandler(async (req, res) => {
  const { photoUrl, farmId, crop, location } = req.body;
  
  if (!photoUrl || !farmId) {
    const error = new Error('photoUrl and farmId are required');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const result = await detectionService.analyze(photoUrl, {
    crop,
    location,
    farmId
  });
  
  if (result.severity >= 0.5) {
    await detectionService.saveDetection(farmId, result);
  }
  
  res.json({
    diagnosis: result.diagnosis,
    severity: result.severity,
    severityLabel: result.severityLabel,
    treatment: result.treatment,
    confidence: result.confidence,
    visualSignals: result.visualSignals,
    action_items: result.action_items,
    model: result.model,
    isFallback: result.isFallback,
    pipeline: result.pipeline,
    consensus: result.consensus
  });
}));

/**
 * GET /detection/history?farmId=
 */
router.get('/history', auth.authenticate, requireFarmer, asyncHandler(async (req, res) => {
  const { farmId } = req.query;
  
  if (!farmId) {
    const error = new Error('farmId is required');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const { data, error } = await supabase
    .from('detections')
    .select('*')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) throw error;
  
  res.json({
    detections: data || [],
    count: data?.length || 0
  });
}));

module.exports = router;