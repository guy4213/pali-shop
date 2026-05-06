'use client'

import { useState } from 'react'
import { updateAdminPermissions } from './actions'

const PERMISSION_LABELS: Record<string, string> = {
  manage_orders: 'ניהול הזמנות',
  manage_products: 'ניהול מוצרים',
  manage_stock: 'ניהול מלאי',
  manage_users: 'ניהול משתמשים',
  view_analytics: 'צפייה בנתונים',
  manage_withdrawals: 'ניהול משיכות',
  manage_referrers: 'ניהול ממליצים',
}

interface Admin {
  id: string
  email: string
  permissions: string[]
}

interface Props {
  admins: Admin[]
  allPermissions: string[]
}

export default function PermissionsManager({ admins, allPermissions }: Props) {
  const [permissionsState, setPermissionsState] = useState<Record<string, string[]>>(
    Object.fromEntries(admins.map(a => [a.id, [...a.permissions]]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function togglePermission(userId: string, permission: string) {
    setPermissionsState(prev => {
      const current = prev[userId] ?? []
      const has = current.includes(permission)
      return {
        ...prev,
        [userId]: has ? current.filter(p => p !== permission) : [...current, permission],
      }
    })
  }

  async function handleSave(userId: string) {
    setSaving(userId)
    setSavedId(null)
    setError(null)
    try {
      await updateAdminPermissions(userId, permissionsState[userId] ?? [])
      setSavedId(userId)
      setTimeout(() => setSavedId(null), 2500)
    } catch {
      setError('שגיאה בשמירת ההרשאות. נסה שוב.')
    } finally {
      setSaving(null)
    }
  }

  if (admins.length === 0) {
    return (
      <p className="text-gray-500 text-center py-12">אין אדמינים רשומים במערכת.</p>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {admins.map(admin => (
        <div key={admin.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-semibold text-gray-900">{admin.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(permissionsState[admin.id] ?? []).length} הרשאות פעילות
              </p>
            </div>
            <button
              onClick={() => handleSave(admin.id)}
              disabled={saving === admin.id}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-gray-900 font-bold px-5 py-2 rounded-lg transition-colors text-sm"
            >
              {saving === admin.id ? 'שומר...' : savedId === admin.id ? '✓ נשמר' : 'שמור'}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allPermissions.map(permission => (
              <label key={permission} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={(permissionsState[admin.id] ?? []).includes(permission)}
                  onChange={() => togglePermission(admin.id, permission)}
                  className="w-4 h-4 accent-yellow-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  {PERMISSION_LABELS[permission] ?? permission}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
