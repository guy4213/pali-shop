import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import GiftPageWrapper from './GiftPageContent'

interface PageProps {
  searchParams: Promise<{ order?: string; ref?: string }>
}

export default async function GiftPage({ searchParams }: PageProps) {
  const { order: orderId } = await searchParams

  if (!orderId) {
    redirect('/')
  }

  const supabase = await createServiceClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-bold text-gray-700 mb-2">הזמנה לא תקפה</h1>
        <p className="text-gray-400 text-sm mb-6">לא ניתן לתבוע מתנה עבור הזמנה זו.</p>
        <a href="/" className="text-yellow-600 hover:underline text-sm">חזרה לדף הבית</a>
      </div>
    )
  }

  if (order.status !== 'paid') {
    redirect(`/orders/${orderId}`)
  }

  const { data: existingClaim } = await supabase
    .from('gift_claims')
    .select('id')
    .eq('order_id', orderId)
    .maybeSingle()

  if (existingClaim) {
    redirect(`/orders/${orderId}`)
  }

  return <GiftPageWrapper />
}
