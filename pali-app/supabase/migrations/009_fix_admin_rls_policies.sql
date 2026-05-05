-- Migration 009: Fix admin RLS policies — wrong JWT path
-- ============================================================
-- PROBLEM:
--   All admin policies created in migrations 001 and 006 use:
--     auth.jwt() ->> 'role' = 'admin'
--   This reads the JWT root-level 'role' claim, which Supabase
--   always sets to 'anon' or 'authenticated' — never 'admin'.
--   The actual custom role is in app_metadata, so the correct path is:
--     (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
--
--   Effect: admins see 0 rows in all tables except orders (fixed in 008)
--   and qr_tokens (created correctly in 003).
--
-- FIX:
--   Drop and recreate each broken admin policy with the correct path.
--   The isAdmin() TypeScript helper already uses app_metadata correctly;
--   this migration brings RLS into alignment with it.
-- ============================================================


-- products
DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'));

-- gift_items
DROP POLICY IF EXISTS "gift_items_admin_all" ON gift_items;
CREATE POLICY "gift_items_admin_all" ON gift_items
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'));

-- referrers
DROP POLICY IF EXISTS "referrers_admin_all" ON referrers;
CREATE POLICY "referrers_admin_all" ON referrers
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'));

-- orders (UPDATE/DELETE — SELECT was fixed in migration 008)
DROP POLICY IF EXISTS "orders_admin_all" ON orders;
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'));

-- referral_clicks
DROP POLICY IF EXISTS "clicks_admin_read" ON referral_clicks;
CREATE POLICY "clicks_admin_read" ON referral_clicks
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'));

-- commissions
DROP POLICY IF EXISTS "commissions_admin_all" ON commissions;
CREATE POLICY "commissions_admin_all" ON commissions
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'));

-- gift_claims
DROP POLICY IF EXISTS "gift_claims_admin_all" ON gift_claims;
CREATE POLICY "gift_claims_admin_all" ON gift_claims
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'));

-- wallet_transactions
DROP POLICY IF EXISTS "wallet_admin_all" ON wallet_transactions;
CREATE POLICY "wallet_admin_all" ON wallet_transactions
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'));

-- withdrawal_requests
DROP POLICY IF EXISTS "withdrawal_admin_all" ON withdrawal_requests;
CREATE POLICY "withdrawal_admin_all" ON withdrawal_requests
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'));

-- support_tickets (the trigger for this migration)
DROP POLICY IF EXISTS "support_tickets_admin_all" ON support_tickets;
CREATE POLICY "support_tickets_admin_all" ON support_tickets
  FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin'));
