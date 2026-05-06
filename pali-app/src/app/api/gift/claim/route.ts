import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateReferralCode, buildReferralUrl } from '@/lib/referral'
import { sendWelcomeEmail } from '@/lib/notifications'
import { z } from 'zod'

const claimSchema = z.object({
  order_id: z.string().uuid().optional().nullable(),
  gift_item_id: z.string().uuid(),
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email(),
  address: z.string().min(5),
  referral_code: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = claimSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'פרטים לא תקינים' }, { status: 400 })
    }

    const data = parsed.data
    const supabase = await createServiceClient()

    // Validate that the order exists and has been paid
    if (!data.order_id) {
      return NextResponse.json({ error: 'הזמנה לא תקפה' }, { status: 400 })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', data.order_id)
      .maybeSingle()

    if (!order || order.status !== 'paid') {
      return NextResponse.json({ error: 'הזמנה לא תקפה' }, { status: 400 })
    }

    // Prevent double-claiming on the same order
    const { data: existingOrderClaim } = await supabase
      .from('gift_claims')
      .select('id')
      .eq('order_id', data.order_id)
      .maybeSingle()

    if (existingOrderClaim) {
      return NextResponse.json(
        { error: 'מתנה כבר נתבעה עבור הזמנה זו.' },
        { status: 409 }
      )
    }

    // Anti-abuse: fast pre-check before doing expensive work.
    const { data: existingClaim } = await supabase
      .from('gift_claims')
      .select('id')
      .or(`phone.eq.${data.phone},email.eq.${data.email}`)
      .limit(1)
      .maybeSingle()

    if (existingClaim) {
      return NextResponse.json(
        { error: 'כבר תבעת מתנה בעבר. ניתן לתבוע מתנה אחת בלבד.' },
        { status: 409 }
      )
    }

    // Atomically decrement stock
    const { data: stockOk, error: stockError } = await supabase
      .rpc('decrement_gift_stock', { p_gift_item_id: data.gift_item_id })

    if (stockError || !stockOk) {
      return NextResponse.json({ error: 'המתנה אזלה מהמלאי' }, { status: 400 })
    }

    // ─── Auth: invite or find existing user ──────────────────────────────────
    let authUser = null

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      data.email,
      {
        redirectTo: `${siteUrl}/dashboard`,
        data: { name: data.name, phone: data.phone },
      }
    )

    if (inviteData?.user) {
      authUser = inviteData.user
    } else {
      // User already exists — find them
      console.warn('Invite skipped (user may already exist):', inviteError?.message)
      const { data: userList } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      authUser = userList?.users?.find(u => u.email === data.email) ?? null
    }

    // ─── Referrer setup ──────────────────────────────────────────────────────
    let referrerId: string | null = null
    let referralCode = generateReferralCode()

    if (authUser) {
      // Get product_id from the order
      let productId: string | null = null
      if (data.order_id) {
        const { data: orderRow } = await supabase
          .from('orders')
          .select('product_id')
          .eq('id', data.order_id)
          .single()
        productId = orderRow?.product_id || null
      }

      if (!productId && data.referral_code) {
        const { data: parentReferrer } = await supabase
          .from('referrers')
          .select('product_id')
          .eq('referral_code', data.referral_code)
          .single()
        productId = parentReferrer?.product_id || null
      }

      if (!productId) {
        const { data: defaultProduct } = await supabase
          .from('products')
          .select('id')
          .eq('is_visible', true)
          .limit(1)
          .single()
        productId = defaultProduct?.id || null
      }

      // Create or get referrer record
      const { data: existingReferrer } = await supabase
        .from('referrers')
        .select('id, referral_code')
        .eq('user_id', authUser.id)
        .single()

      if (existingReferrer) {
        referrerId = existingReferrer.id
        referralCode = existingReferrer.referral_code
      } else {
        // Ensure unique code
        let attempts = 0
        while (attempts < 10) {
          const { data: codeCheck } = await supabase
            .from('referrers')
            .select('id')
            .eq('referral_code', referralCode)
            .single()

          if (!codeCheck) break
          referralCode = generateReferralCode()
          attempts++
        }

        const { data: newReferrer } = await supabase
          .from('referrers')
          .insert({
            user_id: authUser.id,
            referral_code: referralCode,
            product_id: productId,
          })
          .select()
          .single()

        referrerId = newReferrer?.id || null
      }
    }

    // ─── Insert gift claim ───────────────────────────────────────────────────
    const { error: claimError } = await supabase.from('gift_claims').insert({
      order_id: data.order_id || null,
      gift_item_id: data.gift_item_id,
      referrer_id: referrerId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
    })

    if (claimError) {
      if (claimError.code === '23505') {
        return NextResponse.json(
          { error: 'כבר תבעת מתנה בעבר. ניתן לתבוע מתנה אחת בלבד.' },
          { status: 409 }
        )
      }
      throw claimError
    }

    // ─── Send welcome email (always, new or existing user) ──────────────────
    const referralUrl = buildReferralUrl(referralCode)
    await sendWelcomeEmail(data.email, referralUrl)

    return NextResponse.json({
      referral_code: referralCode,
      referral_url: referralUrl,
    })
  } catch (err) {
    console.error('Gift claim error:', err)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}