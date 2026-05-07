'use client'

import { usePermission } from '@/hooks/usePermission'
import { useUser } from '@/components/providers/UserProvider'

interface Props {
  permission: string
  children: React.ReactNode
}

export default function PermissionGuard({ permission, children }: Props) {
  const { loading } = useUser()
  const hasPermission = usePermission(permission)

  if (loading) return null

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[300px]" dir="rtl">
        <p className="text-gray-500 text-lg">אין לך הרשאה לצפות בדף זה.</p>
      </div>
    )
  }

  return <>{children}</>
}
