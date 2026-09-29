/**
 * server/services/emailService.js
 *
 * Sends confirmation emails via the EmailJS REST API using Node's
 * built-in `https` module — NO extra npm package required.
 *
 * EmailJS server-side API docs:
 *   https://www.emailjs.com/docs/rest-api/send/
 *
 * Required environment variables (set in .env / Vercel dashboard):
 *   EMAILJS_SERVICE_ID   — Your EmailJS service ID  (e.g. "service_abc123")
 *   EMAILJS_TEMPLATE_ID  — Your EmailJS template ID (e.g. "template_xyz789")
 *   EMAILJS_PUBLIC_KEY   — Your EmailJS public key  (e.g. "aBcDeFgHiJkLmNoP")
 *   EMAILJS_PRIVATE_KEY  — Your EmailJS private key (NEVER expose to frontend)
 *
 * Template variables expected by your EmailJS template:
 *   {{to_email}}           — recipient email address
 *   {{full_name}}          — participant's full name
 *   {{registration_id}}    — HPP-YS-50-XXXX
 *   {{registration_number}}— XXXX (4-digit number)
 *   {{phone}}              — WhatsApp number
 *   {{category}}           — student / club / influencer / citizen
 *   {{institution}}        — school / club / organization name
 *   {{city}}               — city
 *   {{awareness_topics}}   — comma-separated list of topics
 *   {{registration_date}}  — human-readable date
 *   {{pass_url}}           — https://hppchri-campaign.vercel.app/pass.html?id=...
 */
const https = require('https');

/**
 * Sends a registration confirmation email.
 *
 * @param {object} registrationData — the saved MongoDB registration document
 * @returns {Promise<{ sent: boolean, error?: string }>}
 *
 * NEVER throws — always resolves so a mail failure cannot break the API response.
 */
async function sendConfirmationEmail(registrationData) {
  const {
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY,
    FRONTEND_URL,
  } = process.env;

  // ── Guard: skip silently if credentials are not configured ──────────
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    console.warn('[EmailService] EmailJS credentials not configured — skipping email send.');
    return { sent: false, error: 'EmailJS not configured' };
  }

  // ── Build pass URL ───────────────────────────────────────────────────
  // In production FRONTEND_URL = https://hppchri-campaign.vercel.app
  // In local dev  FRONTEND_URL = http://localhost:5500
  const baseUrl = (FRONTEND_URL || 'https://hppchri-campaign.vercel.app').replace(/\/$/, '');
  const passUrl = `${baseUrl}/pass.html?id=${encodeURIComponent(registrationData.registrationId)}`;

  // ── Build template variables ─────────────────────────────────────────
  const topics = Array.isArray(registrationData.awarenessTopics) && registrationData.awarenessTopics.length
    ? registrationData.awarenessTopics.join(', ')
    : 'General Awareness';

  const templateParams = {
    to_email:            registrationData.email,
    full_name:           registrationData.fullName,
    registration_id:     registrationData.registrationId,
    registration_number: registrationData.registrationNumber,
    phone:               registrationData.phone,
    category:            registrationData.category,
    institution:         registrationData.institution,
    city:                registrationData.city,
    awareness_topics:    topics,
    registration_date:   registrationData.regDate,
    pass_url:            passUrl,
  };

  // ── Build EmailJS REST API payload ───────────────────────────────────
  const payload = JSON.stringify({
    service_id:  EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id:     EMAILJS_PUBLIC_KEY,   // public key authenticates the account
    accessToken: EMAILJS_PRIVATE_KEY,  // private key for server-side sends
    template_params: templateParams,
  });

  // ── Send via Node built-in https ─────────────────────────────────────
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.emailjs.com',
      path:     '/api/v1.0/email/send',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'origin':         'https://hppchri-campaign.vercel.app',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`[EmailService] Confirmation email sent to ${registrationData.email}`);
          resolve({ sent: true });
        } else {
          // Log status only — no credentials in the log
          console.error(`[EmailService] EmailJS returned HTTP ${res.statusCode}: ${body}`);
          resolve({ sent: false, error: `EmailJS HTTP ${res.statusCode}` });
        }
      });
    });

    req.on('error', (err) => {
      // Network error — log message only, no credentials
      console.error('[EmailService] Network error sending email:', err.message);
      resolve({ sent: false, error: err.message });
    });

    req.setTimeout(8000, () => {
      req.destroy();
      console.error('[EmailService] Email request timed out after 8s');
      resolve({ sent: false, error: 'timeout' });
    });

    req.write(payload);
    req.end();
  });
}

module.exports = { sendConfirmationEmail };
