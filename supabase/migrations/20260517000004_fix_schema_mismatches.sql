-- Fix missing columns in bookings and payments tables
-- to match the requirements and the frontend implementation

-- 1. Update bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_number TEXT;

-- 2. Update payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_ref TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cheque_number TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Add index for booking_number to speed up searches
CREATE INDEX IF NOT EXISTS idx_bookings_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_org_number ON bookings(org_id, booking_number);
