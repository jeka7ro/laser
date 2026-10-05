// Laser Magic - Client Booking Widget Controller
// Multi-lingual: FR, NL, EN (No Romanian)

import { t, getLang, setLang, translations, formatMoney } from './i18n.js';
import { store } from './store.js';
import { icon } from './icons.js';
import { getWhatsAppUrl, generateConfirmationEmailHtml, getClientPortalUrl } from './notifications.js';
import { formatBelgianVat } from './companyLookup.js';

// Global Widget State
const state = {
  step: 1,
  category: 'birthday',
  selectedPackage: null,
  selectedDate: null,
  selectedSlot: null,
  playersCount: 10,
  childName: '',
  childAge: 10,
  childBirthDate: '',
  addons: {
    extra_laser: false,
    extra_minigolf: false,
    cake: false,
    castle: false,
    arcade_tokens: 0,
    extra_drinks: false
  },
  organizer: {
    name: '',
    email: '',
    phone: '',
    notes: '',
    termsAgreed: true
  },
  invoice: {
    requested: false,
    companyName: '',
    vatNumber: '',
    billingAddress: '',
    poNumber: ''
  },
  paymentMethod: 'bancontact', // 'bancontact', 'payconiq', 'stripe', 'onsite'
  depositMode: '30', // '30' or '100'
  currentMonthDate: new Date(),
  lastCreatedBooking: null
};

// Packages Definition (Extracted from Live API lasermagic.be)
const packagesData = {
  birthday: [
    {
      id: 'sweet',
      titleKey: 'sweetTitle',
      price: 24,
      taglineKey: 'sweetTag',
      durationKey: 'sweetDuration',
      featuresKey: 'sweetFeatures',
      image: '/images/package-sweet.jpg',
      isPopular: false
    },
    {
      id: 'fun',
      titleKey: 'funTitle',
      price: 25,
      taglineKey: 'funTag',
      durationKey: 'funDuration',
      featuresKey: 'funFeatures',
      image: '/images/package-fun.jpg',
      isPopular: true,
      badgeKey: 'vipBadge'
    },
    {
      id: 'vip',
      titleKey: 'vipTitle',
      price: 29,
      taglineKey: 'vipTag',
      durationKey: 'vipDuration',
      featuresKey: 'vipFeatures',
      image: '/images/package-vip.jpg',
      isPopular: false
    }
  ],
  games: [
    {
      id: 'game1',
      titleDefault: '1x 15 minutes game',
      price: 12,
      duration: '30 min',
      features: ['1 session laser intense (15 min)', 'Briefing tactique & équipement', 'Feuille de score'],
      image: '/images/package-standard.jpg',
      isPopular: false
    },
    {
      id: 'game2',
      titleDefault: '2x 15 minutes games',
      price: 22,
      duration: '1 heure',
      features: ['2 sessions laser (2x 15 min)', 'Arène Jungle + Arène Prison', 'Pause tactique & scores'],
      image: '/images/package-standard.jpg',
      isPopular: true,
      badge: 'Le + Choisi'
    },
    {
      id: 'game3',
      titleDefault: '3x 15 minutes games',
      price: 30,
      duration: '1h30',
      features: ['3 sessions complètes (45 min)', 'Scénarios tactiques avancés', 'Pause rafraîchissement'],
      image: '/images/package-standard.jpg',
      isPopular: false
    },
    {
      id: 'minigolf_outdoor',
      titleDefault: 'Mini-golf extérieur (12 trous)',
      price: 10,
      duration: '45 min',
      features: ['Parcours paysager 12 trous', 'Clubs & balles fluo fournis', 'Accessible à tous âges'],
      image: '/images/addon-minigolf-real.avif',
      isPopular: false
    }
  ],
  quick: [
    {
      id: 'budget_laser',
      titleDefault: 'Budget Laser',
      price: 25,
      duration: '2 heures',
      features: ['2 parties de Laser Game (2x 15 min)', '1 boisson soft au choix incluse', 'Espace table réservé'],
      image: '/images/addon-laser.avif',
      isPopular: false
    },
    {
      id: 'fun_party_laser',
      titleDefault: 'Fun Party Laser',
      price: 35,
      duration: '2 heures',
      features: ['2 parties de Laser Game intenses', '1 portion frites + 1 fricadelle', '1 boisson soft incluse', 'Ambiance EVG / Amis'],
      image: '/images/addon-drinks.avif',
      isPopular: true,
      badge: 'Idéal Amis & EVG'
    }
  ],
  dinner: [
    {
      id: 'kermis_laser',
      titleDefault: 'Kermis Laser (min. 20 pers.)',
      price: 43,
      duration: '3 heures',
      features: ['2 parties de Laser Game', 'Buffet frites & fricadelles', 'Dessert artisanal inclus', 'Salle privatisée'],
      image: '/images/addon-laser.avif',
      isPopular: false
    },
    {
      id: 'pizza_party',
      titleDefault: 'Pizza Party Laser (min. 15 pers.)',
      price: 47,
      duration: '3 heures',
      features: ['2 parties de Laser Game', 'Pizzas artisanales', 'Dessert gourmand + café', 'Formule complète'],
      image: '/images/addon-drinks.avif',
      isPopular: true,
      badge: 'Best-Seller'
    },
    {
      id: 'chicken_party',
      titleDefault: 'Chicken Laser (min. 15 pers.)',
      price: 47,
      duration: '3 heures',
      features: ['2 parties de Laser Game', 'Demi-poulet rôti fermier & frites', 'Dessert & café inclus', 'Soirée festive'],
      image: '/images/addon-laser.avif',
      isPopular: false
    }
  ]
};

// Available time slots based on category and duration
const timeSlots = {
  birthday_2h: [
    "13:30 - 15:30",
    "14:00 - 16:00",
    "14:30 - 16:30",
    "16:00 - 18:00",
    "16:30 - 18:30",
    "17:00 - 19:00"
  ],
  birthday_3h: [
    "11:00 - 14:00",
    "14:00 - 17:00",
    "15:00 - 18:00",
    "16:30 - 19:30"
  ],
  standard: [
    "14:00 - 14:45",
    "15:00 - 15:45",
    "16:00 - 16:45",
    "17:00 - 17:45",
    "18:00 - 18:45",
    "19:00 - 19:45",
    "20:00 - 20:45",
    "21:00 - 21:45"
  ]
};

export function initWidget() {
  // Sync language from URL or global storage
  const urlParams = new URLSearchParams(window.location.search);
  const requestedLang = urlParams.get('lang') || localStorage.getItem('laser_magic_lang') || localStorage.getItem('laser_admin_lang');
  if (requestedLang && ['fr', 'nl', 'en'].includes(requestedLang.toLowerCase())) {
    setLang(requestedLang.toLowerCase(), false);
  }

  // Set default package
  state.selectedPackage = packagesData.birthday[1]; // Fun default
  
  // Set default date to upcoming Saturday or Wednesday
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  state.selectedDate = d.toISOString().split('T')[0];
  state.selectedSlot = timeSlots.birthday_2h[1];

  setupEventListeners();

  // Sync active language buttons
  const activeLang = getLang();
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === activeLang);
  });

  renderAll();

  const requestedStep = parseInt(urlParams.get('step'));
  if (requestedStep && requestedStep >= 1 && requestedStep <= 5) {
    if (requestedStep === 5) {
      const demoBooking = store.getAll()[0];
      if (demoBooking) {
        state.lastCreatedBooking = demoBooking;
        renderSuccessScreen(demoBooking);
      }
    }
    goToStep(requestedStep);
  }

  notifyParentResize();
}

function setupEventListeners() {
  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.dataset.lang;
      setLang(lang);
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderAll();
      notifyParentResize();
    });
  });

  // Category tabs
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      state.category = e.currentTarget.dataset.category;
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      // Reset selected package for new category
      const pkgs = packagesData[state.category] || packagesData.birthday;
      state.selectedPackage = pkgs[0];
      state.playersCount = state.category === 'birthday' ? 10 : 6;
      
      renderStep1();
      renderStep2();
      renderStep3();
      renderStep4();
      notifyParentResize();
    });
  });

  // Footer Navigation
  const btnPrev = document.getElementById('btn-prev-step');
  const btnNext = document.getElementById('btn-next-step');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (state.step > 1) {
        goToStep(state.step - 1);
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (state.step < 4) {
        goToStep(state.step + 1);
      } else if (state.step === 4) {
        submitBooking();
      }
    });
  }
}

function goToStep(stepNum) {
  state.step = stepNum;

  // Update step indicators
  document.querySelectorAll('.wizard-step').forEach((el, idx) => {
    const s = idx + 1;
    el.classList.remove('active', 'completed');
    if (s === stepNum) el.classList.add('active');
    else if (s < stepNum) el.classList.add('completed');
  });

  // Toggle sections
  document.querySelectorAll('.step-section').forEach((sec, idx) => {
    sec.classList.remove('active');
    if (idx + 1 === stepNum) sec.classList.add('active');
  });

  // Update footer buttons
  const btnPrev = document.getElementById('btn-prev-step');
  const btnNext = document.getElementById('btn-next-step');
  const footerEl = document.getElementById('widget-footer');

  if (stepNum === 1 || stepNum === 5) {
    // Hide footer navigation on Step 1 (package selection happens directly via cards) and Step 5 (success)
    if (footerEl) footerEl.style.display = 'none';
  } else {
    if (footerEl) footerEl.style.display = 'flex';
    if (btnPrev) btnPrev.style.visibility = 'visible';
    if (btnNext) {
      if (stepNum === 4) {
        btnNext.textContent = t('completeBookingBtn');
        btnNext.className = 'btn btn-accent btn-lg';
      } else {
        btnNext.textContent = t('step' + (stepNum + 1) + 'Title') + ' →';
        btnNext.className = 'btn btn-primary btn-lg';
      }
    }
  }

  // Refresh current step content
  if (stepNum === 2) renderStep2();
  if (stepNum === 3) renderStep3();
  if (stepNum === 4) renderStep4();

  window.scrollTo({ top: 0, behavior: 'smooth' });
  notifyParentResize();
}

// Render All Components & Localized Texts
function renderAll() {
  // Update static text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  renderStep1();
  renderStep2();
  renderStep3();
  renderStep4();
  if (state.step === 5 && state.lastCreatedBooking) {
    renderSuccessScreen(state.lastCreatedBooking);
  }
}

// STEP 1: Packages
function renderStep1() {
  const container = document.getElementById('package-cards-container');
  if (!container) return;

  const packages = packagesData[state.category] || packagesData.birthday;

  container.innerHTML = packages.map(pkg => {
    const isSelected = state.selectedPackage && state.selectedPackage.id === pkg.id;
    const title = (pkg.titleKey && t(pkg.titleKey) !== pkg.titleKey) ? t(pkg.titleKey) : (pkg.titleDefault || pkg.id);
    const duration = (pkg.durationKey && t(pkg.durationKey) !== pkg.durationKey) ? t(pkg.durationKey) : (pkg.duration || '1h');
    const features = (pkg.featuresKey && Array.isArray(t(pkg.featuresKey))) ? t(pkg.featuresKey) : (pkg.features || []);
    const isPopular = pkg.isPopular;
    const badgeText = (pkg.badgeKey && t(pkg.badgeKey) !== pkg.badgeKey) ? t(pkg.badgeKey) : (pkg.badge || '');
    const tagline = (pkg.taglineKey && t(pkg.taglineKey) !== pkg.taglineKey) ? t(pkg.taglineKey) : (pkg.tagline || '');

    return `
      <div class="package-card ${isPopular ? 'popular' : ''} ${isSelected ? 'selected' : ''}" data-pkg-id="${pkg.id}">
        <div class="package-img-wrap">
          <img src="${pkg.image}" alt="${title}" class="package-card-img" loading="lazy">
          <div class="package-img-gradient"></div>
          <div class="package-badges-float">
            <span class="badge badge-duration">${icon('clock', '', 12)} <span>${duration}</span></span>
            ${isPopular && badgeText ? `<span class="badge badge-pink">${badgeText}</span>` : ''}
          </div>
        </div>
        <div class="package-content">
          <div class="package-header">
            <h3 class="package-title">${title}</h3>
            ${tagline ? `<p class="package-tagline">${tagline}</p>` : ''}
          </div>
          <div class="package-price-wrap">
            <div class="package-price">${formatMoney(pkg.price)}</div>
            <div class="package-unit">${state.category === 'birthday' ? t('perChild') : t('perPerson')}</div>
          </div>
          <ul class="package-features">
            ${features.map(f => `
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>
          <button type="button" class="btn btn-primary package-select-btn" style="width: 100%; justify-content: center; gap: 6px;">
            <span>${t('selectService') || 'Choisir cette formule'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach card and button click handlers
  container.querySelectorAll('.package-card').forEach(card => {
    const id = card.dataset.pkgId;
    const pkg = packages.find(p => p.id === id);
    const selectBtn = card.querySelector('.package-select-btn');

    // Clicking the select button or card advances directly to Step 2
    if (selectBtn) {
      selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.selectedPackage = pkg;
        goToStep(2);
      });
    }

    card.addEventListener('click', () => {
      state.selectedPackage = pkg;
      goToStep(2);
    });
  });
}

// STEP 2: Calendar & Available Slots
function renderStep2() {
  renderCalendar();
  renderTimeSlots();
}

function renderCalendar() {
  const monthTitleEl = document.getElementById('cal-month-title');
  const gridEl = document.getElementById('cal-days-grid');
  if (!monthTitleEl || !gridEl) return;

  const year = state.currentMonthDate.getFullYear();
  const month = state.currentMonthDate.getMonth();

  // Localized Month Header
  const monthFormatter = new Intl.DateTimeFormat(getLang(), { month: 'long', year: 'numeric' });
  monthTitleEl.textContent = monthFormatter.format(state.currentMonthDate);

  // Month Math
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  
  // Day of week index (Monday = 0)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  let html = '';

  // Empty leading days
  for (let i = 0; i < startDayOfWeek; i++) {
    html += `<div class="cal-day disabled"></div>`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Render days
  for (let day = 1; day <= totalDays; day++) {
    const currentIterDate = new Date(year, month, day);
    const dateStr = currentIterDate.toISOString().split('T')[0];
    const isPast = currentIterDate < today;
    const isSelected = state.selectedDate === dateStr;
    const dayOfWeek = currentIterDate.getDay(); // 0 is Sun, 3 is Wed, 6 is Sat

    // Birthday availability rule (Wednesdays, Saturdays, Sundays or any day for standard)
    const isAvailable = !isPast && (state.category !== 'birthday' || dayOfWeek === 0 || dayOfWeek === 3 || dayOfWeek === 6);

    html += `
      <button type="button" 
        class="cal-day ${isAvailable ? 'has-slots' : 'disabled'} ${isSelected ? 'selected' : ''}" 
        data-date="${dateStr}"
        ${!isAvailable ? 'disabled' : ''}>
        ${day}
      </button>
    `;
  }

  gridEl.innerHTML = html;

  // Calendar prev/next buttons
  const prevBtn = document.getElementById('cal-prev-month');
  const nextBtn = document.getElementById('cal-next-month');

  if (prevBtn) {
    prevBtn.onclick = () => {
      state.currentMonthDate.setMonth(state.currentMonthDate.getMonth() - 1);
      renderCalendar();
      notifyParentResize();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      state.currentMonthDate.setMonth(state.currentMonthDate.getMonth() + 1);
      renderCalendar();
      notifyParentResize();
    };
  }

  // Day selection handlers
  gridEl.querySelectorAll('.cal-day:not(.disabled)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.selectedDate = e.currentTarget.dataset.date;
      renderCalendar();
      renderTimeSlots();
      notifyParentResize();
    });
  });
}

function renderTimeSlots() {
  const container = document.getElementById('slots-container');
  if (!container) return;

  let slotsPool = timeSlots.standard;
  if (state.category === 'birthday') {
    slotsPool = (state.selectedPackage && state.selectedPackage.id === 'vip') 
      ? timeSlots.birthday_3h 
      : timeSlots.birthday_2h;
  }

  if (!state.selectedSlot || !slotsPool.includes(state.selectedSlot)) {
    state.selectedSlot = slotsPool[0];
  }

  container.innerHTML = slotsPool.map(slot => {
    const cap = store.getSlotCapacity(state.selectedDate, slot);
    const isSelected = state.selectedSlot === slot;
    const isFull = cap.isFull;

    return `
      <div class="slot-item ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}" data-slot="${slot}">
        <div class="slot-time">${slot}</div>
        <div class="slot-capacity">
          <span class="badge ${isFull ? 'badge-pink' : (cap.remaining <= 6 ? 'badge-amber' : 'badge-green')}">
            ${isFull ? t('slotFull') : `${cap.remaining} ${t('slotsAvailable')}`}
          </span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.slot-item:not(.disabled)').forEach(item => {
    item.addEventListener('click', (e) => {
      state.selectedSlot = e.currentTarget.dataset.slot;
      renderTimeSlots();
      notifyParentResize();
    });
  });
}

// STEP 3: Customization & Add-ons
function renderStep3() {
  // Counter
  const countEl = document.getElementById('players-count-val');
  if (countEl) countEl.textContent = state.playersCount;

  const btnDec = document.getElementById('btn-dec-players');
  const btnInc = document.getElementById('btn-inc-players');

  const minPlayers = state.category === 'birthday' ? 8 : 2;

  if (btnDec) {
    btnDec.onclick = () => {
      if (state.playersCount > minPlayers) {
        state.playersCount--;
        if (countEl) countEl.textContent = state.playersCount;
        updateStep3AddonsPricing();
      }
    };
  }

  if (btnInc) {
    btnInc.onclick = () => {
      if (state.playersCount < 44) {
        state.playersCount++;
        if (countEl) countEl.textContent = state.playersCount;
        updateStep3AddonsPricing();
      }
    };
  }

  // Child details (if birthday)
  const childFields = document.getElementById('birthday-child-fields');
  if (childFields) {
    childFields.style.display = state.category === 'birthday' ? 'block' : 'none';
  }

  const childNameInput = document.getElementById('input-child-name');
  if (childNameInput) {
    childNameInput.value = state.childName;
    childNameInput.oninput = (e) => { state.childName = e.target.value; };
  }

  const childAgeInput = document.getElementById('input-child-age');
  const childDobInput = document.getElementById('input-child-dob');

  if (childAgeInput) {
    childAgeInput.value = state.childAge;
    childAgeInput.oninput = (e) => { 
      state.childAge = parseInt(e.target.value) || 10; 
    };
  }

  if (childDobInput) {
    childDobInput.value = state.childBirthDate || '';
    childDobInput.oninput = (e) => {
      state.childBirthDate = e.target.value;
      if (e.target.value) {
        const bYear = new Date(e.target.value).getFullYear();
        const currentYear = new Date().getFullYear();
        if (!isNaN(bYear)) {
          state.childAge = Math.max(1, currentYear - bYear);
          if (childAgeInput) childAgeInput.value = state.childAge;
        }
      }
    };
  }

  // Addons toggle setup
  setupAddonToggle('addon-laser', 'extra_laser');
  setupAddonToggle('addon-minigolf', 'extra_minigolf');
  setupAddonToggle('addon-cake', 'cake');
  setupAddonToggle('addon-castle', 'castle');
  setupAddonToggle('addon-drinks', 'extra_drinks');

  // Arcade tokens stepper
  const btnDecArcade = document.getElementById('btn-dec-arcade');
  const btnIncArcade = document.getElementById('btn-inc-arcade');
  const arcadeValEl = document.getElementById('arcade-qty-val');
  const arcadeRow = document.getElementById('addon-arcade-row');

  if (btnDecArcade) {
    btnDecArcade.onclick = (e) => {
      e.stopPropagation();
      if (state.addons.arcade_tokens > 0) {
        state.addons.arcade_tokens--;
        if (arcadeValEl) arcadeValEl.textContent = state.addons.arcade_tokens;
        if (arcadeRow) arcadeRow.classList.toggle('active', state.addons.arcade_tokens > 0);
        updateStep3AddonsPricing();
      }
    };
  }

  if (btnIncArcade) {
    btnIncArcade.onclick = (e) => {
      e.stopPropagation();
      if (state.addons.arcade_tokens < 50) {
        state.addons.arcade_tokens++;
        if (arcadeValEl) arcadeValEl.textContent = state.addons.arcade_tokens;
        if (arcadeRow) arcadeRow.classList.toggle('active', state.addons.arcade_tokens > 0);
        updateStep3AddonsPricing();
      }
    };
  }

  updateStep3AddonsPricing();
}

function setupAddonToggle(elementId, addonKey) {
  const row = document.getElementById(elementId);
  if (!row) return;

  row.onclick = () => {
    state.addons[addonKey] = !state.addons[addonKey];
    row.classList.toggle('active', state.addons[addonKey]);
    const chk = row.querySelector('.custom-chk');
    if (chk) chk.innerHTML = state.addons[addonKey] ? icon('check', '', 14) : '';
    updateStep3AddonsPricing();
  };
}

function updateStep3AddonsPricing() {
  const n = state.playersCount;
  const lang = getLang() || 'fr';
  const playersSuffix = lang === 'fr' ? `pour ${n} joueurs` : (lang === 'nl' ? `voor ${n} spelers` : `for ${n} players`);

  const laserEl = document.getElementById('addon-laser-calc');
  if (laserEl) laserEl.textContent = `+${formatMoney(7 * n)} ${playersSuffix}`;

  const minigolfEl = document.getElementById('addon-minigolf-calc');
  if (minigolfEl) minigolfEl.textContent = `+${formatMoney(7 * n)} ${playersSuffix}`;

  const cakeEl = document.getElementById('addon-cake-calc');
  if (cakeEl) cakeEl.textContent = `+${formatMoney(6 * n)} ${playersSuffix}`;

  const castleEl = document.getElementById('addon-castle-calc');
  if (castleEl) castleEl.textContent = `+${formatMoney(2 * n)} ${playersSuffix}`;

  const drinksEl = document.getElementById('addon-drinks-calc');
  if (drinksEl) {
    const drinksTotal = (3.2 * n).toFixed(2).replace(/\.00$/, '');
    drinksEl.textContent = `+${formatMoney(drinksTotal)} ${playersSuffix}`;
  }

  const arcadeEl = document.getElementById('addon-arcade-calc');
  if (arcadeEl) {
    const tokens = state.addons.arcade_tokens;
    const tokensCost = tokens * 2;
    if (lang === 'fr') {
      arcadeEl.textContent = tokens > 0 ? `${tokens} jeton(s) sélectionné(s) (+${formatMoney(tokensCost)})` : `0 jeton sélectionné (0 €)`;
    } else if (lang === 'nl') {
      arcadeEl.textContent = tokens > 0 ? `${tokens} munt(en) gekozen (+${formatMoney(tokensCost)})` : `0 munten gekozen (0 €)`;
    } else {
      arcadeEl.textContent = tokens > 0 ? `${tokens} token(s) selected (+${formatMoney(tokensCost)})` : `0 tokens selected (0 €)`;
    }
  }
}

// STEP 4: Review, Details & Payment
function renderStep4() {
  const nameInp = document.getElementById('input-org-name');
  const emailInp = document.getElementById('input-org-email');
  const phoneInp = document.getElementById('input-org-phone');
  const notesInp = document.getElementById('input-special-notes');

  if (nameInp) nameInp.oninput = (e) => { state.organizer.name = e.target.value; };
  if (emailInp) emailInp.oninput = (e) => { state.organizer.email = e.target.value; };
  if (phoneInp) phoneInp.oninput = (e) => { state.organizer.phone = e.target.value; };
  if (notesInp) notesInp.oninput = (e) => { state.organizer.notes = e.target.value; };

  // Invoice toggle and fields wiring
  const invChk = document.getElementById('input-request-invoice');
  const invBox = document.getElementById('invoice-details-fields');
  const invComp = document.getElementById('input-invoice-company');
  const invVat = document.getElementById('input-invoice-vat');
  const invAddr = document.getElementById('input-invoice-address');
  const invPo = document.getElementById('input-invoice-po');

  if (invChk && invBox) {
    invChk.checked = !!state.invoice.requested;
    invBox.style.display = state.invoice.requested ? 'block' : 'none';

    invChk.onchange = (e) => {
      state.invoice.requested = e.target.checked;
      invBox.style.display = state.invoice.requested ? 'block' : 'none';
      renderStep4();
      notifyParentResize();
    };
  }

  if (invComp) {
    invComp.value = state.invoice.companyName || '';
    invComp.oninput = (e) => {
      state.invoice.companyName = e.target.value;
      const receiptComp = document.getElementById('receipt-invoice-company-name');
      if (receiptComp) receiptComp.textContent = e.target.value || (t('crmCorporate') || 'Société');
    };
  }

  if (invVat) {
    invVat.value = state.invoice.vatNumber || '';
    invVat.oninput = (e) => { state.invoice.vatNumber = e.target.value; };
    invVat.onblur = (e) => {
      const formatted = formatBelgianVat(e.target.value);
      if (formatted) {
        state.invoice.vatNumber = formatted;
        invVat.value = formatted;
      }
    };
  }

  if (invAddr) {
    invAddr.value = state.invoice.billingAddress || '';
    invAddr.oninput = (e) => { state.invoice.billingAddress = e.target.value; };
  }

  if (invPo) {
    invPo.value = state.invoice.poNumber || '';
    invPo.oninput = (e) => { state.invoice.poNumber = e.target.value; };
  }

  // Calculate totals
  const pkgPrice = state.selectedPackage ? state.selectedPackage.price : 24;
  const packageSubtotal = state.playersCount * pkgPrice;

  let addonsTotal = 0;
  const addonItems = [];

  if (state.addons.extra_laser) {
    const cost = state.playersCount * 7;
    addonsTotal += cost;
    addonItems.push({ name: t('addonLaserGame'), total: cost });
  }

  if (state.addons.extra_minigolf) {
    const cost = state.playersCount * 7;
    addonsTotal += cost;
    addonItems.push({ name: t('addonMiniGolf'), total: cost });
  }

  if (state.addons.cake) {
    const cost = state.playersCount * 6;
    addonsTotal += cost;
    addonItems.push({ name: t('addonCake'), total: cost });
  }

  if (state.addons.castle) {
    const cost = state.playersCount * 2;
    addonsTotal += cost;
    addonItems.push({ name: t('addonCastle'), total: cost });
  }

  if (state.addons.extra_drinks) {
    const cost = Math.round(state.playersCount * 3.2);
    addonsTotal += cost;
    addonItems.push({ name: t('addonDrinks'), total: cost });
  }

  if (state.addons.arcade_tokens > 0) {
    const cost = state.addons.arcade_tokens * 2;
    addonsTotal += cost;
    addonItems.push({ name: `${t('addonArcade')} (x${state.addons.arcade_tokens})`, total: cost });
  }

  const grandTotal = packageSubtotal + addonsTotal;
  const isOnline = state.paymentMethod !== 'onsite';
  const deposit = !isOnline ? 0 : (state.depositMode === '100' ? grandTotal : Math.round(grandTotal * 0.3));
  const balanceDue = grandTotal - deposit;

  // Update deposit amount card sub-values
  const d30Val = document.getElementById('deposit-30-val');
  const d100Val = document.getElementById('deposit-100-val');
  if (d30Val) d30Val.textContent = `${formatMoney(Math.round(grandTotal * 0.3))} (${formatMoney(grandTotal - Math.round(grandTotal * 0.3))} le jour J)`;
  if (d100Val) d100Val.textContent = `${formatMoney(grandTotal)} (Solde à 0 €)`;

  // Render receipt
  const receiptEl = document.getElementById('order-summary-details');
  if (receiptEl) {
    receiptEl.innerHTML = `
      <div class="summary-pkg-card">
        <img src="${state.selectedPackage.image}" alt="${t(state.selectedPackage.titleKey)}" class="summary-pkg-thumb">
        <div class="summary-pkg-info">
          <div class="summary-pkg-title">${t(state.selectedPackage.titleKey)}</div>
          <div class="summary-pkg-tag">${state.selectedPackage.taglineKey ? t(state.selectedPackage.taglineKey) : t(state.selectedPackage.durationKey)}</div>
        </div>
        <div class="summary-pkg-price" style="font-weight:700; color:var(--laser-cyan); font-size:1.05rem;">
          ${formatMoney(packageSubtotal)}
        </div>
      </div>

      <div class="summary-row bold">
        <span>${t(state.selectedPackage.titleKey)} (${state.playersCount} ${t('playersUnit') || 'pers.'})</span>
        <span>${formatMoney(packageSubtotal)}</span>
      </div>
      <div class="summary-row" style="font-size:0.82rem; margin-top:-6px;">
        <span style="display:flex; align-items:center; gap:6px;">
          <span style="display:inline-flex; align-items:center; gap:4px;">${icon('calendar', 'text-secondary', 12)} ${state.selectedDate}</span>
          <span>·</span>
          <span style="display:inline-flex; align-items:center; gap:4px;">${icon('clock', 'text-secondary', 12)} ${state.selectedSlot}</span>
        </span>
        <span>${state.playersCount} × ${formatMoney(pkgPrice)}</span>
      </div>
      ${addonItems.map(a => `
        <div class="summary-row">
          <span>+ ${a.name}</span>
          <span>${formatMoney(a.total)}</span>
        </div>
      `).join('')}
      ${state.invoice.requested ? `
        <div class="summary-row" style="background:rgba(0,240,255,0.06); padding:8px 10px; border-radius:8px; margin:8px 0; border:1px solid rgba(0,240,255,0.22); align-items:center;">
          <div style="display:flex; align-items:center; gap:6px; color:var(--laser-cyan); font-weight:700; font-size:0.82rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>${t('invoiceRequestedBadge') || 'Facture demandée'}</span>
          </div>
          <span id="receipt-invoice-company-name" style="font-size:0.8rem; font-weight:600; color:#ffffff; max-width:130px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${state.invoice.companyName || (t('crmCorporate') || 'Société')}</span>
        </div>
      ` : ''}
      <div class="summary-divider"></div>
      <div class="summary-row">
        <span>${deposit > 0 ? (state.depositMode === '100' ? t('depositChoice100') : t('depositToPayNow')) : t('payOnSiteOption')} :</span>
        <span style="color:var(--laser-green); font-weight:700;">${formatMoney(deposit)}</span>
      </div>
      <div class="summary-row">
        <span>${t('balanceDueOnSite')}</span>
        <span style="color:var(--laser-cyan); font-weight:600;">${formatMoney(balanceDue)}</span>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-total">
        <span>${t('totalAmount')}</span>
        <span>${formatMoney(grandTotal)}</span>
      </div>
    `;
  }

  // Payment method cards
  const methods = ['bancontact', 'payconiq', 'stripe', 'onsite'];
  methods.forEach(m => {
    const card = document.getElementById(`pay-opt-${m}`);
    if (card) {
      card.onclick = () => {
        state.paymentMethod = m;
        methods.forEach(other => {
          const c = document.getElementById(`pay-opt-${other}`);
          if (c) c.classList.toggle('active', other === m);
        });

        // Toggle details panel
        const bDesc = document.getElementById('bancontact-desc');
        const pDesc = document.getElementById('payconiq-desc');
        const sDesc = document.getElementById('stripe-card-mock');
        const oDesc = document.getElementById('onsite-desc');
        const depWrap = document.getElementById('deposit-amount-selection');

        if (bDesc) bDesc.style.display = m === 'bancontact' ? 'block' : 'none';
        if (pDesc) pDesc.style.display = m === 'payconiq' ? 'block' : 'none';
        if (sDesc) sDesc.style.display = m === 'stripe' ? 'block' : 'none';
        if (oDesc) oDesc.style.display = m === 'onsite' ? 'block' : 'none';
        if (depWrap) depWrap.style.display = m === 'onsite' ? 'none' : 'block';

        renderStep4();
      };
    }
  });

  // Deposit mode toggle (30% vs 100%)
  const dep30 = document.getElementById('deposit-mode-30');
  const dep100 = document.getElementById('deposit-mode-100');

  if (dep30 && dep100) {
    dep30.onclick = () => {
      state.depositMode = '30';
      dep30.classList.add('active');
      dep100.classList.remove('active');
      renderStep4();
    };
    dep100.onclick = () => {
      state.depositMode = '100';
      dep100.classList.add('active');
      dep30.classList.remove('active');
      renderStep4();
    };
  }
}

// Submit Booking
function submitBooking() {
  const name = state.organizer.name.trim() || "Client Laser Magic";
  const email = state.organizer.email.trim() || "reservation@lasermagic.be";
  const phone = state.organizer.phone.trim() || "+32 470 00 00 00";

  // If invoice requested, validate company details
  if (state.invoice.requested) {
    const compInp = document.getElementById('input-invoice-company');
    const vatInp = document.getElementById('input-invoice-vat');
    const addrInp = document.getElementById('input-invoice-address');

    if (!state.invoice.companyName.trim()) {
      if (compInp) {
        compInp.focus();
        compInp.style.borderColor = 'var(--laser-pink)';
      }
      alert(getLang() === 'nl' ? 'Gelieve de bedrijfsnaam in te vullen voor de factuur.' : (getLang() === 'en' ? 'Please enter the company name for your invoice.' : 'Veuillez renseigner le nom de la société pour la facturation.'));
      return;
    }
    if (!state.invoice.vatNumber.trim()) {
      if (vatInp) {
        vatInp.focus();
        vatInp.style.borderColor = 'var(--laser-pink)';
      }
      alert(getLang() === 'nl' ? 'Gelieve het btw-nummer in te vullen voor de factuur.' : (getLang() === 'en' ? 'Please enter the VAT number for your invoice.' : 'Veuillez renseigner le numéro de TVA pour la facturation.'));
      return;
    }
    if (!state.invoice.billingAddress.trim()) {
      if (addrInp) {
        addrInp.focus();
        addrInp.style.borderColor = 'var(--laser-pink)';
      }
      alert(getLang() === 'nl' ? 'Gelieve het facturatieadres in te vullen.' : (getLang() === 'en' ? 'Please enter the full billing address.' : 'Veuillez renseigner l\'adresse complète de facturation.'));
      return;
    }
  }

  const pkgPrice = state.selectedPackage ? state.selectedPackage.price : 26;
  const packageSubtotal = state.playersCount * pkgPrice;

  let addonsTotal = 0;
  const selectedAddonsList = [];

  if (state.addons.extra_laser) {
    const cost = state.playersCount * 7;
    addonsTotal += cost;
    selectedAddonsList.push({ id: 'extra_laser', name: t('addonLaserGame'), qty: state.playersCount, unitPrice: 7, total: cost });
  }

  if (state.addons.extra_minigolf) {
    const cost = state.playersCount * 7;
    addonsTotal += cost;
    selectedAddonsList.push({ id: 'extra_minigolf', name: t('addonMiniGolf'), qty: state.playersCount, unitPrice: 7, total: cost });
  }

  if (state.addons.cake) {
    const cost = state.playersCount * 6;
    addonsTotal += cost;
    selectedAddonsList.push({ id: 'cake', name: t('addonCake'), qty: state.playersCount, unitPrice: 6, total: cost });
  }

  if (state.addons.castle) {
    const cost = state.playersCount * 2;
    addonsTotal += cost;
    selectedAddonsList.push({ id: 'castle', name: t('addonCastle'), qty: state.playersCount, unitPrice: 2, total: cost });
  }

  if (state.addons.extra_drinks) {
    const cost = Math.round(state.playersCount * 3.2);
    addonsTotal += cost;
    selectedAddonsList.push({ id: 'extra_drinks', name: t('addonDrinks'), qty: state.playersCount, unitPrice: 3.2, total: cost });
  }

  if (state.addons.arcade_tokens > 0) {
    const cost = state.addons.arcade_tokens * 2;
    addonsTotal += cost;
    selectedAddonsList.push({ id: 'arcade', name: t('addonArcade'), qty: state.addons.arcade_tokens, unitPrice: 2, total: cost });
  }

  const grandTotal = packageSubtotal + addonsTotal;
  const isOnline = state.paymentMethod !== 'onsite';
  const deposit = !isOnline ? (state.depositMode === '100' ? grandTotal : Math.round(grandTotal * 0.3)) : 0;
  const balanceDue = grandTotal - deposit;

  // Split slot into start and end
  const times = state.selectedSlot.split(' - ');
  const startTime = times[0] || "14:00";
  const endTime = times[1] || "16:00";

  const clientLang = getLang() || 'fr';

  const newBooking = store.addBooking({
    customerName: name,
    email: email,
    phone: phone,
    lang: clientLang,
    packageId: state.selectedPackage.id,
    packageImage: state.selectedPackage.image,
    category: state.category,
    packageName: t(state.selectedPackage.titleKey),
    date: state.selectedDate,
    timeSlot: state.selectedSlot,
    startTime: startTime,
    endTime: endTime,
    players: state.playersCount,
    childName: state.childName,
    childAge: state.childAge,
    childBirthDate: state.childBirthDate || '',
    addons: selectedAddonsList,
    unitPrice: pkgPrice,
    subtotal: packageSubtotal,
    addonsTotal: addonsTotal,
    totalAmount: grandTotal,
    depositPaid: deposit,
    balanceDue: balanceDue,
    paymentMethod: state.paymentMethod,
    paymentStatus: deposit >= grandTotal ? 'paid_full' : (deposit > 0 ? 'deposit_paid' : 'pending_onsite'),
    status: deposit > 0 ? 'confirmed' : 'pending',
    specialNotes: state.organizer.notes,
    isCorporate: !!state.invoice.requested,
    invoiceRequested: !!state.invoice.requested,
    companyName: state.invoice.requested ? state.invoice.companyName.trim() : '',
    vatNumber: state.invoice.requested ? state.invoice.vatNumber.trim() : '',
    billingAddress: state.invoice.requested ? state.invoice.billingAddress.trim() : '',
    poNumber: state.invoice.requested ? state.invoice.poNumber.trim() : '',
    communicationLog: [
      {
        id: 'comm-init-email',
        type: 'email',
        recipient: email,
        sentAt: new Date().toISOString(),
        notes: `E-mail de confirmation initial avec lien portail (${clientLang.toUpperCase()})`
      }
    ]
  });

  state.lastCreatedBooking = newBooking;
  renderSuccessScreen(newBooking);
  goToStep(5);
}

function renderSuccessScreen(booking) {
  const refEl = document.getElementById('success-booking-ref');
  const detailsEl = document.getElementById('success-booking-details');
  const currentLanguage = booking.lang || getLang() || 'fr';

  if (refEl) refEl.textContent = `#${booking.id}`;
  if (detailsEl) {
    const pkgImg = booking.packageImage || (packagesData.birthday.find(p => p.id === booking.packageId)?.image) || (packagesData.standard.find(p => p.id === booking.packageId)?.image) || '/images/package-fun.jpg';
    detailsEl.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); overflow:hidden; max-width:520px; margin:0 auto; text-align:left; box-shadow:var(--shadow-lg);">
        <div style="position:relative; height:150px; background-image:url('${pkgImg}'); background-size:cover; background-position:center;">
          <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(4,7,15,0.15) 0%, rgba(14,22,40,0.92) 100%);"></div>
          <div style="position:absolute; bottom:14px; left:18px; right:18px; display:flex; justify-content:space-between; align-items:flex-end;">
            <div>
              <span class="badge ${booking.packageId === 'vip' ? 'badge-pink' : 'badge-cyan'}" style="font-size:0.75rem; margin-bottom:4px; display:inline-block;">
                ${booking.category === 'birthday' ? t('categoryBirthdays') : t('categoryStandard')}
              </span>
              <h3 style="font-size:1.35rem; color:#fff; margin:0;">${booking.packageName}</h3>
            </div>
            <span class="status-pill status-${booking.status}">${booking.status === 'confirmed' ? t('statusConfirmed') : t('statusPending')}</span>
          </div>
        </div>
        <div style="padding:22px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span style="color:var(--text-secondary);">${t('selectDate')} :</span>
            <strong>${booking.date} (${booking.timeSlot})</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span style="color:var(--text-secondary);">${t('playersCountLabel')} :</span>
            <strong>${booking.players} ${t('playersUnit') || 'pers.'}</strong>
          </div>
          ${booking.childName ? `
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span style="color:var(--text-secondary);">${t('childCelebratedName')} :</span>
            <strong style="color:var(--laser-pink);">${booking.childName} (${booking.childAge} ${currentLanguage === 'nl' ? 'jaar' : (currentLanguage === 'en' ? 'yrs' : 'ans')})</strong>
          </div>` : ''}
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span style="color:var(--text-secondary);">${t('depositToPayNow')}</span>
            <strong style="color:var(--laser-green);">${formatMoney(booking.depositPaid || 0)} (${booking.paymentMethod.toUpperCase()})</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span style="color:var(--text-secondary);">${t('balanceDueOnSite')}</span>
            <strong style="color:var(--laser-cyan);">${formatMoney(booking.balanceDue || 0)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-subtle); padding-top:12px; margin-top:12px;">
            <span style="color:var(--text-secondary);">${t('totalAmount')} :</span>
            <strong style="color:var(--text-white); font-size:1.25rem;">${formatMoney(booking.totalAmount)}</strong>
          </div>
          ${booking.invoiceRequested || booking.companyName ? `
          <div style="background:rgba(0,240,255,0.06); border:1px solid rgba(0,240,255,0.22); border-radius:var(--radius-md); padding:12px; margin-top:14px;">
            <div style="font-size:0.8rem; font-weight:700; color:var(--laser-cyan); display:flex; align-items:center; gap:6px; margin-bottom:6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>${t('invoiceRequestedBadge') || 'Facture demandée'}</span>
            </div>
            <div style="font-size:0.88rem; color:#fff; font-weight:700;">${booking.companyName}</div>
            ${booking.vatNumber ? `<div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">TVA : <strong style="color:var(--text-white);">${booking.vatNumber}</strong></div>` : ''}
            ${booking.billingAddress ? `<div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">${booking.billingAddress}</div>` : ''}
            ${booking.poNumber ? `<div style="font-size:0.8rem; color:var(--laser-pink); margin-top:2px;">PO : ${booking.poNumber}</div>` : ''}
          </div>` : ''}
        </div>
      </div>
    `;
  }

  // Setup WhatsApp & Client portal links
  const btnWhatsApp = document.getElementById('btn-whatsapp-recap');
  if (btnWhatsApp) {
    btnWhatsApp.href = getWhatsAppUrl(booking, currentLanguage);
    btnWhatsApp.onclick = () => {
      store.recordCommunication(booking.id, {
        type: 'whatsapp',
        recipient: booking.phone,
        notes: `Récapitulatif WhatsApp ouvert par le client (${currentLanguage.toUpperCase()})`
      });
    };
  }

  const btnPortal = document.getElementById('btn-client-portal');
  if (btnPortal) {
    btnPortal.href = getClientPortalUrl(booking.id, window.location.origin, currentLanguage);
  }

  // Setup Email preview modal in widget
  const btnEmail = document.getElementById('btn-preview-email');
  const emailModal = document.getElementById('widget-email-modal');
  const emailFrame = document.getElementById('widget-email-iframe');
  const closeEmailBtn = document.getElementById('btn-close-widget-email');

  if (btnEmail && emailModal && emailFrame) {
    btnEmail.onclick = () => {
      const emailHtml = generateConfirmationEmailHtml(booking, currentLanguage);
      emailModal.style.display = 'flex';
      emailFrame.contentWindow.document.open();
      emailFrame.contentWindow.document.write(emailHtml);
      emailFrame.contentWindow.document.close();
    };
  }

  if (closeEmailBtn && emailModal) {
    closeEmailBtn.onclick = () => {
      emailModal.style.display = 'none';
    };
  }

  // Setup restart & calendar buttons
  const btnRestart = document.getElementById('btn-restart-booking');
  if (btnRestart) {
    btnRestart.onclick = () => {
      goToStep(1);
    };
  }

  const btnCal = document.getElementById('btn-add-calendar');
  if (btnCal) {
    btnCal.onclick = () => {
      generateIcsFile(booking);
    };
  }
}

function generateIcsFile(booking) {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Laser Magic//Booking Widget//FR
BEGIN:VEVENT
UID:${booking.id}@lasermagic.be
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${booking.date.replace(/-/g, '')}T${booking.startTime.replace(':', '')}00
DTEND:${booking.date.replace(/-/g, '')}T${booking.endTime.replace(':', '')}00
SUMMARY:Laser Magic - ${booking.packageName} (${booking.id})
DESCRIPTION:Réservation Laser Magic\\nFormule: ${booking.packageName}\\nJoueurs: ${booking.players}\\nLieu: Vilvoorde (15 min de Bruxelles)
LOCATION:Laser Magic, Vilvoorde
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `LaserMagic-${booking.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// Auto-height notification for responsive Iframe embed in Webflow
let lastSentHeight = 0;
let resizeTimer = null;

function notifyParentResize() {
  if (window.parent && window.parent !== window) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const container = document.querySelector('.widget-container');
      const height = container ? Math.ceil(container.getBoundingClientRect().height) : document.body.offsetHeight;
      if (height > 100 && Math.abs(height - lastSentHeight) > 4) {
        lastSentHeight = height;
        window.parent.postMessage({
          type: 'LASER_MAGIC_IFRAME_RESIZE',
          height: height + 16
        }, '*');
      }
    }, 50);
  }
}

// Listen to window resizes
window.addEventListener('resize', notifyParentResize);

