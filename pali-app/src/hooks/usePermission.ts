'use client'

import { useUser } from '@/components/providers/UserProvider'

export function usePermission(permission: string): boolean {
  const { isSuperAdmin, permissions } = useUser()
  return isSuperAdmin || permissions.includes(permission)
}
