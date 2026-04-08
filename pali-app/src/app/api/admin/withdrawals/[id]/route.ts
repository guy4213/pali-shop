import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const { status, admin_note } = await req.json()

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('withdrawal_requests')
    .update({ status, admin_note, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If rejected, refund points
  if (status === 'rejected' && data) {
    await supabase.from('wallet_transactions').insert({
      referrer_id: data.referrer_id,
      type: 'earn',
      points: data.points_amount,
      description: `החזר נקודות – בקשת משיכה נדחתה`,
    })
  }

  return NextResponse.json({ ok: true })
}
