/**
 * Community Service — 15km Geo-Alerts
 * 
 * Role: Find nearby farmers → broadcast alerts
 * Dependencies: geospatial, Supabase
 */

const geospatial = require('../utils/geospatial');
const supabase = require('../config/supabase');

const DEFAULT_RADIUS_KM = 15;

/**
 * Find farmers within radius of detection
 * @param {object} center - { lat, lng }
 * @param {object} detection - Detection result
 * @param {number} radiusKm
 * @returns {Promise<object[]>} Nearby farmers
 */
async function findNearbyFarmers(center, detection, radiusKm = DEFAULT_RADIUS_KM) {
  try {
    const { data: farms, error } = await supabase
      .from('farms')
      .select('id, user_id, location_lat, location_lng, crop_type, farm_name')
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null);
    
    if (error) throw error;
    
    const nearby = [];
    
    for (const farm of farms) {
      const distance = geospatial.distanceKm(
        center.lat,
        center.lng,
        farm.location_lat,
        farm.location_lng
      );
      
      if (distance <= radiusKm) {
        nearby.push({
          ...farm,
          distance: Math.round(distance * 10) / 10
        });
      }
    }
    
    return nearby.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Community findNearbyFarmers error:', error);
    return [];
  }
}

/**
 * Create community alert from detection
 * @param {object} detection - Detection with location
 * @param {object} center - { lat, lng }
 * @returns {Promise<object>} Created alert
 */
async function createAlert(detection, center) {
  const nearby = await findNearbyFarmers(center, detection);
  
  if (nearby.length === 0) {
    return { alertId: null, farmersNotified: 0, message: 'No nearby farms' };
  }
  
  try {
    const areaKm2 = Math.PI * Math.pow(DEFAULT_RADIUS_KM, 2);
    
    const alertData = {
      detection_id: detection.id,
      alert_type: 'disease',
      severity: detection.severity,
      crop_type: detection.crop,
      center_lat: center.lat,
      center_lng: center.lng,
      affected_area_km2: Math.round(areaKm2 * 100) / 100,
      farmers_notified: nearby.length,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('community_alerts')
      .insert(alertData)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      alertId: data.id,
      farmersNotified: nearby.length,
      farmers: nearby.map(f => ({ id: f.id, distance: f.distance })),
      message: `تم إشعار ${nearby.length} مزارعين في نطاق ${DEFAULT_RADIUS_KM} كم`
    };
  } catch (error) {
    console.error('Community createAlert error:', error);
    return { error: error.message };
  }
}

/**
 * Check for similar alerts in other regions
 * @param {string} cropType
 * @param {string} diagnosis
 * @returns {Promise<object[]>} Similar alerts
 */
async function checkSimilarAlerts(cropType, diagnosis) {
  try {
    const { data: alerts, error } = await supabase
      .from('community_alerts')
      .select('*')
      .eq('alert_type', 'disease')
      .eq('crop_type', cropType)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return alerts || [];
  } catch (error) {
    console.error('Community checkSimilarAlerts error:', error);
    return [];
  }
}

/**
 * Verify alert (farmer confirms/dismisses)
 */
async function verifyAlert(alertId, userId, confirmed) {
  try {
    const { data, error } = await supabase
      .from('community_alert_verifications')
      .insert({
        alert_id: alertId,
        user_id: userId,
        confirmed,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, verification: data };
  } catch (error) {
    console.error('Community verifyAlert error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Broadcast alert to farmers
 */
async function broadcast(alert, farmers) {
  const notificationService = require('./notificationService');
  
  const results = [];
  
  for (const farmer of farmers) {
    if (!farmer.user_id) continue; // Requires user_id for in-app notifications
    
    try {
      // In-app community alert using the new schema
      const result = await notificationService.sendCommunityAlert(
        farmer.user_id,
        {
          alert: `خطر محتمل: ${alert.diagnosis || 'آفة زراعية'} في ${alert.crop_type || 'نفس نوع المحصول'} (مستوى: ${alert.severity || 'متوسط'})`,
          distance: farmer.distance,
          action: alert.action_items?.[0] || 'راجع مزرعتك واتخذ التدابير الوقائية'
        }
      );
      
      results.push({ farmerId: farmer.id, userId: farmer.user_id, ...result });
    } catch (error) {
      results.push({ farmerId: farmer.id, userId: farmer.user_id, error: error.message });
    }
  }
  
  return results;
}

/**
 * Generate alert message in Arabic
 */
function generateAlertMessage(alert, distance) {
  return `تنبيه محلي! 
  
محصول: ${alert.crop_type}
المرض: ${alert.diagnosis}
المستوى: ${alert.severity}
البعد: ${distance} كم

جراءات: ${alert.action_items?.[0] || 'راجع مزرعتك'}`;
}

const communityService = {
  findNearbyFarmers,
  createAlert,
  checkSimilarAlerts,
  verifyAlert,
  broadcast,
  DEFAULT_RADIUS_KM
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = communityService;
}

if (typeof window !== 'undefined') {
  window.communityService = communityService;
}