-- Add shipping_status column to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_status TEXT NOT NULL DEFAULT 'received'
  CHECK (shipping_status IN ('received', 'processing', 'packed', 'shipped', 'in_transit', 'delivered', 'exception'));

-- Add tracking_number column if not already present
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;
