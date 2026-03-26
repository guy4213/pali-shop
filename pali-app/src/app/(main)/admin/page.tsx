import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Users, ArrowDownToLine, Gift } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import AdminProductsTable from './AdminProductsTable'
export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // For now, check by email pattern — in production use custom claims
  const isAdmin = user.email?.endsWith('@pali.co.il') || user.app_metadata?.role === 'admin'
  if (!isAdmin) redirect('/')

  const [products, referrers, pendingWithdrawals, giftClaims] = await Promise.all([
    supabase.from('products').select('*').order('created_at'),
    supabase.from('referrers').select('id').eq('is_active', true),
    supabase.from('withdrawal_requests').select('id').eq('status', 'pending'),
    supabase.from('gift_claims').select('id'),
  ])

  const stats = [
    { label: 'מוצרים', value: products.data?.length || 0, icon: Package, href: '#products' },
    { label: 'ממליצים פעילים', value: referrers.data?.length || 0, icon: Users, href: '/admin/referrers' },
    { label: 'משיכות ממתינות', value: pendingWithdrawals.data?.length || 0, icon: ArrowDownToLine, href: '/admin/withdrawals' },
    { label: 'תביעות מתנות', value: giftClaims.data?.length || 0, icon: Gift, href: '#gifts' },
  ]

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900">לוח בקרה – מנהל</h1>
          <div className="flex gap-3">
            <Link href="/admin/withdrawals" className="text-sm text-blue-600 hover:underline">משיכות</Link>
            <Link href="/admin/referrers" className="text-sm text-blue-600 hover:underline">ממליצים</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <Link key={s.label} href={s.href}>
              <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <s.icon size={20} className="text-yellow-600 mb-3" />
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Products Management */}
        <div id="products">
          <AdminProductsTable initialProducts={products.data || []} />
        </div>
      </div>
    </main>
  )
}
