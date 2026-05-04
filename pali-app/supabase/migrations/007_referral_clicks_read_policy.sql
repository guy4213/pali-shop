-- Migration 007: Allow referrers to read their own referral clicks
-- ============================================================
-- PROBLEM:
--   clicks_admin_read policy uses auth.jwt() ->> 'role' = 'admin'
--   which only matches Supabase custom admin role — regular referrer
--   users (role = 'authenticated') get empty results in the dashboard.
--   Clicks were being inserted (service role bypasses RLS) but could
--   not be read back by the referrer who owns them.
-- ============================================================

DO $$ BEGIN
  CREATE POLICY "clicks_referrer_read" ON referral_clicks
    FOR SELECT USING (
      referral_code IN (
        SELECT referral_code FROM referrers WHERE user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
