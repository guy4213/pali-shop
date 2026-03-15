-- Migration 003: Security fixes, missing columns, and schema additions
-- ============================================================
-- CONTEXT:
--   Files 1-6 in Supabase SQL Editor have been applied manually.
--   Notably, local migration 002's ALTER TABLE statements for
--   referrers (full_name, phone, address, iban) were NEVER executed
--   in Supabase — only the two policies from that file were applied.
--   Admin RLS was already fixed via file 4 in the SQL Editor.
--
-- WHAT THIS MIGRATION DOES:
--   1. Adds the missing referrers profile columns (002 gap)
--   2. Adds Israeli bank fields to referrers + withdrawal_requests
--      (replaces the 'iban' string with structured fields)
--   3. Restricts points INSERT to service_role only
--      (currently any anon user can award themselves points)
--   4. Adds UNIQUE constraint on gift_claims.phone
--      (race-condition-safe deduplication)
--   5. Adds decrement_gift_stock() atomic function
--      (replaces the non-atomic stock_count - 1 pattern in gift/claim)
--   6. Adds payment and tracking fields to orders
--   7. Adds qr_tokens table
-- ============================================================


-- ============================================================
-- 1. MISSING PROFILE COLUMNS ON REFERRERS
--    These were in local migration 002 but the ALTER TABLE
--    statements were never executed in Supabase.
--    The profile/update API is currently broken without these.
-- ============================================================

ALTER TABLE referrers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS phone     TEXT;
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS address   TEXT;

-- Note: we skip adding 'iban' since we are going straight to
-- the correct Israeli bank field structure below (section 2).


-- ============================================================
-- 2. ISRAELI BANK DETAILS
--    Israel uses: bank_code (2 digits) + branch (3 digits) + account number.
--    'iban' is used for international transfers only and is wrong here.
--
--    withdrawal_requests.iban  → EXISTS (from migration 001), rename it
--    referrers                 → 'iban' column was never created, add new fields directly
-- ============================================================

-- withdrawal_requests: rename iban → bank_account_raw (keep old data), add structured fields
-- Wrapped in a DO block so it is safe to run even if the rename already happened
-- (e.g. from a previous partial run of this migration).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'withdrawal_requests' AND column_name = 'iban'
  ) THEN
    ALTER TABLE withdrawal_requests RENAME COLUMN iban TO bank_account_raw;
    -- The original 'iban' column was NOT NULL. After rename the constraint is
    -- inherited. New inserts won't supply this field, so we must drop the NOT NULL.
    ALTER TABLE withdrawal_requests ALTER COLUMN bank_account_raw DROP NOT NULL;
  END IF;
END $$;

COMMENT ON COLUMN withdrawal_requests.bank_account_raw IS
  'Original free-text IBAN field — superseded by bank_code, bank_branch, bank_account';

ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS bank_code    TEXT;  -- e.g. '10'=Leumi, '11'=Discount, '12'=Hapoalim
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS bank_branch  TEXT;  -- 3-digit branch number
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS bank_account TEXT;  -- account number

-- referrers: add structured fields directly (iban was never added here)
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS bank_code    TEXT;
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS bank_branch  TEXT;
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS bank_account TEXT;


-- ============================================================
-- 3. RESTRICT POINTS INSERT TO SERVICE ROLE ONLY
--    Current policies allow ANY request (including anonymous) to
--    INSERT into commissions and wallet_transactions directly via
--    the Supabase REST API, awarding unlimited points.
--    Only server-side routes using the service key should do this.
-- ============================================================

DROP POLICY IF EXISTS "commissions_service_insert" ON commissions;
CREATE POLICY "commissions_service_insert" ON commissions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "wallet_service_insert" ON wallet_transactions;
CREATE POLICY "wallet_service_insert" ON wallet_transactions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 4. GIFT CLAIM DEDUPLICATION — DB-LEVEL UNIQUE CONSTRAINT
--    Per spec: one gift per customer (phone).
--    The current app-layer SELECT-then-INSERT check has a race
--    condition window. A DB constraint enforces this atomically.
--    Note: this is global (one gift per phone across all products).
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gift_claims_phone_unique'
  ) THEN
    ALTER TABLE gift_claims ADD CONSTRAINT gift_claims_phone_unique UNIQUE (phone);
  END IF;
END $$;


-- ============================================================
-- 5. ATOMIC GIFT STOCK DECREMENT
--    The current gift/claim route does:
--      SELECT stock_count ... then UPDATE SET stock_count = stock_count - 1
--    Two separate round trips. Concurrent requests can both read
--    the same stock_count value and both succeed when stock = 1.
--
--    This function does it in a single UPDATE with a WHERE guard,
--    returning TRUE if stock was decremented, FALSE if out of stock.
--    Call this from gift/claim instead of the current pattern.
--
--    Usage in route: const { data: ok } = await supabase.rpc('decrement_gift_stock', { p_gift_item_id: id })
--    if (!ok) return 400 out of stock
-- ============================================================

CREATE OR REPLACE FUNCTION decrement_gift_stock(p_gift_item_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE gift_items
  SET stock_count = stock_count - 1
  WHERE id = p_gift_item_id AND stock_count > 0;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;


-- ============================================================
-- 6. ORDERS — PAYMENT REFERENCE + TRACKING FIELDS
--    payment_reference: store gateway transaction ID for reconciliation
--    payment_status: separate from order status (can be paid but not yet shipped)
--    tracking_number / courier: for "איפה החבילה שלי?" feature
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT
  NOT NULL DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'chargeback'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_redeemed NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier        TEXT;
  -- suggested values: 'israel_post', 'dhl', 'fedex', 'ups', 'other'

CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);


-- ============================================================
-- 7. QR TOKENS TABLE
--    Validates that a gift claimant actually has the physical product.
--    Each QR printed on a physical item encodes a token that must
--    exist in this table. The gift claim flow should look up and
--    (optionally) mark the token as used.
--
--    Two modes:
--      is_single_use = false  →  batch QR (one code per product batch)
--                                dedup relies on gift_claims_phone_unique
--      is_single_use = true   →  per-item QR (strongest anti-fraud)
--                                token can only be used once, regardless of phone
-- ============================================================

CREATE TABLE IF NOT EXISTS qr_tokens (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  token         TEXT        NOT NULL UNIQUE,
  product_id    UUID        NOT NULL REFERENCES products(id),
  batch_label   TEXT,                         -- e.g. 'jan-2026-batch-1'
  is_single_use BOOLEAN     NOT NULL DEFAULT false,
  used_at       TIMESTAMPTZ,
  used_by_phone TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_tokens(token);

ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qr_tokens_public_read" ON qr_tokens;
CREATE POLICY "qr_tokens_public_read" ON qr_tokens
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "qr_tokens_admin_all" ON qr_tokens;
CREATE POLICY "qr_tokens_admin_all" ON qr_tokens
  FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Link gift_claims to the qr_token that was scanned (optional, for audit trail)
ALTER TABLE gift_claims ADD COLUMN IF NOT EXISTS qr_token_id UUID REFERENCES qr_tokens(id);
