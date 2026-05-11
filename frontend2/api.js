/**
 * FILAHA Frontend — API Wrapper
 * Handles authentication and HTTP requests
 */

const FILAHA_API = {
  // Current auth token
  _token: null,

  // Initialize token from localStorage
  init() {
    this._token = localStorage.getItem(FILAHA_CONFIG.STORAGE.TOKEN);
    return this._token;
  },

  // Set token after login
  setToken(token) {
    this._token = token;
    localStorage.setItem(FILAHA_CONFIG.STORAGE.TOKEN, token);
  },

  // Clear token on logout
  clearToken() {
    this._token = null;
    localStorage.removeItem(FILAHA_CONFIG.STORAGE.TOKEN);
  },

  // Get current user from localStorage
  getUser() {
    const userStr = localStorage.getItem(FILAHA_CONFIG.STORAGE.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Save user to localStorage
  setUser(user) {
    localStorage.setItem(FILAHA_CONFIG.STORAGE.USER, JSON.stringify(user));
  },

  // Build headers
  _headers(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (includeAuth && this._token) {
      headers['Authorization'] = `Bearer ${this._token}`;
    }
    return headers;
  },

  // Generic request wrapper
  async request(endpoint, options = {}) {
    const url = FILAHA_CONFIG.API_BASE + endpoint;
    const config = {
      ...options,
      headers: this._headers(options.auth !== false),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  },

  // ─── AUTH ─────────────────────────────────────────────────────────

  async registerFarmer(phone, password, name, country = 'MA', language = 'ar') {
    return this.request(FILAHA_CONFIG.ENDPOINTS.registerFarmer, {
      method: 'POST',
      body: JSON.stringify({ phone, password, name, country_code: country, language }),
      auth: false,
    });
  },

  async registerDistributor(email, password, name, country = 'MA', language = 'fr') {
    return this.request(FILAHA_CONFIG.ENDPOINTS.registerDistributor, {
      method: 'POST',
      body: JSON.stringify({ email, password, name, country_code: country, language }),
      auth: false,
    });
  },

  async login(identifier, password, isPhone = false) {
    const body = isPhone ? { phone: identifier, password } : { email: identifier, password };
    const data = await this.request(FILAHA_CONFIG.ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify(body),
      auth: false,
    });

    if (data.access_token) {
      this.setToken(data.access_token);
      this.setUser(data.user);
    }

    return data;
  },

  async logout() {
    try {
      await this.request(FILAHA_CONFIG.ENDPOINTS.logout, { method: 'POST' });
    } catch (e) {
      // Ignore logout errors
    }
    this.clearToken();
    localStorage.removeItem(FILAHA_CONFIG.STORAGE.USER);
  },

  async getMe() {
    return this.request(FILAHA_CONFIG.ENDPOINTS.me);
  },

  async requestOtp(phone) {
    return this.request(FILAHA_CONFIG.ENDPOINTS.otp, {
      method: 'POST',
      body: JSON.stringify({ phone }),
      auth: false,
    });
  },

  async verifyOtp(phone, token, newPassword = null) {
    const body = { phone, token };
    if (newPassword) body.new_password = newPassword;
    return this.request(FILAHA_CONFIG.ENDPOINTS.verifyOtp, {
      method: 'POST',
      body: JSON.stringify(body),
      auth: false,
    });
  },

  // ─── IRRIGATION (MAÏ) ─────────────────────────────────────────────

  async getIrrigationRecommendation(lat, lng, crop = 'wheat', daysAfterPlanting = 0) {
    const params = new URLSearchParams({ lat, lng, crop, daysAfterPlanting });
    return this.request(`${FILAHA_CONFIG.ENDPOINTS.irrigationRecommend}?${params}`);
  },

  async getIrrigationHistory(farmId) {
    const params = new URLSearchParams({ farmId });
    return this.request(`${FILAHA_CONFIG.ENDPOINTS.irrigationHistory}?${params}`);
  },

  async logIrrigation(farmId, crop, waterMm, weather, recommendation, confidence) {
    return this.request(FILAHA_CONFIG.ENDPOINTS.irrigationLog, {
      method: 'POST',
      body: JSON.stringify({ farmId, crop, waterMm, weather, recommendation, confidence }),
    });
  },

  // ─── MARKET (SILA) ────────────────────────────────────────────────

  async getMarketPrice(crop, country = 'MA') {
    const params = new URLSearchParams({ crop, country });
    return this.request(`${FILAHA_CONFIG.ENDPOINTS.marketPrice(crop)}&country=${country}`);
  },

  async getMarketPrices(crop) {
    const params = new URLSearchParams({ crop });
    return this.request(`${FILAHA_CONFIG.ENDPOINTS.marketPrices(crop)}`);
  },

  async getMarketTrend(crop, country = 'MA') {
    const params = new URLSearchParams({ crop, country });
    return this.request(`${FILAHA_CONFIG.ENDPOINTS.marketTrend(crop)}&country=${country}`);
  },

  async getMarketBestPrice(crop) {
    return this.request(FILAHA_CONFIG.ENDPOINTS.marketBestPrice(crop));
  },

  async getMarketCrops() {
    return this.request(FILAHA_CONFIG.ENDPOINTS.marketCrops);
  },

  // ─── MARKETPLACE ───────────────────────────────────────────────────

  async getListings(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`${FILAHA_CONFIG.ENDPOINTS.listings}?${params}`);
  },

  async getMyListings() {
    return this.request(FILAHA_CONFIG.ENDPOINTS.myListings);
  },

  async createListing(listing) {
    return this.request(FILAHA_CONFIG.ENDPOINTS.createListing, {
      method: 'POST',
      body: JSON.stringify(listing),
    });
  },

  async deleteListing(id) {
    return this.request(`/api/marketplace/listings/${id}`, { method: 'DELETE' });
  },

  async sendOffer(listingId, offeredPrice, quantityKg, message = '') {
    return this.request(`/api/marketplace/listings/${listingId}/offer`, {
      method: 'POST',
      body: JSON.stringify({ offered_price: offeredPrice, quantity_kg: quantityKg, message }),
    });
  },

  async respondToOffer(listingId, offerId, action, counterPrice = null) {
    const body = { action };
    if (counterPrice) body.counter_price = counterPrice;
    return this.request(`/api/marketplace/listings/${listingId}/offer/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async getMyOffers() {
    return this.request(FILAHA_CONFIG.ENDPOINTS.offers);
  },

  // ─── DETECTION ─────────────────────────────────────────────────────

  async analyzePhoto(photoUrl, farmId, crop = null, location = null) {
    const body = { photoUrl, farmId, crop, location };
    return this.request(FILAHA_CONFIG.ENDPOINTS.detectionAnalyze, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async getDetectionHistory(farmId) {
    const params = new URLSearchParams({ farmId });
    return this.request(`${FILAHA_CONFIG.ENDPOINTS.detectionHistory}?${params}`);
  },

  // ─── COMMUNITY ───────────────────────────────────────────────────

  async getCommunityAlerts(lat, lng, radius = 15) {
    const params = new URLSearchParams({ lat, lng, radius });
    return this.request(`${FILAHA_CONFIG.ENDPOINTS.communityAlerts}?${params}`);
  },

  async verifyAlert(alertId, confirmed) {
    return this.request(FILAHA_CONFIG.ENDPOINTS.communityVerify, {
      method: 'POST',
      body: JSON.stringify({ alertId, confirmed }),
    });
  },

  async getFarmersNearby(lat, lng, radius = 15) {
    const params = new URLSearchParams({ lat, lng, radius });
    return this.request(`${FILAHA_CONFIG.ENDPOINTS.communityFarmers}?${params}`);
  },

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────

  async getNotifications() {
    return this.request(FILAHA_CONFIG.ENDPOINTS.notifications);
  },

  async markNotificationRead(id) {
    return this.request(FILAHA_CONFIG.ENDPOINTS.markRead(id), { method: 'PUT' });
  },

  async markAllNotificationsRead() {
    return this.request(FILAHA_CONFIG.ENDPOINTS.markAllRead, { method: 'PUT' });
  },

  async deleteNotification(id) {
    return this.request(`/api/notifications/${id}`, { method: 'DELETE' });
  },

  // ─── HEALTH ────────────────────────────────────────────────────────

  async healthCheck() {
    return this.request(FILAHA_CONFIG.ENDPOINTS.health, { auth: false });
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!this._token;
  },

  // Get user role
  getUserRole() {
    const user = this.getUser();
    return user?.role || null;
  },
};

// Initialize on load
FILAHA_API.init();

window.FILAHA_API = FILAHA_API;