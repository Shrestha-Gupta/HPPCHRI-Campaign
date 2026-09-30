/**
 * controllers/registrationController.js
 * Public: create registration, get single registration by ID
 */
const Registration           = require('../models/Registration');
const { sendConfirmationEmail } = require('../services/emailService');

// ─── Email format validator ───────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Generate unique Registration ID ────────────────────────────────
async function generateUniqueId() {
  const MAX_ATTEMPTS = 50;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const num = Math.floor(1000 + Math.random() * 9000).toString();
    const exists = await Registration.exists({ registrationNumber: num });
    if (!exists) {
      return { registrationId: `HPP-YS-50-${num}`, registrationNumber: num };
    }
  }
  throw new Error('Could not generate a unique registration number. Please try again.');
}

// ─── POST /api/registrations ─────────────────────────────────────────
exports.createRegistration = async (req, res) => {
  try {
    const {
      fullName, phone, email, category, institution, city,
      socialActive, platform, handle, followers,
      awarenessTopics, pledgeAccepted,
    } = req.body;

    // ── Server-side validation ────────────────────────────────────────
    if (!fullName || !phone || !category) {
      return res.status(400).json({ success: false, message: 'Name, phone, and category are required.' });
    }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ success: false, message: 'Invalid WhatsApp number. Must be 10 digits starting with 6-9.' });
    }
    if (!['student', 'club', 'influencer', 'citizen'].includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }
    if (!pledgeAccepted) {
      return res.status(400).json({ success: false, message: 'Pledge acceptance is required.' });
    }

    // ── Email — required + format check ──────────────────────────────
    const emailNorm = email?.trim()?.toLowerCase() || '';
    if (!emailNorm) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!EMAIL_RE.test(emailNorm)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // ── Instagram URL — required for all registrants ─────────────────
    const instagramUrl = handle?.trim() || '';
    const INSTAGRAM_RE = /^https?:\/\/(www\.)?instagram\.com\/.+/i;
    if (!instagramUrl) {
      return res.status(400).json({ success: false, message: 'Instagram Profile URL is required. Please enter your Instagram profile link (e.g. https://instagram.com/yourusername).' });
    }
    if (!INSTAGRAM_RE.test(instagramUrl)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid Instagram profile URL (e.g. https://instagram.com/yourusername). @username alone is not accepted.' });
    }

    // ── Generate unique ID ────────────────────────────────────────────
    const { registrationId, registrationNumber } = await generateUniqueId();

    const regDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

    const record = new Registration({
      registrationId,
      registrationNumber,
      fullName:         fullName.trim(),
      phone:            phone.replace(/\D/g, ''),
      email:            emailNorm,
      category,
      institution:      institution?.trim() || 'Individual Volunteer',
      city:             city?.trim() || 'Gorakhpur',
      socialActive:     socialActive || 'no',
      platform:         platform?.trim() || '',
      handle:           handle?.trim() || '',
      followers:        parseInt(followers, 10) || 0,
      awarenessTopics:  Array.isArray(awarenessTopics) ? awarenessTopics : [],
      pledgeAccepted:   Boolean(pledgeAccepted),
      regDate,
      source: 'form',
    });

    // ── Save to MongoDB FIRST ─────────────────────────────────────────
    await record.save();

    // ── Send confirmation email AFTER successful save ─────────────────
    // sendConfirmationEmail never throws — email failure does NOT affect
    // the registration or the API response status.
    const emailResult = await sendConfirmationEmail(record.toObject());

    return res.status(201).json({
      success:   true,
      message:   'Registration successful.',
      emailSent: emailResult.sent,
      data:      record,
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate registration ID. Please try again.' });
    }
    console.error('createRegistration error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// ─── GET /api/registrations/:registrationId ──────────────────────────
// Public — used by pass.html QR scan verification
exports.getRegistrationById = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const record = await Registration.findOne({ registrationId }).lean();
    if (!record) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    // Return only safe fields for public verification (no contact details)
    const publicData = {
      registrationId: record.registrationId,
      fullName:       record.fullName,
      category:       record.category,
      institution:    record.institution,
      city:           record.city,
      regDate:        record.regDate,
      registeredAt:   record.registeredAt,
    };
    return res.json({ success: true, data: publicData });
  } catch (err) {
    console.error('getRegistrationById error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
