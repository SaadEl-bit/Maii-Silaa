const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// ==========================================
// FARMER: Register with Phone + Password
// ==========================================
router.post('/register/farmer', async (req, res, next) => {
  try {
    const { phone, password, name, country_code = 'MA', language = 'ar' } = req.body;
    
    // Sign up with phone + password in Supabase Auth
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

    // Update the public.users row with extra info (trigger already created it)
    await supabase
      .from('users')
      .update({ name, country_code, preferred_language: language })
      .eq('auth_id', data.user.id);

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح', // "Account created successfully"
      user_id: data.user.id,
      // For hackathon with test phones, you might get the OTP immediately
      // In production, SMS is sent automatically by Supabase
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// DISTRIBUTOR: Register with Email + Password
// ==========================================
router.post('/register/distributor', async (req, res, next) => {
  try {
    const { email, password, name, country_code = 'MA', language = 'fr' } = req.body;
    
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
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`
      }
    });

    if (error) throw error;

    await supabase
      .from('users')
      .update({ name, country_code, preferred_language: language })
      .eq('auth_id', data.user.id);

    res.status(201).json({
      message: 'Veuillez vérifier votre email', // "Please check your email"
      user_id: data.user.id
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// LOGIN (Works for both Phone and Email)
// ==========================================
router.post('/login', async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    
    // Determine if this is phone or email login
    const credentials = phone 
      ? { phone, password } 
      : { email, password };

    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;

    // Fetch user profile to include role
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
        email: data.user.email,
        phone: data.user.phone,
        ...profile
      }
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// FARMER: Request SMS OTP (for password reset)
// ==========================================
router.post('/otp', async (req, res, next) => {
  try {
    const { phone } = req.body;
    
    // Supabase sends SMS OTP automatically
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        // Optional: set channel to 'whatsapp' if configured
        // channel: 'whatsapp'
      }
    });

    if (error) throw error;

    res.json({ 
      message: 'تم إرسال رمز التحقق', // "Verification code sent"
      phone 
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// FARMER: Verify OTP + Set New Password
// ==========================================
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, token, new_password } = req.body;
    
    // 1. Verify the OTP
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });
    if (verifyError) throw verifyError;

    // 2. If new_password provided, update it (password reset flow)
    if (new_password) {
      const { error: updateError } = await supabase.auth.updateUser({
        password: new_password
      });
      if (updateError) throw updateError;
    }

    res.json({
      message: new_password 
        ? 'تم تغيير كلمة المرور بنجاح' // "Password changed successfully"
        : 'تم التحقق بنجاح', // "Verified successfully"
      session: new_password ? null : {
        access_token: verifyData.session.access_token,
        user: verifyData.user
      }
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// DISTRIBUTOR: Request Password Reset Email
// ==========================================
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    
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

// ==========================================
// ME (Get current user)
// ==========================================
router.get('/me', async (req, res, next) => {
  try {
    // Your middleware/auth.js should set req.user from JWT
    const { data: { user }, error } = await supabase.auth.getUser(req.headers.authorization?.split(' ')[1]);
    if (error) throw error;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    res.json({ ...user, profile });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// LOGOUT
// ==========================================
router.post('/logout', async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Déconnexion réussie' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;