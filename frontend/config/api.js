/**
 * FILAHA Frontend — API Configuration
 * All API connections go through this file.
 *
 * LOCAL TESTING:
 *   - Backend: npm start → runs on http://localhost:3000
 *   - Frontend: open index.html in browser (or use Live Server)
 *   - Change API_BASE to match your backend URL
 *
 * PRODUCTION:
 *   - Change API_BASE to your Railway/Vercel backend URL
 */

const CONFIG = {
  // ── API Base URL ───────────────────────────────────────────
  // Local development (default)
  API_BASE: 'http://localhost:3000',

  // Production — uncomment and fill when deploying:
  // API_BASE: 'https://your-backend.railway.app',

  // ── Endpoints ────────────────────────────────────────────
  ENDPOINTS: {
    // Auth
    login: '/api/auth/login',
    registerFarmer: '/api/auth/register/farmer',
    registerDistributor: '/api/auth/register/distributor',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    otp: '/api/auth/otp',
    verifyOtp: '/api/auth/verify-otp',
    resetPassword: '/api/auth/reset-password',

    // Weather
    weather: (lat, lng) => `/api/weather/${lat}/${lng}`,

    // MAÏ — Irrigation
    irrigationRecommend: '/api/irrigation/recommend',
    irrigationHistory: '/api/irrigation/history',
    irrigationLog: '/api/irrigation/log',

    // SILA — Market
    marketPrice: (crop) => `/api/market/price/${encodeURIComponent(crop)}`,
    marketPrices: '/api/market/prices',
    marketTrend: (crop) => `/api/market/trend/${encodeURIComponent(crop)}`,
    marketBestPrice: (crop) => `/api/market/best-price/${encodeURIComponent(crop)}`,
    marketCrops: '/api/market/crops',

    // SILA — Marketplace
    listings: '/api/marketplace/listings',
    myListings: '/api/marketplace/my-listings',
    createListing: '/api/marketplace/listings',
    offers: '/api/marketplace/offers',
    sendOffer: '/api/marketplace/offers',
    updateOffer: (id) => `/api/marketplace/offers/${id}`,

    // Detection — AI photo diagnosis
    detectionAnalyze: '/api/detection/analyze',
    detectionHistory: '/api/detection/history',

    // Community alerts
    communityAlerts: '/api/community/alerts',
    communityVerify: '/api/community/verify',
    communityFarmers: '/api/community/farmers-nearby',

    // Notifications
    notifications: '/api/notifications',
    markRead: (id) => `/api/notifications/${id}/read`,
    markAllRead: '/api/notifications/read-all',

    // Health check
    health: '/api/health',
  },

  // ── Feature Flags ─────────────────────────────────────────
  FEATURES: {
    AI_DIAGNOSIS: true,
    MARKET_PRICE: true,
    IRRIGATION: true,
    COMMUNITY_ALERTS: true,
    NOTIFICATIONS: true,
  },

  // ── Storage Keys ──────────────────────────────────────────
  STORAGE: {
    TOKEN: 'filaha_token',
    USER: 'filaha_user',
    PROFILE: 'filaha_profile',
    ROLE: 'filaha_role',
    LISTINGS: 'filaha_listings',
    OFFERS: 'filaha_offers',
    LANG: 'filaha_lang',
  },

  // ── Default Values ─────────────────────────────────────────
  DEFAULTS: {
    REGION: 'Souss-Massa',
    COUNTRY: 'MA',
    LANGUAGE: 'fr',
  },

  // ── Region Coordinates (Morocco) ────────────────────────────
  REGIONS: {
    'Souss-Massa': [30.42, -9.60],
    'Marrakech-Safi': [31.63, -8.00],
    'Fès-Meknès': [33.89, -5.55],
    'Rabat-Salé-Kénitra': [33.99, -6.85],
    'Casablanca-Settat': [33.59, -7.62],
    'Béni Mellal-Khénifra': [32.34, -6.35],
    "L'Oriental": [34.69, -1.91],
    'Tanger-Tétouan-Al Hoceïma': [35.57, -5.37],
    'Drâa-Tafilalet': [31.05, -4.00],
    'Guelmim-Oued Noun': [28.99, -10.06],
    'Laâyoune-Sakia El Hamra': [27.16, -13.20],
    'Dakhla-Oued Ed-Dahab': [23.69, -15.94],
  },
};

window.FILAHA_CONFIG = CONFIG;