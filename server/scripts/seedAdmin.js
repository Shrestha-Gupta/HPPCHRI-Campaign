/**
 * scripts/seedAdmin.js
 * Run ONCE to create the first admin account in MongoDB.
 * Usage: node scripts/seedAdmin.js
 *
 * Reads credentials from environment variables:
 *   ADMIN_ID       — the admin login username
 *   ADMIN_PASSWORD — the plain-text password (hashed before storing)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Admin    = require('../models/Admin');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminId  = process.env.ADMIN_ID;
    const password = process.env.ADMIN_PASSWORD;

    if (!adminId || !password) {
      console.error('❌ ADMIN_ID and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }

    const existing = await Admin.findOne({ adminId });
    if (existing) {
      console.log(`⚠️  Admin "${adminId}" already exists. Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    const SALT_ROUNDS = 12;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await Admin.create({ adminId, passwordHash });
    console.log(`✅ Admin account created: "${adminId}"`);
    console.log('   → Password stored as bcrypt hash. The plain-text password is NOT saved.');

  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
