import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth'

const VALID_ROLES = ['admin', 'super_admin', 'none'] as const
type Role = typeof VALID_ROLES[number]

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isSuperAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const { role } = await req.json() as { role: Role }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { error } = await supabase.auth.admin.updateUserById(id, {
    app_metadata: { role: role === 'none' ? null : role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
