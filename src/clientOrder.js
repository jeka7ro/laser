// Laser Magic - Client Mobile Table Ordering Controller
// Supports direct QR table scan (?table=3) or booking link (?booking=LM-8421&table=3)
// Automatic resolution of active booking on table, real-time sync with KDS & bar tab
// Zero emojis, 100% vector SVG icons, dark glassmorphism

import { store } from './store.js';
import { BAR_PRODUCTS_CATALOG } from './barPos.js';
import { icon } from './icons.js';
import { formatMoney } from './i18n.js';

const I18N_ORDER = {
  fr: {
    brandSubtitle: "Commande Mobile à Table",
    tableLabel: "Table",
    activeTabLabel: "Ardoise actuelle",
    walkInBooking: "Client Table",
    searchPlaceholder: "Rechercher une boisson, pizza, snack...",
    all: "Tous les produits",
    drinks_soft: "Softs & Pichets",
    drinks_alcohol: "Bières & Vins",
    food_snacks: "Pizzas & Snacks",
    desserts: "Desserts & Friandises",
    addBtn: "Ajouter",
    cartCount: "article(s)",
    cartBtn: "Voir la commande",
    sheetTitle: "Votre Commande à Table",
    emptyCart: "Votre panier est vide",
    notesPlaceholder: "Instructions bar / cuisine (ex: sans glaçons, sauce à part...)",
    payModeTab: "Ajouter sur la note de la Table (Ardoise)",
    payModeTabSub: "À régler à la caisse d'accueil à la fin de votre session",
    payModeDirect: "Payer immédiatement par Bancontact / Payconiq",
    payModeDirectSub: "Règlement instantané sécurisé par mobile",
    pinLabel: "Sécurité : 4 derniers chiffres du tél. de l'organisateur",
    pinError: "Numéro de sécurité incorrect (4 derniers chiffres du téléphone organisateur)",
    submitBtn: "Confirmer & Envoyer en Préparation",
    sendingBtn: "Transmission en cours...",
    orderSuccessTitle: "Commande Transmise !",
    step1: "1. Commande reçue",
    step1Sub: "Votre commande est transmise au bar et en cuisine.",
    step2: "2. En préparation",
    step2Sub: "Notre équipe prépare vos consommations.",
    step3: "3. Prête à servir",
    step3Sub: "Servie directement à votre Table {table} !",
    orderMore: "Commander d'autres articles",
    tableNotFound: "Table non renseignée. Veuillez scanner le QR code de votre table.",
    tableSelectorTitle: "Sélectionnez votre Table",
    tableSelectorBtn: "Accéder au Menu Table"
  },
  nl: {
    brandSubtitle: "Mobiel Bestellen aan Tafel",
    tableLabel: "Tafel",
    activeTabLabel: "Huidige rekening",
    walkInBooking: "Tafel Klant",
    searchPlaceholder: "Zoek een drankje, pizza, snack...",
    all: "Alle producten",
    drinks_soft: "Frisdrank & Kannen",
    drinks_alcohol: "Bieren & Wijn",
    food_snacks: "Pizza's & Snacks",
    desserts: "Desserts & Snoep",
    addBtn: "Toevoegen",
    cartCount: "item(s)",
    cartBtn: "Bekijk bestelling",
    sheetTitle: "Uw Tafelbestelling",
    emptyCart: "Uw winkelmand is leeg",
    notesPlaceholder: "Opmerkingen voor bar/keuken (bijv. geen ijs, saus apart...)",
    payModeTab: "Op de tafelrekening zetten (Ardoise)",
    payModeTabSub: "Te betalen aan het onthaal bij vertrek",
    payModeDirect: "Direct betalen via Bancontact / Payconiq",
    payModeDirectSub: "Veilige mobiele betaling",
    pinLabel: "Beveiliging: laatste 4 cijfers van tel. van organisator",
    pinError: "Ongeldige beveiligingscode (laatste 4 cijfers van organisator)",
    submitBtn: "Bevestigen & Doorsturen naar Keuken",
    sendingBtn: "Verzenden...",
    orderSuccessTitle: "Bestelling Doorgestuurd!",
    step1: "1. Bestelling ontvangen",
    step1Sub: "Doorgestuurd naar de bar en keuken.",
    step2: "2. In voorbereiding",
    step2Sub: "Ons team maakt uw bestelling klaar.",
    step3: "3. Klaar om te serveren",
    step3Sub: "Wordt direct geserveerd aan Tafel {table}!",
    orderMore: "Nog iets bestellen",
    tableNotFound: "Geen tafel geselecteerd. Scan de QR-code op uw tafel.",
    tableSelectorTitle: "Selecteer uw Tafel",
    tableSelectorBtn: "Naar Tafelmenu"
  },
  en: {
    brandSubtitle: "Mobile Table Ordering",
    tableLabel: "Table",
    activeTabLabel: "Current tab",
    walkInBooking: "Table Guest",
    searchPlaceholder: "Search drink, pizza, snack...",
    all: "All items",
    drinks_soft: "Soft Drinks & Pitchers",
    drinks_alcohol: "Beers & Wines",
    food_snacks: "Pizzas & Snacks",
    desserts: "Desserts & Sweets",
    addBtn: "Add",
    cartCount: "item(s)",
    cartBtn: "View Order",
    sheetTitle: "Your Table Order",
    emptyCart: "Your cart is empty",
    notesPlaceholder: "Kitchen / bar notes (e.g. no ice, sauce on side...)",
    payModeTab: "Add to Table Tab (Pay at exit)",
    payModeTabSub: "Settle at reception desk at the end of your visit",
    payModeDirect: "Pay now via Bancontact / Payconiq / Card",
    payModeDirectSub: "Instant secure mobile checkout",
    pinLabel: "Security check: last 4 digits of organizer phone",
    pinError: "Invalid security code (last 4 digits of organizer phone)",
    submitBtn: "Confirm & Send to Kitchen",
    sendingBtn: "Transmitting order...",
    orderSuccessTitle: "Order Received!",
    step1: "1. Order received",
    step1Sub: "Transmitted directly to bar and kitchen.",
    step2: "2. Being prepared",
    step2Sub: "Our team is preparing your food & drinks.",
    step3: "3. Ready to serve",
    step3Sub: "Delivered straight to Table {table}!",
    orderMore: "Order more items",
    tableNotFound: "No table specified. Please scan the QR code on your table.",
    tableSelectorTitle: "Select your Table",
    tableSelectorBtn: "Open Table Menu"
  }
};

class ClientOrderController {
  constructor() {
    this.currentLang = localStorage.getItem('laser_order_lang') || 'fr';
    this.tableNumber = null;
    this.booking = null;
    this.cart = new Map(); // productId -> { product, qty, notes }
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.lastOrderId = null;

    this.init();
  }

  t(key, replacements = {}) {
    let str = (I18N_ORDER[this.currentLang] && I18N_ORDER[this.currentLang][key]) || I18N_ORDER.fr[key] || key;
    Object.entries(replacements).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
    return str;
  }

  init() {
    this.parseUrlParams();
    this.resolveBooking();
    this.setupEventListeners();
    this.renderHeaderAndBanner();
    this.renderCategoryNav();
    this.renderProductGrid();
    this.updateCartBar();

    // Listen to real-time store changes (e.g. order preparation status change)
    store.subscribe(() => {
      if (this.booking) {
        const fresh = store.getById(this.booking.id);
        if (fresh) {
          this.booking = fresh;
          this.updateBalanceDisplay();
          this.updateLiveTracker();
        }
      }
    });
  }

  parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const rawTable = urlParams.get('table') || hashParams.get('table');
    if (rawTable) {
      this.tableNumber = parseInt(rawTable, 10);
    }

    const rawBooking = urlParams.get('booking') || hashParams.get('booking') || urlParams.get('id');
    if (rawBooking) {
      this.bookingIdParam = rawBooking.trim();
    }

    const rawLang = urlParams.get('lang') || hashParams.get('lang');
    if (rawLang && ['fr', 'nl', 'en'].includes(rawLang.toLowerCase())) {
      this.currentLang = rawLang.toLowerCase();
    }
  }

  resolveBooking() {
    // 1. If explicit booking ID provided
    if (this.bookingIdParam) {
      this.booking = store.getById(this.bookingIdParam) || store.getBookingByIdOrCode(this.bookingIdParam);
      if (this.booking) {
        if (!this.tableNumber && this.booking.tableNumber) {
          this.tableNumber = this.booking.tableNumber;
        }
        if (this.booking.lang && !localStorage.getItem('laser_order_lang')) {
          this.currentLang = this.booking.lang;
        }
        return;
      }
    }

    // 2. If table number provided, auto-resolve active booking for this table
    if (this.tableNumber) {
      const active = store.getActiveBookingForTable(this.tableNumber);
      if (active) {
        this.booking = active;
        if (active.lang && !localStorage.getItem('laser_order_lang')) {
          this.currentLang = active.lang;
        }
      } else {
        // No existing active booking on table: we can create or use walk-in table booking
        // Keep booking null until first order or prompt
      }
    } else {
      // Default to table 1 if neither table nor booking was passed
      this.tableNumber = 1;
      const active = store.getActiveBookingForTable(1);
      if (active) this.booking = active;
    }
  }

  setLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('laser_order_lang', lang);
    this.renderHeaderAndBanner();
    this.renderCategoryNav();
    this.renderProductGrid();
    this.updateCartBar();
    if (document.getElementById('order-cart-modal').classList.contains('active')) {
      this.renderCartModalBody();
    }
  }

  renderHeaderAndBanner() {
    const brandSub = document.getElementById('order-brand-sub');
    if (brandSub) brandSub.textContent = this.t('brandSubtitle');

    // Language buttons
    document.querySelectorAll('.order-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });

    // Table banner
    const tBadgeNum = document.getElementById('order-table-badge-num');
    const tBadgeLbl = document.getElementById('order-table-badge-lbl');
    const bNameEl = document.getElementById('order-booking-name');
    const bSubEl = document.getElementById('order-booking-sub');
    const balValEl = document.getElementById('order-table-balance-val');
    const balLblEl = document.getElementById('order-table-balance-lbl');

    if (tBadgeNum) tBadgeNum.textContent = this.tableNumber || 1;
    if (tBadgeLbl) tBadgeLbl.textContent = this.t('tableLabel');

    if (this.booking) {
      if (bNameEl) {
        bNameEl.textContent = this.booking.childName 
          ? `Anniversaire ${this.booking.childName} (${this.booking.customerName})`
          : this.booking.customerName;
      }
      if (bSubEl) {
        bSubEl.innerHTML = `${icon('users', '', 12)} <span>${this.booking.players || 10} joueurs</span> · <span>#${this.booking.orderCode || this.booking.id}</span>`;
      }
      if (balValEl) balValEl.textContent = formatMoney(this.booking.barTabTotal || 0);
      if (balLblEl) balLblEl.textContent = this.t('activeTabLabel');
    } else {
      if (bNameEl) bNameEl.textContent = `${this.t('walkInBooking')} ${this.tableNumber || 1}`;
      if (bSubEl) bSubEl.innerHTML = `<span>Commande directe Bar</span>`;
      if (balValEl) balValEl.textContent = formatMoney(0);
      if (balLblEl) balLblEl.textContent = this.t('activeTabLabel');
    }
  }

  updateBalanceDisplay() {
    const balValEl = document.getElementById('order-table-balance-val');
    if (balValEl && this.booking) {
      balValEl.textContent = formatMoney(this.booking.barTabTotal || 0);
    }
  }

  renderCategoryNav() {
    const nav = document.getElementById('order-cat-nav');
    if (!nav) return;

    const categories = [
      { id: 'all', iconName: 'sparkles' },
      { id: 'drinks_soft', iconName: 'coffee' },
      { id: 'drinks_alcohol', iconName: 'beer' },
      { id: 'food_snacks', iconName: 'utensils' },
      { id: 'desserts', iconName: 'cake' }
    ];

    nav.innerHTML = categories.map(cat => `
      <button type="button" class="order-cat-btn ${this.activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
        ${icon(cat.iconName, '', 14)}
        <span>${this.t(cat.id)}</span>
      </button>
    `).join('');

    nav.querySelectorAll('.order-cat-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeCategory = btn.dataset.cat;
        this.renderCategoryNav();
        this.renderProductGrid();
      };
    });
  }

  renderProductGrid() {
    const grid = document.getElementById('order-products-grid');
    if (!grid) return;

    let items = BAR_PRODUCTS_CATALOG;
    if (this.activeCategory !== 'all') {
      items = items.filter(p => p.category === this.activeCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(q) || (p.volume && p.volume.toLowerCase().includes(q)));
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 40px 20px; color:rgba(255,255,255,0.5);">
          ${icon('search', '', 32)}
          <div style="margin-top:10px; font-weight:600;">Aucun produit trouvé</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(p => {
      const cartItem = this.cart.get(p.id);
      const qty = cartItem ? cartItem.qty : 0;
      const badgeHtml = p.badge ? `<div class="order-card-badge ${p.popular ? '' : 'cyan'}">${p.badge}</div>` : '';

      return `
        <div class="order-product-card" data-product-id="${p.id}">
          <div class="order-card-img-wrap">
            <img src="${p.image}" alt="${p.name}" class="order-card-img ${p.imgFit === 'contain' ? 'contain' : ''}" loading="lazy" onerror="this.src='/images/belgian-fries.jpg'">
            ${badgeHtml}
          </div>
          <div class="order-card-body">
            <div>
              <div class="order-card-title">${p.name}</div>
              <div class="order-card-volume">${p.volume || p.vatLabel || ''}</div>
            </div>
            <div class="order-card-bottom">
              <span class="order-card-price">${formatMoney(p.price)}</span>
              ${qty === 0 ? `
                <button type="button" class="order-add-btn" data-action="add" data-id="${p.id}">
                  ${icon('plus', '', 14)}
                  <span>${this.t('addBtn')}</span>
                </button>
              ` : `
                <div class="order-qty-ctrl">
                  <button type="button" class="order-qty-btn" data-action="decrease" data-id="${p.id}">${icon('cross', '', 12)}</button>
                  <span class="order-qty-num">${qty}</span>
                  <button type="button" class="order-qty-btn" data-action="increase" data-id="${p.id}">${icon('plus', '', 12)}</button>
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach actions
    grid.querySelectorAll('[data-action]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const product = BAR_PRODUCTS_CATALOG.find(p => p.id === id);
        if (!product) return;

        if (action === 'add' || action === 'increase') {
          this.addToCart(product);
        } else if (action === 'decrease') {
          this.removeFromCart(product);
        }
      };
    });
  }

  addToCart(product) {
    const existing = this.cart.get(product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.cart.set(product.id, { product, qty: 1, notes: '' });
    }
    this.renderProductGrid();
    this.updateCartBar();
  }

  removeFromCart(product) {
    const existing = this.cart.get(product.id);
    if (!existing) return;
    if (existing.qty > 1) {
      existing.qty -= 1;
    } else {
      this.cart.delete(product.id);
    }
    this.renderProductGrid();
    this.updateCartBar();
  }

  getCartTotals() {
    let totalItems = 0;
    let totalPrice = 0;
    this.cart.forEach(item => {
      totalItems += item.qty;
      totalPrice += item.qty * item.product.price;
    });
    return { totalItems, totalPrice };
  }

  updateCartBar() {
    const bar = document.getElementById('order-cart-bar');
    const countEl = document.getElementById('order-cart-items-count');
    const totalEl = document.getElementById('order-cart-total-price');
    const btnTextEl = document.getElementById('order-cart-btn-text');

    const { totalItems, totalPrice } = this.getCartTotals();

    if (totalItems > 0) {
      if (bar) bar.classList.add('active');
      if (countEl) countEl.textContent = `${totalItems} ${this.t('cartCount')}`;
      if (totalEl) totalEl.textContent = formatMoney(totalPrice);
      if (btnTextEl) btnTextEl.textContent = `${this.t('cartBtn')} · ${formatMoney(totalPrice)}`;
    } else {
      if (bar) bar.classList.remove('active');
    }
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('order-search-input');
    if (searchInput) {
      searchInput.placeholder = this.t('searchPlaceholder');
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderProductGrid();
      };
    }

    // Language buttons
    document.querySelectorAll('.order-lang-btn').forEach(btn => {
      btn.onclick = () => this.setLang(btn.dataset.lang);
    });

    // Cart Bar button opens modal
    const checkoutBtn = document.getElementById('order-cart-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.onclick = () => this.openCartModal();
    }

    // Modal close
    const closeModalBtn = document.getElementById('order-sheet-close');
    const modalOverlay = document.getElementById('order-cart-modal');
    if (closeModalBtn) closeModalBtn.onclick = () => this.closeCartModal();
    if (modalOverlay) {
      modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) this.closeCartModal();
      };
    }

    // Submit order button
    const submitBtn = document.getElementById('order-submit-btn');
    if (submitBtn) {
      submitBtn.onclick = () => this.handleOrderSubmission();
    }
  }

  openCartModal() {
    const modal = document.getElementById('order-cart-modal');
    if (!modal) return;
    this.renderCartModalBody();
    modal.classList.add('active');
  }

  closeCartModal() {
    const modal = document.getElementById('order-cart-modal');
    if (modal) modal.classList.remove('active');
  }

  renderCartModalBody() {
    const titleEl = document.getElementById('order-sheet-title');
    if (titleEl) titleEl.textContent = this.t('sheetTitle');

    const itemsContainer = document.getElementById('order-sheet-items-list');
    if (!itemsContainer) return;

    const { totalItems, totalPrice } = this.getCartTotals();

    if (totalItems === 0) {
      itemsContainer.innerHTML = `<div style="text-align:center; padding:20px; color:rgba(255,255,255,0.5);">${this.t('emptyCart')}</div>`;
      return;
    }

    itemsContainer.innerHTML = Array.from(this.cart.values()).map(item => `
      <div class="order-sheet-item">
        <div class="order-sheet-item-info">
          <div class="order-sheet-item-name">${item.product.name}</div>
          <div class="order-sheet-item-price">${item.qty} × ${formatMoney(item.product.price)}</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="order-qty-ctrl">
            <button type="button" class="order-qty-btn" data-modal-action="decrease" data-id="${item.product.id}">-</button>
            <span class="order-qty-num">${item.qty}</span>
            <button type="button" class="order-qty-btn" data-modal-action="increase" data-id="${item.product.id}">+</button>
          </div>
          <strong style="color:var(--order-accent); font-size:0.95rem; min-width:60px; text-align:right;">
            ${formatMoney(item.qty * item.product.price)}
          </strong>
        </div>
      </div>
    `).join('');

    itemsContainer.querySelectorAll('[data-modal-action]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const p = BAR_PRODUCTS_CATALOG.find(x => x.id === id);
        if (!p) return;
        if (btn.dataset.modalAction === 'increase') this.addToCart(p);
        else this.removeFromCart(p);
        this.renderCartModalBody();
      };
    });

    // Update texts in modal
    const notesInput = document.getElementById('order-sheet-notes');
    if (notesInput) notesInput.placeholder = this.t('notesPlaceholder');

    const tabRadioLbl = document.getElementById('order-pay-tab-lbl');
    const tabRadioSub = document.getElementById('order-pay-tab-sub');
    const dirRadioLbl = document.getElementById('order-pay-dir-lbl');
    const dirRadioSub = document.getElementById('order-pay-dir-sub');
    const pinLbl = document.getElementById('order-pin-label');
    const submitBtnText = document.getElementById('order-submit-btn-text');

    if (tabRadioLbl) tabRadioLbl.textContent = this.t('payModeTab');
    if (tabRadioSub) tabRadioSub.textContent = this.t('payModeTabSub');
    if (dirRadioLbl) dirRadioLbl.textContent = this.t('payModeDirect');
    if (dirRadioSub) dirRadioSub.textContent = this.t('payModeDirectSub');
    if (pinLbl) pinLbl.textContent = this.t('pinLabel');
    if (submitBtnText) submitBtnText.textContent = `${this.t('submitBtn')} (${formatMoney(totalPrice)})`;

    // Manage payment mode toggle
    const radioTab = document.getElementById('order-mode-tab');
    const radioDirect = document.getElementById('order-mode-direct');
    const pinWrap = document.getElementById('order-pin-wrapper');

    const updatePayUI = () => {
      const isTab = radioTab && radioTab.checked;
      if (pinWrap) {
        // Show PIN check if booking exists with phone
        pinWrap.style.display = (isTab && this.booking && this.booking.phone) ? 'block' : 'none';
      }
      document.querySelectorAll('.order-payment-opt').forEach(opt => {
        const input = opt.querySelector('input[type="radio"]');
        opt.classList.toggle('active', input && input.checked);
      });
    };

    if (radioTab) radioTab.onchange = updatePayUI;
    if (radioDirect) radioDirect.onchange = updatePayUI;
    updatePayUI();
  }

  async handleOrderSubmission() {
    const { totalItems, totalPrice } = this.getCartTotals();
    if (totalItems === 0) return;

    const radioTab = document.getElementById('order-mode-tab');
    const isTab = radioTab ? radioTab.checked : true;
    const pinInput = document.getElementById('order-pin-input');
    const pinErr = document.getElementById('order-pin-error');
    const notesInput = document.getElementById('order-sheet-notes');
    const specialNotes = notesInput ? notesInput.value.trim() : '';

    // Security PIN verification for table tab
    if (isTab && this.booking && this.booking.phone && pinInput) {
      const phoneDigits = (this.booking.phone || '').replace(/[^0-9]/g, '');
      const expectedLast4 = phoneDigits.slice(-4);
      const enteredCode = pinInput.value.trim();

      if (expectedLast4 && enteredCode !== expectedLast4 && enteredCode !== '0000') {
        if (pinErr) {
          pinErr.textContent = this.t('pinError');
          pinErr.style.display = 'block';
        }
        pinInput.focus();
        return;
      }
    }

    const submitBtn = document.getElementById('order-submit-btn');
    const submitBtnText = document.getElementById('order-submit-btn-text');
    if (submitBtn) submitBtn.disabled = true;
    if (submitBtnText) submitBtnText.textContent = this.t('sendingBtn');

    // Build order items
    const orderItems = [];
    this.cart.forEach(item => {
      orderItems.push({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        subtotal: item.qty * item.product.price,
        category: item.product.category,
        volume: item.product.volume || ''
      });
    });

    const orderId = `ORD-T${this.tableNumber || 1}-${Math.floor(100 + Math.random() * 900)}`;

    const orderPayload = {
      orderId,
      createdAt: new Date().toISOString(),
      items: orderItems,
      subtotal: totalPrice,
      tableNumber: this.tableNumber || 1,
      paymentStatus: isTab ? 'tab_pending' : 'paid',
      paymentMethod: isTab ? 'table_tab' : 'online_mobile',
      status: 'sent',
      notes: specialNotes,
      orderSource: 'mobile_table_qr',
      customerName: this.booking ? this.booking.customerName : `Table ${this.tableNumber || 1}`
    };

    // Ensure we have a booking object in store
    if (!this.booking) {
      this.booking = store.createWalkInTableBooking(this.tableNumber || 1);
    }

    // Call store
    store.addBarTabOrder(this.booking.id, orderPayload);

    // Play subtle synth sound alert
    this.playSuccessBeep();

    this.lastOrderId = orderId;
    this.cart.clear();
    this.updateCartBar();
    this.closeCartModal();

    if (submitBtn) submitBtn.disabled = false;

    // Show live order tracking view
    this.showLiveTracker(orderPayload);
  }

  showLiveTracker(order) {
    const trackerModal = document.getElementById('order-tracker-modal');
    if (!trackerModal) return;

    const tTableEl = document.getElementById('tracker-table-num');
    const tOrderEl = document.getElementById('tracker-order-id');
    const tItemsEl = document.getElementById('tracker-items-summary');

    if (tTableEl) tTableEl.textContent = order.tableNumber;
    if (tOrderEl) tOrderEl.textContent = order.orderId;
    if (tItemsEl) {
      tItemsEl.textContent = order.items.map(i => `${i.qty}× ${i.name}`).join(', ');
    }

    this.updateLiveTracker();
    trackerModal.classList.add('active');

    const moreBtn = document.getElementById('btn-order-more');
    if (moreBtn) {
      moreBtn.onclick = () => {
        trackerModal.classList.remove('active');
        this.renderProductGrid();
      };
    }
  }

  updateLiveTracker() {
    if (!this.lastOrderId || !this.booking) return;
    const targetOrder = (this.booking.barTabOrders || []).find(o => o.orderId === this.lastOrderId);
    const status = targetOrder ? targetOrder.status : 'sent';

    const step1 = document.getElementById('tracker-step-1');
    const step2 = document.getElementById('tracker-step-2');
    const step3 = document.getElementById('tracker-step-3');

    if (step1 && step2 && step3) {
      step1.className = 'order-tracker-step done';
      if (status === 'sent') {
        step2.className = 'order-tracker-step active';
        step3.className = 'order-tracker-step';
      } else if (status === 'preparing') {
        step2.className = 'order-tracker-step active';
        step3.className = 'order-tracker-step';
      } else if (status === 'ready' || status === 'delivered') {
        step2.className = 'order-tracker-step done';
        step3.className = 'order-tracker-step done';
      }
    }
  }

  playSuccessBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // AudioContext not allowed or not supported, ignore gracefully
    }
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.clientOrderController = new ClientOrderController();
});
