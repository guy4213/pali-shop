import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Users, ArrowDownToLine, Gift, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import AdminProductsTable from './AdminProductsTable'
import { isAdmin, isSuperAdmin } from '@/lib/auth'

export default async function AdminPage() {
  if (!await isAdmin()) redirect('/')
  const superAdmin = await isSuperAdmin()

  const supabase = await createClient()

  const [products, referrers, pendingWithdrawals, giftClaims] = await Promise.all([
    supabase.from('products').select('*').order('created_at'),
    supabase.from('referrers').select('id').eq('is_active', true),
    supabase.from('withdrawal_requests').select('id').eq('status', 'pending'),
    supabase.from('gift_claims').select('id, name, email, phone, address, claimed_at, gift_items(name)').order('claimed_at', { ascending: false }).limit(50),
  ])

  // Queried separately — table may not exist before migration 006 runs
  const { data: openTicketsData } = await supabase
    .from('support_tickets')
    .select('id')
    .eq('status', 'open')
  const openTicketsCount = openTicketsData?.length ?? 0

  const stats = [
    { label: 'מוצרים', value: products.data?.length || 0, icon: Package, href: '#products' },
    { label: 'ממליצים פעילים', value: referrers.data?.length || 0, icon: Users, href: '/admin/referrers' },
    { label: 'משיכות ממתינות', value: pendingWithdrawals.data?.length || 0, icon: ArrowDownToLine, href: '/admin/withdrawals' },
    { label: 'תביעות מתנות', value: giftClaims.data?.length || 0, icon: Gift, href: '#gifts' },
    { label: 'פניות שירות', value: openTicketsCount, icon: MessageCircle, href: '/admin/support' },
  ]

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900">לוח בקרה – מנהל</h1>
          <div className="flex gap-3">
            <Link href="/admin/withdrawals" className="text-sm text-blue-600 hover:underline">משיכות</Link>
            <Link href="/admin/referrers" className="text-sm text-blue-600 hover:underline">ממליצים</Link>
            {superAdmin && (
              <Link href="/admin/users" className="text-sm text-purple-600 hover:underline">ניהול משתמשים</Link>
            )}
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

        {/* Gift Claims */}
        <div id="gifts" className="mt-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Gift size={20} className="text-yellow-600" />
            תביעות מתנות
          </h2>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {!giftClaims.data || giftClaims.data.length === 0 ? (
                <p className="text-center text-gray-400 py-8">אין תביעות מתנות</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">שם</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">אימייל</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">טלפון</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">מתנה</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">כתובת</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">תאריך</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {giftClaims.data.map((claim: {
                        id: string
                        name: string
                        email: string
                        phone: string
                        address: string
                        claimed_at: string
                        gift_items: { name: string } | null
                      }) => (
                        <tr key={claim.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-800">{claim.name}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs" dir="ltr">{claim.email}</td>
                          <td className="py-3 px-4 text-gray-600" dir="ltr">{claim.phone}</td>
                          <td className="py-3 px-4 text-gray-700">{claim.gift_items?.name ?? '—'}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{claim.address}</td>
                          <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                            {new Date(claim.claimed_at).toLocaleDateString('he-IL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
