import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getBalance, WITHDRAWAL_THRESHOLD } from '@/lib/points'
import { z } from 'zod'

const withdrawSchema = z.object({
  points_amount: z.number().min(WITHDRAWAL_THRESHOLD),
  bank_code:     z.string().min(2).max(3),   // Israeli bank code (e.g. '10', '12')
  bank_branch:   z.string().min(3).max(5),   // branch number
  bank_account:  z.string().min(4),          // account number
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

    const body = await req.json()
    const parsed = withdrawSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'פרטים לא תקינים' }, { status: 400 })
    }

    const { points_amount, bank_code, bank_branch, bank_account } = parsed.data
    const serviceClient = await createServiceClient()

    // Get referrer
    const { data: referrer } = await serviceClient
      .from('referrers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!referrer) return NextResponse.json({ error: 'לא נמצא חשבון ממליץ' }, { status: 404 })

    // Check balance
    const balance = await getBalance(referrer.id)
    if (balance < points_amount) {
      return NextResponse.json({ error: 'יתרה לא מספיקה' }, { status: 400 })
    }

    if (points_amount < WITHDRAWAL_THRESHOLD) {
      return NextResponse.json(
        { error: `סכום משיכה מינימלי: ${WITHDRAWAL_THRESHOLD} נקודות` },
        { status: 400 }
      )
    }

    // Create withdrawal request
    const { data: request } = await serviceClient
      .from('withdrawal_requests')
      .insert({
        referrer_id: referrer.id,
        points_amount,
        bank_code,
        bank_branch,
        bank_account,
        status: 'pending',
      })
      .select()
      .single()

    // Deduct points (pending withdrawal)
    await serviceClient.from('wallet_transactions').insert({
      referrer_id: referrer.id,
      type: 'withdraw',
      points: points_amount,
      description: `בקשת משיכה #${request?.id?.slice(0, 8)} – בבדיקה`,
    })

    return NextResponse.json({ request_id: request?.id })
  } catch (err) {
    console.error('Withdraw error:', err)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
