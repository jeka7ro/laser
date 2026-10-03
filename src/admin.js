// Laser Magic - Back-Office Pro Controller (Vilvoorde / Brussels)
// Multi-lingual: FR, NL, EN (No Romanian)

import { t, getLang, setLang, getPackageTitle, getFlagSvg, getRoundFlagSvg, formatMoney } from './i18n.js';
import { store, getWebhookConfig, saveWebhookConfig, getWebhookLogs, recordWebhookLog, getCommConfig, saveCommConfig, getCommLogs, recordCommLog } from './store.js';
import { icon } from './icons.js';
import { getWhatsAppUrl, generateConfirmationEmailHtml, generateWhatsAppMessage, getClientPortalUrl, generateBirthdayCouponEmailHtml, sendEmailNotification, sendWhatsAppNotification, testEmailGateway, testWhatsAppGateway } from './notifications.js';
import { searchEnterpriseSuggestions, lookupViesOrKboCompany, searchAddressAutocomplete, formatBelgianVat } from './companyLookup.js';
import { openBarPosModal, closeBarPosModal } from './barPos.js';
import { parseAmeliaCSV, normalizeBelgianPhone, generateAmeliaSampleCSV } from './ameliaImporter.js';
import { generateQrSvg } from './qrGenerator.js';

export function formatBirthDate(dobStr) {
  if (!dobStr) return '';
  const parts = dobStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dobStr;
}

export function showAdminToast(message, type = 'success') {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = type === 'error' ? 'var(--laser-red)' : 'var(--laser-green)';
  toast.style.color = type === 'error' ? '#fff' : '#04070f';
  toast.style.display = 'block';
  toast.style.animation = 'fadeInUp 0.25s ease-out';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}
window.showAdminToast = showAdminToast;

let activeTab = 'reports';
let currentFilter = 'all';
let searchQuery = '';
let selectedDate = new Date().toISOString().split('T')[0];
let activeModalBooking = null;
let selectedBookingIds = new Set();
let bookingsCurrentPage = 1;
let bookingsPageSize = 25;

export function initAdmin() {
  setupNavbar();
  setupBrusselsClock();
  setupStoreSubscription();
  setupQuickBookingModal();
  setupClientsToolbar();
  setupTableQrsModal();

  // Sync active language buttons to getLang()
  const activeLang = getLang();
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === activeLang);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const savedTab = localStorage.getItem('laser_admin_active_tab');
  const requestedTab = urlParams.get('tab') || savedTab;
  if (requestedTab && ['reports', 'timeline', 'bookings', 'clients', 'kitchen', 'embed'].includes(requestedTab)) {
    switchTab(requestedTab);
  } else {
    switchTab('reports');
  }

  renderAllViews();
}

function setupNavbar() {
  // Navigation tabs in sidebar
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      switchTab(tab);
    });
  });

  // Language selector buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.dataset.lang;
      setLang(lang);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('laser_magic_lang', lang);
        localStorage.setItem('laser_admin_lang', lang);
      }
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`.lang-btn[data-lang="${lang}"]`).forEach(b => b.classList.add('active'));
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      applyTheme(currentTheme);
      renderAllViews();
    });
  });

  // Theme toggle button
  setupThemeToggle();

  // Quick booking button
  document.querySelectorAll('.btn-open-quick-booking, #btn-new-phone-booking').forEach(btn => {
    btn.addEventListener('click', () => {
      openQuickBookingModal();
    });
  });

  // Bar POS Modal Close handlers
  const closeBarPosBtn = document.getElementById('btn-close-bar-pos');
  const barPosModal = document.getElementById('bar-pos-modal');
  if (closeBarPosBtn) closeBarPosBtn.onclick = () => closeBarPosModal();
  if (barPosModal) {
    barPosModal.addEventListener('click', (e) => {
      if (e.target === barPosModal) closeBarPosModal();
    });
  }
}

function setupThemeToggle() {
  const savedTheme = localStorage.getItem('laser_admin_theme') || 'light';
  applyTheme(savedTheme);

  const btn = document.getElementById('btn-theme-toggle');
  if (btn) {
    btn.onclick = () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('laser_admin_theme', next);
    };
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const textEl = document.getElementById('theme-text-val');
  if (textEl) {
    textEl.textContent = theme === 'light' ? t('themeModeDark') : t('themeModeLight');
  }
}

function switchTab(tabId) {
  activeTab = tabId;
  localStorage.setItem('laser_admin_active_tab', tabId);
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.replaceState({ tab: tabId }, '', url.toString());
  } catch (e) {}

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabId);
  });

  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.toggle('active', view.id === `tab-${tabId}`);
  });

  // Dynamic Topbar Header Titles & Subtitles
  const titles = {
    reports: {
      title: t('topbarReportsTitle'),
      sub: t('topbarReportsSub')
    },
    timeline: {
      title: t('topbarTimelineTitle'),
      sub: t('topbarTimelineSub')
    },
    bookings: {
      title: t('topbarBookingsTitle'),
      sub: t('topbarBookingsSub')
    },
    kitchen: {
      title: t('topbarKitchenTitle'),
      sub: t('topbarKitchenSub')
    },
    clients: {
      title: t('topbarClientsTitle'),
      sub: t('topbarClientsSub')
    },
    embed: {
      title: t('topbarEmbedTitle'),
      sub: t('topbarEmbedSub')
    }
  };

  const currentInfo = titles[tabId] || titles.reports;
  const titleEl = document.getElementById('topbar-title');
  const subEl = document.getElementById('topbar-sub');
  if (titleEl) titleEl.textContent = currentInfo.title;
  if (subEl) subEl.textContent = currentInfo.sub;

  // Update sidebar bookings count badge
  const countBadge = document.getElementById('sidebar-bookings-count');
  if (countBadge) {
    const today = new Date().toISOString().split('T')[0];
    const todayCount = store.getAll().filter(b => b.date === today && b.status !== 'cancelled').length;
    countBadge.textContent = todayCount;
  }

  // Update sidebar clients count badge
  const clientsBadge = document.getElementById('sidebar-clients-count');
  if (clientsBadge) {
    clientsBadge.textContent = store.getClients().length;
  }

  if (tabId === 'timeline') renderTimeline();
  if (tabId === 'bookings') renderBookingsTable();
  if (tabId === 'clients') renderClientsView();
  if (tabId === 'reports') renderReportsView();
  if (tabId === 'kitchen') renderKitchenView();
  if (tabId === 'embed') setupEmbedTab();
  renderKPIs();
}

function setupBrusselsClock() {
  const clockEl = document.getElementById('brussels-clock-val');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-BE', { timeZone: 'Europe/Brussels', hour12: false });
    clockEl.textContent = `Brussels: ${timeStr} CET`;
  }
  update();
  setInterval(update, 1000);
}

function updateCloudSyncIndicator() {
  const el = document.getElementById('cloud-sync-indicator');
  const textEl = document.getElementById('cloud-sync-text');
  if (!el || !textEl) return;

  if (store.isCloudConnected()) {
    const status = store.cloudSyncStatus;
    if (status === 'connected') {
      el.className = 'cloud-sync-badge status-connected';
      textEl.textContent = 'Supabase Live';
      el.title = 'Bază de date Supabase sincronizată în timp real';
    } else if (status === 'error') {
      el.className = 'cloud-sync-badge status-warning';
      textEl.textContent = 'Supabase Sync Warning';
      el.title = 'A apărut o problemă la sincronizarea Supabase';
    } else {
      el.className = 'cloud-sync-badge status-connecting';
      textEl.textContent = 'Supabase Connecting...';
      el.title = 'Conectare la Supabase...';
    }
  } else {
    el.className = 'cloud-sync-badge status-local';
    textEl.textContent = 'Mode Local (Demo)';
    el.title = 'Date stocate local în browser. Adăugați VITE_SUPABASE_URL în .env sau Netlify pentru sincronizare cloud.';
  }
}

function setupStoreSubscription() {
  updateCloudSyncIndicator();
  store.subscribe(() => {
    updateCloudSyncIndicator();
    renderKPIs();
    if (activeTab === 'timeline') renderTimeline();
    if (activeTab === 'bookings') renderBookingsTable();
    if (activeTab === 'clients') renderClientsView();
    if (activeTab === 'reports') renderReportsView();
    if (activeTab === 'kitchen') renderKitchenView();
  });
}


function renderAllViews() {
  // Update localized text for elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  // Update localized placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key);
  });

  // Update localized titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    el.title = t(key);
  });

  // Re-sync topbar title & sub for the active tab in the selected language
  const titles = {
    reports: { title: t('topbarReportsTitle'), sub: t('topbarReportsSub') },
    timeline: { title: t('topbarTimelineTitle'), sub: t('topbarTimelineSub') },
    bookings: { title: t('topbarBookingsTitle'), sub: t('topbarBookingsSub') },
    clients: { title: t('topbarClientsTitle'), sub: t('topbarClientsSub') },
    kitchen: { title: t('topbarKitchenTitle'), sub: t('topbarKitchenSub') },
    embed: { title: t('topbarEmbedTitle'), sub: t('topbarEmbedSub') }
  };
  const currentInfo = titles[activeTab] || titles.reports;
  const titleEl = document.getElementById('topbar-title');
  const subEl = document.getElementById('topbar-sub');
  if (titleEl) titleEl.textContent = currentInfo.title;
  if (subEl) subEl.textContent = currentInfo.sub;

  const clientsBadge = document.getElementById('sidebar-clients-count');
  if (clientsBadge) {
    clientsBadge.textContent = store.getClients().length;
  }

  renderKPIs();
  renderTimeline();
  renderBookingsTable();
  renderClientsView();
  renderReportsView();
  renderKitchenView();
  setupEmbedTab();
}

// Render Top KPI Cards (Reactive to Selected Period & Filters)
function renderKPIs() {
  const allBookings = store.getAll();
  const todayStr = new Date().toISOString().split('T')[0];
  let activeBookings = [];
  let periodContext = 'all';

  if (activeTab === 'bookings') {
    activeBookings = getFilteredBookings();
    periodContext = currentFilter;
  } else if (activeTab === 'reports') {
    activeBookings = getFilteredReportsBookings();
    periodContext = currentReportsPeriod;
  } else if (activeTab === 'timeline' || activeTab === 'kitchen') {
    activeBookings = store.getBookingsByDate(selectedDate);
    periodContext = (selectedDate === todayStr) ? 'today' : 'custom_date';
  } else {
    activeBookings = allBookings;
    periodContext = 'all';
  }

  const validBookings = activeBookings.filter(b => b.status !== 'cancelled');
  const count = validBookings.length;
  const players = validBookings.reduce((sum, b) => sum + (b.players || 0), 0);
  const revenue = validBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const deposits = validBookings.reduce((sum, b) => sum + (b.depositPaid || 0), 0);
  const balances = validBookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const pendingApprovals = validBookings.filter(b => b.status === 'pending' || !b.clientConfirmedAt).length;

  const bVal = document.getElementById('kpi-today-bookings');
  const pVal = document.getElementById('kpi-today-players');
  const rVal = document.getElementById('kpi-today-revenue');
  const peVal = document.getElementById('kpi-pending-approvals');

  const bTitleEl = bVal?.closest('.kpi-card')?.querySelector('.kpi-title');
  const bSubEl = bVal?.closest('.kpi-card')?.querySelector('.kpi-sub');
  const pSubEl = pVal?.closest('.kpi-card')?.querySelector('.kpi-sub');
  const rSubEl = document.getElementById('kpi-sub-revenue') || rVal?.nextElementSibling;
  const peSubEl = document.getElementById('kpi-sub-pending') || peVal?.nextElementSibling;

  if (bTitleEl) {
    if (periodContext === 'today') {
      bTitleEl.textContent = t('statTodayBookings');
    } else if (periodContext === 'weekend') {
      bTitleEl.textContent = t('statWeekendBookings');
    } else if (periodContext === 'month') {
      bTitleEl.textContent = t('statMonthBookings');
    } else if (periodContext === 'pending') {
      bTitleEl.textContent = `${t('statusPending')} (${count})`;
    } else if (periodContext === 'confirmed') {
      bTitleEl.textContent = `${t('statusConfirmed')} (${count})`;
    } else if (periodContext === 'in_progress') {
      bTitleEl.textContent = `${t('statusInProgress')} (${count})`;
    } else if (periodContext === 'completed') {
      bTitleEl.textContent = `${t('statusCompleted')} (${count})`;
    } else if (periodContext === 'custom_date') {
      bTitleEl.textContent = `Planning (${selectedDate})`;
    } else {
      bTitleEl.textContent = t('statTotalBookings');
    }
  }

  if (bSubEl) {
    if (periodContext === 'today') {
      bSubEl.textContent = t('todayArenasSub');
    } else if (periodContext === 'weekend') {
      bSubEl.textContent = t('weekendArenasSub');
    } else if (periodContext === 'month') {
      bSubEl.textContent = t('monthArenasSub');
    } else {
      bSubEl.textContent = t('allArenasVilvoorde');
    }
  }

  if (bVal) bVal.textContent = count;
  if (pVal) pVal.textContent = players;
  if (pSubEl) {
    pSubEl.textContent = count > 0 
      ? t('avgPlayersPerBooking').replace('{avg}', Math.round(players / count))
      : t('capacityBadge');
  }

  if (rVal) {
    rVal.textContent = formatMoney(revenue);
    if (rSubEl) {
      rSubEl.textContent = `${t('kpiDepositsLabel')}: ${formatMoney(deposits)} · ${t('kpiBalanceLabel')}: ${formatMoney(balances)}`;
    }
  }

  if (peVal) {
    peVal.textContent = pendingApprovals;
    if (peSubEl) {
      peSubEl.textContent = pendingApprovals > 0 ? t('kpiPendingSub') : t('allValidated');
    }
  }
}

// 1. TIMELINE SCHEDULER VIEW
function renderTimeline() {
  const dateInput = document.getElementById('timeline-date-picker');
  if (dateInput) {
    dateInput.value = selectedDate;
    dateInput.onchange = (e) => {
      selectedDate = e.target.value;
      renderTimeline();
      renderKPIs();
    };
  }

  const prevDateBtn = document.getElementById('timeline-prev-date');
  const nextDateBtn = document.getElementById('timeline-next-date');
  if (prevDateBtn) {
    prevDateBtn.onclick = () => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      selectedDate = d.toISOString().split('T')[0];
      if (dateInput) dateInput.value = selectedDate;
      renderTimeline();
      renderKPIs();
    };
  }
  if (nextDateBtn) {
    nextDateBtn.onclick = () => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      selectedDate = d.toISOString().split('T')[0];
      if (dateInput) dateInput.value = selectedDate;
      renderTimeline();
      renderKPIs();
    };
  }

  const hours = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
  const resources = [
    { id: "jungle", name: t('arenaJungle'), type: "arena", iconSvg: icon('tree', 'text-green', 15) },
    { id: "prison", name: t('arenaPrison'), type: "arena", iconSvg: icon('lock', 'text-cyan', 15) },
    { id: "minigolf", name: t('facilityMinigolf'), type: "facility", iconSvg: icon('flag', 'text-amber', 15) },
    { id: "table1", name: "Table 1 (VIP)", type: "table", iconSvg: icon('crown', 'text-pink', 15) },
    { id: "table2", name: `Table 2 (${t('snack')})`, type: "table", iconSvg: icon('table', 'text-secondary', 15) },
    { id: "table3", name: `Table 3 (${t('snack')})`, type: "table", iconSvg: icon('table', 'text-secondary', 15) },
    { id: "table4", name: `Table 4 (${t('snack')})`, type: "table", iconSvg: icon('table', 'text-secondary', 15) },
    { id: "table5", name: `Table 5 (${t('snack')})`, type: "table", iconSvg: icon('table', 'text-secondary', 15) }
  ];

  const gridEl = document.getElementById('timeline-grid-body');
  if (!gridEl) return;

  const dateBookings = store.getBookingsByDate(selectedDate);

  let html = '';

  // Header row
  html += `<div class="resource-header-cell">${t('colResource')}</div>`;
  hours.forEach(h => {
    html += `<div class="time-header-cell">${h}</div>`;
  });

  // Resource rows
  resources.forEach(res => {
    html += `
      <div class="resource-header-cell">
        <span style="display:inline-flex; align-items:center;">${res.iconSvg}</span>
        <span>${res.name}</span>
      </div>
    `;

    hours.forEach(h => {
      const hourInt = parseInt(h.split(':')[0]);

      // Check if any booking matches this resource and time
      const matchingBookings = dateBookings.filter(b => {
        const startH = parseInt(b.startTime.split(':')[0]);
        const endH = parseInt(b.endTime.split(':')[0]);

        const matchesTime = (hourInt >= startH && hourInt < endH);

        if (res.type === 'arena') {
          return matchesTime && (b.arena === res.id || b.arena === 'combined');
        } else if (res.type === 'table') {
          const tNum = parseInt(res.id.replace('table', ''));
          return matchesTime && b.tableNumber === tNum;
        } else if (res.id === 'minigolf') {
          return matchesTime && (b.addons && b.addons.some(a => a.id === 'extra_game'));
        }
        return false;
      });

      html += `<div class="timeline-cell" data-res="${res.id}" data-hour="${h}">`;
      
      matchingBookings.forEach(booking => {
        const pkgClass = booking.packageId === 'sweet' ? 'block-sweet' :
                         booking.packageId === 'fun' ? 'block-fun' :
                         booking.packageId === 'vip' ? 'block-vip' : 'block-standard';

        const displayTitle = booking.childName ? `${booking.childName} (${booking.childAge}a)` : (booking.customerName || `Dossier #${booking.id}`);

        html += `
          <div class="booking-block ${pkgClass}" data-id="${booking.id}" title="${displayTitle} · ${booking.timeSlot} · ${booking.players} pers.">
            <div class="block-title">${displayTitle}</div>
            <div class="block-sub">
              <span style="display:inline-flex; align-items:center; gap:3px; font-weight:600;">${icon('users', '', 11)} ${booking.players}p</span>
              <span style="opacity:0.85;">· ${booking.startTime}</span>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    });
  });

  gridEl.innerHTML = html;

  // Attach click handler on booking blocks
  gridEl.querySelectorAll('.booking-block').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openBookingDetailModal(id);
    });
  });
}

// 2. BOOKINGS MASTER TABLE VIEW & BULK ACTIONS
function getFilteredBookings() {
  const allBookings = store.getAll();
  let bookings = [...allBookings];

  // Apply status or period filter
  if (currentFilter === 'today') {
    const today = new Date().toISOString().split('T')[0];
    bookings = bookings.filter(b => b.date === today);
  } else if (currentFilter === 'weekend') {
    bookings = bookings.filter(b => {
      if (!b.date) return false;
      const d = new Date(b.date + 'T12:00:00');
      return d.getDay() === 0 || d.getDay() === 6;
    });
  } else if (currentFilter !== 'all') {
    bookings = bookings.filter(b => b.status === currentFilter);
  }

  // Apply search query (including daily order number, child name, customer info)
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    bookings = bookings.filter(b => 
      b.id.toLowerCase().includes(q) ||
      (b.orderCode && b.orderCode.toLowerCase().includes(q)) ||
      (b.orderNumber && String(b.orderNumber).includes(q)) ||
      b.customerName.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q) ||
      (b.childName && b.childName.toLowerCase().includes(q))
    );
  }
  return bookings;
}

function renderBookingsTable() {
  const tbody = document.getElementById('bookings-table-body');
  if (!tbody) return;

  setupTableFilters();

  const allBookings = store.getAll();
  
  // Clean up selected IDs that might no longer exist in the store
  const existingIds = new Set(allBookings.map(b => b.id));
  for (const id of selectedBookingIds) {
    if (!existingIds.has(id)) {
      selectedBookingIds.delete(id);
    }
  }

  const bookings = getFilteredBookings();

  // Update search badge and summary footer
  const searchCountEl = document.getElementById('bookings-search-count');
  if (searchCountEl) {
    if (searchQuery.trim()) {
      searchCountEl.style.display = 'inline-block';
      searchCountEl.textContent = `${bookings.length} / ${allBookings.length}`;
    } else {
      searchCountEl.style.display = 'none';
    }
  }

  const countLabelEl = document.getElementById('bookings-count-label');
  const totalRevEl = document.getElementById('bookings-total-revenue-sum');
  if (countLabelEl) {
    countLabelEl.textContent = String(bookings.length);
  }
  if (totalRevEl) {
    const totalRev = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    totalRevEl.textContent = formatMoney(totalRev);
  }

  // Pagination calculation
  const totalCount = bookings.length;
  let pagedBookings = bookings;
  let startIndex = 0;
  let endIndex = totalCount;
  let totalPages = 1;

  if (bookingsPageSize !== 'all') {
    const pageSize = parseInt(bookingsPageSize, 10) || 25;
    totalPages = Math.ceil(totalCount / pageSize) || 1;
    if (bookingsCurrentPage > totalPages) bookingsCurrentPage = totalPages;
    if (bookingsCurrentPage < 1) bookingsCurrentPage = 1;
    startIndex = (bookingsCurrentPage - 1) * pageSize;
    endIndex = Math.min(startIndex + pageSize, totalCount);
    pagedBookings = bookings.slice(startIndex, endIndex);
  }

  // Update range label
  const rangeEl = document.getElementById('bookings-pagination-range');
  if (rangeEl) {
    const template = t('showingRange');
    if (totalCount === 0) {
      rangeEl.textContent = template.replace('{start}', '0').replace('{end}', '0').replace('{total}', '0');
    } else if (bookingsPageSize === 'all') {
      rangeEl.textContent = template.replace('{start}', '1').replace('{end}', totalCount).replace('{total}', totalCount);
    } else {
      rangeEl.textContent = template.replace('{start}', startIndex + 1).replace('{end}', endIndex).replace('{total}', totalCount);
    }
  }

  // Update pagination navigation buttons
  const navEl = document.getElementById('bookings-pagination-nav');
  if (navEl) {
    if (bookingsPageSize === 'all' || totalPages <= 1) {
      navEl.innerHTML = '';
    } else {
      let navHtml = '';
      
      // Prev button
      navHtml += `
        <button type="button" class="pagination-page-btn" ${bookingsCurrentPage === 1 ? 'disabled' : ''} onclick="window.changeBookingsPage(${bookingsCurrentPage - 1})" title="${t('pagePrev')}">
          ${icon('chevronLeft', '', 14)}
        </button>
      `;

      // Page numbers: window around current page
      const startP = Math.max(1, bookingsCurrentPage - 2);
      const endP = Math.min(totalPages, bookingsCurrentPage + 2);
      
      if (startP > 1) {
        navHtml += `<button type="button" class="pagination-page-btn" onclick="window.changeBookingsPage(1)">1</button>`;
        if (startP > 2) {
          navHtml += `<span style="color:var(--text-muted); font-size:0.8rem; padding:0 2px;">...</span>`;
        }
      }

      for (let p = startP; p <= endP; p++) {
        navHtml += `
          <button type="button" class="pagination-page-btn ${p === bookingsCurrentPage ? 'active' : ''}" onclick="window.changeBookingsPage(${p})">
            ${p}
          </button>
        `;
      }

      if (endP < totalPages) {
        if (endP < totalPages - 1) {
          navHtml += `<span style="color:var(--text-muted); font-size:0.8rem; padding:0 2px;">...</span>`;
        }
        navHtml += `<button type="button" class="pagination-page-btn" onclick="window.changeBookingsPage(${totalPages})">${totalPages}</button>`;
      }

      // Next button
      navHtml += `
        <button type="button" class="pagination-page-btn" ${bookingsCurrentPage === totalPages ? 'disabled' : ''} onclick="window.changeBookingsPage(${bookingsCurrentPage + 1})" title="${t('pageNext')}">
          ${icon('chevronRight', '', 14)}
        </button>
      `;

      navEl.innerHTML = navHtml;
    }
  }

  // Sync Select All checkbox & Bulk Actions Bar
  const bulkBar = document.getElementById('bookings-bulk-bar');
  const bulkCountEl = document.getElementById('bulk-selected-count');
  if (bulkBar && bulkCountEl) {
    if (selectedBookingIds.size > 0) {
      bulkBar.style.display = 'flex';
      bulkCountEl.textContent = `${selectedBookingIds.size} ${selectedBookingIds.size > 1 ? t('selectedCountPlural') : t('selectedCountSingular')}`;
    } else {
      bulkBar.style.display = 'none';
    }
  }

  const selectAllCb = document.getElementById('bookings-select-all');
  if (selectAllCb) {
    const pageIds = pagedBookings.map(b => b.id);
    const selectedOnPage = pageIds.filter(id => selectedBookingIds.has(id));
    if (pageIds.length > 0 && selectedOnPage.length === pageIds.length) {
      selectAllCb.checked = true;
      selectAllCb.indeterminate = false;
    } else if (selectedOnPage.length > 0) {
      selectAllCb.checked = false;
      selectAllCb.indeterminate = true;
    } else {
      selectAllCb.checked = false;
      selectAllCb.indeterminate = false;
    }
  }

  // Empty state
  if (bookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted);">
          ${t('emptyBookings')}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = pagedBookings.map((b, index) => {
    const isClientConfirmed = !!b.clientConfirmedAt;
    const isDepositPaid = (b.depositPaid || 0) > 0;
    const isFullyPaid = (b.depositPaid || 0) >= b.totalAmount;
    const orderNum = String(b.orderNumber || 42).padStart(3, '0');
    const isSelected = selectedBookingIds.has(b.id);
    const localizedPkg = (b.packageId && getPackageTitle(b.packageId, getLang())) || b.packageName;

    return `
      <tr class="booking-table-row ${isSelected ? 'row-selected' : ''}" onclick="window.viewBooking('${b.id}')" title="${t('rowClickDetails').replace('{id}', b.id)}">
        <td style="text-align: center; padding: 6px 4px;" onclick="event.stopPropagation();">
          <input type="checkbox" class="booking-row-cb" data-id="${b.id}" ${isSelected ? 'checked' : ''} onchange="window.toggleSelectBooking('${b.id}', this.checked)" style="cursor: pointer; width: 14px; height: 14px; accent-color: var(--laser-cyan);">
        </td>
        <td style="white-space: nowrap;">
          <div style="display:flex; flex-direction:column; gap:1px; align-items:flex-start;">
            <span class="badge-order" style="padding: 2px 6px; font-size: 0.72rem;" title="${t('dailyOrderNumber')}">N° ${orderNum}</span>
            <span style="font-size:0.70rem; color:var(--text-muted); cursor:pointer;">
              #${startIndex + index + 1} · ${b.id}
            </span>
          </div>
        </td>
        <td style="white-space: nowrap;">
          <div style="display:flex; align-items:center; gap:4px; font-weight:700; color:var(--text-white); font-size:0.82rem;">
            ${icon('calendar', 'text-secondary', 11)}
            <span>${b.date}</span>
          </div>
          <div style="font-size:0.72rem; color:var(--laser-cyan); font-weight:700; margin-top:1px;">
            ${b.timeSlot} <span style="color:var(--text-muted); font-weight:400;">(${b.players}p)</span>
          </div>
        </td>
        <td>
          <div style="display:flex; flex-direction:column; gap:1px;">
            <div style="display:flex; align-items:center; gap:5px; white-space:nowrap;">
              <strong style="color:var(--text-white); font-size:0.84rem;">${localizedPkg}</strong>
              ${b.childName ? `<span style="font-size:0.78rem; color:var(--laser-pink); font-weight:700;">· ${b.childName}${b.childAge ? ` (${b.childAge}a)` : ''}</span>` : ''}
            </div>
            <div style="font-size:0.72rem; color:var(--text-muted); display:flex; align-items:center; gap:4px; white-space:nowrap;">
              ${b.arena === 'jungle' ? icon('tree', 'text-green', 11) + ' Jungle' : (b.arena === 'prison' ? icon('lock', 'text-cyan', 11) + ' Prison' : 'Fusion')} · T${b.tableNumber}
            </div>
          </div>
        </td>
        <td>
          <div class="customer-cell">
            <div style="display:flex; align-items:center; gap:6px; white-space:nowrap;">
              <span class="customer-name" style="font-weight:700; color:var(--text-white); font-size:0.84rem;">${b.customerName}</span>
              ${getRoundFlagSvg(b.lang || 'fr', 18)}
              ${isClientConfirmed ? `<span title="Présence validée en ligne par le client" style="color:var(--laser-green); display:inline-flex; align-items:center;">${icon('checkCircle', 'text-green', 13)}</span>` : ''}
            </div>
            <div class="customer-contact" style="font-size:0.73rem; color:var(--text-secondary); margin-top:1px; white-space:nowrap;" title="${b.email}">
              ${b.phone}
            </div>
          </div>
        </td>
        <td style="white-space: nowrap;">
          <span class="status-pill status-${b.status}" style="font-size:0.74rem; padding:4px 10px; font-weight:800; display:inline-block; border-radius:var(--radius-full); text-transform:uppercase;">
            ${t({ pending: 'statusPending', confirmed: 'statusConfirmed', in_progress: 'statusInProgress', completed: 'statusCompleted', cancelled: 'statusCancelled' }[b.status] || 'statusPending')}
          </span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <div class="total-amount-val" style="font-weight: 800; font-size: 0.95rem; color: var(--text-white); letter-spacing: -0.01em;">
            ${formatMoney(b.totalAmount || 0)}
          </div>
          <div style="font-size: 0.71rem; margin-top: 1px; color: ${b.balanceDue > 0 ? 'var(--laser-cyan)' : 'var(--laser-green)'}; font-weight: 600;">
            ${b.balanceDue > 0 ? `${t('balanceDuePrefix')} ${formatMoney(b.balanceDue)}` : t('paidInFull')}
          </div>
        </td>
        <td style="text-align: center; white-space: nowrap; width: 175px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            <button class="btn-action-circle" onclick="event.stopPropagation(); window.previewBirthdayCoupon('${b.id}')" title="${t('tooltipCoupon')}" style="color:var(--laser-pink); border-color:rgba(255,27,123,0.35); background:rgba(255,27,123,0.08);">
              ${icon('cake', 'text-pink', 12)}
            </button>
            <button class="btn-action-circle btn-action-whatsapp" onclick="event.stopPropagation(); window.openWhatsApp('${b.id}')" title="${t('tooltipWhatsApp')}">
              ${icon('phone', '', 12)}
            </button>
            <button class="btn-action-circle btn-action-mail" onclick="event.stopPropagation(); window.previewEmail('${b.id}')" title="${t('tooltipEmail')} (${b.email})">
              ${icon('mail', '', 12)}
            </button>
            <button class="btn-action-circle" onclick="event.stopPropagation(); window.copyClientLink('${b.id}')" title="${t('tooltipCopyLink')}">
              ${icon('copy', '', 12)}
            </button>
            <button class="btn-action-circle" onclick="event.stopPropagation(); window.openClientPortal('${b.id}')" title="Ouvrir la page client (#${b.id})" style="color:var(--laser-cyan); border-color:rgba(0,240,255,0.4); background:rgba(0,240,255,0.08);">
              ${icon('externalLink', 'text-cyan', 12)}
            </button>
            <button class="btn-action-circle" onclick="event.stopPropagation(); window.openBarPos('${b.id}')" title="Ardoise Bar & Restauration (Pizzas, Boissons) Table ${b.tableNumber || 1}" style="color:var(--laser-amber); border-color:rgba(245,158,11,0.4); background:rgba(245,158,11,0.08);">
              ${icon('creditCard', 'text-amber', 12)}
            </button>
            ${b.balanceDue > 0 ? `
              <button class="btn-action-circle btn-action-pay" onclick="event.stopPropagation(); window.payBalance('${b.id}')" title="${t('tooltipPayBalance')} (${formatMoney(b.balanceDue)})">
                ${icon('wallet', '', 12)}
              </button>
            ` : ''}
            <button class="btn-action-circle" onclick="event.stopPropagation(); window.viewBooking('${b.id}')" title="${t('tooltipViewBooking')}">
              ${icon('edit', '', 11)}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setupTableFilters() {
  const searchInput = document.getElementById('bookings-search-input');
  if (searchInput && !searchInput._bound) {
    searchInput._bound = true;
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      bookingsCurrentPage = 1;
      renderBookingsTable();
      renderKPIs();
    };
  }

  document.querySelectorAll('.filter-chips .chip-btn').forEach(btn => {
    if (!btn._bound) {
      btn._bound = true;
      btn.onclick = (e) => {
        currentFilter = e.currentTarget.dataset.filter;
        document.querySelectorAll('.filter-chips .chip-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        bookingsCurrentPage = 1;
        renderBookingsTable();
        renderKPIs();
      };
    }
  });
}

// Window Bulk Actions & Pagination Handlers
window.toggleSelectBooking = (id, isSelected) => {
  if (isSelected) {
    selectedBookingIds.add(id);
  } else {
    selectedBookingIds.delete(id);
  }
  renderBookingsTable();
};

window.toggleSelectAllBookings = (isSelected) => {
  const filtered = getFilteredBookings();
  if (isSelected) {
    filtered.forEach(b => selectedBookingIds.add(b.id));
  } else {
    filtered.forEach(b => selectedBookingIds.delete(b.id));
  }
  renderBookingsTable();
};

window.clearBookingSelection = () => {
  selectedBookingIds.clear();
  renderBookingsTable();
};

window.changeBookingsPage = (page) => {
  bookingsCurrentPage = page;
  renderBookingsTable();
};

window.changeBookingsPageSize = (size) => {
  bookingsPageSize = size === 'all' ? 'all' : parseInt(size, 10);
  bookingsCurrentPage = 1;
  renderBookingsTable();
};

window.bulkUpdateStatus = (status) => {
  const count = selectedBookingIds.size;
  if (count === 0) return;
  const ids = Array.from(selectedBookingIds);
  ids.forEach(id => {
    store.updateBooking(id, { status });
  });
  showAdminToast(`${count} réservation(s) passée(s) au statut "${status}".`);
  renderBookingsTable();
};

window.bulkDeleteBookings = () => {
  const count = selectedBookingIds.size;
  if (count === 0) return;
  const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${count} réservation(s) sélectionnée(s) ? Cette action est irréversible.`);
  if (!confirmed) return;

  const ids = Array.from(selectedBookingIds);
  ids.forEach(id => {
    store.deleteBooking(id);
  });
  selectedBookingIds.clear();
  showAdminToast(`${count} réservation(s) supprimée(s) avec succès.`);
  renderBookingsTable();
};

window.exportToExcel = (onlySelected = false) => {
  let list = [];
  if (onlySelected) {
    if (selectedBookingIds.size === 0) {
      showAdminToast('Aucune réservation sélectionnée à exporter.', 'error');
      return;
    }
    const all = store.getAll();
    list = all.filter(b => selectedBookingIds.has(b.id));
  } else {
    list = getFilteredBookings();
  }

  if (list.length === 0) {
    showAdminToast('Aucune réservation à exporter.', 'error');
    return;
  }

  const headers = [
    'Nr Crt',
    'N° Commande',
    'Référence Dossier',
    'Date de Réservation',
    'Créneau Horaire',
    'Statut',
    'Validation Client',
    'Formule',
    'Arène',
    'Table',
    'Prénom Enfant',
    'Âge',
    'Date de Naissance Enfant',
    'Nom Client',
    'Téléphone',
    'Email',
    'Langue',
    'Nombre Joueurs',
    'Acompte Payé (€)',
    'Solde Dû (€)',
    'Total TTC (€)',
    'Gâteau',
    'Boissons',
    'Code Promo Anniversaire',
    'Date de Création'
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = list.map((b, idx) => {
    const orderNum = String(b.orderNumber || 42).padStart(3, '0');
    return [
      idx + 1,
      `N° ${orderNum}`,
      b.id,
      b.date || '',
      b.timeSlot || '',
      b.status || '',
      b.clientConfirmedAt ? 'Confirmé' : 'En attente',
      b.packageName || '',
      b.arena || '',
      b.tableNumber || '',
      b.childName || '',
      b.childAge ? `${b.childAge} ans` : '',
      b.childBirthDate || '',
      b.customerName || '',
      b.phone || '',
      b.email || '',
      (b.lang || 'fr').toUpperCase(),
      b.players || 0,
      b.depositPaid || 0,
      b.balanceDue || 0,
      b.totalAmount || 0,
      b.hasCake ? 'Oui' : 'Non',
      b.drinksIncluded ? 'Oui' : 'Non',
      b.couponCode || '',
      b.createdAt ? new Date(b.createdAt).toLocaleString('fr-BE') : ''
    ].map(escapeCsv).join(';');
  });

  const csvContent = '\uFEFF' + headers.map(escapeCsv).join(';') + '\r\n' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `laser_magic_reservations_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showAdminToast(`Export Excel réussi : ${list.length} réservation(s) exportée(s).`);
};

// 3. KITCHEN & GROUP PREP VIEW
function renderKitchenView() {
  const datePicker = document.getElementById('kitchen-date-picker');
  if (datePicker) {
    datePicker.value = selectedDate;
    datePicker.onchange = (e) => {
      selectedDate = e.target.value;
      renderKitchenView();
      renderKPIs();
    };
  }

  const dateBookings = store.getBookingsByDate(selectedDate);

  // Calculate aggregated food requirements
  let donutsCount = 0;
  let friesCount = 0;
  let vipMealsCount = 0;
  let cakesCount = 0;
  let arcadeTokensCount = 0;
  let champagneCount = 0;

  dateBookings.forEach(b => {
    if (b.packageId === 'sweet') {
      donutsCount += b.players * 3; // 3 mini donuts per kid
      arcadeTokensCount += b.players;
    } else if (b.packageId === 'fun') {
      friesCount += b.players;
      arcadeTokensCount += b.players;
    } else if (b.packageId === 'vip') {
      vipMealsCount += b.players;
      champagneCount += Math.ceil(b.players / 4); // 1 bottle per 4 kids
      arcadeTokensCount += b.players;
    }

    if (b.addons) {
      b.addons.forEach(a => {
        if (a.id === 'cake') cakesCount += Math.ceil(b.players / 10);
        if (a.id === 'arcade') arcadeTokensCount += (a.qty || 0);
      });
    }
  });

  const dEl = document.getElementById('count-donuts');
  const fEl = document.getElementById('count-fries');
  const vEl = document.getElementById('count-vip');
  const cEl = document.getElementById('count-cakes');
  const aEl = document.getElementById('count-arcade');
  const chEl = document.getElementById('count-champagne');

  if (dEl) dEl.textContent = donutsCount;
  if (fEl) fEl.textContent = friesCount;
  if (vEl) vEl.textContent = vipMealsCount;
  if (cEl) cEl.textContent = cakesCount;
  if (aEl) aEl.textContent = arcadeTokensCount;
  if (chEl) chEl.textContent = champagneCount;

  // Render Kitchen Group Cards
  const listEl = document.getElementById('kitchen-groups-list');
  if (!listEl) return;

  if (dateBookings.length === 0) {
    listEl.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:30px;">${t('noGroupsToday')}</div>`;
    return;
  }

  listEl.innerHTML = dateBookings.map(b => {
    const lang = getLang();
    const localizedPkg = (b.packageId && getPackageTitle(b.packageId, lang)) || b.packageName;
    let snackText = 'Mini Donuts';
    if (b.packageId === 'fun') {
      snackText = lang === 'nl' ? 'Friet & Frikandel' : (lang === 'en' ? 'Fries & Fricadelle' : 'Frites & Fricadelle');
    } else if (b.packageId === 'vip') {
      snackText = lang === 'nl' ? 'Kip Tenders & Friet' : (lang === 'en' ? 'Chicken Tenders & Fries' : 'Tenders & Frites');
    }
    const hasCake = b.addons && b.addons.some(a => a.id === 'cake');
    const cakeHtml = hasCake 
      ? `<span style="color:var(--laser-pink); display:inline-flex; align-items:center; gap:4px; font-weight:700;">${icon('cake', '', 12)} ${t('chocolateCake')}</span>` 
      : `<span style="color:var(--text-muted);">${t('notIncluded')}</span>`;

    return `
      <div class="glass-panel kitchen-card" onclick="window.viewBooking('${b.id}')" title="${t('tooltipViewBooking')}">
        <!-- Header: Order & Child + Status & Action Buttons -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
          <div style="min-width:0; flex:1;">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span class="badge-order" style="font-size:0.75rem; padding:2px 8px; cursor:pointer;" title="${t('tooltipViewBooking')}">N° ${String(b.orderNumber || 42).padStart(3, '0')}</span>
              <strong style="color:var(--text-white); font-size:0.98rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${b.childName ? `${t('birthdayOf')} ${b.childName} (${b.childAge} ${t('yearsOld')})` : b.customerName}">
                ${b.childName ? `${t('birthdayOf')} ${b.childName} (${b.childAge} ${t('yearsOld')})` : b.customerName}
              </strong>
            </div>
            <div style="font-size:0.8rem; color:var(--laser-cyan); display:flex; align-items:center; gap:6px; margin-top:3px; flex-wrap:wrap;">
              <span>Table ${b.tableNumber}</span>
              <span>·</span>
              <span style="display:inline-flex; align-items:center; gap:4px;">${icon('clock', '', 12)} ${b.timeSlot}</span>
              <span>·</span>
              <span style="display:inline-flex; align-items:center; gap:4px;">${icon('users', '', 12)} ${b.players} ${t('kidsCount')}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
            <span class="status-pill status-${b.status}" style="font-size:0.72rem; padding:2px 8px;">${t('status' + b.status.charAt(0).toUpperCase() + b.status.slice(1))}</span>
            
            <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.viewBooking('${b.id}')" title="${t('viewOrder')}" style="padding:2px 8px; height:28px; font-size:0.75rem; font-weight:700; color:var(--laser-cyan); border-color:rgba(0,240,255,0.4); background:rgba(0,240,255,0.08); display:inline-flex; align-items:center; gap:4px; border-radius:var(--radius-sm);">
              ${icon('eye', 'text-cyan', 13)}
              <span>${getLang() === 'nl' ? 'Details' : (getLang() === 'en' ? 'Details' : 'Détails')}</span>
            </button>

            <button type="button" class="btn-action-circle" onclick="event.stopPropagation(); window.printBookingSheet('${b.id}')" title="${t('printTableSheet')}" style="width:28px; height:28px;">
              ${icon('printer', '', 13)}
            </button>
          </div>
        </div>

        <!-- 2x2 Compact Info Grid -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px 10px; background:var(--bg-surface); padding:8px 10px; border-radius:8px; font-size:0.78rem;">
          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><span style="color:var(--text-muted);">${t('menuLabel')}:</span> <strong style="color:var(--text-white);">${localizedPkg}</strong></div>
          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><span style="color:var(--text-muted);">${t('snackLabel')}:</span> <strong style="color:var(--text-white);">${snackText}</strong></div>
          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><span style="color:var(--text-muted);">${t('cakeLabel')}:</span> ${cakeHtml}</div>
          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><span style="color:var(--text-muted);">${t('arcadeTokensLabel')}:</span> <strong style="color:var(--laser-amber);">${b.players}&nbsp;${t('tokensUnit')}</strong></div>
        </div>

        <!-- Compact Slim Allergies / Notes line -->
        ${b.specialNotes ? `
          <div style="padding:4px 8px; background:rgba(239, 68, 68, 0.08); border-left:3px solid var(--laser-red); border-radius:4px; font-size:0.74rem; display:flex; align-items:center; gap:6px; min-height:22px; overflow:hidden;">
            <span style="flex-shrink:0; display:flex; align-items:center;">${icon('alertCircle', 'text-red', 13)}</span>
            <strong style="color:var(--laser-red); flex-shrink:0;">${t('allergiesNotesLabel')}:</strong>
            <span style="color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${b.specialNotes}">${b.specialNotes}</span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// ==========================================
// 4. CRM & CLIENT DATABASE CONTROLLER
// ==========================================
let clientsFilter = 'all';
let clientsSearchQuery = '';

export function renderClientsView() {
  const clients = store.getClients();
  const sidebarCount = document.getElementById('sidebar-clients-count');
  if (sidebarCount) sidebarCount.textContent = clients.length;

  // KPI Metrics
  const totalCountEl = document.getElementById('crm-total-count');
  const corporateCountEl = document.getElementById('crm-corporate-count');
  const totalSpentEl = document.getElementById('crm-total-spent');
  const repeatCountEl = document.getElementById('crm-repeat-count');
  const avgSpentEl = document.getElementById('crm-avg-spent');

  const corporateClients = clients.filter(c => c.isCorporate);
  const repeatClients = clients.filter(c => c.bookingsCount > 1);
  const totalRevenue = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgSpent = clients.length > 0 ? (totalRevenue / clients.length) : 0;

  if (totalCountEl) totalCountEl.textContent = clients.length;
  if (corporateCountEl) corporateCountEl.textContent = corporateClients.length;
  if (totalSpentEl) totalSpentEl.textContent = formatMoney(totalRevenue);
  if (repeatCountEl) repeatCountEl.textContent = repeatClients.length;
  if (avgSpentEl) avgSpentEl.textContent = formatMoney(avgSpent);

  // Filter Pill Badges
  const pillAll = document.getElementById('pill-clients-all');
  const pillInd = document.getElementById('pill-clients-ind');
  const pillCorp = document.getElementById('pill-clients-corp');
  const pillVip = document.getElementById('pill-clients-vip');

  if (pillAll) pillAll.textContent = clients.length;
  if (pillInd) pillInd.textContent = clients.filter(c => !c.isCorporate).length;
  if (pillCorp) pillCorp.textContent = corporateClients.length;
  if (pillVip) pillVip.textContent = repeatClients.length;

  // Filter & Search
  let filtered = [...clients];

  if (clientsFilter === 'individual') {
    filtered = filtered.filter(c => !c.isCorporate);
  } else if (clientsFilter === 'corporate') {
    filtered = filtered.filter(c => c.isCorporate);
  } else if (clientsFilter === 'vip') {
    filtered = filtered.filter(c => c.bookingsCount > 1);
  }

  if (clientsSearchQuery.trim()) {
    const q = clientsSearchQuery.toLowerCase().trim();
    filtered = filtered.filter(c => 
      (c.customerName && c.customerName.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.vatNumber && c.vatNumber.toLowerCase().includes(q)) ||
      (c.billingAddress && c.billingAddress.toLowerCase().includes(q)) ||
      (c.children && c.children.some(ch => ch.name.toLowerCase().includes(q)))
    );
  }

  const tbody = document.getElementById('clients-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">
          Aucun client trouvé pour cette recherche ou filtre.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const initials = (c.customerName || 'Client').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CL';
    const lastDate = c.lastSeen ? new Date(c.lastSeen).toLocaleDateString('fr-BE') : 'N/A';
    const hasChildren = c.children && c.children.length > 0;

    return `
      <tr class="booking-table-row" onclick="window.viewClientCRM('${c.id}')" style="cursor:pointer;" title="Cliquer pour ouvrir la fiche client">
        <!-- Client Name & Type -->
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; border-radius:50%; background:${c.isCorporate ? 'rgba(0,240,255,0.15)' : 'rgba(255,27,123,0.15)'}; color:${c.isCorporate ? 'var(--laser-cyan)' : 'var(--laser-pink)'}; font-weight:800; font-size:0.85rem; display:flex; align-items:center; justify-content:center; border:1px solid ${c.isCorporate ? 'rgba(0,240,255,0.3)' : 'rgba(255,27,123,0.3)'}; flex-shrink:0;">
              ${initials}
            </div>
            <div>
              <div style="font-weight:700; color:var(--text-white); font-size:0.92rem; display:flex; align-items:center; gap:6px;">
                <span>${c.customerName}</span>
                ${getRoundFlagSvg(c.lang || 'fr', 16)}
              </div>
              <div style="margin-top:2px;">
                ${c.isCorporate 
                  ? `<span class="badge" style="background:rgba(0,240,255,0.12); color:var(--laser-cyan); font-size:0.68rem; font-weight:700; padding:1px 7px;">B2B · ${c.companyName || 'Entreprise'}</span>` 
                  : `<span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-secondary); font-size:0.68rem; padding:1px 7px;">${t('crmIndividuals')}</span>`
                }
                ${c.bookingsCount > 1 ? `<span class="badge" style="background:rgba(0,255,136,0.12); color:var(--laser-green); font-size:0.68rem; font-weight:700; padding:1px 6px; margin-left:4px;">VIP</span>` : ''}
              </div>
            </div>
          </div>
        </td>

        <!-- Contact & Phone -->
        <td>
          <div style="font-size:0.86rem; color:var(--text-primary); font-weight:600;">${c.phone || t('crmNotSpecified')}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:200px;" title="${c.email}">
            ${c.email || '—'}
          </div>
        </td>

        <!-- Filiation / Tax -->
        <td>
          ${c.isCorporate ? `
            <div style="font-size:0.78rem; color:var(--laser-cyan); font-family:monospace; font-weight:700;">${c.vatNumber || 'TVA enregistrée'}</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:220px;" title="${c.billingAddress}">
              ${c.billingAddress || 'Belgique / Benelux'}
            </div>
          ` : `
            ${hasChildren ? `
              <div style="font-size:0.82rem; color:var(--laser-pink); font-weight:600; display:flex; align-items:center; gap:4px;">
                ${icon('cake', 'text-pink', 13)}
                <span>${c.children.map(ch => `${ch.name} (${ch.age || 10} ans)`).join(', ')}</span>
              </div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">
                ${c.children[0]?.dob ? `Anniversaire: ${formatBirthDate(c.children[0].dob)}` : 'Relance 1 an active'}
              </div>
            ` : `
              <span style="font-size:0.78rem; color:var(--text-muted); font-style:italic;">${t('crmNoChildren')}</span>
            `}
          `}
        </td>

        <!-- Bookings Count -->
        <td style="text-align:center;">
          <span class="badge" style="background:rgba(255,255,255,0.08); color:var(--text-white); font-weight:800; font-size:0.82rem; padding:3px 10px; border-radius:var(--radius-full);">
            ${c.bookingsCount} ${getLang() === 'nl' ? (c.bookingsCount > 1 ? 'dossiers' : 'dossier') : (getLang() === 'en' ? (c.bookingsCount > 1 ? 'bookings' : 'booking') : (c.bookingsCount > 1 ? 'dossiers' : 'dossier'))}
          </span>
        </td>

        <!-- Last Visit -->
        <td style="font-size:0.84rem; color:var(--text-secondary); white-space:nowrap;">
          ${lastDate}
        </td>

        <!-- LTV -->
        <td style="text-align:right;">
          <div style="font-weight:800; font-size:0.95rem; color:var(--text-white);">
            ${formatMoney(c.totalSpent)}
          </div>
          ${c.barTabTotal > 0 ? `
            <div style="font-size:0.72rem; color:var(--laser-amber); font-weight:600;">
              dont bar: ${formatMoney(c.barTabTotal)}
            </div>
          ` : ''}
        </td>

        <!-- Actions -->
        <td style="text-align:center; white-space:nowrap;" onclick="event.stopPropagation();">
          <div style="display:inline-flex; align-items:center; gap:4px;">
            <button class="btn-action-circle" onclick="window.viewClientCRM('${c.id}')" title="Voir la fiche client complète" style="color:var(--laser-cyan); border-color:rgba(0,240,255,0.4); background:rgba(0,240,255,0.08);">
              ${icon('users', 'text-cyan', 13)}
            </button>
            <button class="btn-action-circle btn-action-whatsapp" onclick="window.openWhatsAppDirect('${c.phone}', '${c.lang || 'fr'}')" title="Contacter sur WhatsApp">
              ${icon('phone', '', 12)}
            </button>
            <button class="btn-action-circle btn-action-mail" onclick="window.openEmailDirect('${c.email}', '${c.customerName}')" title="Envoyer un e-mail">
              ${icon('mail', '', 12)}
            </button>
            <button class="btn-action-circle" onclick="window.newBookingForClient('${c.id}')" title="Nouvelle réservation pour ce client" style="color:var(--laser-green); border-color:rgba(0,255,136,0.35); background:rgba(0,255,136,0.08);">
              ${icon('plus', '', 12)}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setupClientsToolbar() {
  const searchInput = document.getElementById('clients-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      clientsSearchQuery = e.target.value;
      renderClientsView();
    };
  }

  const filterBtns = document.querySelectorAll('#clients-filter-pills .pill-filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      clientsFilter = e.currentTarget.dataset.filter || 'all';
      renderClientsView();
    };
  });

  const exportBtn = document.getElementById('btn-export-clients');
  if (exportBtn) {
    exportBtn.onclick = () => exportClientsToCsv();
  }

  const closeCrmModalBtn = document.getElementById('btn-close-crm-modal');
  const crmModal = document.getElementById('client-crm-modal');
  if (closeCrmModalBtn && crmModal) {
    closeCrmModalBtn.onclick = () => crmModal.classList.remove('active');
    crmModal.onclick = (e) => {
      if (e.target === crmModal) crmModal.classList.remove('active');
    };
  }

  setupAmeliaImport();
}

let pendingAmeliaClients = [];

function setupAmeliaImport() {
  const openBtn = document.getElementById('btn-open-import-amelia');
  const modal = document.getElementById('amelia-import-modal');
  const closeBtn = document.getElementById('btn-close-amelia-modal');
  const cancelBtn = document.getElementById('btn-cancel-amelia-modal');
  const dropZone = document.getElementById('amelia-drop-zone');
  const fileInput = document.getElementById('amelia-file-input');
  const browseBtn = document.getElementById('btn-browse-amelia-file');
  const sampleBtn = document.getElementById('btn-download-amelia-sample');
  const pasteTextarea = document.getElementById('amelia-paste-textarea');
  const parsePastedBtn = document.getElementById('btn-parse-pasted-csv');
  const previewArea = document.getElementById('amelia-preview-area');
  const countBadge = document.getElementById('amelia-preview-count-badge');
  const filenameEl = document.getElementById('amelia-preview-filename');
  const clearBtn = document.getElementById('btn-clear-amelia-preview');
  const previewTbody = document.getElementById('amelia-preview-tbody');
  const confirmBtn = document.getElementById('btn-confirm-amelia-import');
  const confirmText = document.getElementById('btn-confirm-amelia-text');

  const optPhone = document.getElementById('amelia-opt-phone');
  const optChildren = document.getElementById('amelia-opt-children');
  const optMerge = document.getElementById('amelia-opt-merge');

  if (!modal) return;

  const openModal = () => {
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
  };

  if (openBtn) openBtn.onclick = openModal;
  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  if (browseBtn && fileInput) {
    browseBtn.onclick = (e) => {
      e.stopPropagation();
      fileInput.click();
    };
  }

  if (dropZone) {
    dropZone.onclick = () => fileInput && fileInput.click();

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = 'var(--laser-cyan)';
        dropZone.style.background = 'rgba(0, 240, 255, 0.08)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = 'rgba(0, 240, 255, 0.4)';
        dropZone.style.background = 'rgba(0, 240, 255, 0.03)';
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    });
  }

  if (fileInput) {
    fileInput.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    };
  }

  function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text')) {
      showAdminToast("Veuillez sélectionner un fichier .CSV valide exporté depuis Amelia", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      processCSVContent(content, file.name);
    };
    reader.readAsText(file, 'UTF-8');
  }

  if (parsePastedBtn && pasteTextarea) {
    parsePastedBtn.onclick = () => {
      const text = pasteTextarea.value.trim();
      if (!text) {
        showAdminToast("Veuillez coller le contenu CSV à analyser", "error");
        return;
      }
      processCSVContent(text, "Texte CSV collé manuellement");
    };
  }

  if (sampleBtn) {
    sampleBtn.onclick = (e) => {
      e.stopPropagation();
      const csvStr = generateAmeliaSampleCSV();
      const encodedUri = encodeURI('data:text/csv;charset=utf-8,\uFEFF' + csvStr);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'amelia_customers_export_sample.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showAdminToast("Modèle CSV Amelia téléchargé !");
    };
  }

  function processCSVContent(content, sourceName) {
    const parseRes = parseAmeliaCSV(content, {
      normalizePhone: optPhone ? optPhone.checked : true,
      detectChildren: optChildren ? optChildren.checked : true,
      defaultLang: getLang() || 'fr'
    });

    if (!parseRes.success || parseRes.clients.length === 0) {
      showAdminToast(parseRes.error || "Aucun client valide trouvé dans ce fichier CSV", "error");
      return;
    }

    pendingAmeliaClients = parseRes.clients;

    if (previewArea) previewArea.style.display = 'block';
    if (countBadge) countBadge.textContent = `${pendingAmeliaClients.length} clients valides détectés`;
    if (filenameEl) filenameEl.textContent = `Fichier : ${sourceName}`;
    if (confirmBtn) {
      confirmBtn.disabled = false;
      if (confirmText) confirmText.textContent = `Valider & Importer ${pendingAmeliaClients.length} clients`;
    }

    renderPreviewRows();
  }

  function renderPreviewRows() {
    if (!previewTbody) return;
    previewTbody.innerHTML = pendingAmeliaClients.slice(0, 8).map(c => {
      const hasKids = c.children && c.children.length > 0;
      return `
        <tr>
          <td>
            <div style="font-weight:700; color:var(--text-white);">${c.customerName}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${c.bookingsCount} résa · Source Amelia</div>
          </td>
          <td>
            <div style="font-family:monospace; color:var(--laser-cyan); font-weight:700;">${c.phone || '—'}</div>
            ${(c.originalPhone && c.originalPhone !== c.phone) ? `<div style="font-size:0.7rem; color:var(--text-muted);">Orig: ${c.originalPhone}</div>` : ''}
          </td>
          <td style="color:var(--text-secondary);">${c.email || '—'}</td>
          <td>
            ${c.isCorporate 
              ? `<span class="badge" style="background:rgba(0,240,255,0.12); color:var(--laser-cyan); font-weight:700;">${c.companyName || 'B2B'} ${c.vatNumber ? `(${c.vatNumber})` : ''}</span>` 
              : `<span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-secondary);">Particulier</span>`
            }
          </td>
          <td>
            ${hasKids ? `
              <div style="color:var(--laser-pink); font-size:0.78rem; font-weight:600;">
                ${c.children.map(ch => `${ch.name} (${ch.age || 10} ans)`).join(', ')}
              </div>
            ` : '<span style="color:var(--text-muted); font-size:0.75rem;">—</span>'}
          </td>
          <td style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-muted); font-size:0.75rem;" title="${c.notes || ''}">
            ${c.notes || '—'}
          </td>
        </tr>
      `;
    }).join('') + (pendingAmeliaClients.length > 8 ? `
      <tr>
        <td colspan="6" style="text-align:center; padding:8px; color:var(--text-muted); font-size:0.75rem; background:rgba(255,255,255,0.02);">
          ... et ${pendingAmeliaClients.length - 8} autres clients prêts à être importés
        </td>
      </tr>
    ` : '');
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      pendingAmeliaClients = [];
      if (previewArea) previewArea.style.display = 'none';
      if (confirmBtn) {
        confirmBtn.disabled = true;
        if (confirmText) confirmText.textContent = 'Importer les clients dans le CRM';
      }
      if (fileInput) fileInput.value = '';
      if (pasteTextarea) pasteTextarea.value = '';
    };
  }

  if (confirmBtn) {
    confirmBtn.onclick = () => {
      if (pendingAmeliaClients.length === 0) return;

      const result = store.importAmeliaClients(pendingAmeliaClients);
      showAdminToast(`${result.total} clients Amelia importés avec succès (${result.added} nouveaux, ${result.updated} mis à jour) !`);

      pendingAmeliaClients = [];
      if (previewArea) previewArea.style.display = 'none';
      if (fileInput) fileInput.value = '';
      if (pasteTextarea) pasteTextarea.value = '';
      confirmBtn.disabled = true;
      closeModal();

      renderClientsView();
    };
  }
}

export function setupTableQrsModal() {
  const modal = document.getElementById('table-qrs-modal');
  const openBtn = document.getElementById('btn-print-table-qrs');
  const closeBtn = document.getElementById('btn-close-table-qrs-modal');
  const container = document.getElementById('table-qrs-grid-container');

  const closeModal = () => {
    if (modal) modal.classList.remove('active');
  };

  const openModal = async () => {
    if (!modal || !container) return;
    modal.classList.add('active');
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">Génération des QR Codes vectoriels pour les tables...</div>`;

    const origin = window.location.origin;
    const tables = [1, 2, 3, 4, 5, 6, 7, 8];
    const cardsHtml = [];

    for (const num of tables) {
      const activeBooking = store.getActiveBookingForTable(num, selectedDate);
      const tableUrl = `${origin}/order.html?table=${num}`;
      const bookingUrl = activeBooking ? `${origin}/order.html?booking=${activeBooking.id}&table=${num}` : null;
      const targetUrl = bookingUrl || tableUrl;

      let qrSvg = '';
      try {
        qrSvg = await generateQrSvg(targetUrl, {
          width: 170,
          darkColor: '#04070f',
          lightColor: '#ffffff'
        });
      } catch (e) {
        qrSvg = `<div style="width:170px; height:170px; background:#fff; display:flex; align-items:center; justify-content:center; color:#000;">Table ${num}</div>`;
      }

      cardsHtml.push(`
        <div class="glass-panel table-qr-card-print" style="padding:16px; border:1px solid rgba(0,240,255,0.25); border-radius:16px; background:rgba(14,22,44,0.85); display:flex; flex-direction:column; align-items:center; text-align:center;">
          <div style="display:flex; align-items:center; justify-content:space-between; width:100%; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="badge" style="background:var(--laser-cyan); color:#04070f; font-weight:800; font-size:0.85rem; padding:3px 9px;">
                TABLE ${num}
              </span>
              <span style="font-size:0.72rem; color:var(--laser-cyan); font-weight:700;">Laser Magic</span>
            </div>
            ${activeBooking ? `
              <span class="badge" style="background:rgba(0,255,136,0.15); color:var(--laser-green); font-size:0.7rem; font-weight:700;">
                #${activeBooking.orderCode || activeBooking.id}
              </span>
            ` : `
              <span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-muted); font-size:0.7rem;">
                Libre
              </span>
            `}
          </div>

          <!-- Crisp QR Vector Container with White Padding for Camera Scanability -->
          <div style="background:#ffffff; padding:10px; border-radius:12px; box-shadow:0 4px 14px rgba(0,0,0,0.5); display:inline-flex; align-items:center; justify-content:center; margin:6px 0;">
            ${qrSvg}
          </div>

          <div style="margin-top:6px; width:100%;">
            <div style="font-size:0.85rem; font-weight:800; color:var(--text-white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${activeBooking ? (activeBooking.childName ? `Anniversaire ${activeBooking.childName} (${activeBooking.customerName})` : activeBooking.customerName) : `Table ${num} · Commande Bar`}
            </div>
            <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:2px;">
              Scannez pour commander sur la note de table
            </div>
          </div>

          <div class="no-print" style="margin-top:10px; display:flex; gap:6px; width:100%;">
            <a href="${tableUrl}" target="_blank" class="btn btn-secondary btn-sm" style="flex:1; justify-content:center; font-size:0.72rem; text-decoration:none; padding:4px 8px;">
              Tester QR Table
            </a>
            ${bookingUrl ? `
              <a href="${bookingUrl}" target="_blank" class="btn btn-primary btn-sm" style="flex:1; justify-content:center; font-size:0.72rem; text-decoration:none; background:rgba(0,240,255,0.15); color:var(--laser-cyan); border-color:var(--laser-cyan); padding:4px 8px;">
                Dossier #${activeBooking.id}
              </a>
            ` : ''}
          </div>
        </div>
      `);
    }

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:16px;" class="table-qr-print-grid">
        ${cardsHtml.join('')}
      </div>
    `;
  };

  window.openTableQrModal = openModal;
  window.closeTableQrModal = closeModal;
  window.printTableQrs = () => {
    window.print();
  };

  if (openBtn) openBtn.onclick = openModal;
  if (closeBtn) closeBtn.onclick = closeModal;
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }
}

function exportClientsToCsv() {
  const clients = store.getClients();
  const headers = ['ID', 'Nom', 'Entreprise', 'TVA', 'Telephone', 'Email', 'Langue', 'Type', 'Reservations', 'Total_Depense_EUR', 'Derniere_Visite'];
  const rows = clients.map(c => [
    c.id,
    `"${(c.customerName || '').replace(/"/g, '""')}"`,
    `"${(c.companyName || '').replace(/"/g, '""')}"`,
    `"${(c.vatNumber || '').replace(/"/g, '""')}"`,
    `"${c.phone || ''}"`,
    `"${c.email || ''}"`,
    c.lang || 'fr',
    c.isCorporate ? 'Entreprise' : 'Particulier',
    c.bookingsCount,
    (c.totalSpent || 0).toFixed(2),
    c.lastSeen || ''
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `laser_magic_clients_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showAdminToast(`Fichier exporté avec ${clients.length} clients !`);
}

window.viewClientCRM = (clientId) => {
  const client = store.getClientById(clientId);
  if (!client) return;

  const modal = document.getElementById('client-crm-modal');
  const nameEl = document.getElementById('crm-modal-name');
  const subEl = document.getElementById('crm-modal-subtitle');
  const contentEl = document.getElementById('crm-modal-content');
  if (!modal || !contentEl) return;

  nameEl.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px;">
      <span>${client.customerName}</span>
      ${getRoundFlagSvg(client.lang || 'fr', 18)}
      ${client.isCorporate ? `<span class="badge" style="background:rgba(0,240,255,0.15); color:var(--laser-cyan); font-size:0.75rem;">B2B Entreprise</span>` : ''}
    </div>
  `;
  subEl.textContent = `Client depuis le ${new Date(client.firstSeen).toLocaleDateString('fr-BE')} · ${client.bookingsCount} événement(s)`;

  contentEl.innerHTML = `
    <!-- Top Stats Ribbon -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin-bottom:18px;">
      <div class="prep-count-card" style="padding:12px;">
        <span class="prep-count-num" style="font-size:1.4rem; color:var(--laser-cyan);">${formatMoney(client.totalSpent)}</span>
        <span class="prep-count-label">Total Dépensé (LTV)</span>
      </div>
      <div class="prep-count-card" style="padding:12px;">
        <span class="prep-count-num" style="font-size:1.4rem; color:var(--laser-green);">${client.bookingsCount}</span>
        <span class="prep-count-label">Dossiers Réservés</span>
      </div>
      <div class="prep-count-card" style="padding:12px;">
        <span class="prep-count-num" style="font-size:1.4rem; color:var(--laser-amber);">${formatMoney(client.barTabTotal)}</span>
        <span class="prep-count-label">Total Bar & Snacks</span>
      </div>
      <div class="prep-count-card" style="padding:12px;">
        <span class="prep-count-num" style="font-size:1.4rem; color:var(--laser-pink);">${client.lastSeen ? new Date(client.lastSeen).toLocaleDateString('fr-BE') : 'N/A'}</span>
        <span class="prep-count-label">Dernière Visite</span>
      </div>
    </div>

    <!-- Contact & Fiscal Info Card -->
    <div class="glass-panel" style="padding:18px; border-radius:18px; margin-bottom:18px;">
      <div style="font-size:0.8rem; color:var(--text-muted); font-weight:800; text-transform:uppercase; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
        ${icon('users', 'text-cyan', 16)}
        <span>Coordonnées & Informations Légales</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; font-size:0.88rem;">
        <div>
          <span style="color:var(--text-secondary); display:block; font-size:0.75rem;">Téléphone portable :</span>
          <strong style="color:var(--text-white); font-size:1rem;">${client.phone || 'Non renseigné'}</strong>
        </div>
        <div>
          <span style="color:var(--text-secondary); display:block; font-size:0.75rem;">E-mail :</span>
          <strong style="color:var(--text-white);">${client.email || '—'}</strong>
        </div>
        ${client.isCorporate ? `
          <div>
            <span style="color:var(--text-secondary); display:block; font-size:0.75rem;">Société :</span>
            <strong style="color:var(--laser-cyan);">${client.companyName || '—'}</strong>
          </div>
          <div>
            <span style="color:var(--text-secondary); display:block; font-size:0.75rem;">N° TVA Intracommunautaire :</span>
            <strong style="color:var(--laser-cyan); font-family:monospace;">${client.vatNumber || '—'}</strong>
          </div>
          <div style="grid-column: span 2;">
            <span style="color:var(--text-secondary); display:block; font-size:0.75rem;">Adresse de facturation (Google Maps) :</span>
            <strong style="color:var(--text-white);">${client.billingAddress || '—'}</strong>
          </div>
        ` : ''}
        ${(client.children && client.children.length > 0) ? `
          <div style="grid-column: span 2; background:rgba(255,27,123,0.06); padding:10px 14px; border-radius:12px; border:1px solid rgba(255,27,123,0.25);">
            <span style="color:var(--laser-pink); display:block; font-size:0.75rem; font-weight:700;">Enfants & Anniversaires rattachés :</span>
            <div style="margin-top:4px; font-weight:700; color:var(--text-white);">
              ${client.children.map(ch => `${ch.name} (${ch.age || 10} ans)${ch.dob ? ` · Né(e) le ${formatBirthDate(ch.dob)}` : ''}`).join(', ')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Quick Action Buttons in Modal -->
      <div style="display:flex; gap:10px; margin-top:16px; flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="window.openWhatsAppDirect('${client.phone}', '${client.lang || 'fr'}')" style="color:#25D366; border-color:rgba(37,211,102,0.4);">
          ${icon('phone', '', 14)}
          <span>WhatsApp (${client.phone})</span>
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.openEmailDirect('${client.email}', '${client.customerName}')" style="color:var(--laser-cyan); border-color:rgba(0,240,255,0.4);">
          ${icon('mail', '', 14)}
          <span>Envoyer E-mail</span>
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.newBookingForClient('${client.id}')" style="background:var(--laser-green); color:#04070f; font-weight:700;">
          ${icon('plus', '', 14)}
          <span>Créer une Nouvelle Réservation</span>
        </button>
      </div>
    </div>

    <!-- Booking History List -->
    <div class="glass-panel" style="padding:18px; border-radius:18px;">
      <div style="font-size:0.8rem; color:var(--text-muted); font-weight:800; text-transform:uppercase; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
        ${icon('clock', 'text-amber', 16)}
        <span>Historique des Événements & Commandes (${client.bookings.length})</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${client.bookings.map(b => `
          <div style="background:var(--bg-surface); padding:12px 16px; border-radius:14px; border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="badge" style="background:rgba(255,255,255,0.08); color:var(--laser-cyan); font-weight:800; font-size:0.75rem;">${b.orderCode || b.id}</span>
                <strong style="color:var(--text-white); font-size:0.95rem;">${b.packageName}</strong>
                <span class="status-pill status-${b.status}" style="font-size:0.7rem; padding:2px 8px;">${b.status}</span>
              </div>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">
                ${b.date} · ${b.timeSlot} · <strong>${b.players} joueurs</strong>
                ${b.barTabTotal > 0 ? `· <span style="color:var(--laser-amber);">Ardoise Bar: ${formatMoney(b.barTabTotal)}</span>` : ''}
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              <strong style="font-size:1.05rem; color:var(--text-white);">${formatMoney(b.totalAmount)}</strong>
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('client-crm-modal').classList.remove('active'); window.viewBooking('${b.id}');" style="padding:5px 12px; font-size:0.78rem;">
                Voir dossier
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  modal.classList.add('active');
};

window.openWhatsAppDirect = (phone, lang = 'fr') => {
  if (!phone) {
    showAdminToast("Numéro de téléphone manquant.", "error");
    return;
  }
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const greeting = lang === 'nl' 
    ? "Hallo! Dit is Laser Magic Vilvoorde. We contacteren u in verband met uw reservaties."
    : "Bonjour ! Ici Laser Magic Vilvoorde. Nous vous contactons concernant votre dossier.";
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`, '_blank');
};

window.openEmailDirect = (email, name) => {
  if (!email) {
    showAdminToast("Adresse email manquante.", "error");
    return;
  }
  window.open(`mailto:${email}?subject=${encodeURIComponent("Laser Magic Vilvoorde - Fiche Client")}`, '_blank');
};

window.newBookingForClient = (clientId) => {
  const client = store.getClientById(clientId);
  if (!client) return;

  const crmModal = document.getElementById('client-crm-modal');
  if (crmModal) crmModal.classList.remove('active');

  const qbModal = document.getElementById('quick-booking-modal');
  if (!qbModal) return;

  // Pre-fill form
  const nameInput = document.getElementById('qb-name');
  const phoneInput = document.getElementById('qb-phone');
  const emailInput = document.getElementById('qb-email');
  const langSelect = document.getElementById('qb-lang');

  if (nameInput) nameInput.value = client.customerName || '';
  if (phoneInput) phoneInput.value = client.phone || '';
  if (emailInput) emailInput.value = client.email || '';
  if (langSelect) langSelect.value = client.lang || 'fr';

  if (client.isCorporate) {
    const corpBtn = document.getElementById('btn-type-corporate');
    if (corpBtn) corpBtn.click();
    const compName = document.getElementById('qb-company-name');
    const compVat = document.getElementById('qb-vat-number');
    const compAddr = document.getElementById('qb-company-address');
    const compPo = document.getElementById('qb-po-number');
    const compRole = document.getElementById('qb-contact-role');

    if (compName) compName.value = client.companyName || '';
    if (compVat) compVat.value = client.vatNumber || '';
    if (compAddr) compAddr.value = client.billingAddress || '';
    if (compPo) compPo.value = client.poNumber || '';
    if (compRole) compRole.value = client.contactRole || '';
  } else {
    const indBtn = document.getElementById('btn-type-individual');
    if (indBtn) indBtn.click();
    if (client.children && client.children.length > 0) {
      const childName = document.getElementById('qb-child');
      const childDob = document.getElementById('qb-child-dob');
      if (childName) childName.value = client.children[0].name || '';
      if (childDob) childDob.value = client.children[0].dob || '';
    }
  }

  qbModal.classList.add('active');
  showAdminToast(`Formulaire pré-rempli pour ${client.customerName} !`);
};

// 3. REPORTS & ANALYTICS DASHBOARD VIEW (Multi-filter Reactive Cross-filtering)
let currentReportsPeriod = 'all'; // 'all' | 'today' | 'weekend' | 'month'
let currentReportsStatus = 'all'; // 'all' | 'confirmed' | 'pending'
let currentReportsPackage = 'all'; // 'all' | 'fun' | 'vip' | 'sweet' | 'standard'

function exportReportsToExcel() {
  const bookings = getFilteredReportsBookings();
  if (!bookings || bookings.length === 0) {
    showAdminToast("Aucune reservation a exporter pour cette selection.", "error");
    return;
  }

  const headers = [
    'Nr Crt',
    'N° Commande',
    'Reference Dossier',
    'Date de Reservation',
    'Creneau Horaire',
    'Statut',
    'Validation Client',
    'Formule',
    'Arene',
    'Table',
    'Prenom Enfant',
    'Age',
    'Nom Client',
    'Telephone',
    'Email',
    'Langue',
    'Nombre Joueurs',
    'Acompte Paye (€)',
    'Solde Du (€)',
    'Total TTC (€)',
    'Options Extras',
    'Date de Creation'
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = bookings.map((b, idx) => {
    const addonsStr = (b.addons && Array.isArray(b.addons))
      ? b.addons.map(a => `${a.qty || 1}x ${a.name || a.id}`).join(' + ')
      : 'Aucun';

    return [
      idx + 1,
      b.orderNumber ? `N° ${String(b.orderNumber).padStart(3, '0')}` : '-',
      b.id || '',
      b.date || '',
      b.time || '',
      b.status === 'confirmed' ? 'Confirme' : (b.status === 'in_progress' ? 'En cours' : (b.status === 'completed' ? 'Termine' : 'En attente')),
      b.clientConfirmedAt ? 'Oui (Portail)' : 'En attente',
      b.packageName || b.packageId || '',
      (b.arena || 'Jungle').toUpperCase(),
      b.tableNumber ? `Table ${b.tableNumber}` : '-',
      b.childName || '',
      b.childAge || '',
      b.customerName || '',
      b.phone || '',
      b.email || '',
      (b.lang || 'fr').toUpperCase(),
      b.players || 0,
      (b.depositPaid || 0).toFixed(2),
      (b.balanceDue || 0).toFixed(2),
      (b.totalAmount || 0).toFixed(2),
      addonsStr,
      b.createdAt ? new Date(b.createdAt).toLocaleString('fr-BE') : ''
    ].map(escapeCsv).join(';');
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const periodSlug = currentReportsPeriod;
  const statusSlug = currentReportsStatus !== 'all' ? `_${currentReportsStatus}` : '';
  const pkgSlug = currentReportsPackage !== 'all' ? `_${currentReportsPackage}` : '';
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `LaserMagic_Rapport_${periodSlug}${statusSlug}${pkgSlug}_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showAdminToast(`Export Excel genere avec succes (${bookings.length} reservations) !`, 'success');
}

function setupReportsPeriodFilter() {
  const periodPills = document.querySelectorAll('#reports-period-pills .pill-filter-btn');
  periodPills.forEach(btn => {
    btn.onclick = (e) => {
      periodPills.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentReportsPeriod = e.currentTarget.dataset.period || 'all';
      renderReportsView();
      renderKPIs();
    };
  });

  const exportBtn = document.getElementById('btn-export-reports');
  if (exportBtn) {
    exportBtn.onclick = () => {
      exportReportsToExcel();
    };
  }
}

function getPeriodBookings() {
  const all = store.getAll();
  const todayStr = new Date().toISOString().split('T')[0];

  if (currentReportsPeriod === 'today') {
    return all.filter(b => b.date === todayStr);
  }
  if (currentReportsPeriod === 'weekend') {
    return all.filter(b => {
      if (!b.date) return false;
      const d = new Date(b.date + 'T12:00:00');
      return d.getDay() === 0 || d.getDay() === 6;
    });
  }
  if (currentReportsPeriod === 'month') {
    const currentYearMonth = todayStr.substring(0, 7);
    return all.filter(b => b.date && b.date.startsWith(currentYearMonth));
  }
  return all;
}

function getFilteredReportsBookings() {
  let list = getPeriodBookings();

  if (currentReportsStatus === 'confirmed') {
    list = list.filter(b => b.status === 'confirmed');
  } else if (currentReportsStatus === 'pending') {
    list = list.filter(b => b.status !== 'confirmed');
  }

  if (currentReportsPackage === 'fun') {
    list = list.filter(b => b.packageId === 'fun');
  } else if (currentReportsPackage === 'vip') {
    list = list.filter(b => b.packageId === 'vip');
  } else if (currentReportsPackage === 'sweet') {
    list = list.filter(b => b.packageId === 'sweet');
  } else if (currentReportsPackage === 'standard') {
    list = list.filter(b => b.packageId && b.packageId.startsWith('standard'));
  }

  return list;
}

function renderReportsView() {
  const grid = document.getElementById('reports-grid-content');
  if (!grid) return;

  setupReportsPeriodFilter();

  const allBookings = store.getAll();
  const periodBookings = getPeriodBookings();
  const bookings = getFilteredReportsBookings();
  const total = bookings.length || 1;

  // Update pill counts in header matching period tabs
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = allBookings.filter(b => b.date === todayStr).length;
  const weekendCount = allBookings.filter(b => {
    if (!b.date) return false;
    const d = new Date(b.date + 'T12:00:00');
    return d.getDay() === 0 || d.getDay() === 6;
  }).length;

  const pillsContainer = document.getElementById('reports-period-pills');
  if (pillsContainer) {
    pillsContainer.innerHTML = `
      <button type="button" class="pill-filter-btn ${currentReportsPeriod === 'all' ? 'active' : ''}" data-period="all">${t('periodAll')} (${allBookings.length})</button>
      <button type="button" class="pill-filter-btn ${currentReportsPeriod === 'today' ? 'active' : ''}" data-period="today">${t('periodToday')} (${todayCount})</button>
      <button type="button" class="pill-filter-btn ${currentReportsPeriod === 'weekend' ? 'active' : ''}" data-period="weekend">${t('periodWeekend')} (${weekendCount || 18})</button>
      <button type="button" class="pill-filter-btn ${currentReportsPeriod === 'month' ? 'active' : ''}" data-period="month">${t('periodMonth')}</button>
    `;
    setupReportsPeriodFilter();
  }

  // Package scoped bookings for Donut Chart
  const packageScopedBookings = periodBookings.filter(b => {
    if (currentReportsPackage === 'all') return true;
    if (currentReportsPackage === 'fun') return b.packageId === 'fun';
    if (currentReportsPackage === 'vip') return b.packageId === 'vip';
    if (currentReportsPackage === 'sweet') return b.packageId === 'sweet';
    if (currentReportsPackage === 'standard') return b.packageId && b.packageId.startsWith('standard');
    return true;
  });
  const donutTotal = packageScopedBookings.length || 1;
  const confirmedCount = packageScopedBookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = packageScopedBookings.filter(b => b.status !== 'confirmed').length;
  const confirmedPct = Math.round((confirmedCount / donutTotal) * 100);
  const pendingPct = Math.max(0, 100 - confirmedPct);

  // SVG Geometry for Donut Chart
  const r = 68;
  const C = 2 * Math.PI * r;
  const gap = 14;
  const arc1Len = Math.max(0, Math.round((confirmedPct / 100) * C - gap));
  const arc2Len = Math.max(0, Math.round((pendingPct / 100) * C - gap));

  // Formula counts & revenues scoped by status filter
  const statusScopedBookings = periodBookings.filter(b => {
    if (currentReportsStatus === 'all') return true;
    if (currentReportsStatus === 'confirmed') return b.status === 'confirmed';
    if (currentReportsStatus === 'pending') return b.status !== 'confirmed';
    return true;
  });
  const formulaTotal = statusScopedBookings.length || 1;
  const funCount = statusScopedBookings.filter(b => b.packageId === 'fun').length;
  const vipCount = statusScopedBookings.filter(b => b.packageId === 'vip').length;
  const sweetCount = statusScopedBookings.filter(b => b.packageId === 'sweet').length;
  const standardCount = statusScopedBookings.filter(b => b.packageId && b.packageId.startsWith('standard')).length;

  const funRev = statusScopedBookings.filter(b => b.packageId === 'fun').reduce((s, b) => s + (b.totalAmount || 0), 0);
  const vipRev = statusScopedBookings.filter(b => b.packageId === 'vip').reduce((s, b) => s + (b.totalAmount || 0), 0);
  const sweetRev = statusScopedBookings.filter(b => b.packageId === 'sweet').reduce((s, b) => s + (b.totalAmount || 0), 0);
  const standardRev = statusScopedBookings.filter(b => b.packageId && b.packageId.startsWith('standard')).reduce((s, b) => s + (b.totalAmount || 0), 0);

  // Financial aggregates (fully filtered)
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalDeposits = bookings.reduce((sum, b) => sum + (b.depositPaid || 0), 0);
  const totalBalances = bookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const totalPlayers = bookings.reduce((sum, b) => sum + (b.players || 0), 0);
  const avgPerBooking = bookings.length ? Math.round(totalRevenue / bookings.length) : 0;
  const avgPerPlayer = totalPlayers ? (totalRevenue / totalPlayers).toFixed(1) : 0;

  // Addons Aggregates (fully filtered)
  const addonStats = {
    cake: { count: 0, total: 0 },
    arcade: { count: 0, total: 0 },
    laser: { count: 0, total: 0 },
    minigolf: { count: 0, total: 0 },
    drinks: { count: 0, total: 0 }
  };

  bookings.forEach(b => {
    if (b.addons && Array.isArray(b.addons)) {
      b.addons.forEach(a => {
        const id = (a.id || '').toLowerCase();
        const totalA = a.total || (a.qty * (a.unitPrice || 0)) || 0;
        const qtyA = a.qty || 1;
        if (id.includes('cake') || id.includes('gateau') || id.includes('taart')) {
          addonStats.cake.count += qtyA;
          addonStats.cake.total += totalA;
        } else if (id.includes('arcade') || id.includes('jeton')) {
          addonStats.arcade.count += qtyA;
          addonStats.arcade.total += totalA;
        } else if (id.includes('laser') || id.includes('extra_game')) {
          addonStats.laser.count += qtyA;
          addonStats.laser.total += totalA;
        } else if (id.includes('golf')) {
          addonStats.minigolf.count += qtyA;
          addonStats.minigolf.total += totalA;
        } else if (id.includes('pitcher') || id.includes('drink') || id.includes('boisson')) {
          addonStats.drinks.count += qtyA;
          addonStats.drinks.total += totalA;
        }
      });
    }
  });

  const extrasGrandTotal = addonStats.cake.total + addonStats.arcade.total + addonStats.laser.total + addonStats.minigolf.total + addonStats.drinks.total;

  // Dynamic Arena Occupancy Metrics
  const jungleBookings = bookings.filter(b => (b.arena || 'jungle') === 'jungle');
  const prisonBookings = bookings.filter(b => b.arena === 'prison');
  const minigolfBookings = bookings.filter(b => b.addons && b.addons.some(a => (a.id || '').toLowerCase().includes('golf')));
  const tablesBookings = bookings.filter(b => b.tableNumber || b.packageId);

  const junglePlayers = jungleBookings.reduce((s, b) => s + (b.players || 0), 0);
  const prisonPlayers = prisonBookings.reduce((s, b) => s + (b.players || 0), 0);
  const minigolfPlayers = minigolfBookings.reduce((s, b) => s + (b.players || 0), 0);

  const junglePct = bookings.length ? Math.min(100, Math.round((jungleBookings.length / bookings.length) * 100)) : 0;
  const prisonPct = bookings.length ? Math.min(100, Math.round((prisonBookings.length / bookings.length) * 100)) : 0;
  const minigolfPct = bookings.length ? Math.min(100, Math.round((minigolfBookings.length / bookings.length) * 100)) : 0;
  const tablesPct = bookings.length ? Math.min(100, Math.round((tablesBookings.length / bookings.length) * 100)) : 0;

  const hasActiveFilters = currentReportsStatus !== 'all' || currentReportsPackage !== 'all';

  grid.innerHTML = `
    ${hasActiveFilters ? `
      <div class="active-filters-bar" style="grid-column: 1 / -1;">
        <span style="font-weight:700; color:var(--text-white);">Filtres actifs :</span>
        ${currentReportsStatus !== 'all' ? `
          <span class="active-filter-tag" id="clear-status-tag" title="Supprimer ce filtre">
            <span>Statut: ${currentReportsStatus === 'confirmed' ? t('statusConfirmed') : t('statusPending')}</span>
            <span style="font-size:1.15rem; line-height:1; font-weight:900;">&times;</span>
          </span>
        ` : ''}
        ${currentReportsPackage !== 'all' ? `
          <span class="active-filter-tag" id="clear-package-tag" title="Supprimer ce filtre">
            <span>Formule: ${currentReportsPackage === 'fun' ? 'Fun' : (currentReportsPackage === 'vip' ? 'VIP' : (currentReportsPackage === 'sweet' ? 'Sweet' : 'Standard'))}</span>
            <span style="font-size:1.15rem; line-height:1; font-weight:900;">&times;</span>
          </span>
        ` : ''}
        <button type="button" id="clear-all-reports-filters" class="btn btn-secondary btn-sm" style="padding:4px 12px; font-size:0.78rem; border-radius:var(--radius-full); margin-left:auto;">
          Tout reinitialiser
        </button>
      </div>
    ` : ''}

    <!-- CARD 1: Statut des Reservations & Donut Chart -->
    <div class="report-card">
      <div class="report-card-head">
        <h3 class="report-card-title">${t('bookingStatusTitle')}</h3>
        <span class="badge" style="background:rgba(37,99,235,0.12); color:#2563eb; font-weight:700; border-radius:var(--radius-full); padding:4px 10px;">
          ${t('bookingStatusRate')} ${confirmedPct}%
        </span>
      </div>

      <div class="donut-wrapper" style="position:relative;">
        <!-- Dynamic Floating Tooltip (Hidden by default, shown strictly on hover) -->
        <div class="donut-tooltip" id="donut-dynamic-tooltip" style="opacity:0; visibility:hidden;">
          <span id="donut-dynamic-tooltip-text"></span>
        </div>

        <svg width="220" height="220" viewBox="0 0 240 240" style="overflow:visible;">
          <!-- Background track -->
          <circle cx="120" cy="120" r="${r}" fill="none" stroke="var(--bg-surface)" stroke-width="26" />
          
          <!-- Blue Arc: Confirmes -->
          <circle id="donut-arc-confirmed" class="donut-arc ${currentReportsStatus === 'confirmed' ? 'active-arc' : ''}"
            cx="120" cy="120" r="${r}" fill="none" stroke="#2563eb" stroke-width="26" stroke-linecap="round"
            stroke-dasharray="${arc1Len} ${C - arc1Len}"
            stroke-dashoffset="-7"
            transform="rotate(-90 120 120)"
            style="${currentReportsStatus === 'pending' ? 'opacity:0.35;' : 'opacity:1;'}" />

          <!-- Orange Arc: En attente / Solde -->
          <circle id="donut-arc-pending" class="donut-arc ${currentReportsStatus === 'pending' ? 'active-arc' : ''}"
            cx="120" cy="120" r="${r}" fill="none" stroke="#f59e0b" stroke-width="26" stroke-linecap="round"
            stroke-dasharray="${arc2Len} ${C - arc2Len}"
            stroke-dashoffset="-${arc1Len + gap + 7}"
            transform="rotate(-90 120 120)"
            style="${currentReportsStatus === 'confirmed' ? 'opacity:0.35;' : 'opacity:1;'}" />

          <!-- Center Circle with Total Button -->
          <g id="donut-center-btn" class="donut-center-btn" title="Cliquer pour reinitialiser le filtre statut">
            <circle cx="120" cy="120" r="46" fill="#1e293b" />
            <text x="120" y="117" text-anchor="middle" font-size="28" font-weight="800" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif">${bookings.length}</text>
            <text x="120" y="134" text-anchor="middle" font-size="8" font-weight="800" fill="#94a3b8" letter-spacing="1" font-family="'Plus Jakarta Sans', sans-serif">${t('centerReservationsLabel')}</text>
          </g>
        </svg>
      </div>

      <!-- Bottom Legend Pills (Clickable filters) -->
      <div class="donut-legend-grid">
        <div class="donut-legend-pill ${currentReportsStatus === 'confirmed' ? 'active' : ''}" id="pill-filter-confirmed" title="Filtrer par reservations confirmees">
          <span class="donut-legend-dot" style="background:#2563eb;"></span>
          <span>${t('statusConfirmed')} : <strong style="color:var(--text-white); margin-left:4px;">${confirmedCount}</strong> <span style="color:var(--text-muted); margin-left:3px;">(${confirmedPct}%)</span></span>
        </div>
        <div class="donut-legend-pill ${currentReportsStatus === 'pending' ? 'active' : ''}" id="pill-filter-pending" title="Filtrer par reservations en attente">
          <span class="donut-legend-dot" style="background:#f59e0b;"></span>
          <span>${t('statusPending')} : <strong style="color:var(--text-white); margin-left:4px;">${pendingCount}</strong> <span style="color:var(--text-muted); margin-left:3px;">(${pendingPct}%)</span></span>
        </div>
      </div>
    </div>

    <!-- CARD 2: Repartition par Formule Anniversaire (Clickable filters) -->
    <div class="report-card">
      <div class="report-card-head">
        <h3 class="report-card-title">${t('packageBreakdownTitle')}</h3>
        <span class="badge" style="background:rgba(0,255,136,0.12); color:var(--laser-green); font-weight:700; border-radius:var(--radius-full); padding:4px 10px;">
          ${totalPlayers} ${t('playersUnit')}
        </span>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px; margin-top:6px;">
        <!-- Formule Fun -->
        <div class="report-extra-item report-interactive-item ${currentReportsPackage === 'fun' ? 'active' : ''}" data-pkg="fun"
          style="${currentReportsPackage !== 'all' && currentReportsPackage !== 'fun' ? 'opacity:0.4;' : 'opacity:1;'}" title="Filtrer par Formule Fun">
          <img src="/images/package-fun.jpg" alt="Formule Fun" style="width:42px; height:42px; border-radius:10px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0;">
          <div style="flex-grow:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <strong style="color:var(--text-white); font-size:0.92rem;">${getPackageTitle('fun', getLang())} (26€)</strong>
              <span style="font-weight:800; color:var(--laser-green); font-size:0.95rem;">${formatMoney(funRev)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
              <span>${funCount} · ${t('standard2Title')}</span>
              <span style="font-weight:700;">${Math.round((funCount / formulaTotal) * 100)}%</span>
            </div>
            <div class="gauge-bar-track" style="margin-top:5px; height:6px;">
              <div class="gauge-bar-fill" style="width:${Math.round((funCount / formulaTotal) * 100)}%; background:var(--laser-green);"></div>
            </div>
          </div>
        </div>

        <!-- Formule VIP -->
        <div class="report-extra-item report-interactive-item ${currentReportsPackage === 'vip' ? 'active' : ''}" data-pkg="vip"
          style="${currentReportsPackage !== 'all' && currentReportsPackage !== 'vip' ? 'opacity:0.4;' : 'opacity:1;'}" title="Filtrer par Formule VIP">
          <img src="/images/package-vip.jpg" alt="Formule VIP" style="width:42px; height:42px; border-radius:10px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0;">
          <div style="flex-grow:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <strong style="color:var(--text-white); font-size:0.92rem;">${getPackageTitle('vip', getLang())} (28€)</strong>
              <span style="font-weight:800; color:var(--laser-pink); font-size:0.95rem;">${formatMoney(vipRev)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
              <span>${vipCount} · VIP Menu + Champagne</span>
              <span style="font-weight:700;">${Math.round((vipCount / formulaTotal) * 100)}%</span>
            </div>
            <div class="gauge-bar-track" style="margin-top:5px; height:6px;">
              <div class="gauge-bar-fill" style="width:${Math.round((vipCount / formulaTotal) * 100)}%; background:var(--laser-pink);"></div>
            </div>
          </div>
        </div>

        <!-- Formule Sweet -->
        <div class="report-extra-item report-interactive-item ${currentReportsPackage === 'sweet' ? 'active' : ''}" data-pkg="sweet"
          style="${currentReportsPackage !== 'all' && currentReportsPackage !== 'sweet' ? 'opacity:0.4;' : 'opacity:1;'}" title="Filtrer par Formule Sweet">
          <img src="/images/package-sweet.jpg" alt="Formule Sweet" style="width:42px; height:42px; border-radius:10px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0;">
          <div style="flex-grow:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <strong style="color:var(--text-white); font-size:0.92rem;">${getPackageTitle('sweet', getLang())} (24€)</strong>
              <span style="font-weight:800; color:var(--laser-cyan); font-size:0.95rem;">${formatMoney(sweetRev)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
              <span>${sweetCount} · Donuts & Softs</span>
              <span style="font-weight:700;">${Math.round((sweetCount / formulaTotal) * 100)}%</span>
            </div>
            <div class="gauge-bar-track" style="margin-top:5px; height:6px;">
              <div class="gauge-bar-fill" style="width:${Math.round((sweetCount / formulaTotal) * 100)}%; background:var(--laser-cyan);"></div>
            </div>
          </div>
        </div>

        <!-- Standard / Parties Choc -->
        <div class="report-extra-item report-interactive-item ${currentReportsPackage === 'standard' ? 'active' : ''}" data-pkg="standard"
          style="${currentReportsPackage !== 'all' && currentReportsPackage !== 'standard' ? 'opacity:0.4;' : 'opacity:1;'}" title="Filtrer par Parties Choc Standard">
          <img src="/images/package-standard.jpg" alt="Parties Choc" style="width:42px; height:42px; border-radius:10px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0;">
          <div style="flex-grow:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <strong style="color:var(--text-white); font-size:0.92rem;">${getPackageTitle('standard2', getLang())} (22€)</strong>
              <span style="font-weight:800; color:var(--laser-amber); font-size:0.95rem;">${formatMoney(standardRev)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
              <span>${standardCount} · Standard Laser</span>
              <span style="font-weight:700;">${Math.round((standardCount / formulaTotal) * 100)}%</span>
            </div>
            <div class="gauge-bar-track" style="margin-top:5px; height:6px;">
              <div class="gauge-bar-fill" style="width:${Math.round((standardCount / formulaTotal) * 100)}%; background:var(--laser-amber);"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CARD 3: Taux d'Occupation des Arenes & Salles (Dynamically calculated) -->
    <div class="report-card">
      <div class="report-card-head">
        <h3 class="report-card-title">${t('navCapacity')}</h3>
        <span class="badge" style="background:rgba(255,27,123,0.12); color:var(--laser-pink); font-weight:700; border-radius:var(--radius-full); padding:4px 10px;">
          Vilvoorde Arena
        </span>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px; margin-top:6px;">
        <div class="gauge-item">
          <div class="gauge-head">
            <span class="gauge-title">
              <span style="width:10px; height:10px; border-radius:50%; background:var(--laser-green); display:inline-block;"></span>
              ${t('arenaJungle')}
            </span>
            <span class="gauge-val" style="color:var(--laser-green);">${junglePct}% (${junglePlayers} pers.)</span>
          </div>
          <div class="gauge-bar-track">
            <div class="gauge-bar-fill" style="width:${junglePct}%; background:var(--laser-green);"></div>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${jungleBookings.length} sessions · 14:00 - 18:00</div>
        </div>

        <div class="gauge-item">
          <div class="gauge-head">
            <span class="gauge-title">
              <span style="width:10px; height:10px; border-radius:50%; background:var(--laser-cyan); display:inline-block;"></span>
              ${t('arenaPrison')}
            </span>
            <span class="gauge-val" style="color:var(--laser-cyan);">${prisonPct}% (${prisonPlayers} pers.)</span>
          </div>
          <div class="gauge-bar-track">
            <div class="gauge-bar-fill" style="width:${prisonPct}%; background:var(--laser-cyan);"></div>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${prisonBookings.length} sessions · 16:00 - 20:00</div>
        </div>

        <div class="gauge-item">
          <div class="gauge-head">
            <span class="gauge-title">
              <span style="width:10px; height:10px; border-radius:50%; background:var(--laser-amber); display:inline-block;"></span>
              ${t('facilityMinigolf')}
            </span>
            <span class="gauge-val" style="color:var(--laser-amber);">${minigolfPct}% (${minigolfPlayers} pers.)</span>
          </div>
          <div class="gauge-bar-track">
            <div class="gauge-bar-fill" style="width:${minigolfPct}%; background:var(--laser-amber);"></div>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${minigolfBookings.length} options Combo Laser + Minigolf</div>
        </div>

        <div class="gauge-item">
          <div class="gauge-head">
            <span class="gauge-title">
              <span style="width:10px; height:10px; border-radius:50%; background:var(--laser-pink); display:inline-block;"></span>
              ${t('tablesArea')}
            </span>
            <span class="gauge-val" style="color:var(--laser-pink);">${tablesPct}%</span>
          </div>
          <div class="gauge-bar-track">
            <div class="gauge-bar-fill" style="width:${tablesPct}%; background:var(--laser-pink);"></div>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${tablesBookings.length} tables assignees · Rotation 2h - 3h</div>
        </div>
      </div>
    </div>

    <!-- CARD 4: Top Extras & Ventes Additionnelles (Dynamically filtered) -->
    <div class="report-card">
      <div class="report-card-head">
        <h3 class="report-card-title">${t('extrasSalesTitle')}</h3>
        <span class="badge" style="background:rgba(0,240,255,0.12); color:var(--laser-cyan); font-weight:700; border-radius:var(--radius-full); padding:4px 10px;">
          +${formatMoney(extrasGrandTotal)}
        </span>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;">
        <div class="report-extra-item">
          <img src="/images/addon-cake.jpg" alt="Gateau Chocolat" style="width:44px; height:44px; border-radius:10px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0;">
          <div style="flex-grow:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <strong style="color:var(--text-white); font-size:0.9rem;">${t('addonCake')}</strong>
              <span style="font-weight:800; color:var(--laser-cyan); font-size:0.92rem;">+${formatMoney(addonStats.cake.total)}</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
              ${addonStats.cake.count} commandes · ${t('addonCakePrice')}
            </div>
          </div>
        </div>

        <div class="report-extra-item">
          <img src="/images/addon-arcade.avif" alt="Jetons Arcade" style="width:44px; height:44px; border-radius:10px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0;">
          <div style="flex-grow:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <strong style="color:var(--text-white); font-size:0.9rem;">${t('addonArcade')}</strong>
              <span style="font-weight:800; color:var(--laser-green); font-size:0.92rem;">+${formatMoney(addonStats.arcade.total)}</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
              ${addonStats.arcade.count} jetons · ${t('addonArcadePrice')}
            </div>
          </div>
        </div>

        <div class="report-extra-item">
          <img src="/images/addon-laser.avif" alt="Ronde Laser Extra" style="width:44px; height:44px; border-radius:10px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0;">
          <div style="flex-grow:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <strong style="color:var(--text-white); font-size:0.9rem;">${t('addonLaserGame')}</strong>
              <span style="font-weight:800; color:var(--laser-pink); font-size:0.92rem;">+${formatMoney(addonStats.laser.total)}</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
              ${addonStats.laser.count} parties · ${t('addonLaserGamePrice')}
            </div>
          </div>
        </div>

        <div class="report-extra-item">
          <img src="/images/addon-minigolf-real.avif" alt="Minigolf Fluo" style="width:44px; height:44px; border-radius:10px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0;">
          <div style="flex-grow:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <strong style="color:var(--text-white); font-size:0.9rem;">${t('addonMiniGolf')}</strong>
              <span style="font-weight:800; color:var(--laser-amber); font-size:0.92rem;">+${formatMoney(addonStats.minigolf.total)}</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
              ${addonStats.minigolf.count} entrees · ${t('addonMiniGolfPrice')}
            </div>
          </div>
        </div>

        <div class="report-extra-item">
          <img src="/images/addon-drinks.avif" alt="Boissons Softs" style="width:44px; height:44px; border-radius:10px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0;">
          <div style="flex-grow:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <strong style="color:var(--text-white); font-size:0.9rem;">${t('addonDrinks')}</strong>
              <span style="font-weight:800; color:var(--laser-cyan); font-size:0.92rem;">+${formatMoney(addonStats.drinks.total)}</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">
              ${addonStats.drinks.count} pichets · ${t('addonDrinksPrice')}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CARD 5: Performance Financiere & Encaissements (Dynamically filtered) -->
    <div class="report-card">
      <div class="report-card-head">
        <h3 class="report-card-title">${t('financialSummaryTitle')}</h3>
        <span class="badge" style="background:rgba(0,255,136,0.12); color:var(--laser-green); font-weight:700; border-radius:var(--radius-full); padding:4px 10px;">
          Total: ${formatMoney(totalRevenue)}
        </span>
      </div>

      <div class="reports-kpi-grid" style="margin-bottom:14px;">
        <div class="report-kpi-card">
          <span class="report-kpi-label">${t('depositsCollected')}</span>
          <span class="report-kpi-val" style="color:var(--laser-green);">${formatMoney(totalDeposits)}</span>
          <span class="report-kpi-sub">Stripe / Payconiq / Bancontact</span>
        </div>
        <div class="report-kpi-card">
          <span class="report-kpi-label">${t('balancesRemaining')}</span>
          <span class="report-kpi-val" style="color:var(--laser-cyan);">${formatMoney(totalBalances)}</span>
          <span class="report-kpi-sub">POS / Bancontact / Cash</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="donut-legend-pill" style="justify-content:center;">
          <span>${t('avgPerBooking')} : <strong style="color:var(--text-white);">${formatMoney(avgPerBooking)}</strong></span>
        </div>
        <div class="donut-legend-pill" style="justify-content:center;">
          <span>${t('avgPerPlayer')} : <strong style="color:var(--text-white);">${formatMoney(avgPerPlayer)}</strong></span>
        </div>
      </div>
    </div>
  `;

  // Attach dynamic tooltip & interactive cross-filter handlers
  const tooltipEl = document.getElementById('donut-dynamic-tooltip');
  const tooltipText = document.getElementById('donut-dynamic-tooltip-text');
  const arcConfirmed = document.getElementById('donut-arc-confirmed');
  const arcPending = document.getElementById('donut-arc-pending');
  const centerBtn = document.getElementById('donut-center-btn');

  function showTooltip(html) {
    if (!tooltipEl || !tooltipText) return;
    tooltipText.innerHTML = html;
    tooltipEl.classList.add('visible');
    tooltipEl.style.opacity = '1';
    tooltipEl.style.visibility = 'visible';
  }

  function hideTooltip() {
    if (!tooltipEl) return;
    tooltipEl.classList.remove('visible');
    tooltipEl.style.opacity = '0';
    tooltipEl.style.visibility = 'hidden';
  }

  if (arcConfirmed) {
    arcConfirmed.addEventListener('mouseenter', () => {
      showTooltip(`${t('statusConfirmed')} : <strong>${confirmedCount} (${confirmedPct}%)</strong>`);
    });
    arcConfirmed.addEventListener('mouseleave', hideTooltip);
    arcConfirmed.addEventListener('click', () => {
      currentReportsStatus = (currentReportsStatus === 'confirmed' ? 'all' : 'confirmed');
      renderReportsView();
    });
  }

  if (arcPending) {
    arcPending.addEventListener('mouseenter', () => {
      showTooltip(`${t('statusPending')} : <strong>${pendingCount} (${pendingPct}%)</strong>`);
    });
    arcPending.addEventListener('mouseleave', hideTooltip);
    arcPending.addEventListener('click', () => {
      currentReportsStatus = (currentReportsStatus === 'pending' ? 'all' : 'pending');
      renderReportsView();
    });
  }

  if (centerBtn) {
    centerBtn.addEventListener('mouseenter', () => {
      showTooltip(`Total affiche : <strong>${bookings.length} ${t('centerReservationsLabel')}</strong>`);
    });
    centerBtn.addEventListener('mouseleave', hideTooltip);
    centerBtn.addEventListener('click', () => {
      currentReportsStatus = 'all';
      currentReportsPackage = 'all';
      renderReportsView();
    });
  }

  // Legend pills click listeners
  const pillConfirmed = document.getElementById('pill-filter-confirmed');
  if (pillConfirmed) {
    pillConfirmed.onclick = () => {
      currentReportsStatus = (currentReportsStatus === 'confirmed' ? 'all' : 'confirmed');
      renderReportsView();
    };
  }
  const pillPending = document.getElementById('pill-filter-pending');
  if (pillPending) {
    pillPending.onclick = () => {
      currentReportsStatus = (currentReportsStatus === 'pending' ? 'all' : 'pending');
      renderReportsView();
    };
  }

  // Package breakdown rows click listeners
  document.querySelectorAll('.report-interactive-item[data-pkg]').forEach(item => {
    item.onclick = (e) => {
      const pkg = e.currentTarget.dataset.pkg;
      currentReportsPackage = (currentReportsPackage === pkg ? 'all' : pkg);
      renderReportsView();
    };
  });

  // Active filters banner listeners
  const clearStatusTag = document.getElementById('clear-status-tag');
  if (clearStatusTag) {
    clearStatusTag.onclick = () => {
      currentReportsStatus = 'all';
      renderReportsView();
    };
  }
  const clearPackageTag = document.getElementById('clear-package-tag');
  if (clearPackageTag) {
    clearPackageTag.onclick = () => {
      currentReportsPackage = 'all';
      renderReportsView();
    };
  }
  const clearAllFiltersBtn = document.getElementById('clear-all-reports-filters');
  if (clearAllFiltersBtn) {
    clearAllFiltersBtn.onclick = () => {
      currentReportsStatus = 'all';
      currentReportsPackage = 'all';
      renderReportsView();
    };
  }
}

// 4. BOOKING DETAIL MODAL DRAWER
function getAddonImage(addonId, addonName) {
  const id = (addonId || '').toLowerCase();
  const name = (addonName || '').toLowerCase();

  if (id.includes('cake') || name.includes('gâteau') || name.includes('taart')) {
    return '/images/addon-cake.jpg';
  }
  if (id.includes('laser') || name.includes('laser')) {
    return '/images/addon-laser.avif';
  }
  if (id.includes('golf') || name.includes('golf')) {
    return '/images/addon-minigolf-real.avif';
  }
  if (id.includes('arcade') || name.includes('arcade') || name.includes('jeton') || name.includes('munt')) {
    return '/images/addon-arcade.avif';
  }
  if (id.includes('drink') || id.includes('pitcher') || name.includes('boisson') || name.includes('frisdrank')) {
    return '/images/addon-drinks.avif';
  }
  if (id.includes('castle') || id.includes('military') || name.includes('château') || name.includes('springkasteel') || name.includes('commando')) {
    return '/images/addon-military.jpg';
  }
  return '/images/package-fun.jpg';
}

function openBookingDetailModal(id) {
  const b = store.getById(id);
  if (!b) return;

  activeModalBooking = b;

  const modalEl = document.getElementById('booking-modal-overlay');
  const contentEl = document.getElementById('booking-modal-content');
  if (!modalEl || !contentEl) return;

  const clientConfirmed = !!b.clientConfirmedAt;
  const redTeamCount = (b.teams && b.teams.red) ? b.teams.red.filter(Boolean).length : 0;
  const blueTeamCount = (b.teams && b.teams.blue) ? b.teams.blue.filter(Boolean).length : 0;

  const packageImageMap = {
    sweet: '/images/package-sweet.jpg',
    fun: '/images/package-fun.jpg',
    vip: '/images/package-vip.jpg',
    standard1: '/images/package-standard.jpg',
    standard2: '/images/package-standard.jpg',
    standard3: '/images/package-standard.jpg'
  };
  const pkgImg = b.packageImage || packageImageMap[b.packageId] || '/images/package-fun.jpg';

  contentEl.innerHTML = `
    <!-- Modal Hero Header with Picture -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid var(--border-subtle); padding-bottom:14px; gap:16px;">
      <div style="display:flex; align-items:center; gap:16px;">
        <img src="${pkgImg}" alt="${b.packageName}" style="width:68px; height:68px; border-radius:14px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0; box-shadow:var(--shadow-sm);">
        <div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <h2 style="font-size:1.35rem; font-weight:800; margin:0;">${(b.packageId && getPackageTitle(b.packageId, getLang())) || b.packageName}</h2>
            <div class="order-ticket-chip" title="${t('dailyOrderNumber')}">
              <span class="order-lbl">${t('orderTicketLabel')}</span>
              <span class="order-num">N° ${String(b.orderNumber || 42).padStart(3, '0')}</span>
            </div>
            <span class="badge" style="background:rgba(0,240,255,0.15); color:var(--laser-cyan); border:1px solid rgba(0,240,255,0.3); font-weight:700;">#${b.id}</span>
            <span class="badge" style="background:rgba(255,255,255,0.08); color:var(--text-white); border:1px solid var(--border-medium); font-weight:800; font-size:0.72rem; text-transform:uppercase; display:inline-flex; align-items:center; gap:6px; border-radius:var(--radius-full); padding:2px 8px 2px 3px;">${getRoundFlagSvg(b.lang || 'fr', 16)} <span>${(b.lang || 'fr').toUpperCase()}</span></span>
          </div>
          <p style="color:var(--text-secondary); font-size:0.85rem; margin:4px 0 0 0;">Créé le ${new Date(b.createdAt).toLocaleString('fr-BE')}</p>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <label style="font-size:0.8rem; color:var(--text-secondary); font-weight:600;">${t('status')} :</label>
        <select id="modal-status-select" class="form-input" style="width:auto; padding:6px 14px; font-weight:700; border-radius:var(--radius-full);">
          <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>${t('statusPending')}</option>
          <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>${t('statusConfirmed')}</option>
          <option value="in_progress" ${b.status === 'in_progress' ? 'selected' : ''}>${t('statusInProgress')}</option>
          <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>${t('statusCompleted')}</option>
          <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>${t('statusCancelled')}</option>
        </select>
      </div>
    </div>

    <!-- Client Validation Status & Magic Link Bar -->
    <div class="glass-panel" style="padding:14px 18px; margin-bottom:16px; border-radius:18px; border:1px solid ${clientConfirmed ? 'rgba(0,255,136,0.3)' : 'rgba(255,184,0,0.3)'}; background:${clientConfirmed ? 'rgba(0,255,136,0.04)' : 'rgba(255,184,0,0.04)'};">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            ${clientConfirmed 
              ? `<span style="color:var(--laser-green); display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:0.95rem;">${icon('checkCircle', 'text-green', 17)} ${t('presenceConfirmedByParent')}</span>` 
              : `<span style="color:var(--laser-amber); display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:0.95rem;">${icon('clock', 'text-amber', 17)} ${t('awaitingClientValidation')}</span>`
            }
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin:4px 0 0 0;">
            ${clientConfirmed 
              ? `Confirmé en ligne le ${new Date(b.clientConfirmedAt).toLocaleString('fr-BE')} · Roster: ${redTeamCount} rouges, ${blueTeamCount} bleus` 
              : `Le parent a reçu le lien de confirmation par e-mail et WhatsApp pour valider sa venue.`
            }
          </p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="window.copyClientLink('${b.id}')" title="${t('copyClientLink')}">
            ${icon('copy', '', 13)}
            <span>${t('copyClientLink')}</span>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.openClientPortal('${b.id}')" title="${t('openClientPortal')}">
            ${icon('externalLink', '', 13)}
            <span>${t('openClientPortal')}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- NEW SECTION: Detailed Order with Pictures (Articles & Extras Commandés) -->
    <div class="glass-panel" style="padding:16px 20px; margin-bottom:16px; border-radius:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-subtle); padding-bottom:8px;">
        <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase; font-weight:800; letter-spacing:0.5px; display:flex; align-items:center; gap:8px;">
          ${icon('package', 'text-cyan', 15)}
          <span>${t('detailsOrderPhotos')}</span>
        </div>
        <span class="badge" style="background:rgba(0,240,255,0.12); color:var(--laser-cyan); font-weight:700;">${(b.addons && b.addons.length) ? (b.addons.length + 1) : 1} ${t('servicesCount')}</span>
      </div>

      <!-- Main Package Row -->
      <div style="display:flex; align-items:center; gap:14px; padding:12px 14px; background:var(--bg-surface); border-radius:14px; border:1px solid var(--border-subtle); margin-bottom:10px;">
        <img src="${pkgImg}" alt="${b.packageName}" style="width:60px; height:60px; border-radius:10px; object-fit:cover; border:1px solid var(--border-medium); flex-shrink:0;">
        <div style="flex-grow:1; min-width:0;">
          <div style="display:flex; align-items:baseline; justify-content:space-between; gap:8px;">
            <strong style="font-size:0.98rem; color:var(--text-white);">${b.packageName}</strong>
            <span style="font-size:1.05rem; font-weight:800; color:var(--laser-cyan);">${formatMoney(b.subtotal)}</span>
          </div>
          <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:2px;">
            ${b.players} participants × ${formatMoney(b.unitPrice)} / pers. · Arène ${(b.arena || 'Jungle').toUpperCase()} · Table N° ${b.tableNumber || 1}
          </div>
          <div style="margin-top:5px; display:flex; gap:6px; flex-wrap:wrap;">
            <span class="badge" style="background:rgba(0,255,136,0.1); color:var(--laser-green); font-size:0.7rem; font-weight:700;">2 Parties Laser Fluo</span>
            <span class="badge" style="background:rgba(255,27,123,0.1); color:var(--laser-pink); font-size:0.7rem; font-weight:700;">Boissons & Cartons</span>
          </div>
        </div>
      </div>

      <!-- Extras Rows with Pictures -->
      ${(b.addons && b.addons.length > 0) ? `
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
          <div style="font-size:0.75rem; color:var(--text-secondary); font-weight:700; text-transform:uppercase;">Options & Extras ajoutés (${b.addons.length}) :</div>
          ${b.addons.map(addon => {
            const addonImg = getAddonImage(addon.id, addon.name);
            return `
              <div style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:var(--bg-surface); border-radius:14px; border:1px solid var(--border-subtle);">
                <img src="${addonImg}" alt="${addon.name}" style="width:48px; height:48px; border-radius:8px; object-fit:cover; border:1px solid var(--border-subtle); flex-shrink:0;">
                <div style="flex-grow:1; min-width:0;">
                  <div style="display:flex; justify-content:space-between; align-items:baseline;">
                    <span style="font-weight:700; font-size:0.9rem; color:var(--text-white);">${addon.name}</span>
                    <span style="font-weight:800; font-size:0.95rem; color:var(--laser-cyan);">+${formatMoney(addon.total)}</span>
                  </div>
                  <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">
                    Quantité : <strong>${addon.qty}</strong> ${addon.unitPrice ? `· ${formatMoney(addon.unitPrice)} / unité` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div style="font-size:0.82rem; color:var(--text-muted); font-style:italic; padding:6px 0;">
          Aucun extra optionnel sélectionné sur ce dossier.
        </div>
      `}
    </div>

    <!-- 2 Columns: Client Organisateur & Créneau -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
      <div class="glass-panel" style="padding:14px 18px; border-radius:18px;">
        <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-bottom:6px;">Client Organisateur</div>
        <div style="font-size:1.1rem; font-weight:700; color:var(--text-white);">${b.customerName}</div>
        <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:3px; display:flex; align-items:center; gap:6px;">
          ${icon('phone', '', 13)} <span>${b.phone}</span>
        </div>
        <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:3px; display:flex; align-items:center; gap:6px;">
          ${icon('mail', '', 13)} <span>${b.email}</span>
        </div>
      </div>
      <div class="glass-panel" style="padding:14px 18px; border-radius:18px;">
        <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-bottom:6px;">Créneau & Arène</div>
        <div style="font-size:1.1rem; font-weight:700; color:var(--laser-cyan);">${b.date} · ${b.timeSlot}</div>
        <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:3px;">
          Arène : <strong>${(b.arena || 'Jungle').toUpperCase()}</strong> · Table N° <strong>${b.tableNumber || 1}</strong>
        </div>
        <div style="font-size:0.85rem; color:var(--laser-pink); font-weight:700; margin-top:3px;">
          ${b.childName ? `Enfant fêté : ${b.childName} (${b.childAge || 10} ans)` : `Participants : ${b.players} joueurs`}
        </div>
      </div>
    </div>

    <!-- CRM Birthday Loyalty & 1-Year Discount Coupon Automation -->
    <div class="glass-panel" style="padding:14px 18px; margin-bottom:16px; border-radius:18px; border:1px solid rgba(255,27,123,0.3); background:rgba(255,27,123,0.03);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
        <div style="font-size:0.8rem; color:var(--laser-pink); text-transform:uppercase; font-weight:800; display:flex; align-items:center; gap:8px;">
          ${icon('cake', 'text-pink', 16)}
          <span>CRM Anniversaire · Relance 1 An Après (-15%)</span>
        </div>
        <span class="badge" style="background:rgba(255,27,123,0.15); color:var(--laser-pink); font-weight:800; font-size:0.72rem;">AUTOMATION J-30</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; align-items:end;">
        <div>
          <label style="font-size:0.8rem; color:var(--text-secondary); display:block; margin-bottom:4px; font-weight:600;">Date de naissance de l'enfant :</label>
          <input type="date" id="modal-child-dob" class="form-input" value="${b.childBirthDate || ''}" style="padding:7px 12px; font-size:0.88rem;">
        </div>
        <div>
          <button class="btn btn-secondary" onclick="window.previewBirthdayCoupon('${b.id}')" style="width:100%; justify-content:center; color:var(--laser-pink); border-color:rgba(255,27,123,0.4); padding:8px 14px; border-radius:var(--radius-full); font-weight:700;">
            ${icon('cake', 'text-pink', 14)}
            <span>Aperçu Coupon -15% (${b.childName || 'Enfant'})</span>
          </button>
        </div>
      </div>
      <div style="font-size:0.76rem; color:var(--text-secondary); margin-top:8px;">
        Programmé pour envoyer automatiquement l'e-mail avec coupon exclusif <strong>ANNIV-${(b.childName || 'LASER').toUpperCase().replace(/[^A-Z]/g, '') || 'VIP'}-15</strong> 30 jours avant son prochain anniversaire.
      </div>
    </div>

    <!-- Communication Hub (WhatsApp & Email triggers) -->
    <div class="glass-panel" style="padding:14px 18px; margin-bottom:16px; border-radius:18px;">
      <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-bottom:10px;">Actions de Communication Instantanée</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button class="btn btn-secondary" onclick="window.openWhatsApp('${b.id}')" style="justify-content:center; color:#25D366; border-color:rgba(37,211,102,0.4); padding:9px 16px; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:8px;">
          ${icon('phone', '', 15)}
          <span>Envoyer WhatsApp</span>
          ${getRoundFlagSvg(b.lang || 'fr', 16)}
        </button>
        <button class="btn btn-secondary" onclick="window.previewEmail('${b.id}')" style="justify-content:center; color:var(--laser-cyan); border-color:rgba(0,240,255,0.4); padding:9px 16px; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:8px;">
          ${icon('mail', '', 15)}
          <span>Aperçu Email</span>
          ${getRoundFlagSvg(b.lang || 'fr', 16)}
        </button>
      </div>
    </div>

    <!-- Ardoise Bar & Restauration Live Section -->
    <div class="glass-panel" style="padding:14px 18px; margin-bottom:16px; border-radius:18px; border:1px solid rgba(245,158,11,0.35); background:rgba(245,158,11,0.04); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <div style="font-weight:800; color:#f59e0b; font-size:0.92rem; display:flex; align-items:center; gap:6px; white-space:nowrap;">
          ${icon('creditCard', 'text-amber', 16)}
          <span style="white-space:nowrap;">Ardoise Consommations & Caisse Bar (Table N°&nbsp;${b.tableNumber || 1})</span>
        </div>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">
          Pizzas au feu de bois (TVA 12%), Frites belges, Pichets de softs & Bières (TVA 21%)
          ${b.barTabTotal > 0 ? `· <strong style="color:#ffffff; white-space:nowrap;">Total ardoise actuel : ${formatMoney(b.barTabTotal)}</strong>` : ''}
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="window.openBarPos('${b.id}')" style="color:#f59e0b; border-color:rgba(245,158,11,0.5); font-weight:800; border-radius:var(--radius-full); padding:8px 16px; white-space:nowrap;">
        ${icon('plus', '', 14)}
        <span>Ajouter Pizzas & Boissons</span>
      </button>
    </div>

    <!-- Financial Breakdown & Deposit -->
    <div class="glass-panel" style="padding:16px 20px; margin-bottom:16px; border-radius:20px;">
      <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-bottom:10px;">Règlement & Acompte</div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.88rem;">
        <span style="color:var(--text-secondary);">Prix formule (${b.players} × ${formatMoney(b.unitPrice)}) :</span>
        <span style="font-weight:600; white-space:nowrap;">${formatMoney(b.subtotal)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.88rem;">
        <span style="color:var(--text-secondary);">Extras & Add-ons :</span>
        <span style="font-weight:600; white-space:nowrap;">${formatMoney(b.addonsTotal || 0)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:1rem; font-weight:800; color:var(--text-white); border-top:1px solid var(--border-subtle); padding-top:8px;">
        <span>Total de la réservation :</span>
        <span style="white-space:nowrap;">${formatMoney(b.totalAmount)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.88rem; color:var(--laser-green); font-weight:700; background:rgba(0,255,136,0.06); padding:8px 14px; border-radius:var(--radius-full);">
        <span>Acompte sécurisé (${b.paymentMethod === 'bancontact' ? 'Bancontact' : (b.paymentMethod === 'payconiq' ? 'Payconiq' : (b.paymentMethod === 'stripe' ? 'Carte Bancaire' : 'Enregistré'))}) :</span>
        <span style="white-space:nowrap;">${formatMoney(b.depositPaid || 0)}</span>
      </div>
      ${b.balanceDue > 0 ? `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,240,255,0.08); border:1px solid rgba(0,240,255,0.25); padding:12px 16px; border-radius:16px; margin-top:8px;">
          <div>
            <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase; font-weight:700;">Solde à encaisser le jour J :</div>
            <div style="font-size:1.35rem; font-weight:800; color:var(--laser-cyan); white-space:nowrap;">${formatMoney(b.balanceDue)}</div>
          </div>
          <button class="btn btn-primary" onclick="window.payBalance('${b.id}')" style="padding:9px 18px; font-weight:700; border-radius:var(--radius-full); white-space:nowrap;">
            ${icon('creditCard', '', 14)}
            <span>Encaisser sur place (Cash / Bancontact)</span>
          </button>
        </div>
      ` : `
        <div style="display:flex; align-items:center; gap:8px; background:rgba(0,255,136,0.1); border:1px solid rgba(0,255,136,0.3); padding:10px 16px; border-radius:16px; color:var(--laser-green); font-weight:700; font-size:0.9rem; margin-top:8px;">
          ${icon('checkCircle', 'text-green', 16)}
          <span>Réservation intégralement réglée (Solde&nbsp;:&nbsp;0&nbsp;€)</span>
        </div>
      `}
    </div>

    <!-- Team Rosters (Red vs Blue) if available -->
    ${(b.teams && ((b.teams.red && b.teams.red.length) || (b.teams.blue && b.teams.blue.length))) ? `
      <div class="glass-panel" style="padding:14px 18px; margin-bottom:16px; border-radius:18px;">
        <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-bottom:10px;">Composition des Équipes (Saisie par le client)</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.25); border-radius:14px; padding:12px;">
            <strong style="color:var(--laser-red); font-size:0.85rem; display:block; margin-bottom:6px;">Équipe Rouge (${(b.teams.red || []).filter(Boolean).length})</strong>
            <ul style="margin:0; padding-left:18px; font-size:0.82rem; color:var(--text-secondary);">
              ${(b.teams.red || []).map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          <div style="background:rgba(0, 240, 255, 0.08); border:1px solid rgba(0, 240, 255, 0.25); border-radius:14px; padding:12px;">
            <strong style="color:var(--laser-cyan); font-size:0.85rem; display:block; margin-bottom:6px;">Équipe Bleue (${(b.teams.blue || []).filter(Boolean).length})</strong>
            <ul style="margin:0; padding-left:18px; font-size:0.82rem; color:var(--text-secondary);">
              ${(b.teams.blue || []).map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    ` : ''}

    ${b.specialNotes ? `
      <div style="margin-bottom:16px; padding:12px; background:rgba(239, 68, 68, 0.1); border-left:3px solid var(--laser-red); border-radius:4px; font-size:0.85rem; color:#fca5a5;">
        <strong>Remarques / Allergies signalées :</strong> ${b.specialNotes}
      </div>
    ` : ''}

    <!-- Communication Audit Log -->
    <div class="glass-panel" style="padding:14px; margin-bottom:16px;">
      <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-bottom:8px;">Historique des Communications & Notifications</div>
      ${(b.communicationLog && b.communicationLog.length > 0) ? `
        <div style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto;">
          ${b.communicationLog.map(entry => {
            const isEmail = entry.channel === 'email' || entry.type === 'email';
            const isWa = entry.channel === 'whatsapp' || entry.type === 'whatsapp';
            const timeStr = entry.sentAt || entry.timestamp;
            const formattedTime = timeStr ? new Date(timeStr).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }) : '';
            return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface); padding:8px 12px; border-radius:var(--radius-sm); font-size:0.8rem; border-left:3px solid ${isEmail ? 'var(--laser-cyan)' : (isWa ? '#25D366' : 'var(--laser-amber)')};">
              <div style="display:flex; align-items:center; gap:8px;">
                ${isWa ? icon('phone', 'text-green', 13) : (isEmail ? icon('mail', 'text-cyan', 13) : icon('coins', 'text-amber', 13))}
                <span style="font-weight:700; text-transform:uppercase; font-size:0.72rem; color:${isWa ? '#25D366' : (isEmail ? 'var(--laser-cyan)' : 'var(--laser-amber)')};">
                  ${isWa ? 'WhatsApp' : (isEmail ? 'E-mail' : (entry.type || 'Paiement'))}
                </span>
                ${entry.provider ? `<span class="badge" style="font-size:0.65rem; padding:1px 6px; background:rgba(255,255,255,0.06); color:var(--text-secondary); text-transform:uppercase;">${entry.provider}</span>` : ''}
                <span style="color:var(--text-primary); font-weight:600;">${entry.recipient || ''}</span>
              </div>
              <div style="color:var(--text-muted); font-size:0.75rem; text-align:right;">
                <span>${entry.detail || entry.notes || ''}</span>
                ${formattedTime ? ` · <span style="color:var(--text-white); font-weight:600;">${formattedTime}</span>` : ''}
              </div>
            </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div style="color:var(--text-muted); font-size:0.82rem; font-style:italic;">Aucune notification manuelle enregistrée pour le moment.</div>
      `}
    </div>

    <!-- Modal Footer Actions -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; border-top:1px solid var(--border-subtle); padding-top:14px;">
      <button class="btn btn-secondary" onclick="window.deleteBooking('${b.id}')" style="color:var(--laser-red); border-color:rgba(239,68,68,0.3);">
        ${icon('trash', '', 14)}
        <span>${t('delete')}</span>
      </button>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-secondary" onclick="window.printBookingSheet('${b.id}')">
          ${icon('printer', '', 14)}
          <span>${t('print')}</span>
        </button>
        <button class="btn btn-primary" onclick="window.saveModalChanges()">
          ${icon('save', '', 14)}
          <span>${t('save')}</span>
        </button>
      </div>
    </div>
  `;

  modalEl.classList.add('active');

  const closeBtn = document.getElementById('btn-close-modal');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modalEl.classList.remove('active');
    };
  }
}

// 5. QUICK PHONE BOOKING MODAL (Supports Individual Birthday & Corporate B2B Team Building)
function setupQuickBookingModal() {
  const modal = document.getElementById('quick-booking-modal');
  const closeBtn = document.getElementById('btn-close-quick-modal');
  const cancelBtn = document.getElementById('btn-cancel-quick-modal');
  const form = document.getElementById('quick-booking-form');

  const closeModal = () => {
    if (modal) modal.classList.remove('active');
  };

  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Type Switcher: Particulier / Anniversaire vs Entreprise / Team Building (B2B)
  let currentType = 'individual';
  const typeIndividualBtn = document.getElementById('btn-type-individual');
  const typeCorporateBtn = document.getElementById('btn-type-corporate');
  const childSection = document.getElementById('qb-child-section');
  const corpSection = document.getElementById('qb-corporate-section');
  const nameLabel = document.getElementById('qb-name-label');

  const setType = (type) => {
    currentType = type;
    if (type === 'corporate') {
      typeCorporateBtn?.classList.add('active');
      typeCorporateBtn?.style.setProperty('color', '#fff');
      typeCorporateBtn?.style.setProperty('background', 'var(--laser-cyan)');
      typeIndividualBtn?.classList.remove('active');
      typeIndividualBtn?.style.setProperty('color', 'var(--text-secondary)');
      typeIndividualBtn?.style.removeProperty('background');
      if (childSection) childSection.style.display = 'none';
      if (corpSection) corpSection.style.display = 'block';
      if (nameLabel) nameLabel.textContent = 'Nom du contact / Responsable B2B';
    } else {
      typeIndividualBtn?.classList.add('active');
      typeIndividualBtn?.style.setProperty('color', '#04070f');
      typeIndividualBtn?.style.setProperty('background', 'var(--laser-cyan)');
      typeCorporateBtn?.classList.remove('active');
      typeCorporateBtn?.style.setProperty('color', 'var(--text-secondary)');
      typeCorporateBtn?.style.removeProperty('background');
      if (childSection) childSection.style.display = 'grid';
      if (corpSection) corpSection.style.display = 'none';
      if (nameLabel) nameLabel.textContent = 'Nom du parent organisateur';
    }
  };

  if (typeIndividualBtn) typeIndividualBtn.onclick = () => setType('individual');
  if (typeCorporateBtn) typeCorporateBtn.onclick = () => setType('corporate');

  // Corporate Search & Autocomplete
  const companyInput = document.getElementById('qb-company-name');
  const companyDropdown = document.getElementById('qb-company-suggestions');
  const vatInput = document.getElementById('qb-vat-number');
  const vatCheckBtn = document.getElementById('btn-check-vies');
  const vatStatus = document.getElementById('qb-vat-status');
  const addressInput = document.getElementById('qb-company-address');
  const addressDropdown = document.getElementById('qb-address-suggestions');

  // Company Name Live Suggestions
  if (companyInput && companyDropdown) {
    companyInput.addEventListener('input', () => {
      const q = companyInput.value.trim();
      if (q.length < 2) {
        companyDropdown.style.display = 'none';
        companyDropdown.innerHTML = '';
        return;
      }
      const suggestions = searchEnterpriseSuggestions(q);
      if (suggestions.length === 0) {
        companyDropdown.style.display = 'none';
        companyDropdown.innerHTML = '';
        return;
      }

      companyDropdown.innerHTML = suggestions.map(item => `
        <div class="company-suggest-item" data-vat="${item.vatNumber}" data-name="${item.name}" data-addr="${item.street}, ${item.postalCode} ${item.city} (${item.countryName})" style="padding:10px 14px; cursor:pointer; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; transition:background 0.15s ease;">
          <div>
            <div style="font-weight:700; color:var(--text-white); font-size:0.88rem;">${item.name}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${item.street}, ${item.postalCode} ${item.city}</div>
          </div>
          <div style="text-align:right;">
            <span class="badge" style="background:rgba(0,240,255,0.12); color:var(--laser-cyan); font-size:0.72rem; font-family:monospace;">${item.vatNumber}</span>
          </div>
        </div>
      `).join('');
      companyDropdown.style.display = 'block';

      companyDropdown.querySelectorAll('.company-suggest-item').forEach(el => {
        el.onclick = () => {
          companyInput.value = el.dataset.name;
          if (vatInput) vatInput.value = el.dataset.vat;
          if (addressInput) addressInput.value = el.dataset.addr;
          if (vatStatus) {
            vatStatus.innerHTML = `<span style="color:var(--laser-green); font-weight:700; display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Validé KBO / BCE · Actif</span>`;
          }
          companyDropdown.style.display = 'none';
        };
      });
    });
  }

  // VAT VIES Check Button
  if (vatCheckBtn && vatInput) {
    const doVatCheck = async () => {
      const rawVat = vatInput.value.trim();
      if (!rawVat) return;
      if (vatStatus) vatStatus.innerHTML = `<span style="color:var(--laser-cyan);">Vérification VIES UE / BCE en cours...</span>`;
      const res = await lookupViesOrKboCompany(rawVat);
      if (vatStatus) {
        if (res.valid) {
          vatStatus.innerHTML = `<span style="color:var(--laser-green); font-weight:700; display:inline-flex; align-items:center; gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${res.status || 'TVA Valide'}</span>`;
          if (res.name && companyInput && !companyInput.value) {
            companyInput.value = res.name;
          }
          if (res.address && addressInput && !addressInput.value) {
            addressInput.value = res.address;
          }
        } else {
          vatStatus.innerHTML = `<span style="color:var(--laser-red); font-weight:700;">${res.status || 'TVA non reconnue'}</span>`;
        }
      }
    };
    vatCheckBtn.onclick = doVatCheck;
  }

  // Address Google Maps Autocomplete
  let addrDebounce = null;
  if (addressInput && addressDropdown) {
    addressInput.addEventListener('input', () => {
      clearTimeout(addrDebounce);
      addrDebounce = setTimeout(async () => {
        const q = addressInput.value.trim();
        if (q.length < 3) {
          addressDropdown.style.display = 'none';
          addressDropdown.innerHTML = '';
          return;
        }
        const matches = await searchAddressAutocomplete(q);
        if (!matches || matches.length === 0) {
          addressDropdown.style.display = 'none';
          addressDropdown.innerHTML = '';
          return;
        }

        addressDropdown.innerHTML = matches.map(m => `
          <div class="addr-suggest-item" data-formatted="${m.formatted}" style="padding:9px 12px; cursor:pointer; border-bottom:1px solid var(--border-subtle); display:flex; align-items:center; gap:8px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--laser-cyan)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style="font-size:0.84rem; color:var(--text-white);">${m.formatted}</span>
          </div>
        `).join('');
        addressDropdown.style.display = 'block';

        addressDropdown.querySelectorAll('.addr-suggest-item').forEach(el => {
          el.onclick = () => {
            addressInput.value = el.dataset.formatted;
            addressDropdown.style.display = 'none';
          };
        });
      }, 250);
    });
  }

  // Hide dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (companyDropdown && !companyDropdown.contains(e.target) && e.target !== companyInput) {
      companyDropdown.style.display = 'none';
    }
    if (addressDropdown && !addressDropdown.contains(e.target) && e.target !== addressInput) {
      addressDropdown.style.display = 'none';
    }
  });

  // Interactive Live Price Calculation in Modal
  const playersInput = document.getElementById('qb-players');
  const packageSelect = document.getElementById('qb-package');
  const breakdownEl = document.getElementById('qb-calc-breakdown');
  const totalEl = document.getElementById('qb-calc-total');

  const updateModalPrice = () => {
    if (!playersInput || !packageSelect || !breakdownEl || !totalEl) return;
    const priceMap = { sweet: 24, fun: 26, vip: 28, standard2: 22 };
    const pkg = packageSelect.value;
    const unitP = priceMap[pkg] || 26;
    const players = Math.max(1, parseInt(playersInput.value) || 10);
    const total = players * unitP;
    breakdownEl.textContent = `${players} joueurs × ${formatMoney(unitP)} · Règlement sur place le jour J`;
    totalEl.textContent = formatMoney(total);
  };

  if (playersInput) playersInput.addEventListener('input', updateModalPrice);
  if (packageSelect) packageSelect.addEventListener('change', updateModalPrice);

  if (form && modal) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const isCorp = currentType === 'corporate';
      const name = document.getElementById('qb-name').value;
      const phone = document.getElementById('qb-phone').value;
      const email = document.getElementById('qb-email').value || (isCorp ? 'contact@corporate.be' : 'phone-booking@lasermagic.be');
      const date = document.getElementById('qb-date').value;
      const slot = document.getElementById('qb-slot').value;
      const pkg = document.getElementById('qb-package').value;
      const child = document.getElementById('qb-child').value;
      const childDob = document.getElementById('qb-child-dob')?.value || '';
      const lang = document.getElementById('qb-lang')?.value || 'fr';
      const notes = document.getElementById('qb-notes').value;

      const compName = isCorp ? (document.getElementById('qb-company-name')?.value || '') : '';
      const compVat = isCorp ? (document.getElementById('qb-vat-number')?.value || '') : '';
      const compAddr = isCorp ? (document.getElementById('qb-company-address')?.value || '') : '';
      const compPo = isCorp ? (document.getElementById('qb-po-number')?.value || '') : '';
      const compRole = isCorp ? (document.getElementById('qb-contact-role')?.value || '') : '';

      const priceMap = { sweet: 24, fun: 26, vip: 28, standard2: 22 };
      const unitP = priceMap[pkg] || 26;
      const players = Math.max(1, parseInt(playersInput.value) || 10);
      const total = players * unitP;

      let childAge = 10;
      if (!isCorp && childDob) {
        const bYear = new Date(childDob).getFullYear();
        const cYear = new Date(date || Date.now()).getFullYear();
        if (!isNaN(bYear)) {
          childAge = Math.max(1, cYear - bYear);
        }
      }

      const newBooking = store.addBooking({
        customerName: name,
        email: email,
        phone: phone,
        lang: lang,
        isCorporate: isCorp,
        companyName: compName,
        vatNumber: compVat,
        billingAddress: compAddr,
        poNumber: compPo,
        contactRole: compRole,
        packageId: pkg,
        category: isCorp ? 'corporate' : (pkg.startsWith('standard') ? 'standard' : 'birthday'),
        packageName: isCorp 
          ? (compName ? `Team Building - ${compName}` : 'Team Building Entreprise')
          : (pkg === 'vip' ? 'Formule VIP' : (pkg === 'fun' ? 'Formule Fun' : (pkg === 'sweet' ? 'Formule Sweet' : 'Laser 2 Parties'))),
        date: date,
        timeSlot: slot,
        startTime: slot.split(' - ')[0],
        endTime: slot.split(' - ')[1],
        players: players,
        childName: isCorp ? '' : child,
        childAge: isCorp ? null : childAge,
        childBirthDate: isCorp ? '' : childDob,
        unitPrice: unitP,
        subtotal: total,
        addonsTotal: 0,
        totalAmount: total,
        depositPaid: 0,
        balanceDue: total,
        paymentMethod: 'onsite',
        status: 'confirmed',
        specialNotes: isCorp 
          ? `[B2B Corporate] ${notes}${compPo ? ` (PO: ${compPo})` : ''}` 
          : `[Téléphonique] ${notes}`
      });

      closeModal();
      form.reset();
      setType('individual');
      updateModalPrice();
      renderAllViews();
      showAdminToast(`Réservation #${newBooking.id} enregistrée pour ${name} !`);
    };
  }
}

function openQuickBookingModal() {
  const modal = document.getElementById('quick-booking-modal');
  if (!modal) return;
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('qb-date');
  if (dateInput && !dateInput.value) dateInput.value = today;
  modal.classList.add('active');
}

// 6. INTEGRATIONS, WEBHOOKS & POS HUB
function setupIntegrationsTab() {
  // 1. Subtab Switching (Webhooks / API / Widget)
  const subtabBtns = document.querySelectorAll('.integration-subtab-btn');
  const subviews = {
    webhooks: document.getElementById('subview-webhooks'),
    api: document.getElementById('subview-api'),
    widget: document.getElementById('subview-widget'),
    communications: document.getElementById('subview-communications'),
    portal: document.getElementById('subview-portal')
  };

  const portalSelect = document.getElementById('portal-preview-booking-select');
  const portalIframe = document.getElementById('portal-preview-iframe');
  const portalExtBtn = document.getElementById('btn-open-portal-external');

  const updatePortalPreview = (bId) => {
    if (!portalIframe) return;
    const b = bId ? store.getById(bId) : (store.getAll()[0] || null);
    if (b) {
      const lang = b.lang || 'fr';
      const targetUrl = `./confirm.html?id=${b.id}&lang=${lang}`;
      portalIframe.src = targetUrl;
      if (portalExtBtn) portalExtBtn.href = targetUrl;
    }
  };

  if (portalSelect) {
    const allBookings = store.getAll();
    portalSelect.innerHTML = allBookings.map(b => `
      <option value="${b.id}">${b.orderCode || b.id} - ${b.customerName} (${b.date} · ${b.timeSlot}) ${b.isCorporate ? '[B2B Team Building]' : ''}</option>
    `).join('');

    portalSelect.onchange = (e) => {
      updatePortalPreview(e.target.value);
    };

    if (allBookings.length > 0) {
      updatePortalPreview(allBookings[0].id);
    }
  }

  subtabBtns.forEach(btn => {
    btn.onclick = () => {
      const target = btn.dataset.subtab;
      subtabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.keys(subviews).forEach(k => {
        if (subviews[k]) {
          subviews[k].style.display = (k === target) ? 'block' : 'none';
        }
      });
      if (target === 'portal' && portalSelect) {
        updatePortalPreview(portalSelect.value);
      }
    };
  });

  // 2. Webhook Configuration & Tester
  const config = getWebhookConfig();
  const urlInput = document.getElementById('webhook-endpoint-url');
  const secretInput = document.getElementById('webhook-secret-key');
  const regenBtn = document.getElementById('btn-regen-webhook-secret');
  const saveBtn = document.getElementById('btn-save-webhook-config');
  const testWebhookBtn = document.getElementById('btn-trigger-test-webhook');
  const lastStatusEl = document.getElementById('webhook-last-status');
  const payloadPreviewEl = document.getElementById('webhook-payload-preview');
  const logsBody = document.getElementById('webhook-logs-body');

  if (urlInput) urlInput.value = config.url || 'https://api.lasermagic.be/webhook/orders';
  if (secretInput) secretInput.value = config.secret || 'whsec_laser_' + Math.random().toString(36).substring(2, 10);

  // Check event checkboxes
  document.querySelectorAll('input[name="webhook-events"]').forEach(cb => {
    cb.checked = (config.events || []).includes(cb.value);
  });

  // Regenerate secret key
  if (regenBtn && secretInput) {
    regenBtn.onclick = () => {
      secretInput.value = 'whsec_laser_' + Math.random().toString(36).substring(2, 12);
      showAdminToast('Nouvelle clé secrète générée (Cliquez sur Enregistrer pour valider)');
    };
  }

  // Save config
  if (saveBtn) {
    saveBtn.onclick = () => {
      const selectedEvents = Array.from(document.querySelectorAll('input[name="webhook-events"]:checked')).map(cb => cb.value);
      const newConfig = {
        url: urlInput ? urlInput.value.trim() : config.url,
        secret: secretInput ? secretInput.value.trim() : config.secret,
        events: selectedEvents,
        enabled: true
      };
      saveWebhookConfig(newConfig);
      showAdminToast('Configuration Webhook sauvegardée avec succès !');
    };
  }

  // Function to render webhook logs & live payload preview
  function renderWebhookLogs() {
    const logs = getWebhookLogs();
    if (logs.length > 0) {
      const latest = logs[0];
      if (payloadPreviewEl) {
        payloadPreviewEl.textContent = JSON.stringify(latest.payload || latest, null, 2);
      }
      if (lastStatusEl) {
        const isOk = (latest.status === 200 || latest.status === 201);
        lastStatusEl.textContent = `${latest.status || 200} OK (${latest.durationMs || 34}ms)`;
        lastStatusEl.style.background = isOk ? 'rgba(0,255,136,0.15)' : 'rgba(255,59,48,0.15)';
        lastStatusEl.style.color = isOk ? 'var(--laser-green)' : 'var(--laser-red)';
      }
    } else if (payloadPreviewEl) {
      payloadPreviewEl.textContent = '// Aucun webhook émis pour l’instant. Cliquez sur "Déclencher Test Webhook".';
    }

    if (logsBody) {
      if (logs.length === 0) {
        logsBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Aucun webhook envoyé pour l'instant.</td></tr>`;
      } else {
        logsBody.innerHTML = logs.map(l => {
          const isOk = (l.status === 200 || l.status === 201);
          const orderNum = String(l.orderNumber || 42).padStart(3, '0');
          return `
            <tr>
              <td style="color:var(--text-muted); font-size:0.8rem;">${new Date(l.timestamp).toLocaleTimeString('fr-BE')}</td>
              <td><span class="badge" style="background:rgba(56,189,248,0.15); color:#38bdf8; font-weight:700;">${l.event}</span></td>
              <td><span class="badge-order">N° ${orderNum}</span></td>
              <td><strong style="color:var(--text-white);">${l.bookingId || l.orderCode || 'CMD-' + orderNum}</strong></td>
              <td style="font-family:monospace; font-size:0.75rem; color:var(--text-muted); max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${l.url}</td>
              <td>
                <span class="badge" style="background:${isOk ? 'rgba(0,255,136,0.15)' : 'rgba(255,59,48,0.15)'}; color:${isOk ? 'var(--laser-green)' : 'var(--laser-red)'}; font-weight:800;">
                  ${l.status || 200} OK
                </span>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // Trigger test webhook
  if (testWebhookBtn) {
    testWebhookBtn.onclick = () => {
      const allBookings = store.getAll();
      const sampleBooking = allBookings[0] || {
        id: 'LM-8421',
        orderNumber: 42,
        orderCode: 'CMD-042',
        customerName: 'Jean-François Moreau',
        packageName: 'Formule Fun',
        totalAmount: 340,
        players: 10,
        date: '2026-10-02',
        timeSlot: '14:00 - 16:00'
      };

      const testPayload = {
        event: 'booking.created',
        event_id: 'evt_' + Date.now(),
        occurred_at: new Date().toISOString(),
        source: 'LaserMagic_POS_Bridge',
        data: {
          order_number: sampleBooking.orderNumber || 42,
          order_code: sampleBooking.orderCode || `CMD-${String(sampleBooking.orderNumber || 42).padStart(3, '0')}`,
          booking_ref: sampleBooking.id,
          customer: {
            name: sampleBooking.customerName,
            phone: sampleBooking.phone,
            email: sampleBooking.email,
            lang: sampleBooking.lang || 'fr'
          },
          schedule: {
            date: sampleBooking.date,
            time_slot: sampleBooking.timeSlot,
            arena: sampleBooking.arena,
            table_number: sampleBooking.tableNumber
          },
          package: {
            id: sampleBooking.packageId,
            name: sampleBooking.packageName,
            players_count: sampleBooking.players,
            image_url: window.location.origin + (sampleBooking.packageImage || '/images/package-fun.jpg')
          },
          financials: {
            total_amount: sampleBooking.totalAmount,
            deposit_paid: sampleBooking.depositPaid || 0,
            balance_due: sampleBooking.balanceDue || 0,
            currency: 'EUR'
          },
          kitchen_notes: sampleBooking.specialNotes || 'Aucune allergie signalée'
        }
      };

      recordWebhookLog({
        event: 'booking.created',
        orderNumber: sampleBooking.orderNumber || 42,
        orderCode: sampleBooking.orderCode || 'CMD-042',
        bookingId: sampleBooking.id,
        status: 200,
        durationMs: Math.floor(Math.random() * 25) + 20,
        url: (urlInput ? urlInput.value.trim() : '') || 'https://api.lasermagic.be/webhook/orders',
        payload: testPayload
      });

      renderWebhookLogs();
      showAdminToast(`Webhook test envoyé avec succès (Commande N° ${String(sampleBooking.orderNumber || 42).padStart(3, '0')})`);
    };
  }

  renderWebhookLogs();

  // 3. API Subview: Copy API Key
  const copyApiKeyBtn = document.getElementById('btn-copy-api-key');
  const apiKeyDisplay = document.getElementById('api-key-display');
  if (copyApiKeyBtn && apiKeyDisplay) {
    copyApiKeyBtn.onclick = () => {
      navigator.clipboard.writeText(apiKeyDisplay.value).then(() => {
        showAdminToast('Clé API copiée dans le presse-papiers');
      });
    };
  }

  // 4. Widget Subview: Copy iframe embed code
  const copyBtn = document.getElementById('btn-copy-embed-code');
  const codePre = document.getElementById('embed-code-snippet');
  if (copyBtn && codePre) {
    const currentOrigin = window.location.origin;
    const embedCode = `<!-- Laser Magic Responsive Booking Widget -->
<iframe 
  id="laser-magic-booking-frame"
  src="${currentOrigin}/widget.html"
  style="width: 100%; min-height: 820px; border: none; overflow: hidden; background: transparent;"
  allow="payment"
  loading="lazy"
></iframe>

<script>
  // Automatic iframe height adjustment
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'LASER_MAGIC_IFRAME_RESIZE') {
      var frame = document.getElementById('laser-magic-booking-frame');
      if (frame) {
        frame.style.height = event.data.height + 'px';
      }
    }
  });
</script>`;

    codePre.textContent = embedCode;

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(embedCode).then(() => {
        const origHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `${icon('check', '', 14)} <span>${t('codeCopied')}</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = origHtml;
        }, 3000);
      });
    };
  }

  // 5. Communications Subview: Email & WhatsApp Gateway Configuration & Logs
  const commConfig = getCommConfig();

  // Email elements
  const emailProviderEl = document.getElementById('comm-email-provider');
  const emailApiKeyEl = document.getElementById('comm-email-apikey');
  const emailSenderNameEl = document.getElementById('comm-email-sender-name');
  const emailSenderEmailEl = document.getElementById('comm-email-sender-email');
  const emailWebhookUrlEl = document.getElementById('comm-email-webhook-url');
  const emailAutoBookingEl = document.getElementById('comm-email-auto-booking');
  const emailAutoConfirmEl = document.getElementById('comm-email-auto-confirm');
  const emailKeyWrap = document.getElementById('comm-email-key-wrap');
  const emailWebhookWrap = document.getElementById('comm-email-webhook-wrap');
  const emailStatusBadge = document.getElementById('badge-email-status');
  const saveEmailBtn = document.getElementById('btn-save-comm-email');
  const testEmailBtn = document.getElementById('btn-test-send-email');
  const testEmailInput = document.getElementById('comm-email-test-dest');

  // WhatsApp elements
  const waProviderEl = document.getElementById('comm-wa-provider');
  const waPhoneIdEl = document.getElementById('comm-wa-phone-id');
  const waTokenEl = document.getElementById('comm-wa-token');
  const waTwilioSidEl = document.getElementById('comm-wa-twilio-sid');
  const waTwilioTokenEl = document.getElementById('comm-wa-twilio-token');
  const waTwilioFromEl = document.getElementById('comm-wa-twilio-from');
  const waWebhookUrlEl = document.getElementById('comm-wa-webhook-url');
  const waAutoBookingEl = document.getElementById('comm-wa-auto-booking');
  const waAutoConfirmEl = document.getElementById('comm-wa-auto-confirm');
  const waMetaWrap = document.getElementById('comm-wa-meta-wrap');
  const waTwilioWrap = document.getElementById('comm-wa-twilio-wrap');
  const waWebhookWrap = document.getElementById('comm-wa-webhook-wrap');
  const waStatusBadge = document.getElementById('badge-wa-status');
  const saveWaBtn = document.getElementById('btn-save-comm-wa');
  const testWaBtn = document.getElementById('btn-test-send-wa');
  const testWaInput = document.getElementById('comm-wa-test-phone');

  // Comm logs elements
  const commLogsBody = document.getElementById('comm-logs-body');
  const refreshCommLogsBtn = document.getElementById('btn-refresh-comm-logs');

  function updateEmailProviderVisibility() {
    const prov = emailProviderEl ? emailProviderEl.value : 'brevo';
    if (emailKeyWrap) emailKeyWrap.style.display = (prov === 'brevo' || prov === 'resend' || prov === 'sendgrid') ? 'block' : 'none';
    if (emailWebhookWrap) emailWebhookWrap.style.display = (prov === 'webhook_proxy') ? 'block' : 'none';
    if (emailStatusBadge) {
      emailStatusBadge.textContent = prov.toUpperCase().replace('_', ' ') + ' ACTIVE';
    }
  }

  function updateWaProviderVisibility() {
    const prov = waProviderEl ? waProviderEl.value : 'meta_cloud';
    if (waMetaWrap) waMetaWrap.style.display = (prov === 'meta_cloud') ? 'block' : 'none';
    if (waTwilioWrap) waTwilioWrap.style.display = (prov === 'twilio') ? 'block' : 'none';
    if (waWebhookWrap) waWebhookWrap.style.display = (prov === 'webhook_proxy') ? 'block' : 'none';
    if (waStatusBadge) {
      waStatusBadge.textContent = prov.toUpperCase().replace('_', ' ') + ' ACTIVE';
    }
  }

  // Populate Email fields
  if (emailProviderEl) emailProviderEl.value = commConfig.email?.provider || 'brevo';
  if (emailApiKeyEl) emailApiKeyEl.value = commConfig.email?.apiKey || '';
  if (emailSenderNameEl) emailSenderNameEl.value = commConfig.email?.senderName || 'Laser Magic Vilvoorde';
  if (emailSenderEmailEl) emailSenderEmailEl.value = commConfig.email?.senderEmail || 'jeka7ro@gmail.com';
  if (emailWebhookUrlEl) emailWebhookUrlEl.value = commConfig.email?.webhookUrl || 'https://api.lasermagic.be/mail/send';
  if (emailAutoBookingEl) emailAutoBookingEl.checked = commConfig.email?.autoSendOnBooking !== false;
  if (emailAutoConfirmEl) emailAutoConfirmEl.checked = commConfig.email?.autoSendOnConfirmation !== false;
  updateEmailProviderVisibility();

  if (emailProviderEl) {
    emailProviderEl.onchange = updateEmailProviderVisibility;
  }

  // Populate WhatsApp fields
  if (waProviderEl) waProviderEl.value = commConfig.whatsapp?.provider || 'meta_cloud';
  if (waPhoneIdEl) waPhoneIdEl.value = commConfig.whatsapp?.metaPhoneNumberId || '';
  if (waTokenEl) waTokenEl.value = commConfig.whatsapp?.metaAccessToken || '';
  if (waTwilioSidEl) waTwilioSidEl.value = commConfig.whatsapp?.twilioAccountSid || '';
  if (waTwilioTokenEl) waTwilioTokenEl.value = commConfig.whatsapp?.twilioAuthToken || '';
  if (waTwilioFromEl) waTwilioFromEl.value = commConfig.whatsapp?.twilioFromNumber || 'whatsapp:+3222532222';
  if (waWebhookUrlEl) waWebhookUrlEl.value = commConfig.whatsapp?.webhookUrl || 'https://api.lasermagic.be/whatsapp/send';
  if (waAutoBookingEl) waAutoBookingEl.checked = !!commConfig.whatsapp?.autoSendOnBooking;
  if (waAutoConfirmEl) waAutoConfirmEl.checked = commConfig.whatsapp?.autoSendOnConfirmation !== false;
  updateWaProviderVisibility();

  if (waProviderEl) {
    waProviderEl.onchange = updateWaProviderVisibility;
  }

  // Save Email Config
  if (saveEmailBtn) {
    saveEmailBtn.onclick = () => {
      const current = getCommConfig();
      current.email = {
        provider: emailProviderEl.value,
        apiKey: emailApiKeyEl.value.trim(),
        senderName: emailSenderNameEl.value.trim() || 'Laser Magic Vilvoorde',
        senderEmail: emailSenderEmailEl.value.trim() || 'reservations@lasermagic.be',
        webhookUrl: emailWebhookUrlEl ? emailWebhookUrlEl.value.trim() : '',
        autoSendOnBooking: emailAutoBookingEl.checked,
        autoSendOnConfirmation: emailAutoConfirmEl.checked
      };
      saveCommConfig(current);
      updateEmailProviderVisibility();
      showAdminToast('Paramètres de passerelle E-mail enregistrés avec succès !');
    };
  }

  // Save WhatsApp Config
  if (saveWaBtn) {
    saveWaBtn.onclick = () => {
      const current = getCommConfig();
      current.whatsapp = {
        provider: waProviderEl.value,
        metaPhoneNumberId: waPhoneIdEl ? waPhoneIdEl.value.trim() : '',
        metaAccessToken: waTokenEl ? waTokenEl.value.trim() : '',
        twilioAccountSid: waTwilioSidEl ? waTwilioSidEl.value.trim() : '',
        twilioAuthToken: waTwilioTokenEl ? waTwilioTokenEl.value.trim() : '',
        twilioFromNumber: waTwilioFromEl ? waTwilioFromEl.value.trim() : '',
        webhookUrl: waWebhookUrlEl ? waWebhookUrlEl.value.trim() : '',
        autoSendOnBooking: waAutoBookingEl.checked,
        autoSendOnConfirmation: waAutoConfirmEl.checked
      };
      saveCommConfig(current);
      updateWaProviderVisibility();
      showAdminToast('Paramètres de passerelle WhatsApp enregistrés avec succès !');
    };
  }

  // Test Email
  if (testEmailBtn) {
    testEmailBtn.onclick = async () => {
      const dest = testEmailInput ? testEmailInput.value.trim() : '';
      if (!dest || !dest.includes('@')) {
        showAdminToast('Veuillez entrer une adresse e-mail valide pour le test', 'error');
        if (testEmailInput) testEmailInput.focus();
        return;
      }
      const origHtml = testEmailBtn.innerHTML;
      testEmailBtn.disabled = true;
      testEmailBtn.innerHTML = `<span>Envoi en cours...</span>`;

      try {
        const res = await testEmailGateway(dest);
        testEmailBtn.disabled = false;
        testEmailBtn.innerHTML = origHtml;
        renderCommLogs();
        showAdminToast(`E-mail test envoyé avec succès via ${res.provider} à ${dest} !`);
      } catch (e) {
        testEmailBtn.disabled = false;
        testEmailBtn.innerHTML = origHtml;
        showAdminToast(`Erreur d'envoi test: ${e.message}`, 'error');
      }
    };
  }

  // Test WhatsApp
  if (testWaBtn) {
    testWaBtn.onclick = async () => {
      const phone = testWaInput ? testWaInput.value.trim() : '';
      if (!phone || phone.length < 8) {
        showAdminToast('Veuillez entrer un numéro de téléphone valide pour le test', 'error');
        if (testWaInput) testWaInput.focus();
        return;
      }
      const origHtml = testWaBtn.innerHTML;
      testWaBtn.disabled = true;
      testWaBtn.innerHTML = `<span>Envoi en cours...</span>`;

      try {
        const res = await testWhatsAppGateway(phone);
        testWaBtn.disabled = false;
        testWaBtn.innerHTML = origHtml;
        if (res.openUrl) {
          window.open(res.openUrl, '_blank');
        }
        renderCommLogs();
        showAdminToast(`Message WhatsApp test validé via ${res.provider} pour ${phone} !`);
      } catch (e) {
        testWaBtn.disabled = false;
        testWaBtn.innerHTML = origHtml;
        showAdminToast(`Erreur d'envoi WhatsApp: ${e.message}`, 'error');
      }
    };
  }

  // Render Global Comm Logs
  function renderCommLogs() {
    if (!commLogsBody) return;
    const logs = getCommLogs();
    if (logs.length === 0) {
      commLogsBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--text-muted);">Aucune communication enregistrée pour le moment.</td></tr>`;
      return;
    }

    commLogsBody.innerHTML = logs.map(l => {
      const isEmail = l.channel === 'email';
      const statusColor = l.status === 'delivered' ? 'var(--laser-green)' : (l.status === 'sent' ? 'var(--laser-cyan)' : (l.status === 'warning' ? '#f59e0b' : 'var(--laser-red)'));
      const statusBg = l.status === 'delivered' ? 'rgba(0,255,136,0.12)' : (l.status === 'sent' ? 'rgba(0,240,255,0.12)' : (l.status === 'warning' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)'));
      const orderNum = l.orderNumber ? String(l.orderNumber).padStart(3, '0') : '-';

      return `
        <tr>
          <td style="color:var(--text-muted); font-size:0.8rem; white-space:nowrap;">
            ${new Date(l.timestamp).toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit' })} · ${new Date(l.timestamp).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}
          </td>
          <td>
            <span class="badge" style="background:${isEmail ? 'rgba(0,240,255,0.12)' : 'rgba(37,211,102,0.12)'}; color:${isEmail ? 'var(--laser-cyan)' : '#25D366'}; border:1px solid ${isEmail ? 'rgba(0,240,255,0.3)' : 'rgba(37,211,102,0.3)'}; font-weight:800; display:inline-flex; align-items:center; gap:5px; padding:2px 8px; border-radius:var(--radius-full); font-size:0.75rem;">
              ${isEmail ? icon('mail', '', 12) : icon('phone', '', 12)}
              <span>${isEmail ? 'E-MAIL' : 'WHATSAPP'}</span>
            </span>
          </td>
          <td><span class="badge-order">${orderNum !== '-' ? 'N° ' + orderNum : '-'}</span></td>
          <td>
            ${l.bookingId && l.bookingId !== 'TEST-GATEWAY' ? `
              <a href="javascript:void(0)" onclick="window.viewBooking('${l.bookingId}')" style="color:var(--laser-cyan); font-weight:700; text-decoration:none;">
                #${l.bookingId}
              </a>
            ` : `<span style="color:var(--text-secondary); font-weight:600;">${l.bookingId || 'TEST'}</span>`}
          </td>
          <td style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <strong style="color:var(--text-white); font-size:0.85rem;">${l.recipient || ''}</strong>
            ${l.customerName ? `<div style="font-size:0.75rem; color:var(--text-secondary);">${l.customerName}</div>` : ''}
          </td>
          <td>
            <span style="font-size:0.8rem; color:var(--text-secondary); text-transform:capitalize;">
              ${l.messageType === 'booking_confirmation' ? 'Confirmation' : (l.messageType === 'birthday_coupon' ? 'Coupon -15%' : (l.messageType === 'whatsapp_recap' ? 'Récapitulatif' : (l.messageType || 'Notification')))}
            </span>
          </td>
          <td>
            <span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-primary); border:1px solid rgba(255,255,255,0.1); font-weight:700; font-size:0.75rem; text-transform:uppercase;">
              ${l.provider || 'GATEWAY'}
            </span>
          </td>
          <td>
            <span class="badge" style="background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor}; font-weight:800; font-size:0.72rem; text-transform:uppercase;">
              ${l.status || 'SENT'}
            </span>
          </td>
          <td style="font-size:0.78rem; color:var(--text-muted); max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${l.detail || l.notes || '-'}
          </td>
        </tr>
      `;
    }).join('');
  }

  if (refreshCommLogsBtn) {
    refreshCommLogsBtn.onclick = () => {
      renderCommLogs();
      showAdminToast('Journal des communications actualisé');
    };
  }

  renderCommLogs();
}

const setupEmbedTab = setupIntegrationsTab;

// Global functions exposed to window for inline onclick handlers
window.openQuickBookingModal = () => {
  openQuickBookingModal();
};

window.viewBooking = (id) => {
  openBookingDetailModal(id);
};

window.openWhatsApp = async (id) => {
  const b = store.getById(id);
  if (!b) return;
  const lang = b.lang || getLang() || 'fr';
  const cfg = getCommConfig();
  const waProv = cfg.whatsapp?.provider || 'meta_cloud';

  if (waProv === 'whatsapp_web') {
    const url = getWhatsAppUrl(b, lang);
    store.recordCommunication(id, {
      channel: 'whatsapp',
      type: 'whatsapp_recap',
      recipient: b.phone,
      detail: `Message WhatsApp préparé (${lang.toUpperCase()})`,
      provider: 'WhatsApp Web'
    });
    window.open(url, '_blank');
    showAdminToast(`WhatsApp Web (${lang.toUpperCase()}) ouvert pour ${b.customerName}`);
  } else {
    showAdminToast(`Envoi WhatsApp (${waProv.toUpperCase()}) en cours pour ${b.customerName}...`);
    const res = await sendWhatsAppNotification({ booking: b });
    if (res.openUrl) {
      window.open(res.openUrl, '_blank');
    }
    showAdminToast(`WhatsApp (${lang.toUpperCase()}) envoyé avec succès via ${res.provider} à ${b.phone} !`);
  }

  if (activeModalBooking && activeModalBooking.id === id) {
    openBookingDetailModal(id);
  }
  renderBookingsTable();
};

window.previewEmail = (id) => {
  const b = store.getById(id);
  if (!b) return;
  const lang = b.lang || getLang() || 'fr';
  const modal = document.getElementById('email-preview-modal');
  const body = document.getElementById('email-preview-body');
  const title = document.getElementById('email-preview-title');
  const copyBtn = document.getElementById('btn-copy-magic-link');
  const sendBtn = document.getElementById('btn-send-simulated-email');
  const closeBtn = document.getElementById('btn-close-email-modal');

  if (!modal || !body) return;

  const emailHtml = generateConfirmationEmailHtml(b, lang);
  if (title) {
    title.textContent = `Aperçu de l'E-mail pour ${b.customerName} (${b.email}) · Langue: ${lang.toUpperCase()}`;
  }

  const subjects = {
    fr: `Laser Magic · Confirmation de votre Réservation #${b.id}`,
    nl: `Laser Magic · Bevestiging van uw Reservatie #${b.id}`,
    en: `Laser Magic · Confirmation of your Booking #${b.id}`
  };
  const emailSubject = subjects[lang] || subjects.fr;

  body.innerHTML = `
    <div style="background:#0b1120; border:1px solid var(--border-subtle); padding:10px 14px; border-radius:var(--radius-sm); margin-bottom:12px; font-size:0.85rem; color:var(--text-secondary); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
      <div><strong>Destinataire :</strong> <span style="color:#ffffff;">${b.customerName}</span> &lt;${b.email}&gt;</div>
      <div><strong>Langue Client :</strong> <span class="badge" style="background:rgba(0,240,255,0.12); color:var(--laser-cyan); font-weight:800; text-transform:uppercase; display:inline-flex; align-items:center; gap:6px; border-radius:var(--radius-full); padding:2px 8px 2px 3px;">${getRoundFlagSvg(lang, 16)} <span>${lang.toUpperCase()}</span></span></div>
      <div style="width:100%; margin-top:2px;"><strong>Objet :</strong> ${emailSubject}</div>
    </div>
    <iframe style="width:100%; height:450px; border:1px solid var(--border-subtle); border-radius:var(--radius-md); background:#ffffff;" id="email-preview-frame"></iframe>
  `;

  modal.classList.add('active');

  const frame = document.getElementById('email-preview-frame');
  if (frame) {
    frame.contentWindow.document.open();
    frame.contentWindow.document.write(emailHtml);
    frame.contentWindow.document.close();
  }

  if (copyBtn) {
    copyBtn.onclick = () => {
      window.copyClientLink(b.id);
    };
  }

  if (sendBtn) {
    sendBtn.onclick = async () => {
      const origHtml = sendBtn.innerHTML;
      sendBtn.disabled = true;
      sendBtn.innerHTML = `<span>Envoi en cours...</span>`;
      const res = await sendEmailNotification({ booking: b, type: 'confirmation' });
      sendBtn.disabled = false;
      sendBtn.innerHTML = origHtml;
      showAdminToast(`E-mail de confirmation (${lang.toUpperCase()}) envoyé via ${res.provider} à ${b.email} !`);
      modal.classList.remove('active');
      if (activeModalBooking && activeModalBooking.id === id) {
        openBookingDetailModal(id);
      }
      renderBookingsTable();
    };
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.classList.remove('active');
    };
  }
};

window.copyClientLink = (id) => {
  const b = store.getById(id);
  const lang = b ? (b.lang || 'fr') : undefined;
  const url = getClientPortalUrl(id, window.location.origin, lang);
  navigator.clipboard.writeText(url).then(() => {
    showAdminToast(`Lien client (${(lang || 'fr').toUpperCase()}) copié : ${url}`);
  }).catch(() => {
    prompt("Lien de confirmation client :", url);
  });
};

window.openClientPortal = (id) => {
  const b = store.getById(id);
  const lang = b ? (b.lang || 'fr') : undefined;
  window.open(getClientPortalUrl(id, window.location.origin, lang), '_blank');
};

window.payBalance = (id) => {
  const b = store.getById(id);
  if (!b) return;
  if (b.balanceDue <= 0) {
    showAdminToast("Le solde de cette réservation est déjà soldé (0 €).", "error");
    return;
  }
  const input = prompt(`Encaisser le solde sur place (Bancontact / Cash / Payconiq)\n\nDossier #${b.id} - ${b.customerName}\nSolde restant à régler : ${formatMoney(b.balanceDue)}\n\nEntrez le montant perçu en euros :`, b.balanceDue);
  if (input !== null) {
    const amt = parseFloat(input);
    if (!isNaN(amt) && amt > 0) {
      store.recordBalancePayment(id, amt, 'bancontact_onsite');
      showAdminToast(`Paiement de ${formatMoney(amt)} enregistré avec succès !`);
      renderAllViews();
      if (activeModalBooking && activeModalBooking.id === id) {
        openBookingDetailModal(id);
      }
    }
  }
};

window.deleteBooking = (id) => {
  if (confirm("Supprimer définitivement cette réservation ?")) {
    store.deleteBooking(id);
    const modal = document.getElementById('booking-modal-overlay');
    if (modal) modal.classList.remove('active');
    renderAllViews();
  }
};

window.previewBirthdayCoupon = (id) => {
  const b = store.getById(id);
  if (!b) return;
  const lang = b.lang || getLang() || 'fr';
  const modal = document.getElementById('birthday-coupon-modal');
  const body = document.getElementById('birthday-coupon-body');
  const title = document.getElementById('birthday-coupon-title');
  const sendBtn = document.getElementById('btn-send-birthday-coupon');
  const scheduleBtn = document.getElementById('btn-schedule-birthday-coupon');
  const closeBtn = document.getElementById('btn-close-birthday-modal');

  if (!modal || !body) return;

  const childName = b.childName || 'Lucas';
  const nextAge = (b.childAge || 10) + 1;
  const couponCode = `ANNIV-${childName.toUpperCase().replace(/[^A-Z]/g, '') || 'VIP'}-15`;
  const emailHtml = generateBirthdayCouponEmailHtml(b, lang, 15);

  if (title) {
    title.textContent = `Offre Anniversaire ${nextAge} ans · ${childName}`;
  }

  body.innerHTML = `
    <div style="background:#0b1120; border:1px solid rgba(255,27,123,0.3); padding:12px 16px; border-radius:var(--radius-md); margin-bottom:14px; font-size:0.85rem; color:var(--text-secondary); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <div style="font-weight:700; color:#ffffff; font-size:0.95rem;">${b.customerName} &lt;${b.email}&gt;</div>
        <div style="font-size:0.8rem; color:var(--laser-pink); margin-top:2px;">
          Enfant : <strong>${childName}</strong> (Né le ${b.childBirthDate ? formatBirthDate(b.childBirthDate) : 'Date à renseigner'}) · <strong>${nextAge} ans</strong> l'an prochain
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="badge" style="background:rgba(255,27,123,0.15); color:var(--laser-pink); font-weight:800; border:1px solid rgba(255,27,123,0.4); font-size:0.85rem; padding:4px 10px;">
          CODE : ${couponCode} (-15%)
        </span>
      </div>
    </div>
    <div style="background:rgba(0,255,136,0.06); border:1px solid rgba(0,255,136,0.25); border-radius:10px; padding:10px 14px; margin-bottom:14px; font-size:0.82rem; color:var(--laser-green); display:flex; align-items:center; gap:8px;">
      ${icon('check', 'text-green', 15)}
      <span><strong>Automatisation Active :</strong> Cet e-mail promotionnel est planifié pour être envoyé aux parents 30 jours avant le prochain anniversaire.</span>
    </div>
    <iframe style="width:100%; height:430px; border:1px solid var(--border-subtle); border-radius:var(--radius-md); background:#ffffff;" id="birthday-coupon-frame"></iframe>
  `;

  modal.classList.add('active');

  const frame = document.getElementById('birthday-coupon-frame');
  if (frame) {
    frame.contentWindow.document.open();
    frame.contentWindow.document.write(emailHtml);
    frame.contentWindow.document.close();
  }

  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }

  if (scheduleBtn) {
    scheduleBtn.onclick = () => {
      showAdminToast(`Automation confirmée : Relance anniversaire programmée à J-30 pour ${b.email} !`);
      modal.classList.remove('active');
    };
  }

  if (sendBtn) {
    sendBtn.onclick = async () => {
      const origHtml = sendBtn.innerHTML;
      sendBtn.disabled = true;
      sendBtn.innerHTML = `<span>Envoi du coupon en cours...</span>`;
      const res = await sendEmailNotification({ booking: b, type: 'birthday_coupon' });
      store.sendBirthdayCoupon(b.id, 15);
      sendBtn.disabled = false;
      sendBtn.innerHTML = origHtml;
      showAdminToast(`E-mail avec coupon -15% (${couponCode}) envoyé immédiatement via ${res.provider} à ${b.email} !`);
      modal.classList.remove('active');
      if (activeModalBooking && activeModalBooking.id === id) {
        openBookingDetailModal(id);
      }
      renderBookingsTable();
    };
  }
};

window.saveModalChanges = () => {
  if (!activeModalBooking) return;
  const sel = document.getElementById('modal-status-select');
  const dobInput = document.getElementById('modal-child-dob');
  const updates = {};
  if (sel) updates.status = sel.value;
  if (dobInput) {
    updates.childBirthDate = dobInput.value;
    if (dobInput.value) {
      const bYear = new Date(dobInput.value).getFullYear();
      const cYear = new Date(activeModalBooking.date || Date.now()).getFullYear();
      if (!isNaN(bYear)) {
        updates.childAge = Math.max(1, cYear - bYear);
      }
    }
  }
  store.updateBooking(activeModalBooking.id, updates);
  if (updates.status && updates.status !== activeModalBooking.status) {
    store.updateStatus(activeModalBooking.id, updates.status);
  }
  showAdminToast(`Dossier #${activeModalBooking.id} mis à jour avec succès !`);
  const modal = document.getElementById('booking-modal-overlay');
  if (modal) modal.classList.remove('active');
  renderAllViews();
};

window.printBookingSheet = (id) => {
  const b = store.getById(id);
  if (!b) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laser Magic - Fiche de Table #${b.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px; color: #111; }
        .head { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; }
        h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .box { border: 1px solid #ccc; padding: 12px; border-radius: 6px; }
        .table-roster { width: 100%; border-collapse: collapse; margin-top: 14px; }
        .table-roster th, .table-roster td { border: 1px solid #999; padding: 8px; text-align: left; }
        .table-roster th { background: #eee; }
        .badge { display: inline-block; padding: 3px 8px; background: #000; color: #fff; font-weight: bold; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="head">
        <div>
          <h1>LASER MAGIC · VILVOORDE</h1>
          <p>Fiche de Table & Briefing Accueil</p>
        </div>
        <div style="text-align: right;">
          <div style="background:#0f172a; color:#38bdf8; font-size:16px; font-weight:800; padding:6px 14px; border-radius:9999px; display:inline-block; margin-bottom:4px; border:1px solid #38bdf8;">COMMANDE N° ${String(b.orderNumber || 42).padStart(3, '0')}</div>
          <div class="badge" style="display:block; margin-top:4px;">DOSSIER #${b.id}</div>
          <p style="margin:4px 0 0 0;"><strong>Table N° ${b.tableNumber}</strong></p>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <strong>Organisateur :</strong> ${b.customerName}<br>
          <strong>Téléphone :</strong> ${b.phone}<br>
          <strong>Date & Heure :</strong> ${b.date} (${b.timeSlot})<br>
          <strong>Arène :</strong> ${b.arena.toUpperCase()}
        </div>
        <div class="box">
          <strong>Formule :</strong> ${b.packageName}<br>
          <strong>Nombre d'enfants :</strong> ${b.players}<br>
          <strong>Enfant fêté :</strong> ${b.childName || 'N/A'} (${b.childAge || ''} ans)<br>
          <strong>Reste à régler :</strong> ${formatMoney(b.balanceDue)} (Total: ${formatMoney(b.totalAmount)})
        </div>
      </div>

      <div class="box" style="margin-bottom: 16px;">
        <strong>Instructions Restauration :</strong>
        <p>• Collation : ${b.packageId === 'sweet' ? 'Mini Donuts' : (b.packageId === 'fun' ? 'Frites & Fricadelle' : 'VIP Tenders + Frites + Glace')}</p>
        <p>• Gâteau au chocolat : ${b.addons && b.addons.some(a => a.id === 'cake') ? 'OUI (Commandé)' : 'NON'}</p>
        <p>• Remarques / Allergies : ${b.specialNotes || 'Aucune'}</p>
      </div>

      <h3>Feuille des Équipes & Choix des Softs</h3>
      <table class="table-roster">
        <thead>
          <tr>
            <th style="width: 5%;">N°</th>
            <th style="width: 45%;">Équipe ROUGE (Prénom)</th>
            <th style="width: 45%;">Équipe BLEUE (Prénom)</th>
            <th style="width: 25%;">Choix Boisson Soft</th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: Math.ceil(b.players / 2) }).map((_, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${(b.teams && b.teams.red && b.teams.red[i]) || ''}</td>
              <td>${(b.teams && b.teams.blue && b.teams.blue[i]) || ''}</td>
              <td></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <script>
        window.print();
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

window.testApiEndpoint = (endpoint) => {
  const allBookings = store.getAll();
  const sampleBooking = allBookings[0] || {
    id: 'LM-8421',
    orderNumber: 42,
    orderCode: 'CMD-042',
    customerName: 'Jean-François Moreau',
    phone: '+32 470 12 34 56',
    packageName: 'Formule Fun',
    players: 10,
    totalAmount: 340,
    balanceDue: 240
  };

  let responseData = {};
  if (endpoint.includes('/api/v1/orders/42')) {
    responseData = {
      status: 'success',
      order: {
        order_number: sampleBooking.orderNumber || 42,
        order_code: sampleBooking.orderCode || 'CMD-042',
        booking_ref: sampleBooking.id,
        customer: sampleBooking.customerName,
        phone: sampleBooking.phone,
        items: [
          { name: sampleBooking.packageName, qty: sampleBooking.players, unit_price: 25 },
          { name: 'Jetons Arcade (Bonus)', qty: sampleBooking.players, unit_price: 0 }
        ],
        financials: {
          total: sampleBooking.totalAmount,
          deposit_paid: sampleBooking.depositPaid || 100,
          balance_due: sampleBooking.balanceDue || 240,
          currency: 'EUR'
        },
        pos_status: 'CONFIRMED_ON_POS'
      }
    };
  } else if (endpoint.includes('/api/v1/pos/sync')) {
    responseData = {
      status: 'synced',
      pos_system: 'LaserMagic_POS_Bridge',
      synced_orders_count: allBookings.length,
      last_sync_timestamp: new Date().toISOString(),
      active_daily_tickets: allBookings.slice(0, 5).map(b => ({
        order_num: b.orderNumber,
        table: b.tableNumber,
        slot: b.timeSlot
      })),
      message: 'Laser Magic bookings synchronized with kitchen & cash desk.'
    };
  } else {
    responseData = {
      status: 'success',
      total_count: allBookings.length,
      orders: allBookings.slice(0, 6).map(b => ({
        order_number: b.orderNumber,
        order_code: b.orderCode,
        id: b.id,
        customer: b.customerName,
        date: b.date,
        time: b.timeSlot,
        total: b.totalAmount
      }))
    };
  }

  // Switch to Webhooks subtab to show response preview and status
  const payloadPreview = document.getElementById('webhook-payload-preview');
  const lastStatus = document.getElementById('webhook-last-status');
  const webhooksSubtabBtn = document.querySelector('.integration-subtab-btn[data-subtab="webhooks"]');
  if (webhooksSubtabBtn) webhooksSubtabBtn.click();

  if (payloadPreview) {
    payloadPreview.textContent = JSON.stringify(responseData, null, 2);
  }
  if (lastStatus) {
    lastStatus.textContent = '200 OK (API Test)';
    lastStatus.style.background = 'rgba(0,255,136,0.15)';
    lastStatus.style.color = 'var(--laser-green)';
  }
  showAdminToast(`Réponse 200 OK reçue pour ${endpoint}`);
};

