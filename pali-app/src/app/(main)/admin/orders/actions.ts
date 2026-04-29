'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { sendShippingUpdateSMS } from '@/lib/notifications'

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

export type ShippingStatus =
  | 'received'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'exception'

export async function updateShippingStatus(
  orderId: string,
  status: ShippingStatus
): Promise<{ success: boolean }> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ shipping_status: status })
    .eq('id', orderId)
    .select('buyer_name, buyer_phone, tracking_number')
    .single()

  if (!error && status === 'shipped' && data?.tracking_number) {
    sendShippingUpdateSMS(data.buyer_phone, data.buyer_name, data.tracking_number).catch(() => {})
  }

  return { success: !error }
}
