'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface WithdrawalRow {
  id: string
  points_amount: number
  bank_code: string | null
  bank_branch: string | null
  bank_account: string | null
  status: string
  created_at: string
  admin_note: string | null
  referrers: { referral_code: string; user_id: string } | null
}

interface Props {
  initialRequests: WithdrawalRow[]
  canApprove: boolean
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'אושר', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'נדחה', color: 'bg-red-100 text-red-700' },
}

export default function WithdrawalsTable({ initialRequests, canApprove }: Props) {
  const [requests, setRequests] = useState(initialRequests)
  const { toast } = useToast()

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    const res = await fetch(`/api/admin/withdrawals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      toast({ title: status === 'approved' ? 'הבקשה אושרה' : 'הבקשה נדחתה' })
    } else {
      toast({ title: 'שגיאה', variant: 'destructive' })
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold">
          בקשות משיכה ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-center text-gray-400 py-8">אין בקשות משיכה</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">ממליץ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">סכום</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">פרטי בנק</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">תאריך</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">סטטוס</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">
                      {req.referrers?.referral_code || '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ₪{req.points_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600" dir="ltr">
                      {req.bank_code && req.bank_branch && req.bank_account
                        ? `בנק ${req.bank_code} / סניף ${req.bank_branch} / ${req.bank_account}`
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(req.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${statusConfig[req.status]?.color} hover:${statusConfig[req.status]?.color}`}>
                        {statusConfig[req.status]?.label || req.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {req.status === 'pending' && canApprove && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(req.id, 'approved')}
                            className="p-1.5 rounded hover:bg-green-50 text-green-600"
                            title="אשר"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => updateStatus(req.id, 'rejected')}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                            title="דחה"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
