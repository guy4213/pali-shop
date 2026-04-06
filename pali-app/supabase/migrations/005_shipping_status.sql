-- Migration 005: Add shipping_status to orders for order tracking page
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status TEXT NOT NULL DEFAULT 'received'
  CONSTRAINT orders_shipping_status_check
  CHECK (shipping_status IN ('received','processing','packed','shipped','in_transit','delivered','exception'));

-- tracking_number already exists from migration 003 — skip

CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON orders(shipping_status);
