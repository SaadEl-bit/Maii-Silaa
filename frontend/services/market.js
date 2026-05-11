/**
 * FILAHA Market Service
 * SILA — Market Intelligence API calls
 *
 * Endpoints:
 *   GET  /api/market/price/:crop      → current price for a crop
 *   GET  /api/market/prices           → all prices
 *   GET  /api/market/trend/:crop     → trend analysis
 *   GET  /api/market/best-price/:crop → best region to sell
 *   GET  /api/market/crops            → list of available crops
 */

const Market = {
  /**
   * Get current price for a crop
   * @param {string} crop
   * @returns {Promise<{current, prev, trend, history, regions, insight}>}
   */
  async getPrice(crop) {
    return API.get(CONFIG.ENDPOINTS.marketPrice(crop));
  },

  /**
   * Get all prices (for dropdown/index)
   */
  async getAllPrices() {
    return API.get(CONFIG.ENDPOINTS.marketPrices);
  },

  /**
   * Get trend analysis for a crop
   */
  async getTrend(crop) {
    return API.get(CONFIG.ENDPOINTS.marketTrend(crop));
  },

  /**
   * Get best price (which region to sell in)
   */
  async getBestPrice(crop) {
    return API.get(CONFIG.ENDPOINTS.marketBestPrice(crop));
  },

  /**
   * Get list of crops with price data
   */
  async getCrops() {
    return API.get(CONFIG.ENDPOINTS.marketCrops);
  },

  /**
   * --- Marketplace: Listings ---
   * Get all active listings
   */
  async getListings(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = CONFIG.ENDPOINTS.listings + (params ? '?' + params : '');
    return API.get(url);
  },

  /**
   * Get my own listings
   */
  async getMyListings() {
    return API.get(CONFIG.ENDPOINTS.myListings);
  },

  /**
   * Create a new listing (farmer posts harvest)
   * @param {object} payload
   */
  async createListing(payload) {
    return API.post(CONFIG.ENDPOINTS.createListing, payload);
  },

  /**
   * --- Marketplace: Offers ---
   * Get all offers received (farmer) or sent (distributor)
   */
  async getOffers(filter = {}) {
    const params = new URLSearchParams(filter).toString();
    const url = CONFIG.ENDPOINTS.offers + (params ? '?' + params : '');
    return API.get(url);
  },

  /**
   * Send an offer on a listing (distributor)
   * @param {object} payload
   */
  async sendOffer(payload) {
    return API.post(CONFIG.ENDPOINTS.sendOffer, payload);
  },

  /**
   * Update offer status (accept/reject/counter)
   * @param {string} offerId
   * @param {string} status - accepted | declined | countered
   * @param {number} counterPrice - optional, for countered
   */
  async updateOffer(offerId, status, counterPrice = null) {
    const body = { status };
    if (counterPrice !== null) body.counter_price = counterPrice;
    return API.put(CONFIG.ENDPOINTS.updateOffer(offerId), body);
  },
};

window.FILAHA_MARKET = Market;