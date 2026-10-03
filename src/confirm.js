// Laser Magic - Client Confirmation Portal Controller
// Multi-lingual: FR, NL, EN (No Romanian)

import { store } from './store.js';
import { icon } from './icons.js';
import { t, getLang, setLang, getPackageTitle, formatMoney } from './i18n.js';

let currentBooking = null;

export function initConfirmPortal() {
  setupLanguageSwitcher();
  loadBookingFromUrl();
}

function setupLanguageSwitcher() {
  document.querySelectorAll('.portal-nav .lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.dataset.lang;
      setLang(lang);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('laser_magic_lang', lang);
        localStorage.setItem('laser_admin_lang', lang);
      }
      document.querySelectorAll('.portal-nav .lang-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderPortal();
    });
  });
}

function loadBookingFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const urlLang = params.get('lang');

  if (id) {
    currentBooking = store.getById(id);
  }

  // Fallback to first available booking if no valid ID provided (for testing/demo)
  if (!currentBooking) {
    const all = store.getAll();
    if (all.length > 0) {
      currentBooking = all[0];
    }
  }

  // Priority: URL lang param > Saved user preference > Booking's saved language > Default
  const savedPref = (typeof localStorage !== 'undefined' ? (localStorage.getItem('laser_magic_lang') || localStorage.getItem('laser_admin_lang')) : null);
  const targetLang = urlLang || savedPref || currentBooking?.lang || 'fr';
  if (['fr', 'nl', 'en'].includes(targetLang)) {
    setLang(targetLang, false);
    document.querySelectorAll('.portal-nav .lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === targetLang);
    });
  }

  renderPortal();

  // Listen to store updates
  store.subscribe(() => {
    if (currentBooking) {
      currentBooking = store.getById(currentBooking.id);
      renderPortal();
    }
  });
}

function renderPortal() {
  const root = document.getElementById('portal-root');
  if (!root) return;

  const lang = getLang() || 'fr';

  // Update header subtitle
  const headerSub = document.getElementById('portal-brand-sub');
  if (headerSub) {
    headerSub.textContent = lang === 'nl' 
      ? 'Klanten Bevestigingsportaal' 
      : (lang === 'en' ? 'Client Confirmation Portal' : 'Espace Confirmation Client');
  }

  if (!currentBooking) {
    const notFoundTitles = {
      fr: { title: "Dossier introuvable", desc: "Aucune réservation ne correspond à cet identifiant.", btn: "Retourner à l'accueil" },
      nl: { title: "Dossier niet gevonden", desc: "Geen reservatie gevonden voor dit identificatienummer.", btn: "Terug naar startpagina" },
      en: { title: "Booking Not Found", desc: "No booking found matching this reference.", btn: "Return to Homepage" }
    };
    const nf = notFoundTitles[lang] || notFoundTitles.fr;
    root.innerHTML = `
      <div class="portal-card" style="text-align:center; padding:50px;">
        <h2 style="color:var(--laser-red);">${nf.title}</h2>
        <p style="color:var(--text-secondary); margin-top:8px;">${nf.desc}</p>
        <a href="./index.html" class="btn btn-primary" style="margin-top:20px;">${nf.btn}</a>
      </div>
    `;
    return;
  }

  const b = currentBooking;
  const isConfirmed = !!b.clientConfirmedAt || b.status === 'confirmed';
  const child = b.childName 
    ? `${b.childName} (${b.childAge || 10} ${lang === 'nl' ? 'jaar' : (lang === 'en' ? 'yrs' : 'ans')})` 
    : null;
  const depositPaid = b.depositPaid || 0;
  const balanceDue = b.balanceDue || (b.totalAmount - depositPaid);

  // Update HTML document title
  document.title = lang === 'nl'
    ? `Bevestiging van Reservatie #${b.id} - Laser Magic`
    : (lang === 'en' ? `Booking Confirmation #${b.id} - Laser Magic` : `Confirmation de Réservation #${b.id} - Laser Magic`);

  const labels = {
    fr: {
      statusConfirmedTitle: "Présence confirmée par l'organisateur",
      statusConfirmedSub: b.clientConfirmedAt ? `Validé en ligne le ${new Date(b.clientConfirmedAt).toLocaleDateString('fr-BE')} à ${new Date(b.clientConfirmedAt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}` : "Votre créneau est verrouillé et réservé.",
      statusPendingTitle: "Action requise : Confirmez votre réservation",
      statusPendingSub: "Merci de valider votre venue en 1 clic pour que notre équipe prépare les gilets et le goûter.",
      btnConfirmNow: "Je confirme ma présence",
      bookingDetails: "Détails de l'événement",
      clientName: "Organisateur",
      package: "Formule choisie",
      dateTime: "Date & Créneau",
      arena: "Arène de jeu",
      players: "Nombre de joueurs",
      playersSuffix: "participants",
      celebrant: "Enfant fêté",
      finance: "Règlement & Acompte",
      totalPrice: "Total formule",
      depositPaid: "Acompte réglé",
      balanceDue: "Solde restant à régler sur place",
      balanceDesc: `Le solde restant de ${formatMoney(balanceDue)} est payable directement au comptoir de Laser Magic à votre arrivée (Bancontact, Carte ou Espèces).`,
      depositValidated: "Acompte 30% Validé",
      depositPending: "À régler sur place",
      rosterTitle: "Composition des Équipes (Préparation des Blasters)",
      rosterSub: "Indiquez les prénoms des enfants pour préparer les feuilles de score et les gilets personnalisés.",
      teamRed: "Équipe Rouge",
      teamBlue: "Équipe Bleue",
      playerPlaceholder: "Prénom joueur",
      maxPlayersText: "joueurs max",
      btnSaveRoster: "Enregistrer la composition",
      dietaryTitle: "Régimes alimentaires & Remarques",
      dietaryPlaceholder: "Allergies aux arachides, intolérance au gluten, préférence bonbons sans gélatine...",
      btnSaveNotes: "Mettre à jour les remarques",
      guidelinesTitle: "Recommandations importantes le jour J",
      guideline1: "Arrivez impérativement 15 minutes avant le début pour le briefing tactique et l'habillage des gilets.",
      guideline2: "Chaussures plates ou baskets obligatoires pour courir dans les arènes (pas de talons, tongs ou sabots).",
      guideline3: "Parking gratuit à disposition directement devant le bâtiment Laser Magic.",
      addToCal: "Ajouter à mon agenda (.ics)",
      openMaps: "Itinéraire Google Maps",
      callCenter: "Appeler le centre",
      statusValidatedPill: `Dossier #${b.id} Validé`,
      categoryBirthday: "Anniversaire Laser Magic",
      categoryStandard: "Session Laser Game",
      tableLabel: "Table N°",
      addonsTitle: "Options incluses :",
      tableOrderTitle: "Commander à votre Table (Boissons & Pizzas)",
      tableOrderSub: "Commandez directement vos rafraîchissements, carafes et snacks sur la note de votre table.",
      tableOrderBtn: "Ouvrir le Menu de Commande à Table"
    },
    nl: {
      statusConfirmedTitle: "Aanwezigheid bevestigd door organisator",
      statusConfirmedSub: b.clientConfirmedAt ? `Online gevalideerd op ${new Date(b.clientConfirmedAt).toLocaleDateString('nl-BE')} om ${new Date(b.clientConfirmedAt).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}` : "Uw tijdslot is vergrendeld en gereserveerd.",
      statusPendingTitle: "Actie vereist: Bevestig uw reservatie",
      statusPendingSub: "Gelieve uw komst in 1 klik te bevestigen zodat ons team de harnassen en het vieruurtje kan voorbereiden.",
      btnConfirmNow: "Ik bevestig mijn aanwezigheid",
      bookingDetails: "Details van het evenement",
      clientName: "Organisator",
      package: "Gekozen formule",
      dateTime: "Datum & Tijdslot",
      arena: "Laser arena",
      players: "Aantal spelers",
      playersSuffix: "deelnemers",
      celebrant: "Jarige",
      finance: "Betaling & Voorschot",
      totalPrice: "Totaalbedrag formule",
      depositPaid: "Voldaan voorschot",
      balanceDue: "Resterend saldo ter plaatse",
      balanceDesc: `Het resterende saldo van ${formatMoney(balanceDue)} kan bij aankomst aan de receptie van Laser Magic worden betaald (Bancontact, Kaart of Contant).`,
      depositValidated: "Voorschot voldaan",
      depositPending: "Ter plaatse te betalen",
      rosterTitle: "Teamsamenstelling (Voorbereiding Blasters)",
      rosterSub: "Geef de voornamen van de kinderen door voor de gepersonaliseerde scorebladen en vesten.",
      teamRed: "Rode Team",
      teamBlue: "Blauwe Team",
      playerPlaceholder: "Voornaam speler",
      maxPlayersText: "max spelers",
      btnSaveRoster: "Samenstelling opslaan",
      dietaryTitle: "Dieetwensen & Opmerkingen",
      dietaryPlaceholder: "Pinda-allergieën, glutenvrij, halal...",
      btnSaveNotes: "Opmerkingen bijwerken",
      guidelinesTitle: "Belangrijke richtlijnen op de dag zelf",
      guideline1: "Kom 15 minuten vooraf aan voor de tactische briefing en uitrusting.",
      guideline2: "Platte schoenen of sportschoenen verplicht om te rennen in de arena's.",
      guideline3: "Gratis parking beschikbaar recht voor het Laser Magic gebouw.",
      addToCal: "Toevoegen aan agenda (.ics)",
      openMaps: "Google Maps routebeschrijving",
      callCenter: "Centrum bellen",
      statusValidatedPill: `Dossier #${b.id} Bevestigd`,
      categoryBirthday: "Laser Magic Verjaardagsfeest",
      categoryStandard: "Laser Game Sessie",
      tableLabel: "Tafel Nr.",
      addonsTitle: "Inbegrepen opties :",
      tableOrderTitle: "Bestellen aan uw Tafel (Drankjes & Snacks)",
      tableOrderSub: "Bestel uw drankjes, kannen en pizza's rechtstreeks op de rekening van uw tafel.",
      tableOrderBtn: "Open Tafel Bestelmenu"
    },
    en: {
      statusConfirmedTitle: "Attendance confirmed by organizer",
      statusConfirmedSub: b.clientConfirmedAt ? `Validated online on ${new Date(b.clientConfirmedAt).toLocaleDateString('en-GB')} at ${new Date(b.clientConfirmedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : "Your slot is locked and ready.",
      statusPendingTitle: "Action required: Confirm your booking",
      statusPendingSub: "Please confirm your attendance in 1 click so our team can prepare vests and party snacks.",
      btnConfirmNow: "Confirm my attendance",
      bookingDetails: "Party Details",
      clientName: "Organizer",
      package: "Selected Package",
      dateTime: "Date & Time Slot",
      arena: "Game Arena",
      players: "Number of guests",
      playersSuffix: "guests",
      celebrant: "Birthday child",
      finance: "Payment & Deposit",
      totalPrice: "Total package amount",
      depositPaid: "Deposit paid online",
      balanceDue: "Balance due on-site",
      balanceDesc: `The remaining balance of ${formatMoney(balanceDue)} is payable at the Laser Magic front desk upon arrival (Bancontact, Card or Cash).`,
      depositValidated: "Deposit confirmed",
      depositPending: "Due on arrival",
      rosterTitle: "Team Rosters (Blaster Preparation)",
      rosterSub: "Provide children's first names for personalized scorecards and laser vests.",
      teamRed: "Red Team",
      teamBlue: "Blue Team",
      playerPlaceholder: "Player name",
      maxPlayersText: "max players",
      btnSaveRoster: "Save team rosters",
      dietaryTitle: "Dietary Requirements & Notes",
      dietaryPlaceholder: "Peanut allergies, gluten-free, halal snack preferences...",
      btnSaveNotes: "Update dietary notes",
      guidelinesTitle: "Important Guidelines for Game Day",
      guideline1: "Please arrive 15 minutes early for safety briefing and vest gear-up.",
      guideline2: "Closed-toe athletic shoes mandatory (no sandals or heels allowed).",
      guideline3: "Free on-site parking available directly in front of Laser Magic.",
      addToCal: "Add to Calendar (.ics)",
      openMaps: "Google Maps Directions",
      callCenter: "Call Center",
      statusValidatedPill: `Booking #${b.id} Confirmed`,
      categoryBirthday: "Laser Magic Birthday Party",
      categoryStandard: "Laser Game Session",
      tableLabel: "Table No.",
      addonsTitle: "Included add-ons :",
      tableOrderTitle: "Order at your Table (Drinks & Snacks)",
      tableOrderSub: "Order your drinks, pitchers and pizzas directly on your table tab.",
      tableOrderBtn: "Open Table Ordering Menu"
    }
  }[lang] || {};

  const arenaMap = {
    fr: { jungle: 'Arène Jungle', prison: 'Arène Prison', combined: 'Mode Fusion (2 Arènes)' },
    nl: { jungle: 'Jungle Arena', prison: 'Prison Arena', combined: 'Gekoppelde Modus (2 Arena\'s)' },
    en: { jungle: 'Jungle Arena', prison: 'Prison Arena', combined: 'Fusion Mode (2 Arenas)' }
  };
  const arenaName = (arenaMap[lang] && arenaMap[lang][b.arena]) || arenaMap.fr[b.arena] || 'Jungle Arena';
  const packageName = getPackageTitle(b.packageId, lang) || b.packageName;

  // Roster arrays
  const redTeam = (b.teams && b.teams.red) || [];
  const blueTeam = (b.teams && b.teams.blue) || [];
  const halfPlayers = Math.ceil(b.players / 2);

  const packageImageMap = {
    sweet: '/images/package-sweet.jpg',
    fun: '/images/package-fun.jpg',
    vip: '/images/package-vip.jpg',
    standard1: '/images/package-standard.jpg',
    standard2: '/images/package-standard.jpg',
    standard3: '/images/package-standard.jpg'
  };
  const pkgImg = b.packageImage || packageImageMap[b.packageId] || '/images/package-fun.jpg';

  root.innerHTML = `
    <!-- Status Banner -->
    <div class="status-banner ${isConfirmed ? 'confirmed' : 'pending'}">
      <div class="status-info">
        <div class="status-badge-icon ${isConfirmed ? 'confirmed' : 'pending'}">
          ${isConfirmed ? icon('check', '', 28) : icon('clock', '', 28)}
        </div>
        <div>
          <h2 style="font-size:1.35rem; color:#fff; margin:0 0 4px 0;">
            ${isConfirmed ? labels.statusConfirmedTitle : labels.statusPendingTitle}
          </h2>
          <p style="color:var(--text-secondary); margin:0; font-size:0.88rem;">
            ${isConfirmed ? labels.statusConfirmedSub : labels.statusPendingSub}
          </p>
        </div>
      </div>
      <div>
        ${!isConfirmed ? `
          <button type="button" class="btn btn-primary btn-lg" id="btn-portal-confirm-attendance" style="background:var(--laser-green); color:#04070f; border-color:var(--laser-green); box-shadow:0 0 20px var(--laser-green-glow);">
            ${icon('check', '', 18)}
            <span>${labels.btnConfirmNow}</span>
          </button>
        ` : `
          <div style="display:flex; align-items:center; gap:8px; color:var(--laser-green); font-weight:700;">
            ${icon('check', '', 18)}
            <span>${labels.statusValidatedPill}</span>
          </div>
        `}
      </div>
    </div>

    <!-- Booking Details Card with Hero Photo Banner -->
    <div class="portal-card" style="padding:0; overflow:hidden;">
      <div class="portal-package-hero" style="background-image:url('${pkgImg}');">
        <div class="portal-package-hero-overlay"></div>
        <div class="portal-package-hero-content">
          <div>
            <span class="badge ${b.packageId === 'vip' ? 'badge-pink' : 'badge-cyan'}" style="margin-bottom:6px; display:inline-block; font-size:0.75rem;">
              ${b.category === 'birthday' ? labels.categoryBirthday : labels.categoryStandard}
            </span>
            <h2 style="font-size:1.6rem; color:#fff; margin:0; font-family:var(--font-display);">${packageName}</h2>
          </div>
          <div style="text-align:right;">
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
              <span class="badge" style="background:#0f172a; color:#38bdf8; font-weight:800; border:1px solid #38bdf8; padding:3px 10px; border-radius:9999px; font-size:0.75rem;">
                TICKET N° ${String(b.orderNumber || 42).padStart(3, '0')}
              </span>
              <span class="status-pill status-${b.status}">${t('status' + b.status.charAt(0).toUpperCase() + b.status.slice(1))}</span>
              <div style="font-size:0.8rem; color:rgba(255,255,255,0.7);">#${b.id}</div>
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 24px;">
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">${labels.clientName}</div>
            <div class="detail-val">${b.customerName}</div>
            <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">${b.phone}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${labels.dateTime}</div>
            <div class="detail-val" style="color:var(--laser-cyan);">${b.date}</div>
            <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:2px;">${b.timeSlot}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${labels.package}</div>
            <div class="detail-val">${packageName}</div>
            <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">${labels.tableLabel} ${b.tableNumber}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">${labels.arena} & ${labels.players}</div>
            <div class="detail-val">${arenaName}</div>
            <div style="font-size:0.82rem; color:var(--laser-pink); font-weight:700; margin-top:2px;">${b.players} ${labels.playersSuffix}</div>
          </div>
          ${child ? `
          <div class="detail-item" style="border-left: 3px solid var(--laser-pink);">
            <div class="detail-label" style="color:var(--laser-pink);">${labels.celebrant}</div>
            <div class="detail-val">${child}</div>
          </div>` : ''}
        </div>

        ${(b.addons && b.addons.length > 0) ? `
          <div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--border-subtle); display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
            <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">${labels.addonsTitle}</span>
            ${b.addons.map(a => `
              <span class="badge" style="background:rgba(0,240,255,0.1); border:1px solid rgba(0,240,255,0.25); color:var(--laser-cyan); padding:4px 10px; font-size:0.82rem;">
                + ${a.name} (${a.qty}×)
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Payment & Deposit Card -->
    <div class="portal-card">
      <div class="portal-card-header">
        <div class="portal-card-title">
          ${icon('creditCard', 'text-green', 20)}
          <span>${labels.finance}</span>
        </div>
        <span style="font-size:0.82rem; color:var(--laser-green); font-weight:700;">
          ${depositPaid > 0 ? labels.depositValidated : labels.depositPending}
        </span>
      </div>

      <div class="finance-row">
        <span style="color:var(--text-secondary);">${labels.totalPrice} :</span>
        <strong style="color:#fff;">${formatMoney(b.totalAmount)}</strong>
      </div>
      <div class="finance-row">
        <span style="color:var(--text-secondary);">${labels.depositPaid} :</span>
        <strong style="color:var(--laser-green);">${formatMoney(depositPaid)}</strong>
      </div>
      <div class="finance-row" style="font-size:1.1rem; padding-top:14px;">
        <span style="color:var(--text-white); font-weight:700;">${labels.balanceDue} :</span>
        <strong style="color:var(--laser-cyan); font-weight:800;">${formatMoney(balanceDue)}</strong>
      </div>
      <p style="font-size:0.78rem; color:var(--text-muted); margin-top:10px;">
        ${labels.balanceDesc}
      </p>
    </div>

    ${b.isCorporate ? `
    <!-- Corporate / B2B Facturation Card -->
    <div class="portal-card" style="border-left:4px solid var(--laser-cyan);">
      <div class="portal-card-header">
        <div class="portal-card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--laser-cyan)" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <span>Facturation Entreprise & Team Building (B2B)</span>
        </div>
        <span class="badge" style="background:rgba(0,255,136,0.15); color:var(--laser-green); font-weight:800; font-size:0.75rem;">
          TVA Validée VIES UE
        </span>
      </div>
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">Entreprise</div>
          <div class="detail-val">${b.companyName || b.customerName}</div>
          ${b.contactRole ? `<div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">${b.contactRole}</div>` : ''}
        </div>
        <div class="detail-item">
          <div class="detail-label">N° de TVA Intracommunautaire</div>
          <div class="detail-val" style="color:var(--laser-cyan); font-family:monospace;">${b.vatNumber || 'BE 0477.123.456'}</div>
        </div>
        <div class="detail-item" style="grid-column: span 2;">
          <div class="detail-label">Adresse de facturation (Google Maps)</div>
          <div class="detail-val" style="font-size:0.92rem; font-weight:600;">${b.billingAddress || 'Avenue Louise 149, 1050 Bruxelles, Belgique'}</div>
        </div>
        ${b.poNumber ? `
        <div class="detail-item">
          <div class="detail-label">Bon de commande (N° PO)</div>
          <div class="detail-val" style="color:var(--laser-amber);">${b.poNumber}</div>
        </div>` : ''}
      </div>
    </div>
    ` : ''}

    <!-- Direct Table QR Ordering Banner -->
    <div class="portal-card" style="border:1px solid rgba(0, 240, 255, 0.4); background: linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(14, 22, 44, 0.95) 100%);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:48px; height:48px; border-radius:14px; background:rgba(0,240,255,0.15); border:1.5px solid var(--laser-cyan); display:flex; align-items:center; justify-content:center; color:var(--laser-cyan);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          </div>
          <div>
            <div style="font-weight:800; font-size:1.05rem; color:#fff;">${labels.tableOrderTitle}</div>
            <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:3px;">
              ${labels.tableOrderSub.replace('{table}', b.tableNumber || 1)}
            </div>
          </div>
        </div>
        <a href="order.html?booking=${b.id}&table=${b.tableNumber || 1}" class="btn" style="background:linear-gradient(135deg, var(--laser-cyan) 0%, #00b4d8 100%); color:#04070f; font-weight:800; text-decoration:none; padding:10px 18px; border-radius:10px; display:inline-flex; align-items:center; gap:8px; box-shadow:0 0 14px rgba(0,240,255,0.35);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span>${labels.tableOrderBtn}</span>
        </a>
      </div>
    </div>

    ${(b.barTabOrders && b.barTabOrders.length > 0) ? `
    <!-- Consommations Bar & Snacks Card -->
    <div class="portal-card" style="border-left:4px solid var(--laser-amber);">
      <div class="portal-card-header">
        <div class="portal-card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--laser-amber)" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          <span>Consommations Bar & Petite Restauration</span>
        </div>
        <span class="badge" style="background:rgba(255,184,0,0.15); color:var(--laser-amber); font-weight:800; font-size:0.75rem;">
          Total : ${formatMoney(b.barTabTotal || 0)}
        </span>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${b.barTabOrders.map(order => `
          <div style="background:var(--bg-surface); padding:10px 14px; border-radius:var(--radius-md); border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:700; font-size:0.88rem; color:#fff;">
                ${(order.items || []).map(i => `${i.qty}× ${i.name}`).join(', ')}
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">
                Commande #${order.orderId || 'BAR'} · ${order.createdAt ? new Date(order.createdAt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
            <div style="text-align:right;">
              <strong style="color:var(--laser-cyan); font-size:0.95rem;">${formatMoney(order.subtotal || 0)}</strong>
              <div style="font-size:0.72rem; color:${order.paymentStatus === 'paid' ? 'var(--laser-green)' : 'var(--laser-amber)'}; font-weight:700;">
                ${order.paymentStatus === 'paid' ? 'Réglé' : 'Sur l\'ardoise'}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Team Rosters Form -->
    <div class="portal-card">
      <div class="portal-card-header">
        <div class="portal-card-title">
          ${icon('users', 'text-cyan', 20)}
          <span>${labels.rosterTitle}</span>
        </div>
      </div>
      <p style="color:var(--text-secondary); font-size:0.88rem; margin-bottom:18px;">
        ${labels.rosterSub}
      </p>

      <form id="portal-roster-form">
        <div class="roster-grid">
          <div class="team-box red">
            <div class="team-title" style="color:var(--laser-pink);">
              <span>${labels.teamRed}</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">${halfPlayers} ${labels.maxPlayersText}</span>
            </div>
            ${Array.from({ length: halfPlayers }).map((_, i) => `
              <input type="text" class="player-tag-input" data-team="red" data-idx="${i}" placeholder="${labels.playerPlaceholder} ${i + 1}" value="${redTeam[i] || ''}">
            `).join('')}
          </div>

          <div class="team-box blue">
            <div class="team-title" style="color:var(--laser-cyan);">
              <span>${labels.teamBlue}</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">${halfPlayers} ${labels.maxPlayersText}</span>
            </div>
            ${Array.from({ length: halfPlayers }).map((_, i) => `
              <input type="text" class="player-tag-input" data-team="blue" data-idx="${i}" placeholder="${labels.playerPlaceholder} ${i + 1}" value="${blueTeam[i] || ''}">
            `).join('')}
          </div>
        </div>

        <div style="margin-top:18px; display:flex; justify-content:flex-end;">
          <button type="submit" class="btn btn-secondary btn-sm">
            ${icon('save', '', 14)}
            <span>${labels.btnSaveRoster}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Dietary Notes & Special Requests -->
    <div class="portal-card">
      <div class="portal-card-header">
        <div class="portal-card-title">
          ${icon('utensils', 'text-amber', 20)}
          <span>${labels.dietaryTitle}</span>
        </div>
      </div>
      <form id="portal-dietary-form">
        <textarea id="portal-notes-input" class="form-textarea" rows="3" placeholder="${labels.dietaryPlaceholder}" style="width:100%; box-sizing:border-box;">${b.specialNotes || ''}</textarea>
        <div style="margin-top:14px; display:flex; justify-content:flex-end;">
          <button type="submit" class="btn btn-secondary btn-sm">
            ${icon('save', '', 14)}
            <span>${labels.btnSaveNotes}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Important Guidelines & GPS Navigation -->
    <div class="portal-card">
      <div class="portal-card-header">
        <div class="portal-card-title">
          ${icon('shield', 'text-green', 20)}
          <span>${labels.guidelinesTitle}</span>
        </div>
      </div>

      <div class="checklist-item">
        <div style="color:var(--laser-green);">${icon('check', '', 18)}</div>
        <span>${labels.guideline1}</span>
      </div>
      <div class="checklist-item">
        <div style="color:var(--laser-green);">${icon('check', '', 18)}</div>
        <span>${labels.guideline2}</span>
      </div>
      <div class="checklist-item">
        <div style="color:var(--laser-green);">${icon('check', '', 18)}</div>
        <span>${labels.guideline3}</span>
      </div>

      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:24px; padding-top:18px; border-top:1px solid var(--border-subtle);">
        <button type="button" class="btn btn-secondary" id="btn-download-portal-ics">
          ${icon('calendar', '', 16)}
          <span>${labels.addToCal}</span>
        </button>
        <a href="https://maps.google.com/?q=Laser+Magic+Vilvoorde" target="_blank" class="btn btn-secondary">
          ${icon('mapPin', '', 16)}
          <span>${labels.openMaps}</span>
        </a>
        <a href="tel:+3222532222" class="btn btn-secondary">
          ${icon('phone', '', 16)}
          <span>${labels.callCenter} (+32 2 253 22 22)</span>
        </a>
      </div>
    </div>
  `;

  // Attach event handlers
  setupPortalActions(b, lang);
}

function setupPortalActions(b, lang) {
  // Confirm attendance button
  const confirmBtn = document.getElementById('btn-portal-confirm-attendance');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      store.confirmByClient(b.id);
      const msg = lang === 'nl' 
        ? "Reservatie succesvol bevestigd!" 
        : (lang === 'en' ? "Attendance successfully confirmed!" : "Réservation confirmée avec succès !");
      showToast(msg);
    };
  }

  // Roster form
  const rosterForm = document.getElementById('portal-roster-form');
  if (rosterForm) {
    rosterForm.onsubmit = (e) => {
      e.preventDefault();
      const redInputs = rosterForm.querySelectorAll('input[data-team="red"]');
      const blueInputs = rosterForm.querySelectorAll('input[data-team="blue"]');

      const red = Array.from(redInputs).map(inp => inp.value.trim()).filter(Boolean);
      const blue = Array.from(blueInputs).map(inp => inp.value.trim()).filter(Boolean);

      store.updateBooking(b.id, {
        teams: { red, blue }
      });
      const msg = lang === 'nl' 
        ? "Teamsamenstelling opgeslagen!" 
        : (lang === 'en' ? "Team rosters saved!" : "Équipes enregistrées !");
      showToast(msg);
    };
  }

  // Dietary form
  const dietaryForm = document.getElementById('portal-dietary-form');
  if (dietaryForm) {
    dietaryForm.onsubmit = (e) => {
      e.preventDefault();
      const notesVal = document.getElementById('portal-notes-input').value;
      store.updateBooking(b.id, {
        specialNotes: notesVal
      });
      const msg = lang === 'nl' 
        ? "Dieetwensen en opmerkingen bijgewerkt!" 
        : (lang === 'en' ? "Dietary notes updated!" : "Remarques alimentaires enregistrées !");
      showToast(msg);
    };
  }

  // Download ICS
  const icsBtn = document.getElementById('btn-download-portal-ics');
  if (icsBtn) {
    icsBtn.onclick = () => {
      downloadIcs(b, lang);
    };
  }
}

function showToast(message) {
  const toast = document.getElementById('portal-toast');
  if (toast) {
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3500);
  }
}

function downloadIcs(b, lang = 'fr') {
  const dateFormatted = b.date.replace(/-/g, '');
  const startHour = (b.startTime || "14:00").replace(':', '') + '00';
  const endHour = (b.endTime || "16:00").replace(':', '') + '00';
  const pkgName = getPackageTitle(b.packageId, lang) || b.packageName;

  const desc = lang === 'nl'
    ? `Lasergame sessie bij Laser Magic Vilvoorde. Tafel Nr. ${b.tableNumber}. Voorschot: ${formatMoney(b.depositPaid)} - Saldo ter plaatse: ${formatMoney(b.balanceDue)}.`
    : (lang === 'en'
       ? `Laser Game session at Laser Magic Vilvoorde. Table No. ${b.tableNumber}. Deposit: ${formatMoney(b.depositPaid)} - Balance on arrival: ${formatMoney(b.balanceDue)}.`
       : `Session Laser Game chez Laser Magic Vilvoorde. Table N°${b.tableNumber}. Acompte: ${formatMoney(b.depositPaid)} - Solde sur place: ${formatMoney(b.balanceDue)}.`);

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Laser Magic//Booking Confirmation//${lang.toUpperCase()}
BEGIN:VEVENT
SUMMARY:Laser Magic - ${pkgName} (${b.players} pers.)
DESCRIPTION:${desc}
LOCATION:Schaarbeeklei 26, 1800 Vilvoorde, Belgique
DTSTART:${dateFormatted}T${startHour}
DTEND:${dateFormatted}T${endHour}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `LaserMagic-${b.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
