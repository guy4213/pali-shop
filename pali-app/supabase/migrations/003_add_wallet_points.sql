-- Migration 003: Add points balance column to referrers + atomic update function

ALTER TABLE referrers ADD COLUMN IF NOT EXISTS points NUMERIC(10,2) NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION add_referrer_wallet_points(p_user_id UUID, p_amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance NUMERIC;
BEGIN
  UPDATE referrers
  SET points = points + p_amount
  WHERE user_id = p_user_id
  RETURNING points INTO v_new_balance;

  RETURN v_new_balance;
END;
$$;
