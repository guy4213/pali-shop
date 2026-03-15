-- Migration 002: Add profile fields to referrers + orders read policy

-- Profile fields on referrers table
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE referrers ADD COLUMN IF NOT EXISTS iban TEXT;

-- Allow authenticated users to read their own orders (matched by buyer_email)
DO $$ BEGIN
  CREATE POLICY "orders_own_read" ON orders FOR SELECT
    USING (buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow authenticated users to update their own referrer row (for profile save)
DO $$ BEGIN
  CREATE POLICY "referrers_own_update" ON referrers FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
