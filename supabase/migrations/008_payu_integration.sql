-- Migration: Add PAYU specific columns to orders and payments tables
-- Safe to run multiple times (uses IF NOT EXISTS)

-- 1. Update 'orders' table
-- Add column to store the main PAYU Transaction ID (mihpayid)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payu_transaction_id TEXT;

-- Add column to store the specific Payment ID (if split payments are used)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payu_payment_id TEXT;

-- Add column to store the raw response hash for verification debugging
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payu_hash_verification TEXT;

-- Add index for faster lookup by PAYU transaction ID
CREATE INDEX IF NOT EXISTS idx_orders_payu_transaction_id 
ON orders(payu_transaction_id);

-- 2. Update 'payments' table (if you have a separate payments table)
-- Store the unique PAYU Bank Reference Number
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payu_bank_ref_no TEXT;

-- Store the specific mode of payment used (CC, DC, NB, UPI, etc.)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payu_payment_mode TEXT;

-- Store the card number last 4 digits or UPI ID (masked)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payu_card_num_or_upi TEXT;

-- Store the name on the card or payer name
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payu_payer_name TEXT;

-- Add index for bank reference lookup
CREATE INDEX IF NOT EXISTS idx_payments_payu_bank_ref_no 
ON payments(payu_bank_ref_no);

-- 3. Add a comment to track migration version
COMMENT ON COLUMN orders.payu_transaction_id IS 'PAYU Mihpayid (Unique Transaction ID)';
COMMENT ON COLUMN payments.payu_bank_ref_no IS 'PAYU Bank Reference Number';