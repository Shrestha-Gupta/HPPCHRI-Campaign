/**
 * HPPCHRI - Cancer Awareness Drive ("Yuva Sanchar") Registration System
 * Handles multi-category participant registrations, pass generation, and local data persistence
 * Updated with palette: ["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"]
 */

const STORAGE_KEY = 'hppchri_registrations_v1';

document.addEventListener('DOMContentLoaded', () => {
  initRegistrationForm();
  initAdminModal();
});

function getStoredRegistrations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading localStorage:', e);
    return [];
  }
}

function saveRegistration(data) {
  const list = getStoredRegistrations();
  list.unshift(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function initRegistrationForm() {
  const form = document.getElementById('drive-registration-form');
  const categorySelect = document.getElementById('reg-category');
  const socialActiveSelect = document.getElementById('reg-social-active');
  const influencerDetails = document.getElementById('influencer-details-group');
  const institutionGroup = document.getElementById('institution-group');
  const institutionLabel = document.getElementById('institution-label');
  const passContainer = document.getElementById('pass-showcase-container');
  const formCard = document.getElementById('registration-form-card');

  if (!form) return;

  // Category conditional toggle
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

  // Social media conditional toggle
  if (socialActiveSelect) {
    socialActiveSelect.addEventListener('change', () => {
      const activeGroup = document.getElementById('social-details-group');
      if (activeGroup) {
        activeGroup.style.display = socialActiveSelect.value === 'yes' ? 'block' : 'none';
      }
    });
  }

  // Handle Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const category = document.getElementById('reg-category').value;
    const city = document.getElementById('reg-city').value.trim();
    const pledgeChecked = document.getElementById('reg-pledge').checked;

    if (!fullName || !phone || !category) {
      alert('कृपया सभी आवश्यक फ़ील्ड भरें / Please fill all required fields.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      alert('कृपया एक वैध 10-अंकीय व्हाट्सएप नंबर दर्ज करें / Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    if (!pledgeChecked) {
      alert('कृपया जागरूकता अभियान की प्रतिज्ञा स्वीकार करें / Please accept the awareness campaign pledge.');
      return;
    }

    let institution = document.getElementById('reg-institution') ? document.getElementById('reg-institution').value.trim() : '';
    let platform = '';
    let handle = '';
    let followers = 0;

    if (category === 'influencer') {
      platform = document.getElementById('reg-platform') ? document.getElementById('reg-platform').value : '';
      handle = document.getElementById('reg-handle') ? document.getElementById('reg-handle').value.trim() : '';
      followers = parseInt(document.getElementById('reg-followers') ? document.getElementById('reg-followers').value : 0, 10) || 0;
      institution = `Influencer (${platform} @${handle.replace('@', '')})`;

      if (followers < 10000) {
        const proceed = confirm('नोट: इन्फ्लुएंसर श्रेणी के लिए 10,000+ फॉलोअर्स का मानक है। क्या आप छात्र/क्लब सदस्य के रूप में भाग लेना चाहेंगे या आगे बढ़ें?');
        if (!proceed) return;
      }
    }

    // Generate Unique Registration ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regId = `HPP-YS-50-${randomSuffix}`;
    const regDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const participantData = {
      regId,
      fullName,
      phone,
      email: email || 'N/A',
      category,
      institution: institution || 'Individual Volunteer',
      city: city || 'Gorakhpur',
      platform,
      handle,
      followers,
      regDate,
      timestamp: Date.now()
    };

    saveRegistration(participantData);
    renderDelegatePass(participantData);

    // Scroll to pass
    if (formCard) formCard.style.display = 'none';
    if (passContainer) {
      passContainer.classList.add('active');
      passContainer.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

function renderDelegatePass(data) {
  const container = document.getElementById('pass-render-area');
  if (!container) return;

  const categoryTitles = {
    student: 'Student Delegate',
    club: 'Club Member Ambassador',
    influencer: 'Verified Digital Creator',
    citizen: 'Community Health Advocate'
  };

  const categoryName = categoryTitles[data.category] || 'Campaign Delegate';

  // SVG QR Code with updated theme
  const qrSvg = `
    <svg width="84" height="84" viewBox="0 0 100 100" fill="#05668d" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#ffffff"/>
      <rect x="10" y="10" width="25" height="25" fill="#05668d"/>
      <rect x="15" y="15" width="15" height="15" fill="#ffffff"/>
      <rect x="65" y="10" width="25" height="25" fill="#05668d"/>
      <rect x="70" y="15" width="15" height="15" fill="#ffffff"/>
      <rect x="10" y="65" width="25" height="25" fill="#05668d"/>
      <rect x="15" y="70" width="15" height="15" fill="#ffffff"/>
      <rect x="42" y="15" width="10" height="10" fill="#00a896"/>
      <rect x="42" y="42" width="16" height="16" fill="#02c39a"/>
      <rect x="15" y="45" width="10" height="10" fill="#05668d"/>
      <rect x="75" y="45" width="10" height="15" fill="#05668d"/>
      <rect x="45" y="70" width="15" height="10" fill="#00a896"/>
      <rect x="70" y="70" width="15" height="15" fill="#05668d"/>
    </svg>
  `;

  container.innerHTML = `
    <div class="delegate-pass-card" id="printable-pass">
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
            <div><strong>Registration ID:</strong> <span style="color: #f0f3bd; font-weight: bold;">${data.regId}</span></div>
            <div><strong>Issued On:</strong> ${data.regDate}</div>
          </div>
        </div>

        <div class="pass-qr-box">
          <div class="qr-placeholder">${qrSvg}</div>
          <div class="pass-id-text">${data.regId}</div>
          <div style="font-size: 0.65rem; color: #5b7083; margin-top: 2px;">VERIFIED ENTRY</div>
        </div>
      </div>

      <div class="pass-footer-quote">
        <span>“Know. Check. Act. Don't Delay.” — Yuva Sanchar Drive</span>
        <span style="color: #f0f3bd; font-weight: 700;">HPPCHRI • Estd. 1975</span>
      </div>
    </div>

    <div class="pass-actions">
      <button class="btn btn-primary" onclick="window.print()">
        Print / Download Official Pass
      </button>
      <a href="${getWhatsAppShareUrl(data)}" target="_blank" class="btn btn-mint">
        Share Registration on WhatsApp
      </a>
      <button class="btn btn-outline-teal" onclick="resetRegistrationForm()">
        Register Another Participant
      </button>
    </div>
  `;
}

function getWhatsAppShareUrl(data) {
  const shareText = `*Yuva Sanchar — City-Wide Cancer Awareness Drive*\n\nI have registered as an official delegate with *Hanuman Prasad Poddar Cancer Hospital & Research Institute, Gorakhpur* for the Golden Jubilee Cancer Awareness Drive!\n\n*Registration ID:* ${data.regId}\n*Motto:* Know. Check. Act. Don't Delay.\n\nJoin the awareness movement and register here: ${window.location.href}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
}

window.resetRegistrationForm = function() {
  const formCard = document.getElementById('registration-form-card');
  const passContainer = document.getElementById('pass-showcase-container');
  const form = document.getElementById('drive-registration-form');

  if (form) form.reset();
  if (passContainer) passContainer.classList.remove('active');
  if (formCard) {
    formCard.style.display = 'block';
    formCard.scrollIntoView({ behavior: 'smooth' });
  }
};

function initAdminModal() {
  const adminBtn = document.getElementById('admin-modal-btn');
  const modalOverlay = document.getElementById('admin-modal-overlay');
  const closeBtn = document.getElementById('admin-modal-close');
  const exportBtn = document.getElementById('admin-export-csv');

  if (!adminBtn || !modalOverlay) return;

  adminBtn.addEventListener('click', (e) => {
    e.preventDefault();
    renderAdminTable();
    modalOverlay.classList.add('active');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  if (exportBtn) {
    exportBtn.addEventListener('click', exportRegistrationsCsv);
  }
}

function renderAdminTable() {
  const container = document.getElementById('admin-table-body');
  const totalCountEl = document.getElementById('admin-total-count');
  const studentsCountEl = document.getElementById('admin-students-count');
  const influencersCountEl = document.getElementById('admin-influencers-count');

  if (!container) return;

  const data = getStoredRegistrations();
  if (totalCountEl) totalCountEl.textContent = data.length;
  if (studentsCountEl) studentsCountEl.textContent = data.filter(d => d.category === 'student').length;
  if (influencersCountEl) influencersCountEl.textContent = data.filter(d => d.category === 'influencer').length;

  if (data.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: #5b7083;">No registrations recorded yet. Complete a registration form above.</td></tr>`;
    return;
  }

  container.innerHTML = data.map(item => `
    <tr>
      <td><strong style="color: #028090;">${item.regId}</strong></td>
      <td>${escapeHtml(item.fullName)}</td>
      <td><span class="badge badge-teal" style="font-size:0.75rem;">${item.category}</span></td>
      <td>${escapeHtml(item.institution)}</td>
      <td>${escapeHtml(item.phone)}</td>
      <td>${item.regDate}</td>
    </tr>
  `).join('');
}

function exportRegistrationsCsv() {
  const data = getStoredRegistrations();
  if (data.length === 0) {
    alert('No registrations available to export.');
    return;
  }

  const headers = ['Registration ID', 'Full Name', 'Category', 'Institution/Club', 'WhatsApp Phone', 'Email', 'City', 'Date Registered'];
  const rows = data.map(d => [
    `"${d.regId}"`,
    `"${d.fullName.replace(/"/g, '""')}"`,
    `"${d.category}"`,
    `"${d.institution.replace(/"/g, '""')}"`,
    `"${d.phone}"`,
    `"${d.email}"`,
    `"${d.city}"`,
    `"${d.regDate}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `HPPCHRI_Registrations_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
