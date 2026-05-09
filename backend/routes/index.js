/**
 * Routes Index — Central Route Registration
 * 
 * Mounts all domain routers on the Express app.
 * Order matters: specific routes first, then catch-all.
 */

const express = require('express');
const router = express.Router();

// Import domain routers
const authRoutes = require('./auth');
const irrigationRoutes = require('./irrigation');
const weatherRoutes = require('./weather');
const marketRoutes = require('./market');
const silaRoutes = require('./sila');
const detectionRoutes = require('./detection');
const communityRoutes = require('./community');
const notificationRoutes = require('./notifications');

// Health check (no prefix)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routes on /api prefix
router.use('/auth', authRoutes);
router.use('/irrigation', irrigationRoutes);
router.use('/weather', weatherRoutes);
router.use('/market', marketRoutes);
router.use('/sila', silaRoutes);
router.use('/detection', detectionRoutes);
router.use('/community', communityRoutes);
router.use('/notifications', notificationRoutes);

// 404 handler (at /api level)
router.use((req, res) => {
  res.status(404).json({
    error: 'غير موجود',
    message: `مسار غير موجود: ${req.method} ${req.originalUrl}`
  });
});

module.exports = router;