/**
 * Auth Middleware — JWT Token Verification
 * 
 * Verifies Supabase JWT tokens from Authorization header.
 * Extracts user info and attaches to req.user.
 * 
 * Header: Authorization: Bearer <token>
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Verify JWT token from Authorization header
 * @param {string} authHeader - "Bearer <token>"
 * @returns {object|null} Decoded token or null
 */
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.slice(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'filaha',
    });
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Express middleware: Attach user to request
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const decoded = verifyToken(authHeader);
  
  if (!decoded) {
    return res.status(401).json({
      error: 'غير مصرح',
      message: 'Invalid or missing token'
    });
  }
  
  req.user = decoded;
  next();
}

/**
 * Optional auth — attaches user if token present, continues if not
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const decoded = verifyToken(authHeader);
  
  if (decoded) {
    req.user = decoded;
  }
  next();
}

/**
 * Generate JWT for testing/dev purposes
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
    issuer: 'filaha',
  });
}

const auth = {
  verifyToken,
  authenticate,
  optionalAuth,
  generateToken,
  JWT_SECRET
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = auth;
}

if (typeof window !== 'undefined') {
  window.auth = auth;
}