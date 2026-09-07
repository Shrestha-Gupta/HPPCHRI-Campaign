/**
 * HPPCHRI - City-Wide Cancer Awareness Drive ("Yuva Sanchar") Main Application
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initAwarenessTabs();
  initCountdownTimer();
  initYuvaSancharModal();
  initScrollspy();
  initSectionTransitions();
  seedSampleDataIfEmpty();
});

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('main-nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    toggleBtn.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
  });

  // Close menu when clicking nav links
  navMenu.querySelectorAll('.nav-link, .btn').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      toggleBtn.innerHTML = '☰';
    });
  });
}

function initAwarenessTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(targetId);
      if (activePane) {
        activePane.classList.add('active');
      }
    });
  });
}

function initCountdownTimer() {
  const countdownContainer = document.getElementById('campaign-countdown');
  if (!countdownContainer) return;

  // Inauguration Date: October 7, 2026 10:00 AM (Bhaiji Jayanti)
  const targetDate = new Date('2026-10-07T10:00:00').getTime();

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      countdownContainer.innerHTML = '<span style="color:#fef08a; font-weight:bold;">Campaign Live & Ongoing!</span>';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownContainer.innerHTML = `
      <div style="display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap;">
        <div style="background: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px; text-align: center; min-width: 60px;">
          <div style="font-size: 1.4rem; font-weight: 800; color: #fef08a;">${days}</div>
          <div style="font-size: 0.7rem; text-transform: uppercase; color: #cbd5e1;">Days</div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px; text-align: center; min-width: 60px;">
          <div style="font-size: 1.4rem; font-weight: 800; color: #ffffff;">${hours}</div>
          <div style="font-size: 0.7rem; text-transform: uppercase; color: #cbd5e1;">Hours</div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px; text-align: center; min-width: 60px;">
          <div style="font-size: 1.4rem; font-weight: 800; color: #ffffff;">${minutes}</div>
          <div style="font-size: 0.7rem; text-transform: uppercase; color: #cbd5e1;">Mins</div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px; text-align: center; min-width: 60px;">
          <div style="font-size: 1.4rem; font-weight: 800; color: #2dd4bf;">${seconds}</div>
          <div style="font-size: 0.7rem; text-transform: uppercase; color: #cbd5e1;">Secs</div>
        </div>
      </div>
    `;
  }

  update();
  setInterval(update, 1000);
}

function initYuvaSancharModal() {
  const openBtn = document.getElementById('view-booklet-btn');
  const modal = document.getElementById('booklet-modal-overlay');
  const closeBtn = document.getElementById('booklet-modal-close');

  if (!openBtn || !modal) return;

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('active');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

function seedSampleDataIfEmpty() {
  const existing = localStorage.getItem('hppchri_registrations_v1');
  if (!existing) {
    const seed = [
      {
        regId: 'HPP-YS-50-1082',
        fullName: 'Aayush Srivastava',
        category: 'student',
        institution: 'DDU Gorakhpur University',
        phone: '9838112233',
        email: 'aayush.ddu@gmail.com',
        city: 'Gorakhpur',
        regDate: '7 Sep 2026',
        timestamp: Date.now() - 3600000
      },
      {
        regId: 'HPP-YS-50-2045',
        fullName: 'Pooja Verma',
        category: 'influencer',
        institution: 'Influencer (Instagram @pooja_gkp_health)',
        phone: '9450223344',
        email: 'pooja.verma@creator.in',
        city: 'Gorakhpur',
        platform: 'Instagram',
        handle: 'pooja_gkp_health',
        followers: 24500,
        regDate: '7 Sep 2026',
        timestamp: Date.now() - 7200000
      },
      {
        regId: 'HPP-YS-50-3091',
        fullName: 'Dr. Vivek Mishra',
        category: 'club',
        institution: 'Rotary Club Gorakhpur Central',
        phone: '9415887766',
        email: 'rotary.gkp@gmail.com',
        city: 'Gorakhpur',
        regDate: '6 Sep 2026',
        timestamp: Date.now() - 86400000
      }
    ];
    localStorage.setItem('hppchri_registrations_v1', JSON.stringify(seed));
  }
}

function triggerSectionArrival(sectionElem) {
  if (!sectionElem) return;
  sectionElem.classList.remove('section-arrival-pulse');
  // force DOM reflow to restart animation reliably
  void sectionElem.offsetWidth;
  sectionElem.classList.add('section-arrival-pulse');
  
  // Ensure it is revealed if observer hasn't fired yet
  sectionElem.classList.add('is-revealed');

  setTimeout(() => {
    sectionElem.classList.remove('section-arrival-pulse');
  }, 1500);
}

function initScrollspy() {
  const navLinks = document.querySelectorAll('.nav-links .nav-link[href^="#"]');
  const sections = [];
  let lastActiveId = null;

  navLinks.forEach(link => {
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      sections.push({ id: targetId, section: targetSection, link: link });
    }
  });

  function updateActiveLink() {
    const scrollPos = window.scrollY + 170; // offset for sticky header & marquee
    let currentActive = null;
    let activeSectionId = null;
    let activeSectionObj = null;

    // Check from bottom to top to identify currently active section
    for (let i = sections.length - 1; i >= 0; i--) {
      const { id, section, link } = sections[i];
      const top = section.offsetTop;
      const height = section.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        currentActive = link;
        activeSectionId = id;
        activeSectionObj = section;
        break;
      }
    }

    navLinks.forEach(l => l.classList.remove('active'));
    if (currentActive) {
      currentActive.classList.add('active');
      if (activeSectionId && activeSectionId !== lastActiveId) {
        lastActiveId = activeSectionId;
        if (activeSectionObj && !activeSectionObj.classList.contains('section-arrival-pulse')) {
          triggerSectionArrival(activeSectionObj);
        }
      }
    }
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateActiveLink);
  }, { passive: true });

  // Update on initial page load
  setTimeout(updateActiveLink, 200);

  // Smooth scroll and animated arrival effect when clicking nav / hash links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const targetElem = document.querySelector(href);
      if (targetElem) {
        e.preventDefault();
        const headerOffset = 110;
        const elementPosition = targetElem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        triggerSectionArrival(targetElem);

        // Update active link immediately in navbar
        navLinks.forEach(l => l.classList.remove('active'));
        const matchedLink = Array.from(navLinks).find(l => l.getAttribute('href') === href);
        if (matchedLink) {
          matchedLink.classList.add('active');
        }
      }
    });
  });
}

function initSectionTransitions() {
  const targets = document.querySelectorAll('.section, .registration-section, .founder-card, .schemes-banner');

  targets.forEach(t => {
    t.classList.add('reveal-on-scroll');
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach(t => t.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.05,
    rootMargin: '0px 0px -30px 0px'
  });

  targets.forEach(t => {
    // If element is already in viewport on load, reveal immediately
    const rect = t.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      t.classList.add('is-revealed');
    } else {
      observer.observe(t);
    }
  });
}
