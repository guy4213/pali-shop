export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  image_url: string | null
  commission_amount: number
  is_visible: boolean
  created_at: string
}

export interface GiftItem {
  id: string
  name: string
  image_url: string | null
  stock_count: number
  created_at: string
}

export interface Referrer {
  id: string
  user_id: string | null
  referral_code: string
  product_id: string | null
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  product_id: string | null
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  buyer_address: string
  referral_code: string | null
  amount: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
}

export interface Commission {
  id: string
  referrer_id: string
  order_id: string
  points_earned: number
  created_at: string
}

export interface GiftClaim {
  id: string
  order_id: string | null
  gift_item_id: string
  referrer_id: string | null
  name: string
  phone: string
  email: string
  address: string
  claimed_at: string
}

export interface WalletTransaction {
  id: string
  referrer_id: string
  type: 'earn' | 'redeem' | 'withdraw'
  points: number
  description: string | null
  created_at: string
}

export interface WithdrawalRequest {
  id: string
  referrer_id: string
  points_amount: number
  bank_code: string | null
  bank_branch: string | null
  bank_account: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  created_at: string
  updated_at: string
}

export interface ReferralStats {
  total_clicks: number
  total_purchases: number
  total_points_earned: number
  current_balance: number
}

export interface OrderWithProduct extends Order {
  products: Pick<Product, 'name' | 'image_url'> | null
}
