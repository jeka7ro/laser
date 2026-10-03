-- ==============================================================================
-- Laser Magic (Vilvoorde / Bruxelles) - Supabase Database Schema
-- Acest script foloseste prefixul "laser_" pentru a putea rula in siguranta
-- in acelasi proiect Supabase comun cu alte aplicatii, fara niciun conflict!
-- Rulati in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. TABELUL: REZERVARI LASER MAGIC (laser_bookings)
CREATE TABLE IF NOT EXISTS public.laser_bookings (
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

-- 2. TABELUL: CLIENTI & CRM LASER MAGIC (laser_clients)
CREATE TABLE IF NOT EXISTS public.laser_clients (
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

-- 3. TABELUL: SETARI SI CONFIGURARI (laser_app_settings)
CREATE TABLE IF NOT EXISTS public.laser_app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SECURITATE: ACTIVARE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.laser_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laser_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laser_app_settings ENABLE ROW LEVEL SECURITY;

-- 5. POLITICI DE ACCES (ANON & AUTHENTICATED)
-- Permite accesul Widget-ului public, Portalului Client si Back-Office-ului via cheia anon
DROP POLICY IF EXISTS "Public full access to laser_bookings" ON public.laser_bookings;
CREATE POLICY "Public full access to laser_bookings"
    ON public.laser_bookings
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to laser_clients" ON public.laser_clients;
CREATE POLICY "Public full access to laser_clients"
    ON public.laser_clients
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to laser_app_settings" ON public.laser_app_settings;
CREATE POLICY "Public full access to laser_app_settings"
    ON public.laser_app_settings
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. INDEXURI PENTRU PERFORMANTA MAXIMA
CREATE INDEX IF NOT EXISTS idx_laser_bookings_date ON public.laser_bookings (date);
CREATE INDEX IF NOT EXISTS idx_laser_bookings_status ON public.laser_bookings (status);
CREATE INDEX IF NOT EXISTS idx_laser_bookings_table ON public.laser_bookings (table_number);
CREATE INDEX IF NOT EXISTS idx_laser_clients_phone ON public.laser_clients (phone);
CREATE INDEX IF NOT EXISTS idx_laser_clients_email ON public.laser_clients (email);

-- 7. ACTIVARE SINCRONIZARE IN TIMP REAL (Supabase Realtime)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'laser_bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.laser_bookings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'laser_clients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.laser_clients;
  END IF;
END $$;
