/**
 * FILAHA Irrigation Service
 * MAÏ — Irrigation Intelligence API calls
 *
 * Endpoints:
 *   GET  /api/irrigation/recommend  → ET₀ + irrigation recommendation
 *   GET  /api/irrigation/history    → historical irrigation logs
 *   POST /api/irrigation/log         → log an irrigation event
 *   GET  /api/weather/:lat/:lng      → live weather data
 */

const Irrigation = {
  /**
   * Get irrigation recommendation for a farm
   * @param {object} params - { farm_id, lat, lng, crop, kc }
   */
  async getRecommendation(params) {
    const url = CONFIG.ENDPOINTS.irrigationRecommend + '?' + new URLSearchParams(params).toString();
    return API.get(url);
  },

  /**
   * Get irrigation history for a farm
   * @param {string} farmId
   */
  async getHistory(farmId) {
    return API.get(CONFIG.ENDPOINTS.irrigationHistory + '?' + new URLSearchParams({ farm_id: farmId }).toString());
  },

  /**
   * Log an irrigation event
   * @param {object} payload - { farm_id, volume_mm, method, date }
   */
  async logIrrigation(payload) {
    return API.post(CONFIG.ENDPOINTS.irrigationLog, payload);
  },

  /**
   * Fetch live weather for a coordinate (no auth needed)
   * @param {number} lat
   * @param {number} lng
   */
  async getWeather(lat, lng) {
    return API.get(CONFIG.ENDPOINTS.weather(lat, lng));
  },
};

window.FILAHA_IRRIGATION = Irrigation;