/**
 * Auth Middleware — Supabase JWT Token Verification
 *
 * Verifies tokens issued by Supabase Auth (NOT a local secret).
 * Extracts user info (id, email, phone, role from user_metadata) and attaches to req.user.
 *
 * Header: Authorization: Bearer <supabase_access_token>
 */

require('dotenv').config();
const supabase = require('../config/supabase');

/**
 * Express middleware: Verify Supabase token and attach user to req.
 * Rejects with 401 if the token is missing, expired, or invalid.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'غير مصرح',
      message: 'Authorization header missing or malformed. Expected: Bearer <token>'
    });
  }

  const token = authHeader.slice(7);

  try {
    // Let Supabase verify the token using its own secret
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'غير مصرح',
        message: 'Token is invalid or expired'
      });
    }

    // Flatten the user object so roleCheck.js can access role directly
    req.user = {
      id: user.id,
      sub: user.id,           // some services use .sub — keep both
      email: user.email,
      phone: user.phone,
      role: user.user_metadata?.role,
      name: user.user_metadata?.name,
      country_code: user.user_metadata?.country_code,
      user_metadata: user.user_metadata // keep raw for any fallback logic
    };

    next();
  } catch (err) {
    return res.status(500).json({
      error: 'خطأ في التحقق',
      message: 'Token verification failed unexpectedly'
    });
  }
}

/**
 * Optional auth — attaches user if a valid token is present, continues either way.
 * Use this for public routes that behave differently when the user is logged in.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // No token → continue as guest
  }

  const token = authHeader.slice(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = {
        id: user.id,
        sub: user.id,
        email: user.email,
        phone: user.phone,
        role: user.user_metadata?.role,
        name: user.user_metadata?.name,
        country_code: user.user_metadata?.country_code,
        user_metadata: user.user_metadata
      };
    }
  } catch (_) {
    // Silently ignore — optional auth never blocks the request
  }

  next();
}

const auth = {
  authenticate,
  optionalAuth
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = auth;
}

if (typeof window !== 'undefined') {
  window.auth = auth;
}