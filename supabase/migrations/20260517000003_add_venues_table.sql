-- Create Venues table
CREATE TABLE venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  description TEXT,
  primary_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Add Policies
CREATE POLICY "Org isolated SELECT" ON venues FOR SELECT USING (org_id = get_current_org_id());
CREATE POLICY "Org isolated INSERT" ON venues FOR INSERT WITH CHECK (org_id = get_current_org_id());
CREATE POLICY "Org isolated UPDATE" ON venues FOR UPDATE USING (org_id = get_current_org_id());
CREATE POLICY "Org isolated DELETE" ON venues FOR DELETE USING (org_id = get_current_org_id());

-- Update halls table to use UUID for venue_id
ALTER TABLE halls ALTER COLUMN venue_id TYPE UUID USING venue_id::UUID;
ALTER TABLE halls ADD CONSTRAINT fk_halls_venue FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL;
