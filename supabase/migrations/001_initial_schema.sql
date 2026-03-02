-- ============================================================
-- VivahSthal - Wedding Venue Marketplace Database Schema
-- ============================================================

-- Enable pgvector for AI search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin', 'rm'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE slot_type AS ENUM ('morning', 'evening', 'full_day'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE venue_type AS ENUM ('banquet_hall', 'farmhouse', 'resort', 'hotel', 'lawn', 'temple', 'palace', 'heritage', 'convention_center', 'community_hall'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer',
  city TEXT,
  assigned_rm_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VENUES
-- ============================================================

CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  venue_type venue_type NOT NULL DEFAULT 'banquet_hall',
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Bihar',
  address TEXT NOT NULL,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  capacity_min INT DEFAULT 50,
  capacity_max INT DEFAULT 500,
  price_per_slot NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price_per_plate NUMERIC(10, 2),
  amenities TEXT[] DEFAULT '{}',
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating NUMERIC(2,1) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_venues_capacity ON venues(capacity_max);
CREATE INDEX IF NOT EXISTS idx_venues_price ON venues(price_per_slot);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);
CREATE INDEX IF NOT EXISTS idx_venues_vendor ON venues(vendor_id);

-- ============================================================
-- VENUE AVAILABILITY / SLOTS
-- ============================================================

CREATE TABLE IF NOT EXISTS venue_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_type slot_type NOT NULL DEFAULT 'full_day',
  is_available BOOLEAN DEFAULT TRUE,
  is_auspicious BOOLEAN DEFAULT FALSE,
  price_override NUMERIC(12, 2),
  booking_status booking_status DEFAULT 'pending',
  booked_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, slot_date, slot_type)
);

CREATE INDEX IF NOT EXISTS idx_slots_venue_date ON venue_slots(venue_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_slots_available ON venue_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_slots_auspicious ON venue_slots(is_auspicious);

-- ============================================================
-- LEADS
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  event_date DATE,
  slot_preference slot_type,
  guest_count INT,
  budget_range TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status lead_status DEFAULT 'new',
  assigned_rm_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_venue ON leads(venue_id);
CREATE INDEX IF NOT EXISTS idx_leads_rm ON leads(assigned_rm_id);

-- ============================================================
-- AUSPICIOUS DATES
-- ============================================================

CREATE TABLE IF NOT EXISTS auspicious_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  year INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auspicious_year ON auspicious_dates(year);

-- ============================================================
-- VENUE REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS venue_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VENUE EMBEDDINGS (for RAG / AI search)
-- ============================================================

CREATE TABLE IF NOT EXISTS venue_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE UNIQUE,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_embeddings_venue ON venue_embeddings(venue_id);

-- ============================================================
-- VECTOR SIMILARITY SEARCH FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION match_venues(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  venue_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ve.id,
    ve.venue_id,
    ve.content,
    1 - (ve.embedding <=> query_embedding) AS similarity
  FROM venue_embeddings ve
  WHERE 1 - (ve.embedding <=> query_embedding) > match_threshold
  ORDER BY ve.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
DO $$ BEGIN CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Venues: public read, vendors manage own
DO $$ BEGIN CREATE POLICY "Active venues are viewable by everyone" ON venues FOR SELECT USING (is_active = true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can insert own venues" ON venues FOR INSERT WITH CHECK (auth.uid() = vendor_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can update own venues" ON venues FOR UPDATE USING (auth.uid() = vendor_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Vendors can delete own venues" ON venues FOR DELETE USING (auth.uid() = vendor_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Slots: public read, vendors manage own venue slots
DO $$ BEGIN CREATE POLICY "Slots are viewable by everyone" ON venue_slots FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Vendors can manage own venue slots" ON venue_slots FOR ALL USING (
    venue_id IN (SELECT v.id FROM venues v WHERE v.vendor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Leads: customers can insert, vendors/admins can view related
DO $$ BEGIN CREATE POLICY "Anyone can create leads" ON leads FOR INSERT WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can view own leads" ON leads FOR SELECT USING (
    customer_id = auth.uid() OR
    assigned_rm_id = auth.uid() OR
    venue_id IN (SELECT v.id FROM venues v WHERE v.vendor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Reviews: public read, users can create own
DO $$ BEGIN CREATE POLICY "Reviews are viewable by everyone" ON venue_reviews FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can create reviews" ON venue_reviews FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TRIGGERS for updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_venue_slots_updated_at ON venue_slots;
CREATE TRIGGER update_venue_slots_updated_at BEFORE UPDATE ON venue_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- HANDLE NEW USER TRIGGER (auto-create profile)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- CRITICAL: never block auth signup due to profile insert failures
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED: Sample auspicious dates 2026
-- ============================================================

INSERT INTO auspicious_dates (date, name, year) VALUES
('2026-01-15', 'Makar Sankranti', 2026),
('2026-01-29', 'Vasant Panchami', 2026),
('2026-02-17', 'Maha Shivaratri', 2026),
('2026-03-14', 'Holi', 2026),
('2026-04-14', 'Baisakhi', 2026),
('2026-04-22', 'Akshaya Tritiya', 2026),
('2026-05-10', 'Budh Purnima', 2026),
('2026-11-08', 'Dev Diwali', 2026),
('2026-11-19', 'Tulsi Vivah', 2026),
('2026-11-22', 'Dev Uthani Ekadashi', 2026),
('2026-12-05', 'Arudra Darshanam', 2026)
ON CONFLICT (date) DO NOTHING;
