/**
 * Auth Routes — Authentication API
 *
 * Farmer flow  → Phone + Password
 * Distributor flow → Email + Password
 *
 * Endpoints:
 *   POST /auth/register/farmer     → Register farmer (phone + password)
 *   POST /auth/register/distributor → Register distributor (email + password)
 *   POST /auth/login               → Login (phone or email + password)
 *   POST /auth/otp                 → Send SMS OTP (farmer forgot password)
 *   POST /auth/verify-otp          → Verify OTP + optional new password
 *   POST /auth/reset-password      → Send password reset email (distributor)
 *   GET  /auth/me                  → Get current user profile
 *   POST /auth/logout              → Invalidate current session
 */

const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');

// ─── FARMER: Register with Phone + Password ───────────────────────────────────

/**
 * POST /auth/register/farmer
 * Body: { phone, password, name, country_code?, language? }
 */
router.post('/register/farmer', async (req, res, next) => {
  try {
    const { phone, password, name, country_code = 'MA', language = 'ar' } = req.body;

    if (!phone || !password || !name) {
      return res.status(400).json({
        error: 'بيانات ناقصة',
        message: 'phone, password, and name are required'
      });
    }

    const { data, error } = await supabase.auth.signUp({
      phone,
      password,
      options: {
        data: {
          role: 'farmer',
          name,
          language,
          country_code
        }
      }
    });

    if (error) throw error;

    // Update the public.users row created by the Supabase DB trigger
    await supabase
      .from('users')
      .update({ name, country_code, preferred_language: language })
      .eq('auth_id', data.user.id);

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      user_id: data.user.id
      // In dev: Supabase returns the session without phone confirmation if confirmations are OFF
      // In production: farmer must confirm phone via SMS before logging in
    });
  } catch (err) {
    next(err);
  }
});

// ─── DISTRIBUTOR: Register with Email + Password ──────────────────────────────

/**
 * POST /auth/register/distributor
 * Body: { email, password, name, country_code?, language? }
 */
router.post('/register/distributor', async (req, res, next) => {
  try {
    const { email, password, name, country_code = 'MA', language = 'fr' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'بيانات ناقصة',
        message: 'email, password, and name are required'
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'distributor',
          name,
          language,
          country_code
        },
        // Supabase sends confirmation email — user must click it before login works
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`
      }
    });

    if (error) throw error;

    await supabase
      .from('users')
      .update({ name, country_code, preferred_language: language })
      .eq('auth_id', data.user.id);

    res.status(201).json({
      message: 'Veuillez vérifier votre email pour activer votre compte',
      user_id: data.user.id
    });
  } catch (err) {
    next(err);
  }
});

// ─── LOGIN (works for both phone and email) ───────────────────────────────────

/**
 * POST /auth/login
 * Body: { phone, password } OR { email, password }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({
        error: 'بيانات ناقصة',
        message: 'password and either email or phone are required'
      });
    }

    // Build credentials based on what was provided
    const credentials = phone
      ? { phone, password }
      : { email, password };

    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;

    // Fetch the public.users profile for the role and preferences
    const { data: profile } = await supabase
      .from('users')
      .select('role, name, preferred_language, country_code, data_sharing_consent')
      .eq('auth_id', data.user.id)
      .single();

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email || null,
        phone: data.user.phone || null,
        ...profile
      }
    });
  } catch (err) {
    // Distinguish auth errors from server errors
    if (err.message?.includes('Invalid login') || err.status === 400) {
      return res.status(401).json({
        error: 'فشل في الدخول',
        message: 'Invalid phone/email or password'
      });
    }
    next(err);
  }
});

// ─── FARMER: Request SMS OTP (forgot password) ────────────────────────────────

/**
 * POST /auth/otp
 * Body: { phone }
 */
router.post('/otp', async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: 'رقم الهاتف مطلوب',
        message: 'phone is required'
      });
    }

    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;

    res.json({
      message: 'تم إرسال رمز التحقق إلى هاتفك',
      phone
    });
  } catch (err) {
    next(err);
  }
});

// ─── FARMER: Verify OTP + optional new password ───────────────────────────────

/**
 * POST /auth/verify-otp
 * Body: { phone, token, new_password? }
 * - Without new_password: verifies phone (first-time confirmation)
 * - With new_password: resets the password after OTP verification
 */
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, token, new_password } = req.body;

    if (!phone || !token) {
      return res.status(400).json({
        error: 'بيانات ناقصة',
        message: 'phone and token are required'
      });
    }

    // Step 1: Verify the OTP — this logs the user in and returns a session
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    if (verifyError) throw verifyError;

    // Step 2: If a new password was provided, update it using the active session
    if (new_password) {
      const { error: updateError } = await supabase.auth.updateUser({ password: new_password });
      if (updateError) throw updateError;

      return res.json({
        message: 'تم تغيير كلمة المرور بنجاح'
      });
    }

    // No password reset — just return the session (phone confirmation flow)
    res.json({
      message: 'تم التحقق بنجاح',
      access_token: verifyData.session.access_token,
      refresh_token: verifyData.session.refresh_token,
      user: {
        id: verifyData.user.id,
        phone: verifyData.user.phone
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── DISTRIBUTOR: Request password reset email ────────────────────────────────

/**
 * POST /auth/reset-password
 * Body: { email }
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'البريد الإلكتروني مطلوب',
        message: 'email is required'
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`
    });
    if (error) throw error;

    res.json({
      message: 'Veuillez consulter votre email pour réinitialiser votre mot de passe'
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────

/**
 * GET /auth/me
 * Header: Authorization: Bearer <access_token>
 */
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'غير مصرح',
        message: 'Authorization header missing'
      });
    }

    const token = authHeader.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw error || new Error('User not found');

    // Fetch full profile from public.users
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    res.json({
      id: user.id,
      email: user.email || null,
      phone: user.phone || null,
      profile
    });
  } catch (err) {
    next(err);
  }
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

/**
 * POST /auth/logout
 * Header: Authorization: Bearer <access_token>
 */
router.post('/logout', async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;