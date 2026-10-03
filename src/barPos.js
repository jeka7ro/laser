// Laser Magic - Bar, Kitchen & Snacks POS / Client Tab Engine
// Allows tracking live food & drinks consumption per reservation table
// Zero emojis, 100% SVG vectors, dark glassmorphism

import { icon } from './icons.js';
import { formatMoney } from './i18n.js';
import { store } from './store.js';

export const BAR_PRODUCTS_CATALOG = [
  // 1. BOISSONS SOFTS & PICHETS (TVA 21% Horeca)
  {
    id: 'coca',
    name: 'Coca-Cola Original',
    category: 'drinks_soft',
    price: 3.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '33cl',
    image: '/images/coca-cola.jpg',
    imgFit: 'contain',
    popular: true
  },
  {
    id: 'coca_zero',
    name: 'Coca-Cola Zero Sucre',
    category: 'drinks_soft',
    price: 3.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '33cl',
    image: '/images/coca-zero.jpg',
    imgFit: 'contain',
    popular: true
  },
  {
    id: 'fanta',
    name: 'Fanta Orange',
    category: 'drinks_soft',
    price: 3.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '33cl',
    image: '/images/fanta-orange.jpg',
    imgFit: 'contain'
  },
  {
    id: 'sprite',
    name: 'Sprite Citron',
    category: 'drinks_soft',
    price: 3.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '33cl',
    image: '/images/sprite.jpg',
    imgFit: 'contain'
  },
  {
    id: 'fuze_tea',
    name: 'Fuze Tea Pêche Intense',
    category: 'drinks_soft',
    price: 3.20,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '33cl',
    image: '/images/fuze-tea.jpg',
    imgFit: 'contain'
  },
  {
    id: 'red_bull',
    name: 'Red Bull Energy Drink',
    category: 'drinks_soft',
    price: 4.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '25cl',
    image: '/images/red-bull.jpg',
    imgFit: 'contain'
  },
  {
    id: 'water_still',
    name: 'Chaudfontaine Plate',
    category: 'drinks_soft',
    price: 2.50,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '50cl',
    image: '/images/water-bottle.jpg',
    imgFit: 'contain'
  },
  {
    id: 'water_sparkling',
    name: 'Chaudfontaine Pétillante',
    category: 'drinks_soft',
    price: 2.50,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '50cl',
    image: '/images/water-bottle.jpg',
    imgFit: 'contain'
  },
  {
    id: 'pitcher_soft',
    name: 'Pichet Géant Soft au choix',
    category: 'drinks_soft',
    price: 9.50,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '1.5L',
    image: '/images/pitcher-soft.jpg',
    imgFit: 'contain',
    popular: true,
    badge: 'Idéal Table'
  },

  // 2. BIÈRES BELGES & VINS (TVA 21% Horeca)
  {
    id: 'stella',
    name: 'Stella Artois Pression',
    category: 'drinks_alcohol',
    price: 3.50,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '25cl',
    image: '/images/biere-abbaye.jpg',
    imgFit: 'contain',
    popular: true
  },
  {
    id: 'leffe_blonde',
    name: 'Leffe Blonde d’Abbaye',
    category: 'drinks_alcohol',
    price: 4.50,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '33cl',
    image: '/images/biere-abbaye.jpg',
    imgFit: 'contain',
    popular: true
  },
  {
    id: 'duvel',
    name: 'Duvel Belge Spéciale',
    category: 'drinks_alcohol',
    price: 5.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '33cl',
    image: '/images/biere-abbaye.jpg',
    imgFit: 'contain'
  },
  {
    id: 'corona',
    name: 'Corona Extra avec Rondelle',
    category: 'drinks_alcohol',
    price: 4.80,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '33cl',
    image: '/images/biere-belge.jpg',
    imgFit: 'contain'
  },
  {
    id: 'champagne_bottle',
    name: 'Bouteille Cava Brut Reserva',
    category: 'drinks_alcohol',
    price: 28.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '75cl',
    image: '/images/cava-reserva.jpg',
    imgFit: 'contain',
    badge: 'Corporate & VIP'
  },
  {
    id: 'wine_glass',
    name: 'Verre de Vin Réserve (Rouge/Blanc)',
    category: 'drinks_alcohol',
    price: 4.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '15cl',
    image: '/images/cava-reserva.jpg',
    imgFit: 'contain'
  },

  // 3. SNACKS, PIZZAS & RESTAURATION (TVA 12% Nourriture Horeca Belgique)
  {
    id: 'pizza_margherita',
    name: 'Pizza Artisanale Margherita',
    category: 'food_snacks',
    price: 11.00,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: '30cm · Mozzarella & Basilic',
    image: '/images/pizza-margherita.jpg',
    imgFit: 'cover',
    popular: true,
    badge: 'Au Feu de Bois'
  },
  {
    id: 'pizza_pepperoni',
    name: 'Pizza Artisanale Pepperoni',
    category: 'food_snacks',
    price: 12.50,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: '30cm · Épicée',
    image: '/images/pizza-pepperoni.jpg',
    imgFit: 'cover',
    popular: true,
    badge: 'Bestseller'
  },
  {
    id: 'portion_frites',
    name: 'Grande Portion Frites Belges & Sauces',
    category: 'food_snacks',
    price: 4.50,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: 'Portion généreuse double cuisson',
    image: '/images/belgian-fries.jpg',
    imgFit: 'cover',
    popular: true,
    badge: 'Fait Maison'
  },
  {
    id: 'fricadelle',
    name: 'Fricadelle Artisanale Belge',
    category: 'food_snacks',
    price: 2.50,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: '1 pièce avec sauces & oignons',
    image: '/images/fricadelle.jpg',
    imgFit: 'cover'
  },
  {
    id: 'tenders',
    name: 'Panier Tenders Poulet Croustillant',
    category: 'food_snacks',
    price: 7.50,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: '8 pièces + 2 sauces',
    image: '/images/chicken-tenders.jpg',
    imgFit: 'cover',
    popular: true
  },
  {
    id: 'nachos',
    name: 'Nachos Fromage Fondu & Guacamole',
    category: 'food_snacks',
    price: 6.50,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: 'Plat chaud à partager',
    image: '/images/nachos-cheese.jpg',
    imgFit: 'cover'
  },
  {
    id: 'planche_tapas',
    name: 'Planche Mixte Charcuterie & Fromages',
    category: 'food_snacks',
    price: 14.00,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: '3-4 personnes',
    image: '/images/snacks-frites.jpg',
    imgFit: 'cover',
    badge: 'Team Building'
  },

  // 4. SUCRÉ, GÂTEAUX & GOÛTER (TVA 12% Nourriture Horeca Belgique)
  {
    id: 'cake_chocolate',
    name: 'Gâteau Chocolat Moelleux Bougies',
    category: 'food_sweets',
    price: 35.00,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: '10 personnes',
    image: '/images/addon-cake.jpg',
    imgFit: 'cover',
    badge: 'Anniversaire'
  },
  {
    id: 'donuts_box',
    name: 'Boîte de 12 Mini Donuts Glacés',
    category: 'food_sweets',
    price: 18.00,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: '12 pièces assorties',
    image: '/images/donuts-box.jpg',
    imgFit: 'cover',
    popular: true
  },
  {
    id: 'crepes_platter',
    name: 'Assiette de 6 Crêpes Chaudes Nutella',
    category: 'food_sweets',
    price: 9.00,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: '6 crêpes artisanales',
    image: '/images/package-sweet.jpg',
    imgFit: 'cover'
  },
  {
    id: 'candy_bowl',
    name: 'Corbeille Géante Bonbons Fluo & Chips',
    category: 'food_sweets',
    price: 6.00,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: 'Partage fête',
    image: '/images/package-fun.jpg',
    imgFit: 'cover'
  },
  {
    id: 'ice_cream',
    name: 'Glace Bâtonnet / Cornet Magnum',
    category: 'food_sweets',
    price: 2.80,
    vatRate: 0.12,
    vatLabel: 'TVA 12% (Food)',
    volume: '1 pièce',
    image: '/images/package-vip.jpg',
    imgFit: 'cover'
  },

  // 5. JETONS ARCADE & EXTRAS (TVA 21% Loisirs)
  {
    id: 'arcade_tokens_10',
    name: 'Pack 10 Jetons Salle Arcade',
    category: 'extras_games',
    price: 10.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '10 jetons',
    image: '/images/addon-arcade.avif',
    imgFit: 'contain',
    popular: true
  },
  {
    id: 'arcade_tokens_25',
    name: 'Pack 25 Jetons Arcade VIP (+5 Offerts)',
    category: 'extras_games',
    price: 20.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '25 jetons',
    image: '/images/addon-arcade.avif',
    imgFit: 'contain',
    badge: 'Offre Spéciale'
  },
  {
    id: 'extra_laser_round',
    name: 'Session Laser Game Extra (15 min)',
    category: 'extras_games',
    price: 7.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '1 joueur',
    image: '/images/addon-laser.avif',
    imgFit: 'cover'
  },
  {
    id: 'minigolf_round',
    name: 'Parcours Mini-Golf Extérieur (12 trous)',
    category: 'extras_games',
    price: 5.00,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: '1 joueur',
    image: '/images/addon-minigolf-real.avif',
    imgFit: 'cover'
  },
  {
    id: 'medal_laser',
    name: 'Médaille Métal Gravée Laser Magic',
    category: 'extras_games',
    price: 4.50,
    vatRate: 0.21,
    vatLabel: 'TVA 21%',
    volume: 'Souvenir',
    image: '/images/package-vip.jpg',
    imgFit: 'contain'
  }
];

export function getBarProduct(id) {
  return BAR_PRODUCTS_CATALOG.find(p => p.id === id);
}

export function getAllBarProducts() {
  return [...BAR_PRODUCTS_CATALOG];
}

export function getBarProductsByCategory(cat) {
  if (!cat || cat === 'all') return BAR_PRODUCTS_CATALOG;
  return BAR_PRODUCTS_CATALOG.filter(p => p.category === cat);
}

// Global active cart for the open POS modal session
let currentPosBookingId = null;
let currentPosCart = {}; // { [productId]: qty }
let activeCategory = 'all';

/**
 * Open the Bar & Snacks POS Modal for a specific reservation (or first active table by default)
 */
export function openBarPosModal(bookingId) {
  let b = bookingId ? store.getById(bookingId) : null;
  if (!b) {
    const all = store.getAll();
    b = all.find(item => item.status !== 'cancelled') || all[0];
  }
  if (!b) return;

  currentPosBookingId = b.id;
  currentPosCart = {};
  activeCategory = 'all';

  const modal = document.getElementById('bar-pos-modal');
  if (!modal) return;

  renderPosModalContent(b);
  modal.classList.add('active');
}

export function closeBarPosModal() {
  const modal = document.getElementById('bar-pos-modal');
  if (modal) modal.classList.remove('active');
  currentPosBookingId = null;
  currentPosCart = {};
}

// Attach globally
if (typeof window !== 'undefined') {
  window.openBarPosModal = openBarPosModal;
  window.openBarPos = openBarPosModal;
  window.closeBarPosModal = closeBarPosModal;
}

function renderPosModalContent(booking) {
  const modalBody = document.getElementById('bar-pos-modal-body');
  if (!modalBody) return;

  const b = booking || store.getById(currentPosBookingId);
  if (!b) return;

  const allBookings = store.getAll().filter(item => item.status !== 'cancelled');
  const currentTabOrders = b.barTabOrders || [];
  const existingTabTotal = currentTabOrders.reduce((acc, o) => acc + (o.subtotal || 0), 0);
  const unpaidTabTotal = currentTabOrders
    .filter(o => o.paymentStatus !== 'paid')
    .reduce((acc, o) => acc + (o.subtotal || 0), 0);

  modalBody.innerHTML = `
    <div class="pos-split-layout">
      <!-- LEFT: Catalog Browser -->
      <div class="pos-left-pane">
        <!-- Header & Table Switcher -->
        <div style="margin-bottom:12px;">
          <div class="pos-toolbar-wrap">
            <!-- Table Switcher Dropdown -->
            <div class="pos-table-selector-box">
              <span class="pos-table-badge">
                TABLE N° ${b.tableNumber || 1}
              </span>
              <select id="pos-table-selector" class="pos-table-select">
                ${allBookings.map(bk => `
                  <option value="${bk.id}" ${bk.id === b.id ? 'selected' : ''}>
                    Table ${bk.tableNumber || 1} · ${bk.customerName} (${bk.orderCode || bk.id})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Search input -->
            <div class="pos-search-wrapper">
              <span class="pos-search-icon">
                ${icon('search', '', 14)}
              </span>
              <input type="text" id="pos-search-input" class="pos-search-input" placeholder="Rechercher pizza, boisson...">
            </div>
          </div>

          <!-- Category filter pills -->
          <div class="pos-cat-pills">
            <button type="button" class="pos-cat-btn ${activeCategory === 'all' ? 'active-cat' : ''}" data-cat="all">
              Tous (${BAR_PRODUCTS_CATALOG.length})
            </button>
            <button type="button" class="pos-cat-btn ${activeCategory === 'food_snacks' ? 'active-cat' : ''}" data-cat="food_snacks">
              Pizzas & Frites (TVA 12%)
            </button>
            <button type="button" class="pos-cat-btn ${activeCategory === 'drinks_soft' ? 'active-cat' : ''}" data-cat="drinks_soft">
              Softs & Pichets (TVA 21%)
            </button>
            <button type="button" class="pos-cat-btn ${activeCategory === 'drinks_alcohol' ? 'active-cat' : ''}" data-cat="drinks_alcohol">
              Bières & Vins (TVA 21%)
            </button>
            <button type="button" class="pos-cat-btn ${activeCategory === 'food_sweets' ? 'active-cat' : ''}" data-cat="food_sweets">
              Gâteaux & Goûter (TVA 12%)
            </button>
            <button type="button" class="pos-cat-btn ${activeCategory === 'extras_games' ? 'active-cat' : ''}" data-cat="extras_games">
              Jetons & Loisirs (TVA 21%)
            </button>
          </div>
        </div>

        <!-- Products Grid Container -->
        <div id="pos-products-grid" class="pos-products-grid">
          <!-- Injected via renderProductsGrid -->
        </div>
      </div>

      <!-- RIGHT: Current Cart & Running Tab History -->
      <div class="pos-right-pane">
        <div class="pos-right-header" style="white-space:nowrap; gap:10px;">
          <h4 class="pos-right-title" style="white-space:nowrap; flex-shrink:0;">
            ${icon('wallet', 'text-cyan', 16)}
            <span style="white-space:nowrap;">Ardoise Table&nbsp;${b.tableNumber || 1}</span>
          </h4>
          <span class="pos-balance-tag" style="white-space:nowrap; flex-shrink:0;">
            Solde restant&nbsp;:&nbsp;<strong style="white-space:nowrap;">${formatMoney(b.balanceDue || 0)}</strong>
          </span>
        </div>

        <!-- Scrollable Active Cart Items -->
        <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:4px;">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Articles en cours d'ajout :</div>
          <div id="pos-cart-items-wrap" style="display:flex; flex-direction:column; gap:6px;">
            <!-- Cart items injected here -->
          </div>

          <!-- Previously Ordered Tab History -->
          <div style="margin-top:14px; border-top:1px dashed var(--border-subtle); padding-top:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Déjà servi à table (${currentTabOrders.length} commandes) :</span>
              <span style="font-size:0.8rem; font-weight:700; color:${unpaidTabTotal > 0 ? '#f59e0b' : 'var(--laser-green)'};">
                ${unpaidTabTotal > 0 ? `À régler : ${formatMoney(unpaidTabTotal)}` : `Réglé (${formatMoney(existingTabTotal)})`}
              </span>
            </div>
            <div class="pos-history-box">
              ${currentTabOrders.length === 0 ? `
                <div style="color:var(--text-muted); font-style:italic; padding:4px 0;">Aucune consommation précédente sur cette table.</div>
              ` : currentTabOrders.map(order => `
                <div class="pos-history-row">
                  <div>
                    <strong>${(order.items || []).map(i => `${i.qty}× ${i.name}`).join(', ')}</strong>
                    <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">${new Date(order.timestamp).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-weight:700; color:var(--text-white);">${formatMoney(order.subtotal || 0)}</div>
                    <span class="badge" style="font-size:0.65rem; padding:1px 5px; background:${order.paymentStatus === 'paid' ? 'rgba(0,255,136,0.15)' : 'rgba(245,158,11,0.15)'}; color:${order.paymentStatus === 'paid' ? 'var(--laser-green)' : '#f59e0b'};">
                      ${order.paymentStatus === 'paid' ? 'RÉGLÉ' : 'SUR NOTE'}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- POS Foot: Totals, VAT Breakdown & Action Buttons -->
        <div class="pos-foot-card">
          <!-- Ventilation Fiscale TVA Live Breakdown -->
          <div id="pos-vat-breakdown-box" class="pos-vat-breakdown-card">
            <div class="pos-vat-head">
              <span>Ventilation TVA (Horeca BE)</span>
              <span id="pos-calc-total-ht" style="font-weight:800; white-space:nowrap;">0,00&nbsp;€ HT</span>
            </div>
            <div style="display:flex; justify-content:space-between; color:var(--text-secondary); margin-bottom:3px; white-space:nowrap;">
              <span>Alimentation & Pizzas (TVA 12%) :</span>
              <strong id="pos-calc-vat-12" style="color:#b45309; font-weight:700; white-space:nowrap;">0,00&nbsp;€</strong>
            </div>
            <div style="display:flex; justify-content:space-between; color:var(--text-secondary); margin-bottom:2px; white-space:nowrap;">
              <span>Boissons & Loisirs (TVA 21%) :</span>
              <strong id="pos-calc-vat-21" style="color:#0284c7; font-weight:700; white-space:nowrap;">0,00&nbsp;€</strong>
            </div>
          </div>

          <div class="pos-total-row" style="white-space:nowrap;">
            <span>Total TTC à ajouter :</span>
            <span id="pos-calc-total" class="pos-total-amount" style="white-space:nowrap;">0,00&nbsp;€</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <button type="button" class="btn btn-primary" id="btn-pos-add-to-tab" style="justify-content:center; padding:10px; font-size:0.84rem; border-radius:var(--radius-full); font-weight:800;">
              ${icon('plus', '', 14)}
              <span>Mettre sur l'Ardoise</span>
            </button>
            <button type="button" class="pos-btn-pay-direct" id="btn-pos-pay-now">
              ${icon('creditCard', '', 14)}
              <span>Encaisser Direct</span>
            </button>
          </div>
          ${unpaidTabTotal > 0 ? `
            <button type="button" class="btn btn-secondary" id="btn-pos-settle-all-tab" style="width:100%; justify-content:center; margin-top:8px; padding:8px; font-size:0.8rem; border-radius:var(--radius-full); color:#b45309; border-color:rgba(245,158,11,0.4); font-weight:700;">
              ${icon('checkCircle', '', 13)}
              <span>Régler toute l'ardoise table (${formatMoney(unpaidTabTotal)})</span>
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Attach table selector switch
  const tableSelector = document.getElementById('pos-table-selector');
  if (tableSelector) {
    tableSelector.onchange = () => {
      const selectedId = tableSelector.value;
      currentPosBookingId = selectedId;
      currentPosCart = {};
      const targetB = store.getById(selectedId);
      renderPosModalContent(targetB);
    };
  }

  // Attach search and category buttons
  const searchInput = document.getElementById('pos-search-input');
  if (searchInput) {
    searchInput.oninput = () => {
      renderProductsGrid(searchInput.value.trim().toLowerCase());
    };
  }

  const catBtns = modalBody.querySelectorAll('.pos-cat-btn');
  catBtns.forEach(btn => {
    btn.onclick = () => {
      activeCategory = btn.dataset.cat;
      catBtns.forEach(b => b.classList.remove('active-cat'));
      btn.classList.add('active-cat');
      renderProductsGrid(searchInput ? searchInput.value.trim().toLowerCase() : '');
    };
  });

  // Action buttons
  const addToTabBtn = document.getElementById('btn-pos-add-to-tab');
  const payNowBtn = document.getElementById('btn-pos-pay-now');
  const settleAllBtn = document.getElementById('btn-pos-settle-all-tab');

  if (addToTabBtn) {
    addToTabBtn.onclick = () => {
      handleFinalizePosOrder('tab_pending');
    };
  }

  if (payNowBtn) {
    payNowBtn.onclick = () => {
      handleFinalizePosOrder('bancontact_direct');
    };
  }

  if (settleAllBtn) {
    settleAllBtn.onclick = () => {
      handleSettleAllTab(b.id, unpaidTabTotal);
    };
  }

  renderProductsGrid();
  updateCartView();
}

function renderProductsGrid(filterText = '') {
  const grid = document.getElementById('pos-products-grid');
  if (!grid) return;

  let items = getBarProductsByCategory(activeCategory);
  if (filterText) {
    items = items.filter(p => p.name.toLowerCase().includes(filterText) || (p.volume && p.volume.toLowerCase().includes(filterText)));
  }

  grid.innerHTML = items.map(p => {
    const qty = currentPosCart[p.id] || 0;
    const vatRate = p.vatRate || (p.category.startsWith('food') ? 0.12 : 0.21);
    const priceHt = p.price / (1 + vatRate);
    const isFood = vatRate === 0.12;

    return `
      <div class="pos-product-card ${qty > 0 ? 'selected' : ''}">
        <!-- VAT Badge -->
        <span class="${isFood ? 'pos-vat-pill-food' : 'pos-vat-pill-drink'}">
          ${isFood ? 'TVA 12% Food' : 'TVA 21%'}
        </span>

        ${p.badge ? `
          <span class="pos-special-badge">
            ${p.badge}
          </span>
        ` : ''}

        <!-- Product Image -->
        <div class="pos-img-box">
          <img src="${p.image}" alt="${p.name}" class="${p.imgFit === 'contain' ? 'img-contain' : ''}" loading="lazy">
        </div>

        <div>
          <div class="pos-card-name">${p.name}</div>
          <div class="pos-card-volume">${p.volume || ''}</div>
        </div>

        <div class="pos-card-bottom">
          <div>
            <div class="pos-price-ttc">${formatMoney(p.price)}</div>
            <div class="pos-price-ht">${formatMoney(priceHt)} HT</div>
          </div>
          <div class="pos-qty-controls">
            ${qty > 0 ? `
              <button type="button" class="pos-btn-circle-minus btn-minus" data-id="${p.id}" aria-label="Moins">-</button>
              <span class="pos-qty-label">${qty}</span>
            ` : ''}
            <button type="button" class="pos-btn-circle-plus btn-plus" data-id="${p.id}" aria-label="Plus">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Wire plus and minus clicks
  grid.querySelectorAll('.btn-plus').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      currentPosCart[id] = (currentPosCart[id] || 0) + 1;
      renderProductsGrid(filterText);
      updateCartView();
    };
  });

  grid.querySelectorAll('.btn-minus').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (currentPosCart[id] > 1) {
        currentPosCart[id]--;
      } else {
        delete currentPosCart[id];
      }
      renderProductsGrid(filterText);
      updateCartView();
    };
  });
}

function updateCartView() {
  const cartWrap = document.getElementById('pos-cart-items-wrap');
  const totalHtEl = document.getElementById('pos-calc-total-ht');
  const vat12El = document.getElementById('pos-calc-vat-12');
  const vat21El = document.getElementById('pos-calc-vat-21');
  const totalEl = document.getElementById('pos-calc-total');
  const addBtn = document.getElementById('btn-pos-add-to-tab');
  const payBtn = document.getElementById('btn-pos-pay-now');

  if (!cartWrap) return;

  const itemKeys = Object.keys(currentPosCart);
  if (itemKeys.length === 0) {
    cartWrap.innerHTML = `
      <div style="padding:18px 14px; text-align:center; color:var(--text-muted); font-size:0.82rem; border:1px dashed var(--border-subtle); border-radius:10px;">
        L'ardoise est vide.<br>Cliquez sur le bouton <strong>[+]</strong> d'une pizza ou boisson pour l'ajouter.
      </div>
    `;
    if (totalHtEl) totalHtEl.textContent = '0,00\u00A0€ HT';
    if (vat12El) vat12El.textContent = '0,00\u00A0€';
    if (vat21El) vat21El.textContent = '0,00\u00A0€';
    if (totalEl) totalEl.textContent = '0,00\u00A0€';
    if (addBtn) addBtn.disabled = true;
    if (payBtn) payBtn.disabled = true;
    return;
  }

  if (addBtn) addBtn.disabled = false;
  if (payBtn) payBtn.disabled = false;

  let grandTotalTtc = 0;
  let foodTtc = 0;
  let drinksTtc = 0;

  cartWrap.innerHTML = itemKeys.map(id => {
    const p = getBarProduct(id);
    if (!p) return '';
    const qty = currentPosCart[id];
    const itemTotal = qty * p.price;
    grandTotalTtc += itemTotal;

    const vatRate = p.vatRate || (p.category.startsWith('food') ? 0.12 : 0.21);
    if (vatRate === 0.12) {
      foodTtc += itemTotal;
    } else {
      drinksTtc += itemTotal;
    }

    return `
      <div class="pos-cart-item">
        <div>
          <div class="pos-cart-item-name">${p.name}</div>
          <div class="pos-cart-item-sub">
            <span>${qty} × ${formatMoney(p.price)}</span>
            <span class="${vatRate === 0.12 ? 'pos-vat-pill-food' : 'pos-vat-pill-drink'}" style="position:static; padding:1px 5px; font-size:0.62rem;">${p.vatLabel}</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="pos-cart-item-price">${formatMoney(itemTotal)}</span>
          <button type="button" class="btn-remove-item" data-id="${id}" style="background:none; border:none; color:var(--laser-red); cursor:pointer; padding:3px; display:flex;" aria-label="Supprimer">
            ${icon('trash', '', 14)}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Precise Belgian VAT calculation
  const foodHt = foodTtc / 1.12;
  const foodVat = foodTtc - foodHt;
  const drinksHt = drinksTtc / 1.21;
  const drinksVat = drinksTtc - drinksHt;
  const totalHt = foodHt + drinksHt;

  if (totalHtEl) totalHtEl.textContent = `${formatMoney(totalHt)} HT`;
  if (vat12El) vat12El.textContent = `+${formatMoney(foodVat)} (sur ${formatMoney(foodHt)} HT)`;
  if (vat21El) vat21El.textContent = `+${formatMoney(drinksVat)} (sur ${formatMoney(drinksHt)} HT)`;
  if (totalEl) totalEl.textContent = formatMoney(grandTotalTtc);

  cartWrap.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      delete currentPosCart[id];
      renderProductsGrid();
      updateCartView();
    };
  });
}

function handleFinalizePosOrder(paymentMethod = 'tab_pending') {
  const itemKeys = Object.keys(currentPosCart);
  if (itemKeys.length === 0 || !currentPosBookingId) return;

  const b = store.getById(currentPosBookingId);
  if (!b) return;

  const items = itemKeys.map(id => {
    const p = getBarProduct(id);
    const qty = currentPosCart[id];
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      qty: qty,
      unitPrice: p.price,
      total: qty * p.price,
      image: p.image
    };
  });

  const orderSubtotal = items.reduce((acc, i) => acc + i.total, 0);
  const orderNumber = (b.barTabOrders?.length || 0) + 1;
  const orderId = `TAB-${b.orderNumber || b.id.replace('LM-', '')}-${orderNumber}`;

  const newOrder = {
    orderId,
    timestamp: new Date().toISOString(),
    items,
    subtotal: orderSubtotal,
    status: 'served',
    paymentStatus: paymentMethod === 'tab_pending' ? 'unpaid' : 'paid',
    paymentMethod: paymentMethod === 'tab_pending' ? 'tab_pending' : 'bancontact'
  };

  const existingOrders = b.barTabOrders || [];
  const updatedOrders = [...existingOrders, newOrder];
  const barTabTotal = updatedOrders.reduce((acc, o) => acc + (o.subtotal || 0), 0);

  // Recalculate booking totalAmount and balanceDue
  const originalSubtotal = b.subtotal || (b.players * (b.unitPrice || 26));
  const addonsTotal = b.addonsTotal || 0;
  const totalAmount = originalSubtotal + addonsTotal + barTabTotal;

  let depositPaid = b.depositPaid || 0;
  if (paymentMethod !== 'tab_pending') {
    depositPaid += orderSubtotal;
  }
  const balanceDue = Math.max(0, totalAmount - depositPaid);

  const commLog = b.communicationLog || [];
  commLog.unshift({
    timestamp: new Date().toISOString(),
    channel: 'onsite',
    type: 'bar_consumption',
    status: paymentMethod === 'tab_pending' ? 'tab_recorded' : 'paid',
    detail: `Consommation Bar ajoutée (#${orderId}) : ${items.map(i => `${i.qty}× ${i.name}`).join(', ')} (${formatMoney(orderSubtotal)})`
  });

  store.updateBooking(b.id, {
    barTabOrders: updatedOrders,
    barTabTotal: barTabTotal,
    totalAmount: totalAmount,
    depositPaid: depositPaid,
    balanceDue: balanceDue,
    communicationLog: commLog
  });

  if (window.showAdminToast) {
    window.showAdminToast(`Consommations de ${formatMoney(orderSubtotal)} enregistrées sur l'ardoise Table N° ${b.tableNumber || 1} !`);
  }

  closeBarPosModal();
}

function handleSettleAllTab(bookingId, amount) {
  const b = store.getById(bookingId);
  if (!b) return;

  const currentTabOrders = b.barTabOrders || [];
  const settledOrders = currentTabOrders.map(o => ({
    ...o,
    paymentStatus: 'paid',
    settledAt: new Date().toISOString()
  }));

  const depositPaid = (b.depositPaid || 0) + amount;
  const balanceDue = Math.max(0, (b.totalAmount || 0) - depositPaid);

  const commLog = b.communicationLog || [];
  commLog.unshift({
    timestamp: new Date().toISOString(),
    channel: 'onsite',
    type: 'tab_settled',
    status: 'paid',
    detail: `Ardoise bar soldée sur place : ${formatMoney(amount)} encaissés (Bancontact / Cash)`
  });

  store.updateBooking(b.id, {
    barTabOrders: settledOrders,
    depositPaid: depositPaid,
    balanceDue: balanceDue,
    communicationLog: commLog
  });

  if (window.showAdminToast) {
    window.showAdminToast(`Ardoise de ${formatMoney(amount)} soldée avec succès pour la Table N° ${b.tableNumber || 1} !`);
  }

  closeBarPosModal();
}
