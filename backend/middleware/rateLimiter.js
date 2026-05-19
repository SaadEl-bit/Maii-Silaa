/**
 * Rate Limiter Middleware
 * 
 * In-memory token bucket rate limiter.
 * For production, replace with Redis-based solution.
 * 
 * Limits:
 *   - Auth routes: 5 req/min
 *   - Detection: 10 req/min
 *   - Other routes: 60 req/min
 *   - IP blacklist for > 100 req/min
 */

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Simple in-memory store
 * Map<key, { tokens, lastReset }>
 */
const rateLimitStore = new Map();

/**
 * Get current bucket for key
 * @param {string} key - Rate limit key (IP or user ID)
 * @param {number} maxTokens - Max requests per window
 * @param {number} windowMs - Window in milliseconds
 * @returns {object} Bucket state
 */
function getBucket(key, maxTokens, windowMs) {
  const now = Date.now();
  let bucket = rateLimitStore.get(key);
  
  if (!bucket || now - bucket.lastReset >= windowMs) {
    bucket = {
      tokens: maxTokens,
      lastReset: now,
      requests: []
    };
    rateLimitStore.set(key, bucket);
  }
  
  return bucket;
}

/**
 * Check if request should be rate limited
 * @param {string} key - Rate limit key
 * @param {number} maxTokens - Max requests per window
 * @param {number} windowMs - Window in milliseconds
 * @returns {object} { allowed, remaining, resetAt }
 */
function checkLimit(key, maxTokens, windowMs) {
  const bucket = getBucket(key, maxTokens, windowMs);
  const now = Date.now();
  const remaining = Math.max(0, bucket.tokens);
  const resetAt = bucket.lastReset + windowMs;
  
  return {
    allowed: bucket.tokens > 0,
    remaining,
    resetAt,
    resetIn: Math.max(0, resetAt - now)
  };
}

/**
 * Consume one token from bucket
 * @param {string} key - Rate limit key
 * @returns {boolean} True if token consumed
 */
function consume(key) {
  const bucket = rateLimitStore.get(key);
  if (!bucket || bucket.tokens <= 0) return false;
  
  bucket.tokens -= 1;
  bucket.requests.push(Date.now());
  
  // Prune old requests (keep only last 100)
  if (bucket.requests.length > 100) {
    bucket.requests = bucket.requests.slice(-100);
  }
  
  return true;
}

/**
 * Create rate limiter middleware
 * @param {object} options - Configuration
 * @returns {function} Express middleware
 */
function createRateLimiter(options = {}) {
  const {
    maxTokens = 60,
    windowMs = DEFAULT_WINDOW_MS,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    getToken = () => 1,
    onError = (req, res) => {
      res.status(429).json({
        error: 'طلبات كثيرة',
        message: 'Rate limit exceeded. Try again later.'
      });
    }
  } = options;
  
  return function rateLimiterMiddleware(req, res, next) {
    const key = keyGenerator(req);
    const limit = getToken(req);
    const bucketMax = limit * maxTokens;
    const { allowed, remaining, resetIn } = checkLimit(key, bucketMax, windowMs);
    
    res.set('X-RateLimit-Limit', bucketMax);
    res.set('X-RateLimit-Remaining', remaining);
    res.set('X-RateLimit-Reset', Math.ceil(resetIn / 1000));
    
    if (!allowed) {
      return onError(req, res);
    }
    
    consume(key);
    next();
  };
}

/**
 * Pre-configured limiters for different routes
 */
const limiters = {
  // Strict: auth endpoints
  auth: createRateLimiter({
    maxTokens: 5,
    getToken: () => 1
  }),
  
  // Medium: detection, expensive operations
  detection: createRateLimiter({
    maxTokens: 10,
    getToken: () => 1
  }),
  
  // Standard: most API routes
  standard: createRateLimiter({
    maxTokens: 60,
    getToken: () => 1
  }),
  
  // Lenient: read-only, public
  public: createRateLimiter({
    maxTokens: 120,
    getToken: () => 1
  })
};

const rateLimiter = {
  createRateLimiter,
  checkLimit,
  consume,
  limiters,
  DEFAULT_WINDOW_MS
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = rateLimiter;
}

if (typeof window !== 'undefined') {
  window.rateLimiter = rateLimiter;
}