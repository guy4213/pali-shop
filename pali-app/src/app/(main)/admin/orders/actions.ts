'use server'

import { createServiceClient } from '@/lib/supabase/server'

export async function updateTrackingNumber(
  orderId: string,
  trackingNumber: string
): Promise<{ success: boolean }> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('orders')
    .update({ tracking_number: trackingNumber })
    .eq('id', orderId)
  return { success: !error }
}

export async function updateShippingStatus(
  orderId: string,
  shippingStatus: string
): Promise<{ success: boolean }> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('orders')
    .update({ shipping_status: shippingStatus })
    .eq('id', orderId)
  return { success: !error }
}
