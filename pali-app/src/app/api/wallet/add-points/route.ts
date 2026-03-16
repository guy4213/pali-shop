import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const addPointsSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })

    const body = await req.json()
    const parsed = addPointsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'פרטים לא תקינים' }, { status: 400 })
    }

    const { userId, amount } = parsed.data

    if (userId !== user.id) {
      return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 })
    }

    const serviceClient = await createServiceClient()

    const { data: newBalance, error } = await serviceClient.rpc('add_wallet_points', {
      p_user_id: userId,
      p_amount: amount,
    })

    if (error) {
      if (error.code === 'P0001') {
        return NextResponse.json({ error: 'משתמש לא נמצא' }, { status: 404 })
      }
      return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
    }

    if (newBalance === null) {
      return NextResponse.json({ error: 'משתמש לא נמצא' }, { status: 404 })
    }

    return NextResponse.json({ success: true, newBalance })
  } catch (err) {
    console.error('Add points error:', err)
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 })
  }
}
