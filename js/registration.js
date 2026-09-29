/**
 * HPPCHRI - Yuva Sanchar Registration System v3
 * Primary storage: MongoDB via backend API
 * QR: real scannable code via QRCode.js
 */

// ─── Config ────────────────────────────────────────────────────────
// In production (Vercel), frontend and API share the same domain, so
// we use an empty string — all fetch('/api/...') calls are same-origin.
// During local development (localhost / 127.0.0.1), we target the
// Express dev server running on port 5000.
const API_BASE_URL = (() => {
  const h = window.location.hostname;
  // Mirror page hostname so HttpOnly cookie domain always matches the API domain.
  if (h === '127.0.0.1') return 'http://127.0.0.1:5000';
  if (h === 'localhost')  return 'http://localhost:5000';
  return ''; // same-origin on Vercel
})();


// Verification URL base for QR payload
const VERIFY_BASE = (() => {
  const o = window.location.origin;
  const p = window.location.pathname.replace(/\/[^/]*$/, '');
  return o + p;
})();

// ─── QR code rendering ─────────────────────────────────────────────
function renderQrCode(registrationId, containerEl) {
  containerEl.innerHTML = '';
  const payload = `${VERIFY_BASE}/pass.html?id=${encodeURIComponent(registrationId)}`;
  if (typeof QRCode !== 'undefined') {
    new QRCode(containerEl, {
      text: payload, width: 108, height: 108,
      colorDark: '#05668d', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
  } else {
    containerEl.innerHTML = `<div style="width:108px;height:108px;background:#f0f3bd;
      display:flex;align-items:center;justify-content:center;font-size:.6rem;
      color:#05668d;border:2px solid #05668d;border-radius:4px;padding:4px;
      word-break:break-all;text-align:center;">${registrationId}</div>`;
  }
}

// ─── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initRegistrationForm();
  // Admin button in navbar now links to /admin.html — no modal needed
});

function initRegistrationForm() {
  const form               = document.getElementById('drive-registration-form');
  const categorySelect     = document.getElementById('reg-category');
  const socialActiveSelect = document.getElementById('reg-social-active');
  const influencerDetails  = document.getElementById('influencer-details-group');
  const institutionGroup   = document.getElementById('institution-group');
  const institutionLabel   = document.getElementById('institution-label');
  const passContainer      = document.getElementById('pass-showcase-container');
  const formCard           = document.getElementById('registration-form-card');

  if (!form) return;

  // Category → conditional fields
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      const cat = categorySelect.value;
      if (cat === 'student') {
        institutionGroup.style.display = 'block';
        institutionLabel.textContent = 'School / College / University Name *';
        document.getElementById('reg-institution').placeholder = 'e.g. DDU Gorakhpur University / MMMUT / AIIMS / BRD';
        if (influencerDetails) influencerDetails.style.display = 'none';
      } else if (cat === 'club') {
        institutionGroup.style.display = 'block';
        institutionLabel.textContent = 'Club / Organization Name *';
        document.getElementById('reg-institution').placeholder = 'e.g. Rotary Club / Lions Club / Gorakhpur Youth Forum';
        if (influencerDetails) influencerDetails.style.display = 'none';
      } else if (cat === 'influencer') {
        institutionGroup.style.display = 'none';
        if (influencerDetails) influencerDetails.style.display = 'block';
      } else {
        institutionGroup.style.display = 'block';
        institutionLabel.textContent = 'Affiliated Organization / Community (Optional)';
        document.getElementById('reg-institution').placeholder = 'e.g. Citizen Volunteer / Resident Association';
        if (influencerDetails) influencerDetails.style.display = 'none';
      }
    });
  }

  if (socialActiveSelect) {
    socialActiveSelect.addEventListener('change', () => {
      const g = document.getElementById('social-details-group');
      if (g) g.style.display = socialActiveSelect.value === 'yes' ? 'block' : 'none';
    });
  }

  // ── Form submission → POST to backend ─────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    const fullName      = document.getElementById('reg-name').value.trim();
    const phone         = document.getElementById('reg-phone').value.trim();
    const email         = document.getElementById('reg-email').value.trim();
    const category      = document.getElementById('reg-category').value;
    const city          = document.getElementById('reg-city').value.trim();
    const pledgeChecked = document.getElementById('reg-pledge').checked;
    const socialActive  = document.getElementById('reg-social-active')?.value || 'no';

    // Basic client-side validation
    if (!fullName || !phone || !category) {
      alert('कृपया सभी आवश्यक फ़ील्ड भरें / Please fill all required fields.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      alert('कृपया एक वैध 10-अंकीय व्हाट्सएप नंबर दर्ज करें / Please enter a valid 10-digit WhatsApp number.');
      return;
    }
    // Email — required + basic format
    if (!email) {
      alert('कृपया ईमेल पता दर्ज करें / Please enter your email address.');
      document.getElementById('reg-email').focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('कृपया एक वैध ईमेल पता दर्ज करें / Please enter a valid email address.');
      document.getElementById('reg-email').focus();
      return;
    }
    if (!pledgeChecked) {
      alert('कृपया जागरूकता अभियान की प्रतिज्ञा स्वीकार करें / Please accept the awareness campaign pledge.');
      return;
    }

    let institution = document.getElementById('reg-institution')?.value.trim() || '';
    let platform = '', handle = '', followers = 0;
    let awarenessTopics = [];

    if (category === 'influencer') {
      platform  = document.getElementById('reg-platform')?.value ?? '';
      handle    = document.getElementById('reg-handle')?.value.trim() ?? '';
      followers = parseInt(document.getElementById('reg-followers')?.value ?? 0, 10) || 0;
      institution = `Influencer (${platform} @${handle.replace('@', '')})`;
      if (followers < 10000) {
        const proceed = confirm('नोट: इन्फ्लुएंसर श्रेणी के लिए 10,000+ फॉलोअर्स का मानक है। क्या आप आगे बढ़ना चाहेंगे?');
        if (!proceed) return;
      }
    }

    // Collect checked awareness topics
    document.querySelectorAll('input[name="topics"]:checked').forEach(cb => {
      awarenessTopics.push(cb.value);
    });

    // ── Show loading state ───────────────────────────────────────────
    const origBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering… / पंजीकृत हो रहा है…';

    try {
      const response = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, phone: phone.replace(/\D/g, ''), email,
          category, institution, city, socialActive,
          platform, handle, followers, awarenessTopics,
          pledgeAccepted: pledgeChecked,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(`Registration failed / पंजीकरण विफल:\n${result.message || 'Please try again.'}`);
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHTML;
        return;
      }

      // ── SUCCESS ─────────────────────────────────────────────────────
      const participantData = result.data;
      renderDelegatePass(participantData);

      if (formCard) formCard.style.display = 'none';
      if (passContainer) {
        passContainer.classList.add('active');
        passContainer.scrollIntoView({ behavior: 'smooth' });
      }

      // Non-blocking email notice (does NOT affect pass validity)
      if (result.emailSent === false) {
        const notice = document.createElement('div');
        notice.style.cssText = [
          'margin:12px 16px 0',
          'padding:10px 14px',
          'background:#fff8e1',
          'border-left:3px solid #f9a825',
          'border-radius:4px',
          'font-size:.82rem',
          'color:#5d4037',
          'line-height:1.5',
        ].join(';');
        notice.innerHTML = '⚠️ Registration successful, but the confirmation email could not be sent. ' +
          'Your Registration ID and pass are still fully valid.<br>' +
          '<em style="color:#795548;">पंजीकरण सफल हुआ, परंतु पुष्टि ईमेल नहीं भेजा जा सका। आपका पास और पंजीकरण संख्या मान्य है।</em>';
        const passRender = document.getElementById('pass-render-area');
        if (passRender) passRender.appendChild(notice);
      }

    } catch (networkErr) {
      console.error('Network error:', networkErr);
      alert('Network error / नेटवर्क त्रुटि: Could not reach the server. Please check your internet connection and try again.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnHTML;
    }
  });
}

// ─── Render delegate pass ──────────────────────────────────────────
function renderDelegatePass(data) {
  const container = document.getElementById('pass-render-area');
  if (!container) return;

  const regId = data.registrationId || data.regId;

  const categoryTitles = {
    student:    'Student Delegate',
    club:       'Club Member Ambassador',
    influencer: 'Verified Digital Creator',
    citizen:    'Community Health Advocate',
  };
  const categoryName = categoryTitles[data.category] || 'Campaign Delegate';
  const verificationUrl = `${VERIFY_BASE}/pass.html?id=${encodeURIComponent(regId)}`;

  container.innerHTML = `
    <div class="delegate-pass-card" id="printable-pass">

      <div style="background:linear-gradient(135deg,#02c39a 0%,#00a896 100%);
                  color:#fff;text-align:center;padding:10px 18px;
                  border-radius:var(--border-radius-lg) var(--border-radius-lg) 0 0;
                  font-weight:700;font-size:.95rem;letter-spacing:.03em;">
        ✓ Registration Successful / पंजीकरण सफल
      </div>

      <div class="pass-top-bar">
        <div class="pass-logos">
          <img src="assets/hppchri_logo.png" alt="HPPCHRI" class="pass-logo" />
          <img src="assets/golden_jubilee_logo.png" alt="50 Golden Years" class="pass-logo" />
        </div>
        <div class="pass-badge-label">OFFICIAL DELEGATE PASS</div>
      </div>

      <div class="pass-body">
        <div class="pass-user-info">
          <div class="pass-category-pill">${categoryName}</div>
          <h2>${escapeHtml(data.fullName)}</h2>
          <div class="pass-details-list">
            <div><strong>Affiliation:</strong> ${escapeHtml(data.institution)}</div>
            <div><strong>Location:</strong> ${escapeHtml(data.city)}</div>
            <div><strong>Issued On:</strong> ${escapeHtml(data.regDate)}</div>
          </div>
          <div style="margin-top:12px;border:2px solid var(--c-mint);border-radius:8px;
                      padding:10px 14px;background:#eefcf8;">
            <div style="font-size:.7rem;font-weight:700;color:#028090;text-transform:uppercase;
                        letter-spacing:.07em;margin-bottom:3px;">
              Registration ID / पंजीकरण संख्या
            </div>
            <div style="font-size:1.15rem;font-weight:800;color:#05668d;
                        letter-spacing:.06em;font-family:monospace;">${regId}</div>
          </div>
        </div>

        <div class="pass-qr-box">
          <div id="pass-qr-container" style="width:108px;height:108px;"></div>
          <div class="pass-id-text" style="font-family:monospace;font-size:.7rem;margin-top:4px;">
            ${regId}
          </div>
          <div style="font-size:.6rem;color:#5b7083;margin-top:2px;">SCAN TO VERIFY</div>
        </div>
      </div>

      <div style="margin:0 16px 10px;background:#f0f8ff;border-left:3px solid #028090;
                  padding:9px 14px;border-radius:4px;font-size:.8rem;color:#033f58;line-height:1.55;">
        This pass confirms your successful registration for the Yuva Sanchar Campaign
        and is valid for participation. Please keep your Registration ID safe.<br>
        <em style="color:#5b7083;">यह पास आपके सफल पंजीकरण की पुष्टि करता है। अपनी पंजीकरण संख्या सुरक्षित रखें।</em>
      </div>

      <div class="pass-footer-quote">
        <span>"Know. Check. Act. Don't Delay." — Yuva Sanchar Drive</span>
        <span style="color:#f0f3bd;font-weight:700;">HPPCHRI • Estd. 1975</span>
      </div>
    </div>

    <div class="pass-actions">
      <button class="btn btn-primary" onclick="window.print()">
        <i class="fa-solid fa-download"></i> Download / Print Pass
      </button>
      <a href="${getWhatsAppShareUrl(data)}" target="_blank" class="btn btn-mint">
        <i class="fa-brands fa-whatsapp"></i> Share on WhatsApp
      </a>
      <button class="btn btn-outline-teal" onclick="resetRegistrationForm()">
        <i class="fa-solid fa-rotate-left"></i> Register Another
      </button>
    </div>
  `;

  const qrEl = document.getElementById('pass-qr-container');
  if (qrEl) renderQrCode(regId, qrEl);
}

// ─── WhatsApp share ────────────────────────────────────────────────
function getWhatsAppShareUrl(data) {
  const regId = data.registrationId || data.regId;
  const verificationUrl = `${VERIFY_BASE}/pass.html?id=${encodeURIComponent(regId)}`;
  const msg =
`*Yuva Sanchar — Cancer Awareness Drive | HPPCHRI, Gorakhpur*

✅ *Registration Successful / पंजीकरण सफल*

*Name / नाम:* ${data.fullName}
*Registration ID / पंजीकरण संख्या:* ${regId}
*Category:* ${data.category}
*Issued On:* ${data.regDate}

My official digital delegate pass has been generated.
यह पास युवा संचार अभियान के लिए मेरी भागीदारी की पुष्टि करता है।

🔗 Verify Pass: ${verificationUrl}

Join the campaign: Know. Check. Act. Don't Delay.`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}

// ─── Reset ─────────────────────────────────────────────────────────
window.resetRegistrationForm = function () {
  const formCard      = document.getElementById('registration-form-card');
  const passContainer = document.getElementById('pass-showcase-container');
  const form          = document.getElementById('drive-registration-form');
  if (form) form.reset();
  if (passContainer) passContainer.classList.remove('active');
  if (formCard) { formCard.style.display = 'block'; formCard.scrollIntoView({ behavior: 'smooth' }); }
};

// ─── HTML escaping ─────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g,
    t => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[t] || t));
}
