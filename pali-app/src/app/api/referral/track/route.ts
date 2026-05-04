import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, userAgent } = body

    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') || 'unknown'

    const supabase = await createServiceClient()

    const { error } = await supabase.from('referral_clicks').insert({
      referral_code: code,
      ip_address: ip,
      user_agent: userAgent,
    })

    if (error) {
      console.error('[referral/track] insert failed:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
