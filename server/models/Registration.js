/**
 * models/Registration.js — Mongoose schema for participant registrations
 * MongoDB-ready: mirrors the complete data structure from the registration form.
 */
const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    // ─── Core ID (unique, permanent) ───────────────────────────────
    registrationId: {
      type: String,
      required: true,
      unique: true,
      match: /^HPP-YS-50-\d{4}$/,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{4}$/,
    },

    // ─── Personal details ──────────────────────────────────────────
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone:    { type: String, required: true, trim: true, match: /^[6-9]\d{9}$/ },
    email:    { type: String, required: true, trim: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },

    // ─── Participant classification ────────────────────────────────
    category: {
      type: String,
      required: true,
      enum: ['student', 'club', 'influencer', 'citizen'],
    },
    institution: { type: String, trim: true, default: 'Individual Volunteer' },
    city:        { type: String, trim: true, default: 'Gorakhpur' },

    // ─── Social media ──────────────────────────────────────────────
    socialActive: { type: String, enum: ['yes', 'no'], default: 'no' },
    platform:     { type: String, trim: true, default: '' },
    handle:       { type: String, trim: true, default: '' },
    followers:    { type: Number, default: 0, min: 0 },

    // ─── Awareness topics chosen ───────────────────────────────────
    awarenessTopics: [{ type: String }],

    // ─── Pledge / Consent ─────────────────────────────────────────
    pledgeAccepted: { type: Boolean, required: true, default: false },

    // ─── Date metadata ────────────────────────────────────────────
    regDate:      { type: String },           // human-readable "27 Sep 2026"
    registeredAt: { type: Date, default: Date.now },

    // ─── Misc flags ───────────────────────────────────────────────
    source: { type: String, enum: ['form', 'admin', 'migration'], default: 'form' },
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

module.exports = mongoose.model('Registration', registrationSchema);
