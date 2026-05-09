/**
 * FILAHA API Server — Express Entry Point
 * 
 * Mounts all middleware and routes.
 * Starts HTTP server on PORT from .env (default: 3000).
 * 
 * Routes:
 *   /api/auth            → Auth endpoints
 *   /api/irrigation      → MAÏ irrigation endpoints
 *   /api/market         → SILA market endpoints
 *   /api/detection      → AI photo diagnosis
 *   /api/community     → 15km radius alerts
 *   /api/notifications → In-app notifications
 *   /api/health        → Health check
 */

require('dotenv').config();
const express = require('express');

const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');
const { i18n } = require('./middleware/i18n');
const { limiters } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const irrigationRoutes = require('./routes/irrigation');
const weatherRoutes = require('./routes/weather');
const marketRoutes = require('./routes/market');
const silaRoutes = require('./routes/sila');
const marketplaceRoutes = require('./routes/marketplace');
const detectionRoutes = require('./routes/detection');
const communityRoutes = require('./routes/community');
const notificationRoutes = require('./routes/notifications');

const app = express();

// ── Middleware ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// I18n — resolve locale (ar default)
app.use(i18n);

// Rate Limiting — per route
app.use('/api/auth', limiters.auth);
app.use('/api/detection', limiters.detection);
app.use('/api/irrigation', limiters.standard);
app.use('/api/weather', limiters.public);
app.use('/api/market', limiters.public);
app.use('/api/sila', limiters.public);
app.use('/api/marketplace', limiters.standard);
app.use('/api/community', limiters.standard);
app.use('/api/notifications', limiters.standard);

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ── Routes ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/sila', silaRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/detection', detectionRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Error Handling ───────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Server Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`FILAHA API running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;