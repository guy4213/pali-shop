import { createClient } from '@/lib/supabase/server'
import { getBalance, WITHDRAWAL_THRESHOLD } from '@/lib/points'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WalletClient from './WalletClient'

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/wallet')

  const { data: referrer } = await supabase
    .from('referrers')
    .select('id, referral_code')
    .eq('user_id', user.id)
    .single()

  if (!referrer) redirect('/gift')

  const [balance, transactions, withdrawalRequests] = await Promise.all([
    getBalance(referrer.id),
    supabase
      .from('wallet_transactions')
      .select('*')
      .eq('referrer_id', referrer.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('referrer_id', referrer.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header  />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <WalletClient
          balance={balance}
          transactions={transactions.data || []}
          withdrawalRequests={withdrawalRequests.data || []}
          referrerId={referrer.id}
          canWithdraw={balance >= WITHDRAWAL_THRESHOLD}
          withdrawalThreshold={WITHDRAWAL_THRESHOLD}
        />
      </main>
      <Footer />
    </div>
  )
}
