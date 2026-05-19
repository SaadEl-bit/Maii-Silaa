/**
 * Notifications Routes — In-App Alerts API
 * 
 * Endpoints:
 *   GET  /notifications             → Get user's notifications
 *   PUT  /notifications/:id/read    → Mark as read
 *   PUT  /notifications/read-all   → Mark all as read
 *   DELETE /notifications/:id       → Delete notification
 */

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const notificationService = require('../services/notificationService');
const supabase = require('../config/supabase');

/**
 * GET /notifications
 * 
 * Returns: { notifications: [], unreadCount }
 */
router.get('/', auth.authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  let data, error;
  try {
    const result = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    data = result.data;
    error = result.error;
  } catch (e) {
    return res.json({ notifications: [], unreadCount: 0 });
  }
  
  if (error) {
    if (error.code === '42P01') {
      return res.json({ notifications: [], unreadCount: 0 });
    }
    throw error;
  }
  
  const unread = (data || []).filter(n => !n.is_read).length;
  
  res.json({
    notifications: data || [],
    unreadCount: unread
  });
}));

/**
 * PUT /notifications/:id/read
 */
router.put('/:id/read', auth.authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  
  res.json({
    success: true,
    notification: data
  });
}));

/**
 * PUT /notifications/read-all
 */
router.put('/read-all', auth.authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);
  
  if (error) throw error;
  
  res.json({
    success: true,
    updated: data?.length || 0
  });
}));

/**
 * DELETE /notifications/:id
 */
router.delete('/:id', auth.authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) throw error;
  
  res.json({
    success: true
  });
}));

module.exports = router;