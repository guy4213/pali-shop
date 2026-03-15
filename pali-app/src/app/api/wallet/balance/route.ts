import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBalance } from '@/lib/points'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ balance: 0 })
  }

  const service = await createServiceClient()
  const { data: referrer } = await service
    .from('referrers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!referrer) {
    return NextResponse.json({ balance: 0 })
  }

  const balance = await getBalance(referrer.id)
  return NextResponse.json({ balance })
}
