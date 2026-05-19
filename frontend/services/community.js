/**
 * FILAHA Community Service
 * Cross-border community alerts (15km radius)
 *
 * Endpoints:
 *   GET  /api/community/alerts        → nearby alerts
 *   POST /api/community/verify         → verify/dismiss an alert
 *   GET  /api/community/farmers-nearby → farmers in 15km radius
 */

const Community = {
  async getAlerts(params = {}) {
    const url = CONFIG.ENDPOINTS.communityAlerts + '?' + new URLSearchParams(params).toString();
    return API.get(url);
  },

  async verifyAlert(alertId, verified) {
    return API.post(CONFIG.ENDPOINTS.communityVerify, { alert_id: alertId, verified });
  },

  async getFarmersNearby(lat, lng, radiusKm = 15) {
    return API.get(
      CONFIG.ENDPOINTS.communityFarmers + '?' + new URLSearchParams({ lat, lng, radius: radiusKm }).toString()
    );
  },
};

window.FILAHA_COMMUNITY = Community;