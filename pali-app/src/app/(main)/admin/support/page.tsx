import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { markTicketHandled } from './actions'

type StatusFilter = 'open' | 'handled' | 'all'

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  if (!(await isAdmin())) redirect('/')

  const rawStatus = searchParams.status
  const status: StatusFilter =
    rawStatus === 'handled' ? 'handled' : rawStatus === 'all' ? 'all' : 'open'

  const supabase = await createClient()
  let q = supabase
    .from('support_tickets')
    .select('id, created_at, buyer_name, buyer_phone, buyer_email, issue_summary, status, handled_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status !== 'all') q = q.eq('status', status)

  const { data: tickets } = await q

  const filterLinks: { label: string; value: StatusFilter }[] = [
    { label: 'פתוחות', value: 'open' },
    { label: 'טופלו', value: 'handled' },
    { label: 'הכל', value: 'all' },
  ]

  return (
    <main className="flex-1" dir="rtl" lang="he">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">פניות שירות לקוחות</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {filterLinks.map(f => (
            <Link
              key={f.value}
              href={`?status=${f.value}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === f.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {tickets && tickets.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">מזהה</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">תאריך</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">שם</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">טלפון</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">מייל</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">בעיה</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">סטטוס</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">פעולה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {ticket.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(ticket.created_at).toLocaleString('he-IL')}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{ticket.buyer_name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${ticket.buyer_phone}`}
                          dir="ltr"
                          className="text-blue-600 hover:underline"
                        >
                          {ticket.buyer_phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{ticket.buyer_email ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px]">
                        <span title={ticket.issue_summary}>
                          {ticket.issue_summary.length > 80
                            ? `${ticket.issue_summary.slice(0, 80)}…`
                            : ticket.issue_summary}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {ticket.status === 'open' ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            פתוחה
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            טופלה
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {ticket.status === 'open' ? (
                          <form action={markTicketHandled}>
                            <input type="hidden" name="ticket_id" value={ticket.id} />
                            <button
                              type="submit"
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                            >
                              סמן כטופל
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {ticket.handled_at
                              ? new Date(ticket.handled_at).toLocaleString('he-IL')
                              : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">אין פניות להצגה</p>
          </div>
        )}
      </div>
    </main>
  )
}
