/**
 * server/server.js — Local development entry point
 *
 * Imports the shared Express app and starts a persistent HTTP server.
 * This file is used ONLY for local development (npm start / npm run dev).
 *
 * On Vercel, api/index.js is used instead — it exports the app without
 * calling listen(), as required by Vercel's serverless runtime.
 */
const app  = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
