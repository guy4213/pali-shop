import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { isSuperAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServiceClient } from '@/lib/supabase/server'
import PermissionsManager from './PermissionsManager'
import { ALL_PERMISSIONS } from '@/components/providers/UserProvider'

export default async function AdminPermissionsPage() {
  if (!await isSuperAdmin()) redirect('/admin')

  const adminClient = createAdminClient()
  const supabase = await createServiceClient()

  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const adminUsers = (users ?? []).filter(u => u.app_metadata?.role === 'admin')

  const { data: existingPermissions } = await supabase
    .from('admin_permissions')
    .select('user_id, permission')

  const permissionsByUser: Record<string, string[]> = {}
  for (const p of existingPermissions ?? []) {
    if (!permissionsByUser[p.user_id]) permissionsByUser[p.user_id] = []
    permissionsByUser[p.user_id].push(p.permission)
  }

  const admins = adminUsers.map(u => ({
    id: u.id,
    email: u.email ?? '',
    permissions: permissionsByUser[u.id] ?? [],
  }))

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowRight size={16} className="rtl-flip" />
          חזרה לניהול
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-2">ניהול הרשאות אדמינים</h1>
        <p className="text-sm text-gray-500 mb-8">
          הגדר אילו פעולות כל אדמין רשאי לבצע.
        </p>

        <PermissionsManager
          admins={admins}
          allPermissions={[...ALL_PERMISSIONS]}
        />
      </div>
    </div>
  )
}
