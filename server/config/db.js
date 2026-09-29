/**
 * config/db.js — MongoDB Atlas connection (serverless-safe)
 *
 * Caches the connection promise in a module-level variable so that
 * Vercel / AWS Lambda warm invocations reuse the same open socket
 * instead of creating a new connection on every request.
 *
 * process.exit() is intentionally NOT called on error — doing so in
 * a serverless environment would kill the Lambda container and mask
 * the real error. Instead we throw so the caller can handle it.
 */
const mongoose = require('mongoose');

// Module-level cache — survives across warm Lambda invocations
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false, // fail fast if not yet connected
      })
      .then((m) => {
        console.log(`✅ MongoDB connected: ${m.connection.host}`);
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset so the next invocation can retry
    cached.promise = null;
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;
