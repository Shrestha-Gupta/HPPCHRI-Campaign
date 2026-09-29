/**
 * routes/registrationRoutes.js — Public registration endpoints
 */
const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/registrationController');

// POST /api/registrations          — Submit form registration
router.post('/', ctrl.createRegistration);

// GET  /api/registrations/:registrationId — QR/pass public verification
router.get('/:registrationId', ctrl.getRegistrationById);

module.exports = router;
