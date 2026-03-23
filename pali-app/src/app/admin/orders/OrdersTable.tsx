'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { updateTrackingNumber } from './actions'

interface OrderRow {
  id: string
  buyer_name: string
  buyer_email: string
  amount: number
  points_redeemed: number
  status: string
  payment_status: string
  tracking_number: string | null
  created_at: string
  products: { name: string } | null
}

interface Props {
  initialOrders: OrderRow[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: 'ממתין',  color: 'bg-gray-100 text-gray-600' },
  paid:      { label: 'שולם',   color: 'bg-green-100 text-green-700' },
  shipped:   { label: 'נשלח',   color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'בוטל',   color: 'bg-red-100 text-red-600' },
  delivered: { label: 'נמסר',   color: 'bg-green-100 text-green-700' },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  unpaid:     { label: 'לא שולם',  color: 'bg-yellow-100 text-yellow-700' },
  paid:       { label: 'שולם',     color: 'bg-green-100 text-green-700' },
  refunded:   { label: 'הוחזר',    color: 'bg-purple-100 text-purple-700' },
  chargeback: { label: 'חיוב חוזר', color: 'bg-red-100 text-red-600' },
}

export default function OrdersTable({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [savingId, setSavingId] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleTrackingUpdate(orderId: string, value: string, original: string | null) {
    if (value === (original ?? '')) return
    setSavingId(orderId)
    const { success } = await updateTrackingNumber(orderId, value)
    setSavingId(null)
    if (success) {
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, tracking_number: value } : o)
      )
      toast({ title: 'מספר מעקב עודכן' })
    } else {
      toast({ title: 'שגיאה בשמירה', variant: 'destructive' })
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold">
          הזמנות ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center text-gray-400 py-8">אין הזמנות עדיין</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">מזהה</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">שם רוכש</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">אימייל</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">מוצר</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">סכום (₪)</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">נקודות</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">סטטוס</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">תשלום</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">תאריך</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 whitespace-nowrap">מס׳ מעקב</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => {
                  const sc = statusConfig[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
                  const pc = paymentStatusConfig[order.payment_status] ?? { label: order.payment_status, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono text-xs text-gray-500">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-3 text-gray-800 whitespace-nowrap">
                        {order.buyer_name}
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-xs" dir="ltr">
                        {order.buyer_email}
                      </td>
                      <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                        {order.products?.name ?? '—'}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">
                        ₪{order.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-yellow-700 font-medium">
                        {order.points_redeemed > 0 ? order.points_redeemed.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={`${sc.color} hover:${sc.color} border-0`}>
                          {sc.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={`${pc.color} hover:${pc.color} border-0`}>
                          {pc.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('he-IL')}
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          defaultValue={order.tracking_number ?? ''}
                          disabled={savingId === order.id}
                          placeholder="הוסף מספר מעקב"
                          className="w-36 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 disabled:opacity-50"
                          onBlur={e => handleTrackingUpdate(order.id, e.target.value, order.tracking_number)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur()
                            }
                          }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
