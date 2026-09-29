/**
 * routes/adminRoutes.js — Protected admin API endpoints
 */
const express       = require('express');
const router        = express.Router();
const ctrl          = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');
const rateLimit     = require('express-rate-limit');

// Brute-force protection on login only
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Auth routes (public) ────────────────────────────────────────
router.post('/login',  loginLimiter, ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me',      requireAdmin, ctrl.me);

// ─── Registration management (all protected) ─────────────────────
router.get   ('/registrations',              requireAdmin, ctrl.listRegistrations);
router.get   ('/registrations/:registrationId', requireAdmin, ctrl.getRegistration);
router.post  ('/registrations',              requireAdmin, ctrl.addRegistration);
router.put   ('/registrations/:registrationId', requireAdmin, ctrl.updateRegistration);
router.delete('/registrations/:registrationId', requireAdmin, ctrl.deleteRegistration);

// ─── LocalStorage migration (protected) ─────────────────────────
router.post('/migrate', requireAdmin, ctrl.migrateFromLocalStorage);

module.exports = router;
