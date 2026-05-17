-- 1. Create Organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  gstin TEXT,
  pan TEXT,
  address TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  plan TEXT DEFAULT 'basic',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Profiles table (links to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'staff',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT,
  tentative_date DATE,
  guest_count INTEGER,
  budget_from INTEGER,
  budget_to INTEGER,
  follow_up_date DATE,
  last_contact_date TIMESTAMPTZ,
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Halls table
CREATE TABLE halls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  venue_id TEXT, -- Stores custom string from org settings
  name TEXT NOT NULL,
  hall_type TEXT,
  floor_number INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  capacity_min INTEGER NOT NULL,
  capacity_max INTEGER NOT NULL,
  comfortable_capacity INTEGER,
  area_sqft INTEGER,
  length_ft INTEGER,
  width_ft INTEGER,
  height_ft INTEGER,
  ceiling_height_ft INTEGER,
  floors_within INTEGER,
  amenities JSONB DEFAULT '{}'::jsonb,
  facilities JSONB DEFAULT '{}'::jsonb,
  pricing JSONB DEFAULT '{}'::jsonb,
  media JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
  hall_id UUID REFERENCES halls(id) ON DELETE RESTRICT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  status TEXT DEFAULT 'hold',
  total_amount INTEGER NOT NULL,
  advance_amount INTEGER NOT NULL,
  balance_amount INTEGER NOT NULL,
  start_time TIME,
  end_time TIME,
  setup_start_time TIME,
  teardown_end_time TIME,
  guest_count INTEGER,
  special_requirements TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  payment_method TEXT,
  status TEXT DEFAULT 'completed',
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Configuration
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org_id
CREATE OR REPLACE FUNCTION get_current_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for Organizations (Users can read their own org)
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = get_current_org_id());

-- Policies for Profiles
CREATE POLICY "Users can view profiles in their org"
  ON profiles FOR SELECT
  USING (org_id = get_current_org_id());

-- Generic policies for org-scoped tables
CREATE POLICY "Org isolated SELECT" ON customers FOR SELECT USING (org_id = get_current_org_id());
CREATE POLICY "Org isolated INSERT" ON customers FOR INSERT WITH CHECK (org_id = get_current_org_id());
CREATE POLICY "Org isolated UPDATE" ON customers FOR UPDATE USING (org_id = get_current_org_id());

CREATE POLICY "Org isolated SELECT" ON leads FOR SELECT USING (org_id = get_current_org_id());
CREATE POLICY "Org isolated INSERT" ON leads FOR INSERT WITH CHECK (org_id = get_current_org_id());
CREATE POLICY "Org isolated UPDATE" ON leads FOR UPDATE USING (org_id = get_current_org_id());

CREATE POLICY "Org isolated SELECT" ON halls FOR SELECT USING (org_id = get_current_org_id());
CREATE POLICY "Org isolated INSERT" ON halls FOR INSERT WITH CHECK (org_id = get_current_org_id());
CREATE POLICY "Org isolated UPDATE" ON halls FOR UPDATE USING (org_id = get_current_org_id());

CREATE POLICY "Org isolated SELECT" ON bookings FOR SELECT USING (org_id = get_current_org_id());
CREATE POLICY "Org isolated INSERT" ON bookings FOR INSERT WITH CHECK (org_id = get_current_org_id());
CREATE POLICY "Org isolated UPDATE" ON bookings FOR UPDATE USING (org_id = get_current_org_id());

CREATE POLICY "Org isolated SELECT" ON payments FOR SELECT USING (org_id = get_current_org_id());
CREATE POLICY "Org isolated INSERT" ON payments FOR INSERT WITH CHECK (org_id = get_current_org_id());
CREATE POLICY "Org isolated UPDATE" ON payments FOR UPDATE USING (org_id = get_current_org_id());
