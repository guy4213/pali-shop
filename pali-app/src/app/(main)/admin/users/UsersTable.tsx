'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Users } from 'lucide-react'

type Role = 'admin' | 'super_admin' | 'none'

interface UserRow {
  id: string
  email: string
  role: Role
  lastSignIn: string | null
  createdAt: string
}

const roleConfig: Record<Role, { label: string; color: string }> = {
  super_admin: { label: 'סופר מנהל', color: 'bg-purple-100 text-purple-700' },
  admin: { label: 'מנהל', color: 'bg-blue-100 text-blue-700' },
  none: { label: 'משתמש', color: 'bg-gray-100 text-gray-600' },
}

export default function UsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  async function updateRole(userId: string, role: Role) {
    setLoading(userId)
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })

    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
      toast({ title: 'התפקיד עודכן בהצלחה' })
    } else {
      toast({ title: 'שגיאה בעדכון תפקיד', variant: 'destructive' })
    }
    setLoading(null)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Users size={18} className="text-yellow-600" />
          ניהול משתמשים ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-gray-600">אימייל</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">תפקיד נוכחי</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">כניסה אחרונה</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">נרשם</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">שינוי תפקיד</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800 font-mono text-xs" dir="ltr">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${roleConfig[user.role].color} hover:${roleConfig[user.role].color}`}>
                      {roleConfig[user.role].label}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {user.lastSignIn
                      ? new Date(user.lastSignIn).toLocaleDateString('he-IL')
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString('he-IL')}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      disabled={loading === user.id}
                      value={user.role}
                      onChange={e => updateRole(user.id, e.target.value as Role)}
                      className="text-sm border border-gray-200 rounded px-2 py-1 bg-white disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    >
                      <option value="none">משתמש</option>
                      <option value="admin">מנהל</option>
                      <option value="super_admin">סופר מנהל</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
