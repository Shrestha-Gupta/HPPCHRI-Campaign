/**
 * server.js — HPPCHRI Campaign Backend
 * Node.js + Express + MongoDB Atlas
 */
require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const path         = require('path');
const connectDB    = require('./config/db');

// ─── Connect to MongoDB ────────────────────────────────────────────
connectDB();

const app = express();

// ─── Security headers ──────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // relax for static frontend embedding
}));

// ─── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:8080',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5000',
  'http://localhost:5500',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true, // needed for HttpOnly cookie
}));

// ─── Body + cookie parsers ─────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// ─── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
