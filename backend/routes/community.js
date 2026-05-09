/**
 * Community Routes — 15km Radius Alerts API
 * 
 * Endpoints:
 *   GET  /community/alerts           → Get nearby community alerts
 *   POST /community/verify           → Verify/dismiss alert
 *   GET  /community/farmers-nearby    → Get farmers within radius
 * 
 * Requires: auth
 */

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { requireFarmer } = require('../middleware/roleCheck');
const { asyncHandler } = require('../middleware/errorHandler');
const communityService = require('../services/communityService');
const supabase = require('../config/supabase');

/**
 * GET /community/alerts?lat=&lng=&radius=15
 */
router.get('/alerts', auth.authenticate, asyncHandler(async (req, res) => {
  const { lat, lng, radius = 15 } = req.query;
  
  if (!lat || !lng) {
    const error = new Error('lat and lng are required');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const { data, error } = await supabase
    .from('community_alerts')
    .select('*')
    .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  const alerts = (data || []).map(alert => {
    const distance = communityService.findNearbyFarmers(
      { lat: alert.center_lat, lng: alert.center_lng },
      alert,
      radius
    );
    return { ...alert, yourDistance: distance };
  });
  
  res.json({
    alerts,
    count: alerts.length
  });
}));

/**
 * POST /community/verify
 * 
 * Body: { alertId, confirmed }
 */
router.post('/verify', auth.authenticate, requireFarmer, asyncHandler(async (req, res) => {
  const { alertId, confirmed } = req.body;
  
  if (!alertId || confirmed === undefined) {
    const error = new Error('alertId and confirmed are required');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const result = await communityService.verifyAlert(alertId, req.user.id, confirmed);
  
  res.json(result);
}));

/**
 * GET /community/farmers-nearby?lat=&lng=&radius=15
 */
router.get('/farmers-nearby', auth.authenticate, requireFarmer, asyncHandler(async (req, res) => {
  const { lat, lng, radius = 15 } = req.query;
  
  if (!lat || !lng) {
    const error = new Error('lat and lng are required');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const detection = { id: 'manual-query' };
  const farmers = await communityService.findNearbyFarmers(
    { lat: parseFloat(lat), lng: parseFloat(lng) },
    detection,
    parseFloat(radius)
  );
  
  res.json({
    farmers,
    count: farmers.length
  });
}));

module.exports = router;