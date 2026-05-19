-- Up Migration: Enterprise V2 Schema Refactoring

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Base columns (updated_at, deleted_at, version)
-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add standard columns to existing tables
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('organizations', 'profiles', 'customers', 'leads', 'halls', 'bookings', 'payments', 'venues')
    LOOP
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;', t);
        
        -- Drop trigger if exists to recreate safely
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_%I_timestamp ON %I;', t, t);
        EXECUTE format('CREATE TRIGGER trigger_update_%I_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t, t);
    END LOOP;
END $$;

-- 3. Duplicate checks via Unique Indexes (Partial indexes that ignore soft deletes)
CREATE UNIQUE INDEX IF NOT EXISTS customers_org_phone_idx ON customers (org_id, phone) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS customers_org_email_idx ON customers (org_id, email) WHERE email IS NOT NULL AND email != '' AND deleted_at IS NULL;

-- 4. New Tables

-- Booking Groups (For Multi-event weddings)
CREATE TABLE IF NOT EXISTS booking_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
    title TEXT NOT NULL,
    total_budget NUMERIC,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1
);
CREATE TRIGGER trigger_update_booking_groups_timestamp BEFORE UPDATE ON booking_groups FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Payment Ledger
CREATE TABLE IF NOT EXISTS payment_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT,
    booking_group_id UUID REFERENCES booking_groups(id) ON DELETE RESTRICT,
    amount NUMERIC NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('advance', 'installment', 'final_settlement', 'refund')),
    payment_method TEXT,
    reference_id TEXT,
    status TEXT DEFAULT 'completed',
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Ledger is append-only, no update trigger needed.

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    actor_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotency Keys
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key TEXT PRIMARY KEY,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    response_body JSONB
);

-- 5. Modify Bookings Table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES booking_groups(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time_range TSTZRANGE;

-- 6. Resource Conflict Engine (Exclusion constraint)
-- Prevent overlapping bookings for the same hall, excluding soft-deleted, cancelled, and draft bookings
ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
    hall_id WITH =,
    time_range WITH &&
) WHERE (deleted_at IS NULL AND status NOT IN ('cancelled', 'draft'));

-- 7. RLS for new tables
ALTER TABLE booking_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org isolated SELECT" ON booking_groups FOR SELECT USING (org_id = get_current_org_id());
CREATE POLICY "Org isolated INSERT" ON booking_groups FOR INSERT WITH CHECK (org_id = get_current_org_id());
CREATE POLICY "Org isolated UPDATE" ON booking_groups FOR UPDATE USING (org_id = get_current_org_id());

CREATE POLICY "Org isolated SELECT" ON payment_ledger FOR SELECT USING (org_id = get_current_org_id());
CREATE POLICY "Org isolated INSERT" ON payment_ledger FOR INSERT WITH CHECK (org_id = get_current_org_id());

CREATE POLICY "Org isolated SELECT" ON audit_logs FOR SELECT USING (org_id = get_current_org_id());
CREATE POLICY "Org isolated INSERT" ON audit_logs FOR INSERT WITH CHECK (org_id = get_current_org_id());

CREATE POLICY "Org isolated ALL" ON idempotency_keys FOR ALL USING (org_id = get_current_org_id());

-- 8. Core Trigger for Audit Logs
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (org_id, entity_type, entity_id, action, new_data, actor_id)
        VALUES (NEW.org_id, TG_TABLE_NAME, NEW.id, 'CREATE', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (org_id, entity_type, entity_id, action, old_data, new_data, actor_id)
        VALUES (NEW.org_id, TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (org_id, entity_type, entity_id, action, old_data, actor_id)
        VALUES (OLD.org_id, TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to critical tables
DROP TRIGGER IF EXISTS trigger_audit_bookings ON bookings;
CREATE TRIGGER trigger_audit_bookings AFTER INSERT OR UPDATE OR DELETE ON bookings FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

DROP TRIGGER IF EXISTS trigger_audit_payment_ledger ON payment_ledger;
CREATE TRIGGER trigger_audit_payment_ledger AFTER INSERT OR UPDATE ON payment_ledger FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
