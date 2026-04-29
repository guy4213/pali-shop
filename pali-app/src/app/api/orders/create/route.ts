import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getBalance, redeemPoints, addPoints } from '@/lib/points'
import { sendOrderConfirmationSMS, sendCommissionEarnedSMS, sendSaleNotification } from '@/lib/notifications'
import { z } from 'zod'

const orderSchema = z.object({
  product_id:      z.string().uuid(),
  referral_code:   z.string().nullable().optional(),
  buyer_name:      z.string().min(2),
  buyer_email:     z.string().email(),
  buyer_phone:     z.string().min(8),
  buyer_address:   z.string().min(5),
  points_to_redeem: z.number().min(0).default(0),
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

    // Look up product price
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, price, commission_amount')
      .eq('id', data.product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'מוצר לא נמצא' }, { status: 404 })
    }

    // Validate points_to_redeem if provided
    let pointsToRedeem = data.points_to_redeem
    if (pointsToRedeem > 0) {
      // Cannot redeem more than the product price
      if (pointsToRedeem > product.price) {
        pointsToRedeem = product.price
      }

      // Validate buyer has enough balance
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
          if (currentBalance < pointsToRedeem) {
            return NextResponse.json({ error: 'יתרת נקודות לא מספיקה' }, { status: 400 })
          }
          // Deduct points — only after order is created below
          // (handled after insert to avoid deducting on failed order)
        }
      } else {
        // Not logged in — cannot redeem points
        pointsToRedeem = 0
      }
    }

    // TODO: set status='pending', payment_status='unpaid' once real payment webhook is wired up
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        product_id:      data.product_id,
        referral_code:   data.referral_code || null,
        buyer_name:      data.buyer_name,
        buyer_email:     data.buyer_email,
        buyer_phone:     data.buyer_phone,
        buyer_address:   data.buyer_address,
        amount:          product.price,
        points_redeemed: pointsToRedeem,
        status:          'paid',
        payment_status:  'paid',
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order insert error:', orderError)
      return NextResponse.json({ error: 'שגיאה ביצירת הזמנה' }, { status: 500 })
    }

    // Deduct points now that the order exists
    if (pointsToRedeem > 0) {
      const authClient = await createClient()
      const { data: { user } } = await authClient.auth.getUser()
      if (user) {
        const { data: buyerReferrer } = await supabase
          .from('referrers')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (buyerReferrer) {
          await redeemPoints(
            buyerReferrer.id,
            pointsToRedeem,
            `שימוש בנקודות להזמנה #${order.id.slice(0, 8)}`
          )
        }
      }
    }

    // Award commission to referrer (K1)
    if (data.referral_code && product.commission_amount > 0) {
      const { data: referrer } = await supabase
        .from('referrers')
        .select('id, user_id, referral_code, phone')
        .eq('referral_code', data.referral_code)
        .single()

      if (referrer) {
        await addPoints(referrer.id, product.commission_amount, 'עמלה על מכירה דרך קישור')

        await supabase.from('commissions').insert({
          referrer_id: referrer.id,
          order_id: order.id,
          points_earned: product.commission_amount,
        })

        // Commission SMS + sale email to referrer (K7)
        if (referrer.phone) {
          sendCommissionEarnedSMS(referrer.phone, referrer.referral_code, product.commission_amount).catch(() => {})
        }
        if (referrer.user_id) {
          const { data: authUser } = await supabase.auth.admin.getUserById(referrer.user_id)
          if (authUser?.user?.email) {
            sendSaleNotification(authUser.user.email, product.commission_amount).catch(() => {})
          }
        }
      }
    }

    // Order confirmation SMS to buyer (K7)
    sendOrderConfirmationSMS(data.buyer_phone, data.buyer_name, order.id).catch(() => {})

    return NextResponse.json({ order_id: order.id, status: 'paid' })

  } catch (err) {
    console.error('Create order error:', err)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}