-- Migration 005: Shipping status tracking for orders
-- ============================================================
-- Adds shipping_status column with a CHECK constraint to orders.
-- The tracking_number column already exists from migration 003,
-- so it is added with IF NOT EXISTS for safety.
-- No RLS changes needed — existing admin policies cover orders.
-- ============================================================

-- Add shipping_status column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status TEXT
  NOT NULL DEFAULT 'received'
  CHECK (shipping_status IN (
    'received',
    'processing',
    'packed',
    'shipped',
    'in_transit',
    'delivered',
    'exception'
  ));

-- tracking_number was added in migration 003, but guard with IF NOT EXISTS
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON orders(shipping_status);
