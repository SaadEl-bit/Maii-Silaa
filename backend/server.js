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

const authRoutes = require('./routes/auth');
const irrigationRoutes = require('./routes/irrigation');
const marketRoutes = require('./routes/market');
const detectionRoutes = require('./routes/detection');
const communityRoutes = require('./routes/community');
const notificationRoutes = require('./routes/notifications');

const app = express();

// ── Middleware ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/market', marketRoutes);
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