import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isAdmin } from '@/lib/auth'

export default async function AdminReferrersPage() {
  if (!await isAdmin()) redirect('/')

  const supabase = await createClient()

  const { data: referrers } = await supabase
    .from('referrers')
    .select('*')
    .order('created_at', { ascending: false })

  // Get click counts and commission totals in parallel
  const enriched = await Promise.all(
    (referrers || []).map(async (r) => {
      const [clicks, commissions] = await Promise.all([
        supabase.from('referral_clicks').select('id', { count: 'exact' }).eq('referral_code', r.referral_code),
        supabase.from('commissions').select('points_earned').eq('referrer_id', r.id),
      ])

      const totalEarned = commissions.data?.reduce((s, c) => s + c.points_earned, 0) || 0

      return {
        ...r,
        click_count: clicks.count || 0,
        purchase_count: commissions.data?.length || 0,
        total_earned: totalEarned,
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowRight size={16} className="rtl-flip" />
          חזרה לניהול
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-6">ממליצים ({enriched.length})</h1>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">רשימת ממליצים פעילים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">קוד ייחודי</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">קליקים</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">רכישות</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">סה&quot;כ עמלות</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">תאריך הצטרפות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enriched.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-bold text-gray-800">{r.referral_code}</td>
                      <td className="py-3 px-4 text-blue-600 font-medium">{r.click_count}</td>
                      <td className="py-3 px-4 text-green-600 font-medium">{r.purchase_count}</td>
                      <td className="py-3 px-4 text-yellow-700 font-bold">₪{r.total_earned.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(r.created_at).toLocaleDateString('he-IL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
