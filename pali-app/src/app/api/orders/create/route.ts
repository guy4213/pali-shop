import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { addPoints, getBalance, redeemPoints } from '@/lib/points'
import { sendSaleNotification } from '@/lib/notifications'
import { z } from 'zod'

const orderSchema = z.object({
  product_id: z.string().uuid(),
  referral_code: z.string().nullable().optional(),
  buyer_name: z.string().min(2),
  buyer_email: z.string().email(),
  buyer_phone: z.string().min(8),
  buyer_address: z.string().min(5),
  amount: z.number().positive(),
  points_used: z.number().min(0).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'פרטים לא תקינים' }, { status: 400 })
    }

    const data = parsed.data
    const supabase = await createServiceClient()

    // Deduct points if buyer is using store credit
    if (data.points_used && data.points_used > 0) {
      const authClient = await createClient()
      const { data: { user } } = await authClient.auth.getUser()
      if (user) {
        const { data: buyerReferrer } = await supabase
          .from('referrers')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (buyerReferrer) {
          const currentBalance = await getBalance(buyerReferrer.id)
          if (currentBalance < data.points_used) {
            return NextResponse.json({ error: 'יתרת נקודות לא מספיקה' }, { status: 400 })
          }
          await redeemPoints(buyerReferrer.id, data.points_used, `שימוש בנקודות לרכישה`)
        }
      }
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        product_id: data.product_id,
        referral_code: data.referral_code || null,
        buyer_name: data.buyer_name,
        buyer_email: data.buyer_email,
        buyer_phone: data.buyer_phone,
        buyer_address: data.buyer_address,
        amount: data.amount,
        status: 'paid',
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order error:', orderError)
      return NextResponse.json({ error: 'שגיאה ביצירת הזמנה' }, { status: 500 })
    }

    // Award commission to referrer if applicable
    if (data.referral_code) {
      const { data: referrer } = await supabase
        .from('referrers')
        .select('id, user_id')
        .eq('referral_code', data.referral_code)
        .single()

      if (referrer) {
        // Get commission amount from product
        const { data: product } = await supabase
          .from('products')
          .select('commission_amount')
          .eq('id', data.product_id)
          .single()

        const commission = product?.commission_amount || 20

        // Insert commission record
        await supabase.from('commissions').insert({
          referrer_id: referrer.id,
          order_id: order.id,
          points_earned: commission,
        })

        // Add points to wallet
        await addPoints(
          referrer.id,
          commission,
          `עמלה מרכישה #${order.id.slice(0, 8)}`
        )

        // Send email notification to referrer
        if (referrer.user_id) {
          const { data: userData } = await supabase.auth.admin.getUserById(referrer.user_id)
          if (userData.user?.email) {
            await sendSaleNotification(
              userData.user.email,
              commission,
              data.buyer_name
            )
          }
        }
      }
    }

    return NextResponse.json({ order_id: order.id })
  } catch (err) {
    console.error('Create order error:', err)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
