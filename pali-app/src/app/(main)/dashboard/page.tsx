import { createClient } from '@/lib/supabase/server'
import { getBalance, WITHDRAWAL_THRESHOLD } from '@/lib/points'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/dashboard')

  const { data: referrer } = await supabase
    .from('referrers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!referrer) redirect('/')

  const [balance, clicksData, commissionsData, earningsData] = await Promise.all([
    getBalance(referrer.id),
    supabase
      .from('referral_clicks')
      .select('created_at')
      .eq('referral_code', referrer.referral_code)
      .order('created_at', { ascending: false }),
    supabase
      .from('commissions')
      .select('points_earned, created_at')
      .eq('referrer_id', referrer.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('wallet_transactions')
      .select('points, created_at')
      .eq('referrer_id', referrer.id)
      .eq('type', 'earn'),
  ])

  const stats = {
    total_clicks: clicksData.data?.length || 0,
    total_purchases: commissionsData.data?.length || 0,
    total_earned: earningsData.data?.reduce((s, t) => s + Number(t.points), 0) || 0,
    balance,
    can_withdraw: balance >= WITHDRAWAL_THRESHOLD,
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const referralUrl = `${siteUrl}/share/${referrer.referral_code}`

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <DashboardClient
        stats={stats}
        referralCode={referrer.referral_code}
        referralUrl={referralUrl}
        recentClicks={clicksData.data || []}
        recentCommissions={commissionsData.data || []}
      />
    </main>
  )
}
