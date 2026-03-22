-- Migration 004: points_redeemed + payment fields on orders

DO $$
BEGIN
  -- Add points_redeemed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'points_redeemed'
  ) THEN
    ALTER TABLE orders ADD COLUMN points_redeemed NUMERIC(10,2) NOT NULL DEFAULT 0;
  END IF;

  -- Add payment_reference column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_reference TEXT;
  END IF;

  -- Add payment_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid';
  END IF;

EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;
