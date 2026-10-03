// Shared State & Persistence for Laser Magic (Vilvoorde / Brussels)
// Handles live capacity, reservation status transitions, and cross-tab sync
import {
  supabase,
  isSupabaseConfigured,
  TABLE_BOOKINGS,
  TABLE_CLIENTS,
  bookingToSupabaseRow,
  supabaseRowToBooking,
  clientToSupabaseRow,
  supabaseRowToClient
} from './supabaseClient.js';

const STORAGE_KEY = 'laser_magic_reservations_v2';
const CUSTOM_CLIENTS_KEY = 'laser_magic_custom_clients';
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('laser_magic_sync') : null;

// Initial seed reservations if local storage is empty
function getInitialBookings() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Upcoming Saturday
  const sat = new Date(now);
  sat.setDate(sat.getDate() + ((6 - sat.getDay() + 7) % 7 || 7));
  const satStr = sat.toISOString().split('T')[0];

  const initialBookings = [
    {
      id: "LM-8421",
      orderNumber: 42,
      orderCode: "CMD-042",
      lang: "fr",
      customerName: "Jean-François Moreau",
      email: "jf.moreau@skynet.be",
      phone: "+32 472 88 19 20",
      packageId: "fun",
      category: "birthday",
      packageName: "Formule Fun",
      date: todayStr,
      timeSlot: "14:00 - 16:00",
      startTime: "14:00",
      endTime: "16:00",
      players: 10,
      childName: "Lucas",
      childAge: 10,
      childBirthDate: "2016-10-15",
      arena: "jungle",
      tableNumber: 3,
      addons: [
        { id: "cake", name: "Gâteau chocolat", qty: 10, unitPrice: 6, total: 60 },
        { id: "arcade", name: "Jetons arcade extra", qty: 10, unitPrice: 2, total: 20 }
      ],
      unitPrice: 26,
      subtotal: 260,
      addonsTotal: 80,
      totalAmount: 340,
      depositPaid: 102,
      balanceDue: 238,
      paymentMethod: "stripe",
      status: "confirmed",
      specialNotes: "1 enfant allergique aux arachides. Lucas est fan de Star Wars.",
      teams: {
        red: ["Lucas (Cap)", "Maxime", "Arthur", "Noah", "Emma"],
        blue: ["Thomas (Cap)", "Hugo", "Jules", "Sacha", "Léa"]
      },
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "LM-8422",
      orderNumber: 43,
      orderCode: "CMD-043",
      lang: "nl",
      customerName: "Anke Van den Bossche",
      email: "anke.vdbossche@telenet.be",
      phone: "+32 495 12 34 56",
      packageId: "vip",
      category: "birthday",
      packageName: "Formule VIP",
      date: todayStr,
      timeSlot: "16:30 - 19:30",
      startTime: "16:30",
      endTime: "19:30",
      players: 14,
      childName: "Mats",
      childAge: 12,
      childBirthDate: "2014-06-20",
      arena: "prison",
      tableNumber: 1,
      addons: [
        { id: "extra_game", name: "Ronde laser extra", qty: 14, unitPrice: 7, total: 98 }
      ],
      unitPrice: 28,
      subtotal: 392,
      addonsTotal: 98,
      totalAmount: 490,
      depositPaid: 147,
      balanceDue: 343,
      paymentMethod: "stripe",
      status: "in_progress",
      specialNotes: "VIP champagne zonder alcohol goed gekoeld voor de kinderen.",
      teams: {
        red: ["Mats (Cap)", "Lars", "Finn", "Sem", "Daan", "Bram", "Milan"],
        blue: ["Stan (Cap)", "Wout", "Tuur", "Liam", "Noah", "Jonas", "Kobe"]
      },
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: "LM-8423",
      orderNumber: 44,
      orderCode: "CMD-044",
      lang: "en",
      customerName: "David Sterling",
      email: "david.sterling@eu-consulting.com",
      phone: "+32 468 90 44 11",
      packageId: "standard2",
      category: "standard",
      packageName: "2 Action Rounds",
      date: todayStr,
      timeSlot: "19:45 - 20:45",
      startTime: "19:45",
      endTime: "20:45",
      players: 8,
      childName: "",
      childAge: null,
      childBirthDate: "",
      arena: "combined",
      tableNumber: 5,
      addons: [
        { id: "pitcher", name: "Pichet soft 1.5L", qty: 2, unitPrice: 9, total: 18 }
      ],
      unitPrice: 22,
      subtotal: 176,
      addonsTotal: 18,
      barTabOrders: [
        {
          orderId: "TAB-044-1",
          timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
          items: [
            { id: "pitcher_soft", name: "Pichet Géant Soft au choix", qty: 2, unitPrice: 9.5, total: 19, category: "drinks_soft" },
            { id: "leffe_blonde", name: "Leffe Blonde d’Abbaye", qty: 4, unitPrice: 4.5, total: 18, category: "drinks_alcohol" },
            { id: "nachos", name: "Nachos Fromage Fondu & Guacamole", qty: 2, unitPrice: 6.5, total: 13, category: "food_snacks" }
          ],
          subtotal: 50,
          status: "served",
          paymentStatus: "unpaid",
          paymentMethod: "tab_pending"
        }
      ],
      barTabTotal: 50,
      totalAmount: 244,
      depositPaid: 0,
      balanceDue: 244,
      isCorporate: true,
      companyName: "EU Consulting & Tech Partners SPRL",
      vatNumber: "BE 0477.123.456",
      enterpriseNumber: "0477.123.456",
      billingAddress: {
        street: "Avenue Louise 149",
        postalCode: "1050",
        city: "Bruxelles",
        country: "BE",
        formatted: "Avenue Louise 149, 1050 Bruxelles (Belgique)"
      },
      contactRole: "Lead Tech & Event Organizer",
      poNumber: "PO-2026-EU448",
      vatValidation: {
        valid: true,
        name: "EU Consulting & Tech Partners SPRL",
        address: "Avenue Louise 149, 1050 Bruxelles",
        checkedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        provider: "VIES (Commission Européenne) & BCE / KBO"
      },
      paymentMethod: "onsite",
      status: "pending",
      specialNotes: "Expat team building group (EN). Facturation TVA société demandée (PO: PO-2026-EU448).",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: "LM-8424",
      orderNumber: 45,
      orderCode: "CMD-045",
      lang: "fr",
      customerName: "Sophie Delaunois",
      email: "sophie.delaunois@gmail.com",
      phone: "+32 477 33 22 11",
      packageId: "sweet",
      category: "birthday",
      packageName: "Formule Sweet",
      date: tomorrowStr,
      timeSlot: "14:00 - 16:00",
      startTime: "14:00",
      endTime: "16:00",
      players: 9,
      childName: "Chloé",
      childAge: 9,
      childBirthDate: "2017-11-04",
      arena: "jungle",
      tableNumber: 4,
      addons: [
        { id: "cake", name: "Gâteau chocolat", qty: 9, unitPrice: 6, total: 54 }
      ],
      unitPrice: 24,
      subtotal: 216,
      addonsTotal: 54,
      totalAmount: 270,
      depositPaid: 81,
      balanceDue: 189,
      paymentMethod: "stripe",
      status: "confirmed",
      specialNotes: "Chloé aimerait l'animation bougies avec la musique Reine des Neiges si possible.",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: "LM-8425",
      orderNumber: 46,
      orderCode: "CMD-046",
      lang: "nl",
      customerName: "Karel De Smet",
      email: "karel.desmet@bpost.be",
      phone: "+32 491 55 66 77",
      packageId: "vip",
      category: "birthday",
      packageName: "Formule VIP",
      date: satStr,
      timeSlot: "11:00 - 14:00",
      startTime: "11:00",
      endTime: "14:00",
      players: 16,
      childName: "Ruben",
      childAge: 11,
      childBirthDate: "2015-08-12",
      arena: "prison",
      tableNumber: 2,
      addons: [
        { id: "military", name: "Parcours commando", qty: 16, unitPrice: 2, total: 32 }
      ],
      unitPrice: 28,
      subtotal: 448,
      addonsTotal: 32,
      totalAmount: 480,
      depositPaid: 144,
      balanceDue: 336,
      paymentMethod: "stripe",
      status: "confirmed",
      specialNotes: "16 enthousiaste kinderen. Grote parkeerplaats nodig voor minibus.",
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
    }
  ];

  // Generate 45 additional realistic bookings to reach exactly 50 total
  const firstNames = ["Maxime", "Charlotte", "Thomas", "Sarah", "Lucas", "Emma", "Nicolas", "Camille", "Arthur", "Juliette", "Daan", "Lotte", "Milan", "Noor", "Lars", "Fien", "Oliver", "Emily", "James", "Chloe", "Julien", "Elena"];
  const lastNames = ["Vandamme", "Claes", "Peeters", "Maes", "Wouters", "Dubois", "Lambert", "Dupont", "Martin", "Renard", "Vermeulen", "Janssens", "Mertens", "Willems", "Goossens", "Smith", "Johnson", "Brown", "Taylor", "Wilson"];
  const packageConfigs = [
    { id: 'fun', name: 'Formule Fun', price: 26, category: 'birthday', addons: [{ id: 'cake', name: 'Gâteau chocolat', qty: 10, unitPrice: 6, total: 60 }] },
    { id: 'vip', name: 'Formule VIP', price: 28, category: 'birthday', addons: [{ id: 'arcade', name: 'Jetons arcade extra', qty: 12, unitPrice: 2, total: 24 }] },
    { id: 'sweet', name: 'Formule Sweet', price: 24, category: 'birthday', addons: [{ id: 'pitcher', name: 'Pichet soft 1.5L', qty: 3, unitPrice: 9, total: 27 }] },
    { id: 'standard2', name: '2 Parties Choc', price: 22, category: 'standard', addons: [{ id: 'minigolf', name: 'Minigolf fluo 18 trous', qty: 8, unitPrice: 8, total: 64 }] }
  ];

  const timeSlots = [
    { slot: "11:00 - 13:00", start: "11:00", end: "13:00" },
    { slot: "13:30 - 15:30", start: "13:30", end: "15:30" },
    { slot: "14:00 - 16:00", start: "14:00", end: "16:00" },
    { slot: "16:00 - 18:00", start: "16:00", end: "18:00" },
    { slot: "16:30 - 18:30", start: "16:30", end: "18:30" },
    { slot: "18:30 - 20:30", start: "18:30", end: "20:30" },
    { slot: "19:00 - 21:00", start: "19:00", end: "21:00" }
  ];

  for (let i = 6; i <= 50; i++) {
    const fn = firstNames[(i * 3) % firstNames.length];
    const ln = lastNames[(i * 5) % lastNames.length];
    const customerName = `${fn} ${ln}`;
    const lang = i % 5 === 0 ? 'en' : (i % 2 === 0 ? 'nl' : 'fr');
    const domain = lang === 'nl' ? 'telenet.be' : (lang === 'en' ? 'gmail.com' : 'skynet.be');
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`;
    const phone = `+32 4${(70 + (i % 29)).toString().padStart(2, '0')} ${((i * 13) % 90 + 10)} ${((i * 29) % 90 + 10)} ${((i * 47) % 90 + 10)}`;

    // Status: 25 Confirmed (1..25), 8 In Progress (26..33), 17 Pending (34..50)
    let status = 'confirmed';
    if (i > 33) {
      status = 'pending';
    } else if (i > 25) {
      status = 'in_progress';
    }

    // Dates: 5 today (1..5), 18 weekend (6..23), remaining across month
    let date = todayStr;
    if (i > 5 && i <= 23) {
      date = satStr;
    } else if (i > 23) {
      const offsetDays = ((i % 14) - 5);
      const d = new Date(now);
      d.setDate(d.getDate() + offsetDays);
      date = d.toISOString().split('T')[0];
    }

    const tSlot = timeSlots[i % timeSlots.length];
    const pkg = packageConfigs[i % packageConfigs.length];
    const players = 8 + (i % 9); // 8 to 16 players
    const subtotal = players * pkg.price;
    const addonsTotal = pkg.addons.reduce((sum, a) => sum + (a.total || 0), 0);
    const totalAmount = subtotal + addonsTotal;
    const isConfirmed = status === 'confirmed';
    const depositPaid = isConfirmed ? Math.round(totalAmount * 0.3) : (status === 'in_progress' ? Math.round(totalAmount * 0.3) : 0);
    const balanceDue = totalAmount - depositPaid;
    const arena = i % 3 === 0 ? 'jungle' : (i % 3 === 1 ? 'prison' : 'combined');
    const tableNumber = 1 + (i % 5);
    const orderNumber = 40 + i;
    const orderCode = `CMD-${String(orderNumber).padStart(3, '0')}`;

    initialBookings.push({
      id: `LM-${8420 + i}`,
      orderNumber,
      orderCode,
      lang,
      customerName,
      email,
      phone,
      packageId: pkg.id,
      category: pkg.category,
      packageName: pkg.name,
      date,
      timeSlot: tSlot.slot,
      startTime: tSlot.start,
      endTime: tSlot.end,
      players,
      childName: fn,
      childAge: 7 + (i % 8),
      childBirthDate: `${2026 - (7 + (i % 8))}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + ((i * 3) % 27)).padStart(2, '0')}`,
      arena,
      tableNumber,
      addons: [...pkg.addons],
      unitPrice: pkg.price,
      subtotal,
      addonsTotal,
      totalAmount,
      depositPaid,
      balanceDue,
      paymentMethod: status === 'pending' ? 'onsite' : 'stripe',
      status,
      clientConfirmedAt: isConfirmed ? new Date(Date.now() - 3600000 * (i * 2)).toISOString() : null,
      specialNotes: i % 4 === 0 ? "Anniversaire surprise pour l'enfant. Prévoir bougies fluo." : "",
      teams: {
        red: [`${fn} (Cap)`, "Alex", "Sam", "Leo"],
        blue: ["Max (Cap)", "Zoe", "Tom", "Mia"]
      },
      createdAt: new Date(Date.now() - 3600000 * (i * 5)).toISOString()
    });
  }

  return initialBookings;
}

class Store {
  constructor() {
    this.bookings = [];
    this.customClients = [];
    this.listeners = [];
    this.cloudSyncStatus = isSupabaseConfigured ? 'connecting' : 'local_only';
    this.supabaseChannel = null;
    this.init();
    if (isSupabaseConfigured) {
      this.initSupabaseSync();
    }
  }

  isCloudConnected() {
    return isSupabaseConfigured && Boolean(supabase);
  }

  async initSupabaseSync() {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data: cloudBookings, error: bError } = await supabase
        .from(TABLE_BOOKINGS)
        .select('*')
        .order('date', { ascending: false });

      if (bError) {
        console.warn('[Supabase] Erreur chargement réservations:', bError);
        this.cloudSyncStatus = 'error';
      } else if (Array.isArray(cloudBookings)) {
        if (cloudBookings.length > 0) {
          this.bookings = cloudBookings.map(supabaseRowToBooking);
          this.persist(false);
          this.notify(false);
        } else if (this.bookings.length > 0) {
          // Baza cloud este proaspăt creată -> sincronizăm automat rezervările existente
          console.log('[Supabase] Initialisation de la base distante avec les données de démarrage...');
          await this.syncAllToSupabase();
        }
      }

      const { data: cloudClients, error: cError } = await supabase
        .from(TABLE_CLIENTS)
        .select('*');

      if (!cError && Array.isArray(cloudClients) && cloudClients.length > 0) {
        this.customClients = cloudClients.map(supabaseRowToClient);
        this.persistCustomClients(false);
        this.notify(false);
      }

      if (this.supabaseChannel) {
        supabase.removeChannel(this.supabaseChannel);
      }

      this.supabaseChannel = supabase
        .channel('laser_magic_realtime_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_BOOKINGS }, (payload) => {
          this.handleCloudBookingChange(payload);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_CLIENTS }, (payload) => {
          this.handleCloudClientChange(payload);
        })
        .subscribe((status) => {
          this.cloudSyncStatus = status === 'SUBSCRIBED' ? 'connected' : status;
          this.notify(false);
        });

    } catch (err) {
      console.warn('[Supabase Sync Init Exception]:', err);
      this.cloudSyncStatus = 'error';
    }
  }

  handleCloudBookingChange(payload) {
    if (!payload) return;
    const { eventType, new: newRow, old: oldRow } = payload;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const incoming = supabaseRowToBooking(newRow);
      if (!incoming || !incoming.id) return;

      const idx = this.bookings.findIndex(b => b.id === incoming.id);
      if (idx >= 0) {
        this.bookings[idx] = incoming;
      } else {
        this.bookings.unshift(incoming);
      }
      this.persist(false);
      this.notify(false);
    } else if (eventType === 'DELETE' && oldRow && oldRow.id) {
      this.bookings = this.bookings.filter(b => b.id !== oldRow.id);
      this.persist(false);
      this.notify(false);
    }
  }

  handleCloudClientChange(payload) {
    if (!payload) return;
    const { eventType, new: newRow, old: oldRow } = payload;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const incoming = supabaseRowToClient(newRow);
      if (!incoming || !incoming.id) return;

      const idx = this.customClients.findIndex(c => c.id === incoming.id);
      if (idx >= 0) {
        this.customClients[idx] = incoming;
      } else {
        this.customClients.push(incoming);
      }
      this.persistCustomClients(false);
      this.notify(false);
    } else if (eventType === 'DELETE' && oldRow && oldRow.id) {
      this.customClients = this.customClients.filter(c => c.id !== oldRow.id);
      this.persistCustomClients(false);
      this.notify(false);
    }
  }

  async syncAllToSupabase() {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, reason: 'not_configured' };
    }
    try {
      if (this.bookings && this.bookings.length > 0) {
        const bookingRows = this.bookings.map(bookingToSupabaseRow);
        const { error: bErr } = await supabase.from(TABLE_BOOKINGS).upsert(bookingRows);
        if (bErr) throw bErr;
      }

      if (this.customClients && this.customClients.length > 0) {
        const clientRows = this.customClients.map(clientToSupabaseRow);
        const { error: cErr } = await supabase.from(TABLE_CLIENTS).upsert(clientRows);
        if (cErr) throw cErr;
      }

      return {
        success: true,
        bookingsCount: this.bookings.length,
        clientsCount: this.customClients.length
      };
    } catch (err) {
      console.error('[Supabase Sync All Error]:', err);
      return { success: false, error: err.message };
    }
  }

  init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 25) {
          this.bookings = parsed;
          let backfilled = false;
          this.bookings.forEach((b, idx) => {
            if (!b.orderNumber) {
              b.orderNumber = 41 + idx;
              b.orderCode = `CMD-${String(b.orderNumber).padStart(3, '0')}`;
              backfilled = true;
            }
            if (!b.lang) {
              if (b.id === 'LM-8422' || b.id === 'LM-8425') b.lang = 'nl';
              else if (b.id === 'LM-8423') b.lang = 'en';
              else b.lang = 'fr';
              backfilled = true;
            }
            if (!b.childBirthDate && (b.childAge || b.childName)) {
              const age = b.childAge || 10;
              const bYear = 2026 - age;
              const bMonth = String(1 + ((idx * 2) % 12)).padStart(2, '0');
              const bDay = String(1 + ((idx * 3) % 27)).padStart(2, '0');
              b.childBirthDate = `${bYear}-${bMonth}-${bDay}`;
              backfilled = true;
            }
          });
          if (backfilled) {
            this.persist(false);
          }
        } else {
          this.bookings = getInitialBookings();
          this.persist();
        }
      } else {
        this.bookings = getInitialBookings();
        this.persist();
      }
    } catch (e) {
      console.warn("Storage error, resetting bookings", e);
      this.bookings = getInitialBookings();
    }

    try {
      const storedClients = localStorage.getItem(CUSTOM_CLIENTS_KEY);
      if (storedClients) {
        this.customClients = JSON.parse(storedClients);
      }
    } catch (e) {
      this.customClients = [];
    }

    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC') {
          const fresh = localStorage.getItem(STORAGE_KEY);
          if (fresh) {
            this.bookings = JSON.parse(fresh);
            this.notify(false);
          }
        } else if (event.data && event.data.type === 'SYNC_CLIENTS') {
          const freshClients = localStorage.getItem(CUSTOM_CLIENTS_KEY);
          if (freshClients) {
            this.customClients = JSON.parse(freshClients);
            this.notify(false);
          }
        }
      };
    }
  }

  persist(broadcast = true) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookings));
    if (broadcast && broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC', timestamp: Date.now() });
    }
  }

  persistCustomClients(broadcast = true) {
    localStorage.setItem(CUSTOM_CLIENTS_KEY, JSON.stringify(this.customClients));
    if (broadcast && broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC_CLIENTS', timestamp: Date.now() });
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(broadcast = true) {
    this.listeners.forEach(listener => listener(this.bookings));
    if (broadcast) {
      this.persist(true);
    }
  }

  getAll() {
    return [...this.bookings];
  }

  getById(id) {
    return this.bookings.find(b => b.id === id);
  }

  getClients() {
    const clientMap = new Map();

    this.bookings.forEach(b => {
      const cleanPhone = (b.phone || '').replace(/[^0-9]/g, '');
      const cleanEmail = (b.email || '').toLowerCase().trim();
      const clientKey = cleanPhone || cleanEmail || (b.customerName ? b.customerName.toLowerCase().replace(/\s+/g, '_') : 'client');

      if (!clientMap.has(clientKey)) {
        clientMap.set(clientKey, {
          id: `cli_${clientKey.substring(0, 16)}`,
          customerName: b.customerName,
          phone: b.phone || '',
          email: b.email || '',
          lang: b.lang || 'fr',
          isCorporate: !!b.isCorporate,
          companyName: b.companyName || '',
          vatNumber: b.vatNumber || '',
          billingAddress: b.billingAddress || '',
          contactRole: b.contactRole || '',
          poNumber: b.poNumber || '',
          firstSeen: b.date || b.createdAt,
          lastSeen: b.date || b.createdAt,
          bookingsCount: 0,
          totalSpent: 0,
          totalDeposit: 0,
          barTabTotal: 0,
          children: [],
          bookings: [],
          notes: b.specialNotes || ''
        });
      }

      const client = clientMap.get(clientKey);
      client.bookingsCount += 1;
      client.totalSpent += (b.totalAmount || 0);
      client.totalDeposit += (b.depositPaid || 0);
      client.barTabTotal += (b.barTabTotal || 0);

      if (b.isCorporate) {
        client.isCorporate = true;
        if (b.companyName) client.companyName = b.companyName;
        if (b.vatNumber) client.vatNumber = b.vatNumber;
        if (b.billingAddress) client.billingAddress = b.billingAddress;
        if (b.contactRole) client.contactRole = b.contactRole;
        if (b.poNumber) client.poNumber = b.poNumber;
      }

      if (b.childName && !client.children.some(c => c.name === b.childName)) {
        client.children.push({
          name: b.childName,
          dob: b.childBirthDate || null,
          age: b.childAge || null
        });
      }

      if (b.date && (!client.lastSeen || b.date > client.lastSeen)) {
        client.lastSeen = b.date;
      }

      client.bookings.push({
        id: b.id,
        orderNumber: b.orderNumber,
        orderCode: b.orderCode,
        date: b.date,
        timeSlot: b.timeSlot,
        packageName: b.packageName,
        players: b.players,
        totalAmount: b.totalAmount,
        depositPaid: b.depositPaid || 0,
        balanceDue: b.balanceDue || 0,
        status: b.status,
        barTabTotal: b.barTabTotal || 0
      });
    });

    // Merge custom / imported clients from Amelia
    (this.customClients || []).forEach(cc => {
      const cleanPhone = (cc.phone || '').replace(/[^0-9]/g, '');
      const cleanEmail = (cc.email || '').toLowerCase().trim();
      const clientKey = cleanPhone || cleanEmail || (cc.customerName ? cc.customerName.toLowerCase().replace(/\s+/g, '_') : cc.id);

      if (!clientMap.has(clientKey)) {
        clientMap.set(clientKey, {
          id: cc.id || `cli_${clientKey.substring(0, 16)}`,
          customerName: cc.customerName || 'Client Amelia',
          phone: cc.phone || '',
          email: cc.email || '',
          lang: cc.lang || 'fr',
          isCorporate: !!cc.isCorporate,
          companyName: cc.companyName || '',
          vatNumber: cc.vatNumber || '',
          billingAddress: cc.billingAddress || '',
          contactRole: cc.contactRole || '',
          poNumber: cc.poNumber || '',
          firstSeen: cc.firstSeen || new Date().toISOString().split('T')[0],
          lastSeen: cc.lastSeen || new Date().toISOString().split('T')[0],
          bookingsCount: cc.bookingsCount || 1,
          totalSpent: cc.totalSpent || 0,
          totalDeposit: cc.totalDeposit || 0,
          barTabTotal: 0,
          children: cc.children || [],
          bookings: cc.bookings || [],
          notes: cc.notes || '',
          source: cc.source || 'amelia'
        });
      } else {
        const existing = clientMap.get(clientKey);
        if (cc.customerName && !existing.customerName) existing.customerName = cc.customerName;
        if (cc.notes) existing.notes = (existing.notes ? `${existing.notes} | ` : '') + cc.notes;
        if (cc.isCorporate) {
          existing.isCorporate = true;
          if (cc.companyName) existing.companyName = cc.companyName;
          if (cc.vatNumber) existing.vatNumber = cc.vatNumber;
          if (cc.billingAddress) existing.billingAddress = cc.billingAddress;
        }
        if (cc.children && cc.children.length > 0) {
          existing.children = existing.children || [];
          cc.children.forEach(ch => {
            if (!existing.children.some(c => c.name === ch.name)) {
              existing.children.push(ch);
            }
          });
        }
        if (cc.bookingsCount && (!existing.bookingsCount || existing.bookingsCount < cc.bookingsCount)) {
          existing.bookingsCount = Math.max(existing.bookingsCount, cc.bookingsCount);
        }
        if (cc.totalSpent && existing.totalSpent === 0) {
          existing.totalSpent = cc.totalSpent;
        }
      }
    });

    return Array.from(clientMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }

  importAmeliaClients(clientsList) {
    if (!Array.isArray(clientsList) || clientsList.length === 0) {
      return { added: 0, updated: 0, total: 0 };
    }

    let addedCount = 0;
    let updatedCount = 0;

    clientsList.forEach(item => {
      const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
      const cleanEmail = (item.email || '').toLowerCase().trim();

      const existingIdx = this.customClients.findIndex(c => {
        const cPhone = (c.phone || '').replace(/[^0-9]/g, '');
        const cEmail = (c.email || '').toLowerCase().trim();
        return (cleanPhone && cPhone && cleanPhone === cPhone) ||
               (cleanEmail && cEmail && cleanEmail === cEmail);
      });

      if (existingIdx >= 0) {
        const existing = this.customClients[existingIdx];
        if (item.customerName) existing.customerName = item.customerName;
        if (item.phone) existing.phone = item.phone;
        if (item.email) existing.email = item.email;
        if (item.notes) existing.notes = (existing.notes ? `${existing.notes} | ` : '') + item.notes;
        if (item.companyName) {
          existing.companyName = item.companyName;
          existing.isCorporate = true;
        }
        if (item.vatNumber) {
          existing.vatNumber = item.vatNumber;
          existing.isCorporate = true;
        }
        if (item.billingAddress) existing.billingAddress = item.billingAddress;
        if (item.bookingsCount) existing.bookingsCount = Math.max(existing.bookingsCount || 1, item.bookingsCount);
        if (item.totalSpent) existing.totalSpent = Math.max(existing.totalSpent || 0, item.totalSpent);
        if (item.children && item.children.length > 0) {
          existing.children = existing.children || [];
          item.children.forEach(ch => {
            if (!existing.children.some(c => c.name === ch.name)) {
              existing.children.push(ch);
            }
          });
        }
        updatedCount++;
      } else {
        const id = item.id || `cli_am_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        this.customClients.push({
          id,
          customerName: item.customerName || 'Client Amelia',
          phone: item.phone || '',
          email: item.email || '',
          lang: item.lang || 'fr',
          isCorporate: !!item.isCorporate,
          companyName: item.companyName || '',
          vatNumber: item.vatNumber || '',
          billingAddress: item.billingAddress || '',
          firstSeen: item.firstSeen || new Date().toISOString().split('T')[0],
          lastSeen: item.lastSeen || new Date().toISOString().split('T')[0],
          bookingsCount: item.bookingsCount || 1,
          totalSpent: item.totalSpent || 0,
          totalDeposit: item.totalDeposit || 0,
          barTabTotal: 0,
          children: item.children || [],
          bookings: item.bookings || [],
          notes: item.notes || '',
          source: 'amelia'
        });
        addedCount++;
      }
    });

    this.persistCustomClients();
    this.notify();
    if (isSupabaseConfigured && supabase && Array.isArray(this.customClients)) {
      const rows = this.customClients.map(clientToSupabaseRow);
      supabase.from(TABLE_CLIENTS).upsert(rows).catch(e => console.warn('[Supabase Clients Upsert Error]:', e));
    }
    return { added: addedCount, updated: updatedCount, total: clientsList.length };
  }

  getClientById(id) {
    return this.getClients().find(c => c.id === id);
  }

  addBooking(bookingData) {
    const id = "LM-" + Math.floor(1000 + Math.random() * 9000);
    const isOnlinePaid = bookingData.paymentMethod === 'stripe' || bookingData.paymentMethod === 'bancontact';
    const clientLang = bookingData.lang || 'fr';
    const maxOrder = this.bookings.reduce((max, b) => Math.max(max, b.orderNumber || 0), 40);
    const orderNumber = maxOrder + 1;
    const orderCode = `CMD-${String(orderNumber).padStart(3, '0')}`;

    const newBooking = {
      id,
      orderNumber,
      orderCode,
      lang: clientLang,
      createdAt: new Date().toISOString(),
      clientConfirmedAt: null,
      paymentStatus: isOnlinePaid ? 'deposit_paid' : 'unpaid',
      status: bookingData.status || (isOnlinePaid ? 'confirmed' : 'pending'),
      arena: bookingData.arena || (Math.random() > 0.5 ? 'jungle' : 'prison'),
      tableNumber: bookingData.tableNumber || Math.floor(1 + Math.random() * 8),
      teams: {
        red: [],
        blue: []
      },
      isCorporate: !!bookingData.isCorporate,
      companyName: bookingData.companyName || '',
      vatNumber: bookingData.vatNumber || '',
      enterpriseNumber: bookingData.enterpriseNumber || '',
      billingAddress: bookingData.billingAddress || null,
      contactRole: bookingData.contactRole || '',
      poNumber: bookingData.poNumber || '',
      vatValidation: bookingData.vatValidation || null,
      barTabOrders: bookingData.barTabOrders || [],
      barTabTotal: bookingData.barTabTotal || 0,
      communicationLog: [
        {
          timestamp: new Date().toISOString(),
          channel: 'email',
          type: 'booking_confirmation',
          status: 'sent',
          detail: `E-mail de confirmation & acompte envoyé à ${bookingData.email}`
        },
        {
          timestamp: new Date().toISOString(),
          channel: 'whatsapp',
          type: 'whatsapp_recap',
          status: 'ready',
          detail: `Message WhatsApp prêt pour ${bookingData.phone}`
        }
      ],
      ...bookingData
    };

    this.bookings.unshift(newBooking);
    this.notify(true);
    if (isSupabaseConfigured && supabase) {
      supabase.from(TABLE_BOOKINGS).upsert(bookingToSupabaseRow(newBooking)).catch(e => console.warn('[Supabase Insert Error]:', e));
    }
    this.dispatchWebhook('booking.created', newBooking);
    return newBooking;
  }

  confirmByClient(id, updates = {}) {
    const b = this.getById(id);
    if (!b) return null;

    const commLog = b.communicationLog || [];
    commLog.push({
      timestamp: new Date().toISOString(),
      channel: 'email_portal',
      type: 'client_confirmed',
      status: 'confirmed',
      detail: 'Présence confirmée par le client via le lien magique'
    });

    return this.updateBooking(id, {
      status: 'confirmed',
      clientConfirmedAt: new Date().toISOString(),
      communicationLog: commLog,
      ...updates
    });
  }

  recordCommunication(id, data = {}) {
    const b = this.getById(id);
    if (!b) return null;

    const channel = data.channel || data.type || 'email';
    const messageType = data.messageType || data.type || 'confirmation';
    const status = data.status || 'sent';
    const recipient = data.recipient || (channel === 'whatsapp' ? b.phone : b.email);
    const detail = data.detail || data.notes || '';
    const provider = data.provider || 'default';
    const sentAt = data.sentAt || data.timestamp || new Date().toISOString();
    const error = data.error || null;
    const messageId = data.messageId || data.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const commLog = b.communicationLog || [];
    commLog.unshift({
      id: messageId,
      timestamp: sentAt,
      sentAt,
      channel,
      type: channel,
      messageType,
      recipient,
      status,
      detail,
      notes: detail,
      provider,
      error
    });

    recordCommLog({
      id: messageId,
      timestamp: sentAt,
      bookingId: b.id,
      orderNumber: b.orderNumber,
      orderCode: b.orderCode,
      customerName: b.customerName,
      channel,
      messageType,
      recipient,
      status,
      detail,
      provider,
      error
    });

    return this.updateBooking(id, { communicationLog: commLog });
  }

  recordBalancePayment(id, amount, method = 'onsite_bancontact') {
    const b = this.getById(id);
    if (!b) return null;

    const commLog = b.communicationLog || [];
    commLog.unshift({
      timestamp: new Date().toISOString(),
      channel: 'onsite',
      type: 'balance_paid',
      status: 'paid',
      detail: `Solde de ${amount} € réglé sur place (${method})`
    });

    return this.updateBooking(id, {
      depositPaid: b.totalAmount,
      balanceDue: 0,
      paymentStatus: 'fully_paid',
      paymentMethod: method,
      status: b.status === 'pending' ? 'confirmed' : b.status,
      communicationLog: commLog
    });
  }

  addBarTabOrder(id, orderData) {
    const b = this.getById(id);
    if (!b) return null;

    const currentOrders = b.barTabOrders || [];
    const newOrder = {
      orderId: orderData.orderId || `ORD-${Date.now().toString(36).toUpperCase()}`,
      createdAt: orderData.createdAt || new Date().toISOString(),
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      paymentStatus: orderData.paymentStatus || 'tab_pending',
      paymentMethod: orderData.paymentMethod || 'table_tab',
      tableNumber: orderData.tableNumber || b.tableNumber || 1,
      customerName: orderData.customerName || b.customerName || `Table ${b.tableNumber}`,
      status: orderData.status || 'sent', // 'sent' -> 'preparing' -> 'ready' -> 'delivered'
      notes: orderData.notes || '',
      orderSource: orderData.orderSource || 'mobile_table_qr'
    };

    const updatedOrders = [...currentOrders, newOrder];
    const barTabTotal = updatedOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const totalAmount = (b.subtotal || 0) + (b.addonsTotal || 0) + barTabTotal;
    
    let depositPaid = b.depositPaid || 0;
    if (orderData.paymentStatus === 'paid') {
      depositPaid += orderData.subtotal;
    }
    const balanceDue = Math.max(0, totalAmount - depositPaid);

    const commLog = b.communicationLog || [];
    commLog.unshift({
      timestamp: new Date().toISOString(),
      channel: 'onsite',
      type: 'bar_consumption',
      status: orderData.paymentStatus === 'paid' ? 'paid' : 'tab_recorded',
      detail: `Consommations Bar ajoutées (#${newOrder.orderId}) : ${(newOrder.items || []).map(i => `${i.qty}× ${i.name}`).join(', ')} (${(orderData.subtotal || 0).toLocaleString('fr-BE', { minimumFractionDigits: 2 })} €)`
    });

    return this.updateBooking(id, {
      barTabOrders: updatedOrders,
      barTabTotal: barTabTotal,
      totalAmount: totalAmount,
      depositPaid: depositPaid,
      balanceDue: balanceDue,
      communicationLog: commLog
    });
  }

  updateBarOrderStatus(bookingId, orderId, newStatus) {
    const b = this.getById(bookingId);
    if (!b || !b.barTabOrders) return null;

    let found = false;
    const updatedOrders = b.barTabOrders.map(o => {
      if (o.orderId === orderId) {
        found = true;
        return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return o;
    });

    if (!found) return null;
    return this.updateBooking(bookingId, { barTabOrders: updatedOrders });
  }

  getActiveBookingForTable(tableNumber, targetDate = null) {
    const tNum = parseInt(tableNumber, 10);
    if (isNaN(tNum) || tNum < 1) return null;

    const dateStr = targetDate || new Date().toISOString().split('T')[0];
    const validBookings = this.bookings.filter(b => b.tableNumber === tNum && b.status !== 'cancelled');

    if (validBookings.length === 0) return null;

    // 1. Try exact date match with active status
    const onDate = validBookings.filter(b => b.date === dateStr);
    if (onDate.length > 0) {
      // Prioritize arrived or in_game, then confirmed, then pending
      const activeMatch = onDate.find(b => b.status === 'in_game' || b.status === 'arrived');
      if (activeMatch) return activeMatch;
      const confirmedMatch = onDate.find(b => b.status === 'confirmed');
      if (confirmedMatch) return confirmedMatch;
      return onDate[0];
    }

    // 2. If no booking on dateStr, find closest upcoming or most recent booking for this table
    const sorted = [...validBookings].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return sorted[0] || null;
  }

  getBookingByIdOrCode(query) {
    if (!query) return null;
    const q = String(query).trim().toLowerCase();
    const cleanDigits = q.replace(/[^0-9]/g, '');

    return this.bookings.find(b => {
      if (b.id && b.id.toLowerCase() === q) return true;
      if (b.orderCode && b.orderCode.toLowerCase() === q) return true;
      if (b.orderNumber && String(b.orderNumber) === q) return true;
      if (q.startsWith('lm-') && b.id && b.id.toLowerCase().includes(q)) return true;
      if (cleanDigits.length >= 4) {
        const bPhone = (b.phone || '').replace(/[^0-9]/g, '');
        if (bPhone.endsWith(cleanDigits)) return true;
      }
      return false;
    }) || null;
  }

  createWalkInTableBooking(tableNumber) {
    const tNum = parseInt(tableNumber, 10) || 1;
    const today = new Date().toISOString().split('T')[0];
    const maxOrder = this.bookings.reduce((max, b) => Math.max(max, b.orderNumber || 0), 40);
    const orderNumber = maxOrder + 1;
    const id = `LM-BAR-T${tNum}-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking = {
      id,
      orderNumber,
      orderCode: `BAR-T${tNum}-${orderNumber}`,
      lang: 'fr',
      createdAt: new Date().toISOString(),
      clientConfirmedAt: new Date().toISOString(),
      paymentStatus: 'unpaid',
      status: 'arrived',
      arena: 'jungle',
      date: today,
      timeSlot: 'Consommations Table',
      packageName: 'Bar & Petite Restauration',
      packageId: 'bar_only',
      players: 1,
      pricePerPlayer: 0,
      subtotal: 0,
      addonsTotal: 0,
      totalAmount: 0,
      depositPaid: 0,
      balanceDue: 0,
      customerName: `Client Table ${tNum}`,
      phone: '',
      email: '',
      tableNumber: tNum,
      barTabOrders: [],
      barTabTotal: 0,
      communicationLog: [{
        timestamp: new Date().toISOString(),
        channel: 'onsite',
        type: 'walk_in_opened',
        status: 'active',
        detail: `Compte Bar ouvert automatiquement pour la Table ${tNum}`
      }]
    };

    this.bookings.unshift(newBooking);
    this.persist(true);
    this.notify(true);
    if (isSupabaseConfigured && supabase) {
      supabase.from(TABLE_BOOKINGS).upsert(bookingToSupabaseRow(newBooking)).catch(e => console.warn('[Supabase Insert Error]:', e));
    }
    return newBooking;
  }

  getAllPendingBarOrders() {
    const list = [];
    this.bookings.forEach(b => {
      (b.barTabOrders || []).forEach(o => {
        if (o.status === 'sent' || o.status === 'preparing') {
          list.push({
            ...o,
            bookingId: b.id,
            bookingCustomerName: b.customerName,
            bookingTableNumber: b.tableNumber
          });
        }
      });
    });
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  settleBarTab(id, amount = null) {
    const b = this.getById(id);
    if (!b) return null;

    const currentOrders = b.barTabOrders || [];
    const unpaidAmount = currentOrders
      .filter(o => o.paymentStatus !== 'paid')
      .reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const settleAmount = amount !== null ? amount : unpaidAmount;

    const settledOrders = currentOrders.map(o => ({
      ...o,
      paymentStatus: 'paid',
      settledAt: new Date().toISOString()
    }));

    const depositPaid = (b.depositPaid || 0) + settleAmount;
    const balanceDue = Math.max(0, (b.totalAmount || 0) - depositPaid);

    const commLog = b.communicationLog || [];
    commLog.unshift({
      timestamp: new Date().toISOString(),
      channel: 'onsite',
      type: 'tab_settled',
      status: 'paid',
      detail: `Ardoise bar soldée sur place : ${settleAmount.toLocaleString('fr-BE', { minimumFractionDigits: 2 })} € encaissés`
    });

    return this.updateBooking(id, {
      barTabOrders: settledOrders,
      depositPaid: depositPaid,
      balanceDue: balanceDue,
      communicationLog: commLog
    });
  }

  updateCorporateDetails(id, corporateData) {
    return this.updateBooking(id, {
      isCorporate: true,
      companyName: corporateData.companyName || '',
      vatNumber: corporateData.vatNumber || '',
      enterpriseNumber: corporateData.enterpriseNumber || '',
      billingAddress: corporateData.billingAddress || null,
      contactRole: corporateData.contactRole || '',
      poNumber: corporateData.poNumber || '',
      vatValidation: corporateData.vatValidation || null
    });
  }

  updateBooking(id, partial) {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.bookings[idx] = { ...this.bookings[idx], ...partial };
      const updated = this.bookings[idx];
      this.notify(true);
      if (isSupabaseConfigured && supabase) {
        supabase.from(TABLE_BOOKINGS).upsert(bookingToSupabaseRow(updated)).catch(e => console.warn('[Supabase Update Error]:', e));
      }
      return updated;
    }
    return null;
  }

  updateStatus(id, newStatus) {
    const updated = this.updateBooking(id, { status: newStatus });
    if (updated) {
      this.dispatchWebhook('booking.status_updated', updated);
    }
    return updated;
  }

  deleteBooking(id) {
    const b = this.getById(id);
    this.bookings = this.bookings.filter(b => b.id !== id);
    this.notify(true);
    if (isSupabaseConfigured && supabase) {
      supabase.from(TABLE_BOOKINGS).delete().eq('id', id).catch(e => console.warn('[Supabase Delete Error]:', e));
    }
    if (b) {
      this.dispatchWebhook('booking.cancelled', b);
    }
  }

  sendBirthdayCoupon(id, customDiscount = 15) {
    const b = this.getById(id);
    if (!b) return null;
    const commLog = b.communicationLog || [];
    const code = `ANNIV-${(b.childName || 'LASER').toUpperCase().replace(/[^A-Z]/g, '') || 'VIP'}-${customDiscount}`;
    commLog.push({
      timestamp: new Date().toISOString(),
      channel: 'email',
      type: 'birthday_coupon',
      status: 'sent',
      sentAt: new Date().toISOString(),
      recipient: b.email,
      notes: `Coupon Anniversaire -${customDiscount}% (${code}) envoyé pour l'anniversaire de ${b.childName || 'l\'enfant'}`
    });
    const updated = this.updateBooking(id, { 
      communicationLog: commLog,
      lastBirthdayCouponSentAt: new Date().toISOString(),
      activeBirthdayCoupon: {
        code,
        discountPercent: customDiscount,
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString()
      }
    });
    this.dispatchWebhook('marketing.birthday_coupon_sent', {
      booking_id: b.id,
      child_name: b.childName,
      child_birth_date: b.childBirthDate,
      coupon_code: code,
      discount_percent: customDiscount,
      recipient_email: b.email
    });
    return updated;
  }

  // Webhook Dispatcher
  dispatchWebhook(eventType, booking) {
    if (!booking) return;
    const config = getWebhookConfig();
    if (!config.enabled) return;

    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      webhook_id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      order: {
        order_number: booking.orderNumber || 42,
        order_code: booking.orderCode || `CMD-${String(booking.orderNumber || 42).padStart(3, '0')}`,
        booking_id: booking.id,
        source: "LaserMagic_Backoffice",
        customer: {
          name: booking.customerName,
          phone: booking.phone,
          email: booking.email,
          language: booking.lang || 'fr'
        },
        booking: {
          date: booking.date,
          time_slot: booking.timeSlot,
          arena: booking.arena,
          table_number: booking.tableNumber,
          package_name: booking.packageName,
          players_count: booking.players,
          child_name: booking.childName || '',
          child_age: booking.childAge || null
        },
        items: [
          { type: "package", name: booking.packageName, qty: booking.players, unit_price: booking.unitPrice, total: booking.subtotal },
          ...(booking.addons || []).map(a => ({ type: "addon", name: a.name, qty: a.qty, unit_price: a.unitPrice, total: a.total }))
        ],
        financials: {
          total_amount: booking.totalAmount,
          deposit_paid: booking.depositPaid,
          balance_due: booking.balanceDue,
          currency: "EUR",
          payment_method: booking.paymentMethod,
          status: booking.status
        }
      }
    };

    recordWebhookLog({
      event: eventType,
      orderNumber: booking.orderNumber || 42,
      orderCode: booking.orderCode || `CMD-${String(booking.orderNumber || 42).padStart(3, '0')}`,
      bookingId: booking.id,
      status: 200,
      url: config.url,
      payload
    });
  }

  // Get active bookings for a specific date
  getBookingsByDate(dateStr) {
    return this.bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
  }

  // Check arena capacity for a time slot
  getSlotCapacity(dateStr, timeSlot, arena = null) {
    const relevant = this.bookings.filter(b => 
      b.date === dateStr && 
      b.timeSlot === timeSlot && 
      b.status !== 'cancelled' &&
      (!arena || b.arena === arena || b.arena === 'combined')
    );

    const playersBooked = relevant.reduce((sum, b) => sum + (b.players || 0), 0);
    const maxCapacity = arena ? 22 : 44;
    const remaining = Math.max(0, maxCapacity - playersBooked);

    return {
      booked: playersBooked,
      max: maxCapacity,
      remaining,
      isFull: remaining <= 0
    };
  }

  // Reset to demo data
  resetDemoData() {
    this.bookings = getInitialBookings();
    this.persist(true);
    this.notify(false);
  }
}

// Webhook Configuration & Logs Management
const WEBHOOK_CONFIG_KEY = 'laser_magic_webhook_config';
const WEBHOOK_LOG_KEY = 'laser_magic_webhook_logs';

export function getWebhookConfig() {
  try {
    const stored = localStorage.getItem(WEBHOOK_CONFIG_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {
    url: 'https://api.lasermagic.be/webhook/orders',
    secret: 'whsec_laser_' + Math.random().toString(36).substring(2, 10),
    events: ['booking.created', 'booking.client_confirmed', 'payment.deposit_received', 'pos.order_sync'],
    enabled: true
  };
}

export function saveWebhookConfig(config) {
  localStorage.setItem(WEBHOOK_CONFIG_KEY, JSON.stringify(config));
}

export function getWebhookLogs() {
  try {
    const stored = localStorage.getItem(WEBHOOK_LOG_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [
    {
      id: "wh_log_init_1",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      event: "booking.created",
      orderNumber: 42,
      orderCode: "CMD-042",
      bookingId: "LM-8421",
      status: 200,
      url: "https://api.lasermagic.be/webhook/orders",
      payload: {
        event: "booking.created",
        order_number: 42,
        order_code: "CMD-042",
        source: "LaserMagic_Backoffice",
        customer: "Jean-François Moreau",
        formula: "Formule Fun",
        total: 340
      }
    }
  ];
}

export function recordWebhookLog(logEntry) {
  const logs = getWebhookLogs();
  logs.unshift({
    id: "wh_log_" + Date.now(),
    timestamp: new Date().toISOString(),
    ...logEntry
  });
  if (logs.length > 25) logs.pop();
  localStorage.setItem(WEBHOOK_LOG_KEY, JSON.stringify(logs));
}

// Communications (Email & WhatsApp) Configuration & Audit Logs
const COMM_CONFIG_KEY = 'laser_magic_comm_config';
const COMM_LOGS_KEY = 'laser_magic_comm_logs';

export function getCommConfig() {
  const envBrevoKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BREVO_API_KEY) ? import.meta.env.VITE_BREVO_API_KEY : '';
  try {
    const stored = localStorage.getItem(COMM_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.email) {
        if (envBrevoKey) {
          parsed.email.apiKey = envBrevoKey;
        }
        if (!parsed.email.senderEmail || parsed.email.senderEmail === 'reservations@lasermagic.be') {
          parsed.email.senderEmail = 'jeka7ro@gmail.com';
        }
      }
      return parsed;
    }
  } catch (e) {}
  const defaultConfig = {
    email: {
      provider: 'brevo', // 'brevo' | 'resend' | 'sendgrid' | 'webhook_proxy' | 'simulated'
      apiKey: envBrevoKey || '',
      senderEmail: 'jeka7ro@gmail.com',
      senderName: 'Laser Magic Vilvoorde',
      webhookUrl: 'https://api.lasermagic.be/mail/send',
      autoSendOnBooking: true,
      autoSendOnConfirmation: true
    },
    whatsapp: {
      provider: 'meta_cloud', // 'meta_cloud' | 'twilio' | 'webhook_proxy' | 'whatsapp_web'
      metaPhoneNumberId: '104857291048591',
      metaAccessToken: 'EAAG_laser_live_access_token_v19',
      twilioAccountSid: 'AC9823471029348123',
      twilioAuthToken: 'auth_laser_twilio_live',
      twilioFromNumber: 'whatsapp:+3222532222',
      webhookUrl: 'https://api.lasermagic.be/whatsapp/send',
      autoSendOnBooking: false,
      autoSendOnConfirmation: true
    }
  };
  saveCommConfig(defaultConfig);
  return defaultConfig;
}

export function saveCommConfig(config) {
  localStorage.setItem(COMM_CONFIG_KEY, JSON.stringify(config));
}

export function getCommLogs() {
  try {
    const stored = localStorage.getItem(COMM_LOGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [
    {
      id: "msg_init_01",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      bookingId: "LM-8421",
      orderNumber: 42,
      orderCode: "CMD-042",
      customerName: "Jean-François Moreau",
      channel: "email",
      messageType: "booking_confirmation",
      recipient: "jf.moreau@skynet.be",
      status: "delivered",
      detail: "Confirmation de réservation #LM-8421 avec acompte Bancontact",
      provider: "Resend",
      error: null
    },
    {
      id: "msg_init_02",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      bookingId: "LM-8422",
      orderNumber: 43,
      orderCode: "CMD-043",
      customerName: "Anke Van den Bossche",
      channel: "whatsapp",
      messageType: "whatsapp_recap",
      recipient: "+32 495 12 34 56",
      status: "sent",
      detail: "Récapitulatif WhatsApp envoyé (NL) avec lien portail client",
      provider: "Meta WhatsApp Cloud",
      error: null
    },
    {
      id: "msg_init_03",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      bookingId: "LM-8424",
      orderNumber: 45,
      orderCode: "CMD-045",
      customerName: "Sophie Delaunois",
      channel: "email",
      messageType: "booking_confirmation",
      recipient: "sophie.delaunois@gmail.com",
      status: "delivered",
      detail: "Confirmation de réservation #LM-8424 avec acompte Bancontact",
      provider: "Resend",
      error: null
    }
  ];
}

export function recordCommLog(logEntry) {
  const logs = getCommLogs();
  logs.unshift({
    id: logEntry.id || "msg_" + Date.now(),
    timestamp: logEntry.timestamp || new Date().toISOString(),
    ...logEntry
  });
  if (logs.length > 50) logs.pop();
  localStorage.setItem(COMM_LOGS_KEY, JSON.stringify(logs));
}

export const store = new Store();

