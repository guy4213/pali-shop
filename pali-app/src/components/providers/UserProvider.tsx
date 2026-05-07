'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export const ALL_PERMISSIONS = [
  'manage_orders',
  'manage_products',
  'manage_stock',
  'manage_users',
  'view_analytics',
  'manage_withdrawals',
  'manage_referrers',
] as const

interface UserContextType {
  userEmail: string | null
  isAdmin: boolean
  isSuperAdmin: boolean
  permissions: string[]
  balance: number
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  userEmail: null,
  isAdmin: false,
  isSuperAdmin: false,
  permissions: [],
  balance: 0,
  loading: true,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [permissions, setPermissions] = useState<string[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function syncUser(userId: string | null, role: string | undefined) {
    const adminRole = role === 'admin' || role === 'super_admin'
    const superAdminRole = role === 'super_admin'
    setIsAdmin(adminRole)
    setIsSuperAdmin(superAdminRole)

    if (superAdminRole) {
      setPermissions([...ALL_PERMISSIONS])
    } else if (adminRole && userId) {
      const { data } = await supabase
        .from('admin_permissions')
        .select('permission')
        .eq('user_id', userId)
      setPermissions(data?.map(p => p.permission) ?? [])
    } else {
      setPermissions([])
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null)
        await syncUser(user.id, user.app_metadata?.role)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null
      setUserEmail(user?.email ?? null)
      await syncUser(user?.id ?? null, user?.app_metadata?.role)
    })

    fetch('/api/wallet/balance')
      .then(r => r.json())
      .then(data => setBalance(data.balance ?? 0))
      .catch(() => {})

    return () => subscription.unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ userEmail, isAdmin, isSuperAdmin, permissions, balance, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
