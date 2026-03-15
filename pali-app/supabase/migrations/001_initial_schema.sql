-- PALI Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 20,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gift items table
CREATE TABLE gift_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_url TEXT,
  stock_count INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referrers table (links to Supabase auth.users)
CREATE TABLE referrers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  product_id UUID REFERENCES products(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  referral_code TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referral clicks tracking
CREATE TABLE referral_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commissions earned by referrers per order
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES referrers(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  points_earned NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id) -- one commission per order
);

-- Gift claims (one per customer to prevent abuse)
CREATE TABLE gift_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  gift_item_id UUID NOT NULL REFERENCES gift_items(id),
  referrer_id UUID REFERENCES referrers(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wallet transactions (all point movements)
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES referrers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn','redeem','withdraw')),
  points NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES referrers(id) ON DELETE CASCADE,
  points_amount NUMERIC(10, 2) NOT NULL,
  iban TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_referral_clicks_code ON referral_clicks(referral_code);
CREATE INDEX idx_orders_referral_code ON orders(referral_code);
CREATE INDEX idx_wallet_transactions_referrer ON wallet_transactions(referrer_id);
CREATE INDEX idx_commissions_referrer ON commissions(referrer_id);
CREATE INDEX idx_gift_claims_phone ON gift_claims(phone);
CREATE INDEX idx_gift_claims_email ON gift_claims(email);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Products: public can read visible products
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_all" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Gift items: public can read
CREATE POLICY "gift_items_public_read" ON gift_items FOR SELECT USING (true);
CREATE POLICY "gift_items_admin_all" ON gift_items FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Referrers: user can read/update their own
CREATE POLICY "referrers_own_read" ON referrers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "referrers_insert_authenticated" ON referrers FOR INSERT WITH CHECK (true);
CREATE POLICY "referrers_admin_all" ON referrers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Orders: public can insert, authenticated can read own (by referral_code)
CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_admin_all" ON orders FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Referral clicks: anyone can insert
CREATE POLICY "clicks_public_insert" ON referral_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "clicks_admin_read" ON referral_clicks FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Commissions: referrer can read their own
CREATE POLICY "commissions_own_read" ON commissions FOR SELECT
  USING (referrer_id IN (SELECT id FROM referrers WHERE user_id = auth.uid()));
CREATE POLICY "commissions_service_insert" ON commissions FOR INSERT WITH CHECK (true);
CREATE POLICY "commissions_admin_all" ON commissions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Gift claims: public can insert (claim a gift)
CREATE POLICY "gift_claims_public_insert" ON gift_claims FOR INSERT WITH CHECK (true);
CREATE POLICY "gift_claims_admin_all" ON gift_claims FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Wallet transactions: referrer sees their own
CREATE POLICY "wallet_own_read" ON wallet_transactions FOR SELECT
  USING (referrer_id IN (SELECT id FROM referrers WHERE user_id = auth.uid()));
CREATE POLICY "wallet_service_insert" ON wallet_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "wallet_admin_all" ON wallet_transactions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Withdrawal requests: referrer sees own, admin manages all
CREATE POLICY "withdrawal_own_read" ON withdrawal_requests FOR SELECT
  USING (referrer_id IN (SELECT id FROM referrers WHERE user_id = auth.uid()));
CREATE POLICY "withdrawal_own_insert" ON withdrawal_requests FOR INSERT
  WITH CHECK (referrer_id IN (SELECT id FROM referrers WHERE user_id = auth.uid()));
CREATE POLICY "withdrawal_admin_all" ON withdrawal_requests FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
