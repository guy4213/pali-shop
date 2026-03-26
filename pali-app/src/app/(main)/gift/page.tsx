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
    redirect('/')
  }

  if (order.status !== 'paid') {
    redirect(`/orders/${orderId}`)
  }

  return <GiftPageWrapper />
}
