import { createServiceClient } from '@/lib/supabase/server'

export const WITHDRAWAL_THRESHOLD = 2000

export async function getBalance(referrerId: string): Promise<number> {
  const supabase = await createServiceClient()

  const { data } = await supabase
    .from('wallet_transactions')
    .select('type, points')
    .eq('referrer_id', referrerId)

  if (!data) return 0

  return data.reduce((balance, tx) => {
    if (tx.type === 'earn') return balance + tx.points
    if (tx.type === 'redeem' || tx.type === 'withdraw') return balance - tx.points
    return balance
  }, 0)
}

export async function addPoints(
  referrerId: string,
  points: number,
  description: string
): Promise<void> {
  const supabase = await createServiceClient()

  await supabase.from('wallet_transactions').insert({
    referrer_id: referrerId,
    type: 'earn',
    points,
    description,
  })
}

export async function redeemPoints(
  referrerId: string,
  points: number,
  description: string
): Promise<void> {
  const supabase = await createServiceClient()

  await supabase.from('wallet_transactions').insert({
    referrer_id: referrerId,
    type: 'redeem',
    points,
    description,
  })
}
