import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth'
import UsersTable from './UsersTable'

export default async function AdminUsersPage() {
  if (!await isSuperAdmin()) redirect('/')

  const supabase = await createServiceClient()
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  if (error) throw new Error(error.message)

  const rows = users.map(u => ({
    id: u.id,
    email: u.email ?? '—',
    role: (u.app_metadata?.role ?? 'none') as 'admin' | 'super_admin' | 'none',
    lastSignIn: u.last_sign_in_at ?? null,
    createdAt: u.created_at,
  }))

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">ניהול משתמשים ותפקידים</h1>
        <p className="text-sm text-gray-500 mb-6 bg-yellow-50 border border-yellow-200 rounded px-4 py-2">
          שינוי תפקיד נכנס לתוקף בכניסה הבאה של המשתמש — על המשתמש להתנתק ולהתחבר מחדש.
        </p>
        <UsersTable initialUsers={rows} />
      </div>
    </main>
  )
}
