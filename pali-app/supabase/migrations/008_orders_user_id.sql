-- Migration 008: Add user_id to orders for ownership-based access control

-- 1. Add user_id column (nullable to avoid breaking existing rows)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 2. Drop all existing SELECT/INSERT policies on orders (replace with clean identity-based policies)
DROP POLICY IF EXISTS "orders_own_read"          ON orders;
DROP POLICY IF EXISTS "orders_secure_read"       ON orders;
DROP POLICY IF EXISTS "orders_public_read_by_id" ON orders;
DROP POLICY IF EXISTS "orders_public_insert"     ON orders;

-- 3. New INSERT policy — authenticated users only, must set their own user_id
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- 4. New SELECT policy — owner OR admin/super_admin
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- Keep existing admin ALL policy (already covers UPDATE/DELETE for admins)
-- "orders_admin_all" should already exist from migration 001
