import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const profileSchema = z.object({
  full_name:    z.string().min(2).optional(),
  phone:        z.string().min(8).optional(),
  address:      z.string().optional(),
  bank_code:    z.string().optional(),    // 2-digit Israeli bank code
  bank_branch:  z.string().optional(),    // 3-digit branch number
  bank_account: z.string().optional(),    // account number
})

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
  }

  const { data: referrer, error } = await supabase
    .from('referrers')
    .select('full_name, phone, address, bank_code, bank_branch, bank_account')
    .eq('user_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'לא נמצא פרופיל' }, { status: 404 })
  }

  return NextResponse.json(referrer)
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'פרטים לא תקינים' }, { status: 400 })
  }

  const { error } = await supabase
    .from('referrers')
    .update(parsed.data)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'שגיאה בשמירה' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
