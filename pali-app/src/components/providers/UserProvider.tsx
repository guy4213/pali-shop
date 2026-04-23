'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserContextType {
  userEmail: string | null
  isAdmin: boolean
  balance: number
}

const UserContext = createContext<UserContextType>({
  userEmail: null,
  isAdmin: false,
  balance: 0,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [balance, setBalance] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserEmail(user.email ?? null)
      setIsAdmin(user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'super_admin')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setUserEmail(user?.email ?? null)
      setIsAdmin(
        user?.app_metadata?.role === 'admin' || user?.app_metadata?.role === 'super_admin'
      )
    })

    fetch('/api/wallet/balance')
      .then(r => r.json())
      .then(data => setBalance(data.balance ?? 0))
      .catch(() => {})

    return () => subscription.unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ userEmail, isAdmin, balance }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)