-- Up Migration: Phase 1 SaaS Vision & Architecture Roadmap

-- 1. Add Tentative Holds and BEO (Banquet Event Order) to Bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS beo_details JSONB DEFAULT '{}'::jsonb;

-- 2. Add Vendor Payouts / Outbound tracking to Payment Ledger
ALTER TABLE payment_ledger
ADD COLUMN IF NOT EXISTS is_outbound BOOLEAN DEFAULT false;

-- 3. Enable pg_cron for automated cleanup (Supabase supports this)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 4. Create the cleanup function for expired tentative holds
CREATE OR REPLACE FUNCTION expire_tentative_bookings()
RETURNS void AS $$
BEGIN
    UPDATE bookings
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE status = 'tentative' 
      AND expires_at IS NOT NULL 
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Schedule the cron job to run every hour
-- Note: In Supabase, you might need to run this from the dashboard if permissions are restricted,
-- but this SQL defines the intent.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        -- Schedule job to run at minute 0 of every hour
        PERFORM cron.schedule(
            'expire-tentative-holds',
            '0 * * * *',
            'SELECT expire_tentative_bookings()'
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if pg_cron scheduling fails due to permissions in local environment
END $$;
