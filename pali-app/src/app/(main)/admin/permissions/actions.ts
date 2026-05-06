'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const VALID_PERMISSIONS = [
  'manage_orders',
  'manage_products',
  'manage_stock',
  'manage_users',
  'view_analytics',
  'manage_withdrawals',
  'manage_referrers',
] as const

type Permission = (typeof VALID_PERMISSIONS)[number]

export async function updateAdminPermissions(userId: string, permissions: string[]) {
  if (!await isSuperAdmin()) throw new Error('Unauthorized')

  const validPerms = permissions.filter((p): p is Permission =>
    VALID_PERMISSIONS.includes(p as Permission)
  )

  const supabase = await createServiceClient()
  const { data: { user: granter } } = await supabase.auth.getUser()

  await supabase.from('admin_permissions').delete().eq('user_id', userId)

  if (validPerms.length > 0) {
    await supabase.from('admin_permissions').insert(
      validPerms.map(permission => ({
        user_id: userId,
        permission,
        granted_by: granter?.id ?? null,
      }))
    )
  }

  revalidatePath('/admin/permissions')
}
