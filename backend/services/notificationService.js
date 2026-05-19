/**
 * Notification Service — In-App Alerts
 *
 * CURRENT PLAN: In-app notifications stored in Supabase `notifications` table.
 * WhatsApp (AiSensy) and SMS (Twilio) are COMMENTED OUT — keys kept in .env
 * for future activation once the WhatsApp Business API is configured.
 *
 * In-app flow:
 *   notificationService.sendInApp(userId, title, message, type)
 *     → INSERT INTO notifications { user_id, title, message, type, is_read: false }
 *   Frontend polls GET /notifications?userId= or uses Supabase Realtime channel.
 *
 * To re-enable WhatsApp: uncomment the sendWhatsApp() call in send().
 * To re-enable SMS:       uncomment the sendSMS()       call in send().
 */

require('dotenv').config();

// --- WhatsApp / SMS credentials (kept, not used yet) ---
// const TWILIO_ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID;
// const TWILIO_AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN;
// const TWILIO_PHONE_NUMBER = process.env.TWILIO_SMS_FROM;
// const AISENSY_API_KEY     = process.env.AISENSY_API_KEY;
// const AISENSY_INSTANCE_ID = process.env.AISENSY_INSTANCE_ID;
// let twilioClient = null;
// let twilio       = null;
//
// function getTwilioClient() {
//   if (!twilioClient && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
//     if (!twilio) twilio = require('twilio');
//     twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
//   }
//   return twilioClient;
// }

// ============================================================================
// IN-APP NOTIFICATIONS (active)
// ============================================================================

/**
 * Write an in-app notification to the `notifications` Supabase table.
 * @param {string} userId  - UUID from the users table
 * @param {string} title   - Short heading (shown in bell dropdown)
 * @param {string} message - Full notification body (Arabic MSA)
 * @param {string} type    - 'irrigation' | 'price' | 'community' | 'detection' | 'system'
 * @returns {Promise<object>} { sent, id }
 */
async function sendInApp(userId, title, message, type = 'system') {
  const supabase = require('../config/supabase');

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id:    userId,
        title,
        message,
        type,
        is_read:    false,
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) throw error;

    return { sent: true, id: data.id };
  } catch (err) {
    console.error('notificationService.sendInApp error:', err.message);
    return { sent: false, error: err.message };
  }
}

/**
 * Mark a notification as read.
 * @param {string} notificationId - UUID
 */
async function markRead(notificationId) {
  const supabase = require('../config/supabase');
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  return { ok: !error };
}

/**
 * Get all unread notifications for a user.
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
async function getUnread(userId) {
  const supabase = require('../config/supabase');
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false });
  return error ? [] : data;
}

// ============================================================================
// DOMAIN HELPERS (use sendInApp now; swap for WhatsApp later)
// ============================================================================

/**
 * Send irrigation recommendation notification.
 * @param {string} userId
 * @param {object} data - { recommendation, waterMm, explanation }
 */
async function sendIrrigationAlert(userId, data) {
  const title   = 'توصية الري 💧';
  const message = `${data.recommendation}\nالكمية: ${data.waterMm} مم\nالسبب: ${data.explanation}`;
  return sendInApp(userId, title, message, 'irrigation');

  // --- WhatsApp version (future) ---
  // return sendWhatsApp(phone, `توصية ري 📡\n${message}`);
}

/**
 * Send price alert notification.
 * @param {string} userId
 * @param {object} data - { crop, price, currency, trend, recommendation }
 */
async function sendPriceAlert(userId, data) {
  const title   = 'تنبيه سعر 💰';
  const message = `${data.crop}\nالسعر: ${data.price} ${data.currency}\nالاتجاه: ${data.trend}\nالتوصية: ${data.recommendation}`;
  return sendInApp(userId, title, message, 'price');

  // --- WhatsApp version (future) ---
  // return sendWhatsApp(phone, `تنبيه سعر 💰\n${message}`);
}

/**
 * Send community / geo-alert notification.
 * @param {string} userId
 * @param {object} data - { alert, distance, action }
 */
async function sendCommunityAlert(userId, data) {
  const title   = 'تنبيه محلي ⚠️';
  const message = `${data.alert}\nالموقع: ${data.distance} كم\nالإجراء: ${data.action}`;
  return sendInApp(userId, title, message, 'community');

  // --- WhatsApp version (future) ---
  // return sendWhatsApp(phone, `تنبيه محلي ⚠️\n${message}`);
}

/**
 * Send OTP for phone authentication.
 * NOTE: OTP must still be sent via SMS — this in-app channel is kept as a
 * secondary log only. Twilio will be activated for OTP specifically.
 * @param {string} userId
 * @param {string} otpCode
 */
async function sendOTP(userId, otpCode) {
  // Log OTP in-app (useful during development / testing)
  return sendInApp(
    userId,
    'رمز التحقق 🔐',
    `كود التحقق: ${otpCode}\nلا تشارك هذا الكود مع أي شخص.`,
    'system'
  );

  // --- SMS version for production ---
  // return sendSMS(phone, `كود التحقق: ${otpCode}\nلا تشارك هذا الكود مع أي شخص.`);
}

// ============================================================================
// COMMENTED-OUT WHATSAPP + SMS IMPLEMENTATIONS (future)
// ============================================================================

// async function sendWhatsApp(phone, message) {
//   if (!AISENSY_API_KEY || !AISENSY_INSTANCE_ID) {
//     console.warn('NotificationService: AiSensy not configured');
//     return { sent: false, reason: 'not_configured' };
//   }
//   const url = `https://wati.in/api/v1/templateMessage/${AISENSY_INSTANCE_ID}/send`;
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: { 'Authorization': `Bearer ${AISENSY_API_KEY}`, 'Content-Type': 'application/json' },
//     body: JSON.stringify({ phone, message, encoding: 'unicode' })
//   });
//   if (!response.ok) throw new Error(`AiSensy error: ${response.status}`);
//   const data = await response.json();
//   return { sent: true, messageId: data.id || data.message_id, channel: 'whatsapp', provider: 'aisensy' };
// }

// async function sendSMS(phone, message) {
//   const client = getTwilioClient();
//   if (!client) { console.warn('NotificationService: Twilio not configured'); return { sent: false }; }
//   const result = await client.messages.create({ body: message, from: TWILIO_PHONE_NUMBER, to: phone });
//   return { sent: result.status !== 'failed', messageId: result.sid, channel: 'sms', provider: 'twilio' };
// }

// ============================================================================
// PREFERENCES (stored in Supabase)
// ============================================================================

async function getPreferences(userId) {
  const supabase = require('../config/supabase');
  try {
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data || getDefaultPreferences();
  } catch {
    return getDefaultPreferences();
  }
}

function getDefaultPreferences() {
  return {
    irrigation: { enabled: true,  channel: 'in_app' },
    price:      { enabled: true,  channel: 'in_app' },
    community:  { enabled: true,  channel: 'in_app' },
    marketing:  { enabled: false, channel: 'in_app' }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

const notificationService = {
  sendInApp,
  markRead,
  getUnread,
  sendOTP,
  sendIrrigationAlert,
  sendPriceAlert,
  sendCommunityAlert,
  getPreferences
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = notificationService;
}

if (typeof window !== 'undefined') {
  window.notificationService = notificationService;
}