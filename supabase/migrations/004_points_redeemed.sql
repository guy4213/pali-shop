-- Migration 004: Add points_redeemed column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_redeemed NUMERIC(10,2) NOT NULL DEFAULT 0;
