// Supabase Client & Data Adapters for Laser Magic
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey.length > 20
);

export const TABLE_BOOKINGS = 'laser_bookings';
export const TABLE_CLIENTS = 'laser_clients';
export const TABLE_SETTINGS = 'laser_app_settings';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// Converteste un obiect booking din JS in format rand Supabase
export function bookingToSupabaseRow(b) {
  if (!b) return null;
  return {
    id: b.id,
    order_number: b.orderNumber || null,
    order_code: b.orderCode || null,
    date: b.date || null,
    time_slot: b.timeSlot || null,
    status: b.status || 'pending',
    customer_name: b.customerName || null,
    email: b.email || null,
    phone: b.phone || null,
    players: Number(b.players || 0),
    table_number: b.tableNumber ? Number(b.tableNumber) : null,
    package_id: b.packageId || null,
    package_name: b.packageName || null,
    total_amount: Number(b.totalAmount || 0),
    deposit_paid: Number(b.depositPaid || 0),
    balance_due: Number(b.balanceDue || 0),
    payment_method: b.paymentMethod || null,
    payment_status: b.paymentStatus || null,
    bar_tab_total: Number(b.barTabTotal || 0),
    lang: b.lang || 'fr',
    payload: b, // Salveaza intregul obiect (echipe, consumatii, istoric mesaje etc.)
    updated_at: new Date().toISOString()
  };
}

// Reconstituie obiectul JS complet dintr-un rand Supabase
export function supabaseRowToBooking(row) {
  if (!row) return null;
  const base = (row.payload && typeof row.payload === 'object') ? { ...row.payload } : {};
  return {
    ...base,
    id: row.id,
    orderNumber: row.order_number ?? base.orderNumber,
    orderCode: row.order_code ?? base.orderCode,
    date: row.date ?? base.date,
    timeSlot: row.time_slot ?? base.timeSlot,
    status: row.status ?? base.status,
    customerName: row.customer_name ?? base.customerName,
    email: row.email ?? base.email,
    phone: row.phone ?? base.phone,
    players: row.players != null ? Number(row.players) : base.players,
    tableNumber: row.table_number != null ? Number(row.table_number) : base.tableNumber,
    packageId: row.package_id ?? base.packageId,
    packageName: row.package_name ?? base.packageName,
    totalAmount: Number(row.total_amount ?? base.totalAmount ?? 0),
    depositPaid: Number(row.deposit_paid ?? base.depositPaid ?? 0),
    balanceDue: Number(row.balance_due ?? base.balanceDue ?? 0),
    paymentMethod: row.payment_method ?? base.paymentMethod,
    paymentStatus: row.payment_status ?? base.paymentStatus,
    barTabTotal: Number(row.bar_tab_total ?? base.barTabTotal ?? 0),
    lang: row.lang ?? base.lang ?? 'fr'
  };
}

// Converteste un obiect client din JS in format rand Supabase
export function clientToSupabaseRow(c) {
  if (!c) return null;
  return {
    id: c.id,
    customer_name: c.customerName || null,
    phone: c.phone || null,
    email: c.email || null,
    lang: c.lang || 'fr',
    is_corporate: Boolean(c.isCorporate),
    company_name: c.companyName || null,
    vat_number: c.vatNumber || null,
    first_seen: c.firstSeen || null,
    last_seen: c.lastSeen || null,
    bookings_count: Number(c.bookingsCount || 1),
    total_spent: Number(c.totalSpent || 0),
    total_deposit: Number(c.totalDeposit || 0),
    source: c.source || 'direct',
    payload: c,
    updated_at: new Date().toISOString()
  };
}

// Reconstituie obiectul client dintr-un rand Supabase
export function supabaseRowToClient(row) {
  if (!row) return null;
  const base = (row.payload && typeof row.payload === 'object') ? { ...row.payload } : {};
  return {
    ...base,
    id: row.id,
    customerName: row.customer_name ?? base.customerName,
    phone: row.phone ?? base.phone,
    email: row.email ?? base.email,
    lang: row.lang ?? base.lang,
    isCorporate: row.is_corporate != null ? Boolean(row.is_corporate) : base.isCorporate,
    companyName: row.company_name ?? base.companyName,
    vatNumber: row.vat_number ?? base.vatNumber,
    firstSeen: row.first_seen ?? base.firstSeen,
    lastSeen: row.last_seen ?? base.lastSeen,
    bookingsCount: Number(row.bookings_count ?? base.bookingsCount ?? 1),
    totalSpent: Number(row.total_spent ?? base.totalSpent ?? 0),
    totalDeposit: Number(row.total_deposit ?? base.totalDeposit ?? 0),
    source: row.source ?? base.source ?? 'direct'
  };
}
