ALTER TABLE payments 
ADD COLUMN payment_type TEXT,
ADD COLUMN transaction_ref TEXT,
ADD COLUMN cheque_number TEXT,
ADD COLUMN bank_name TEXT,
ADD COLUMN notes TEXT;
