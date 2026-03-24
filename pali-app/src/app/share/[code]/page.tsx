import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductPage from '@/components/product/ProductPage'
import ReferralTracker from './ReferralTracker'
import type { Product } from '@/types'

interface SharePageProps {
  params: Promise<{ code: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { code } = await params
  const supabase = await createClient()

  // Find the referrer
  const { data: referrer } = await supabase
    .from('referrers')
    .select('*, products(*)')
    .eq('referral_code', code)
    .eq('is_active', true)
    .single()

  if (!referrer) return notFound()

  const product = referrer.products as unknown as Product
  if (!product) return notFound()

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header  />
      {/* Track the click client-side */}
      <ReferralTracker code={code} />
      <main className="flex-1">
        <ProductPage product={product} referralCode={code} />
      </main>
      <Footer />
    </div>
  )
}
