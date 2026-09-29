/**
 * server/app.js — HPPCHRI Campaign Express Application
 *
 * This file configures and exports the Express app WITHOUT calling
 * app.listen(). It is shared between:
 *   • server.js  — local development  (calls app.listen())
 *   • ../api/index.js — Vercel serverless function (exports the app)
 */
require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');

const connectDB    = require('./config/db');

const app = express();

// ─── Security headers ──────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // relax for static frontend embedding
}));

// ─── CORS ──────────────────────────────────────────────────────────
// When frontend and API are on the same Vercel domain, browsers send
// same-origin requests (no Origin header), which are always allowed.
// We only need explicit CORS for cross-origin dev traffic.
const allowedOrigins = [
  // Populated from env in production (your Vercel frontend URL)
  process.env.FRONTEND_URL,
  // Local development origins
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
].filter(Boolean); // remove undefined if FRONTEND_URL is not set

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin requests (no Origin header) — e.g. Vercel same-domain
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true, // needed for HttpOnly cookie
}));

// ─── Body + cookie parsers ─────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Ensure DB is connected on every request (serverless-safe) ─────
// connectDB() is idempotent — it returns the cached connection if
// already open, so this adds negligible overhead on warm invocations.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(503).json({ success: false, message: 'Database unavailable. Please try again later.' });
  }
});

// ─── API routes ────────────────────────────────────────────────────
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));

// ─── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ─── 404 for unknown API calls ─────────────────────────────────────
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'API endpoint not found.' }));

// ─── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;
