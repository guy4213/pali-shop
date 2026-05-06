import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import WithdrawalsTable from './WithdrawalsTable'
import { isAdmin } from '@/lib/auth'
import PermissionGuard from '@/components/admin/PermissionGuard'

export default async function WithdrawalsPage() {
  if (!await isAdmin()) redirect('/')

  const supabase = await createClient()

  const { data: requests } = await supabase
    .from('withdrawal_requests')
    .select(`
      *,
      referrers (
        referral_code,
        user_id
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <PermissionGuard permission="manage_withdrawals">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
            <ArrowRight size={16} className="rtl-flip" />
            חזרה לניהול
          </Link>
          <h1 className="text-2xl font-black text-gray-900 mb-6">בקשות משיכה</h1>
          <WithdrawalsTable initialRequests={requests || []} />
        </div>
      </div>
    </PermissionGuard>
  )
}
