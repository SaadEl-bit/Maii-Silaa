/**
 * Auth Routes — Authentication API
 * 
 * Endpoints:
 *   POST /auth/register     → Register new user
 *   POST /auth/login       → Login (email or phone)
 *   POST /auth/otp        → Send OTP for phone login
 *   POST /auth/verify-otp → Verify OTP
 *   GET  /auth/me         → Get current user
 * 
 * Note: This implements Supabase Auth wrapping.
 * For production, use Supabase Auth directly.
 */

const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');
const notificationService = require('../services/notificationService');

/**
 * POST /auth/register
 * 
 * Body: { email, phone, password, role, name, countryCode }
 */
router.post('/register', async (req, res) => {
  const { email, phone, password, role = 'farmer', name, countryCode = 'MA' } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({
      error: 'بيانات مطلوبة',
      message: 'email, password, and name are required'
    });
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          country_code: countryCode
        }
      }
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (error) {
    res.status(400).json({
      error: 'فشل في التسجيل',
      message: error.message
    });
  }
});

/**
 * POST /auth/login
 * 
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'بيانات مطلوبة',
      message: 'email and password are required'
    });
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    res.json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (error) {
    res.status(401).json({
      error: 'فشل في الدخول',
      message: 'Invalid credentials'
    });
  }
});

/**
 * POST /auth/otp (Dev only - generates mock OTP)
 */
router.post('/otp', async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({
      error: 'رقم الهاتف مطلوب',
      message: 'phone is required'
    });
  }
  
  if (process.env.NODE_ENV === 'production') {
    return res.status(501).json({
      error: 'غير متاح',
      message: 'OTP not implemented in production'
    });
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log('OTP for', phone, ':', otp);
  
  res.json({
    success: true,
    message: 'OTP sent (dev mode: check server console)',
    devOtp: otp
  });
});

/**
 * POST /auth/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  
  if (process.env.NODE_ENV === 'production') {
    return res.status(501).json({
      error: 'غير متاح',
      message: 'OTP not implemented in production'
    });
  }
  
  res.json({
    success: false,
    message: 'Use /auth/login with email for now'
  });
});

/**
 * GET /auth/me
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'غير مصرح',
      message: 'No token provided'
    });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (error) throw error;
    
    res.json({
      user
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      message: error.message
    });
  }
});

/**
 * POST /auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
});

module.exports = router;