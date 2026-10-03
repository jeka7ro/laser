-- ==============================================================================
-- Laser Magic (Vilvoorde / Bruxelles) - Supabase Database Schema
-- Rulati acest script in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. TABELUL: REZERVARI (bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    order_number INTEGER,
    order_code TEXT,
    date DATE,
    time_slot TEXT,
    status TEXT DEFAULT 'pending',
    customer_name TEXT,
    email TEXT,
    phone TEXT,
    players INTEGER DEFAULT 10,
    table_number INTEGER,
    package_id TEXT,
    package_name TEXT,
    total_amount NUMERIC(10, 2) DEFAULT 0,
    deposit_paid NUMERIC(10, 2) DEFAULT 0,
    balance_due NUMERIC(10, 2) DEFAULT 0,
    payment_method TEXT,
    payment_status TEXT,
    bar_tab_total NUMERIC(10, 2) DEFAULT 0,
    lang TEXT DEFAULT 'fr',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABELUL: CLIENTI & CRM (clients)
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    phone TEXT,
    email TEXT,
    lang TEXT DEFAULT 'fr',
    is_corporate BOOLEAN DEFAULT false,
    company_name TEXT,
    vat_number TEXT,
    first_seen DATE,
    last_seen DATE,
    bookings_count INTEGER DEFAULT 1,
    total_spent NUMERIC(10, 2) DEFAULT 0,
    total_deposit NUMERIC(10, 2) DEFAULT 0,
    source TEXT DEFAULT 'direct',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABELUL: SETARI SI CONFIGURARI (app_settings)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SECURITATE: ACTIVARE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 5. POLITICI DE ACCES (ANON & AUTHENTICATED)
-- Permite accesul Widget-ului public, Portalului Client si Back-Office-ului via cheia anon
DROP POLICY IF EXISTS "Public full access to bookings" ON public.bookings;
CREATE POLICY "Public full access to bookings"
    ON public.bookings
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to clients" ON public.clients;
CREATE POLICY "Public full access to clients"
    ON public.clients
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to app_settings" ON public.app_settings;
CREATE POLICY "Public full access to app_settings"
    ON public.app_settings
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. INDEXURI PENTRU PERFORMANTA MAXIMA
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings (date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_table ON public.bookings (table_number);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients (phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients (email);

-- 7. ACTIVARE SINCRONIZARE IN TIMP REAL (Supabase Realtime)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'clients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
  END IF;
END $$;
