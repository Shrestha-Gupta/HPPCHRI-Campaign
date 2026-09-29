/**
 * api/index.js — Vercel Serverless Function Entry Point
 *
 * Vercel treats every file in the /api directory as a serverless
 * function. This file re-exports the Express app so Vercel can
 * invoke it as a standard Node.js HTTP handler.
 *
 * Path: /api/index.js  →  handles all /api/* routes per vercel.json
 *
 * NOTE: We do NOT call app.listen() here. Vercel's runtime manages
 * the HTTP server lifecycle.
 */
const app = require('../server/app');

module.exports = app;
