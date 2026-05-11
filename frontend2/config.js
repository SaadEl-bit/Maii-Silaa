/**
 * FILAHA Frontend — Configuration
 * Set API_BASE to your backend URL
 */

const CONFIG = {
  // Backend URL - change this to match your backend
  API_BASE: 'http://localhost:3000',

  // API Endpoints mapping
  ENDPOINTS: {
    // Auth
    registerFarmer: '/api/auth/register/farmer',
    registerDistributor: '/api/auth/register/distributor',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    otp: '/api/auth/otp',
    verifyOtp: '/api/auth/verify-otp',
    resetPassword: '/api/auth/reset-password',

    // Weather
    weather: (lat, lng) => `/api/weather/${lat}/${lng}`,

    // Irrigation (MAÏ)
    irrigationRecommend: '/api/irrigation/recommend',
    irrigationHistory: '/api/irrigation/history',
    irrigationLog: '/api/irrigation/log',

    // Market (SILA)
    marketPrice: (crop) => `/api/market/price?crop=${encodeURIComponent(crop)}`,
    marketPrices: (crop) => `/api/market/prices?crop=${encodeURIComponent(crop)}`,
    marketTrend: (crop) => `/api/market/trend?crop=${encodeURIComponent(crop)}`,
    marketBestPrice: (crop) => `/api/market/best-price?crop=${encodeURIComponent(crop)}`,
    marketCrops: '/api/market/crops',

    // Marketplace
    listings: '/api/marketplace/listings',
    myListings: '/api/marketplace/listings/my',
    createListing: '/api/marketplace/listings',
    offers: '/api/marketplace/offers/my',

    // Detection (AI Photo Diagnosis)
    detectionAnalyze: '/api/detection/analyze',
    detectionHistory: '/api/detection/history',

    // Community
    communityAlerts: '/api/community/alerts',
    communityVerify: '/api/community/verify',
    communityFarmers: '/api/community/farmers-nearby',

    // Notifications
    notifications: '/api/notifications',
    markRead: (id) => `/api/notifications/${id}/read`,
    markAllRead: '/api/notifications/read-all',

    // Health
    health: '/api/health',
  },

  // Storage keys
  STORAGE: {
    TOKEN: 'filaha_token',
    USER: 'filaha_user',
  },

  // Default values
  DEFAULTS: {
    LAT: 30.42,  // Souss-Massa, Morocco
    LNG: -9.60,
    COUNTRY: 'MA',
  },
};

window.FILAHA_CONFIG = CONFIG;