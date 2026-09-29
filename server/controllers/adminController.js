/**
 * controllers/adminController.js
 * Admin auth + protected CRUD for registrations
 */
const jwt          = require('jsonwebtoken');
const Admin        = require('../models/Admin');
const Registration = require('../models/Registration');

// ─── Cookie config ───────────────────────────────────────────────────
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 8 * 60 * 60 * 1000, // 8 hours in ms
};

// ─── POST /api/admin/login ───────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    if (!adminId || !password) {
      return res.status(400).json({ success: false, message: 'Admin ID and password are required.' });
    }

    const admin = await Admin.findOne({ adminId: adminId.trim() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const valid = await admin.verifyPassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { adminId: admin.adminId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.cookie('adminToken', token, COOKIE_OPTS);
    return res.json({ success: true, message: 'Login successful.', adminId: admin.adminId });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── POST /api/admin/logout ──────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie('adminToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res.json({ success: true, message: 'Logged out.' });
};

// ─── GET /api/admin/me ───────────────────────────────────────────────
exports.me = (req, res) => {
  return res.json({ success: true, adminId: req.admin.adminId });
};

// ─── GET /api/admin/registrations ───────────────────────────────────
exports.listRegistrations = async (req, res) => {
  try {
    const { search, category, city, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (search) {
      const re = new RegExp(search.trim(), 'i');
      filter.$or = [
        { registrationId: re },
        { fullName: re },
        { phone: re },
        { email: re },
        { institution: re },
      ];
    }
    if (category && ['student', 'club', 'influencer', 'citizen'].includes(category)) {
      filter.category = category;
    }
    if (city) filter.city = new RegExp(city.trim(), 'i');

    const skip  = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Registration.countDocuments(filter);
    const docs  = await Registration.find(filter)
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    // Summary counts
    const [totalAll, students, clubs, influencers, citizens] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({ category: 'student' }),
      Registration.countDocuments({ category: 'club' }),
      Registration.countDocuments({ category: 'influencer' }),
      Registration.countDocuments({ category: 'citizen' }),
    ]);

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayCount = await Registration.countDocuments({ registeredAt: { $gte: todayStart } });

    return res.json({
      success: true,
      summary: { total: totalAll, students, clubs, influencers, citizens, today: todayCount },
      pagination: { total, page: parseInt(page,10), limit: parseInt(limit,10) },
      data: docs,
    });
  } catch (err) {
    console.error('listRegistrations error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET /api/admin/registrations/:registrationId ───────────────────
exports.getRegistration = async (req, res) => {
  try {
    const record = await Registration.findOne({ registrationId: req.params.registrationId }).lean();
    if (!record) return res.status(404).json({ success: false, message: 'Not found.' });
    return res.json({ success: true, data: record });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── POST /api/admin/registrations (admin-add) ───────────────────────
exports.addRegistration = async (req, res) => {
  try {
    const {
      fullName, phone, email, category, institution, city,
      socialActive, platform, handle, followers,
      awarenessTopics, pledgeAccepted,
    } = req.body;

    if (!fullName || !phone || !category) {
      return res.status(400).json({ success: false, message: 'Name, phone, and category are required.' });
    }

    // Generate unique ID
    let registrationId, registrationNumber;
    for (let i = 0; i < 50; i++) {
      const num = Math.floor(1000 + Math.random() * 9000).toString();
      const exists = await Registration.exists({ registrationNumber: num });
      if (!exists) { registrationNumber = num; registrationId = `HPP-YS-50-${num}`; break; }
    }
    if (!registrationId) return res.status(500).json({ success: false, message: 'Could not generate unique ID.' });

    const regDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const record = new Registration({
      registrationId, registrationNumber,
      fullName: fullName.trim(), phone: phone.replace(/\D/g,''),
      email: email?.trim()?.toLowerCase() || 'N/A',
      category, institution: institution?.trim() || 'Individual Volunteer',
      city: city?.trim() || 'Gorakhpur',
      socialActive: socialActive || 'no',
      platform: platform?.trim() || '', handle: handle?.trim() || '',
      followers: parseInt(followers,10) || 0,
      awarenessTopics: Array.isArray(awarenessTopics) ? awarenessTopics : [],
      pledgeAccepted: Boolean(pledgeAccepted),
      regDate, source: 'admin',
    });

    await record.save();
    return res.status(201).json({ success: true, message: 'Registration added.', data: record });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Duplicate ID.' });
    console.error('addRegistration error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── PUT /api/admin/registrations/:registrationId ────────────────────
exports.updateRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    // Prevent changing registrationId/registrationNumber
    const { registrationId: _, registrationNumber: __, _id: ___, ...updates } = req.body;
    updates.updatedAt = new Date();

    const record = await Registration.findOneAndUpdate(
      { registrationId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!record) return res.status(404).json({ success: false, message: 'Not found.' });
    return res.json({ success: true, message: 'Updated.', data: record });
  } catch (err) {
    console.error('updateRegistration error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── DELETE /api/admin/registrations/:registrationId ─────────────────
exports.deleteRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const record = await Registration.findOneAndDelete({ registrationId });
    if (!record) return res.status(404).json({ success: false, message: 'Not found.' });
    return res.json({ success: true, message: `Registration ${registrationId} deleted.` });
  } catch (err) {
    console.error('deleteRegistration error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── POST /api/admin/migrate — import localStorage records ───────────
exports.migrateFromLocalStorage = async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No records provided.' });
    }

    let imported = 0, skipped = 0, errors = [];

    for (const r of records) {
      const regId = r.registrationId || r.regId;
      if (!regId) { skipped++; continue; }

      const exists = await Registration.exists({ registrationId: regId });
      if (exists) { skipped++; continue; }

      const num = regId.split('-').pop();
      try {
        await Registration.create({
          registrationId:   regId,
          registrationNumber: num,
          fullName:         r.fullName || 'Unknown',
          phone:            r.phone?.replace(/\D/g,'') || '0000000000',
          email:            r.email || 'N/A',
          category:         ['student','club','influencer','citizen'].includes(r.category) ? r.category : 'citizen',
          institution:      r.institution || 'Individual Volunteer',
          city:             r.city || 'Gorakhpur',
          socialActive:     r.socialActive || 'no',
          platform:         r.platform || '',
          handle:           r.handle || '',
          followers:        parseInt(r.followers,10) || 0,
          awarenessTopics:  r.awarenessTopics || [],
          pledgeAccepted:   true,
          regDate:          r.regDate || '',
          registeredAt:     r.timestamp ? new Date(r.timestamp) : new Date(),
          source:           'migration',
        });
        imported++;
      } catch (e) {
        errors.push({ regId, error: e.message });
      }
    }

    return res.json({ success: true, imported, skipped, errors });
  } catch (err) {
    console.error('migration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during migration.' });
  }
};
