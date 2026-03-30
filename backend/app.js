'use strict';

require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const morgan     = require('morgan');
const compression = require('compression');

const routes       = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const logger       = require('./utils/logger');

const app = express();

// ── Security headers ─────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map(u => u.trim());
    const isAllowed = allowed.some(u => origin === u) ||
      /^https:\/\/mekacare(-[a-z0-9]+)*\.vercel\.app$/.test(origin);
    if (isAllowed) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ── HTTP request logging ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

// ── Global rate limiter ───────────────────────────────────────────────
app.use('/api', generalLimiter);

// ── Health check ──────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() })
);

// ── API routes ────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 handler ───────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.path}` })
);

// ── Global error handler ──────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
