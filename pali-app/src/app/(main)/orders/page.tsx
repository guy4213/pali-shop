import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { OrderWithProduct } from '@/types'

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending:   { label: 'ממתין',   variant: 'secondary' },
  paid:      { label: 'שולם',    variant: 'default' },
  shipped:   { label: 'נשלח',    variant: 'default' },
  delivered: { label: 'נמסר',    variant: 'default' },
  cancelled: { label: 'בוטל',    variant: 'destructive' },
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/orders')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, products(name, image_url)')
    .order('created_at', { ascending: false })

  const typedOrders = (orders ?? []) as OrderWithProduct[]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowRight size={16} className="rtl-flip" />
          חזרה לדשבורד
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingBag size={24} className="text-yellow-600" />
          היסטוריית הזמנות
        </h1>

        {typedOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">אין הזמנות עדיין</p>
            <p className="text-sm mt-1">כשתבצע רכישה היא תופיע כאן</p>
          </div>
        ) : (
          <div className="space-y-3">
            {typedOrders.map(order => {
              const status = statusMap[order.status] ?? { label: order.status, variant: 'outline' as const }
              return (
                <Card key={order.id} className="shadow-sm">
                  <CardContent className="flex items-center gap-4 py-4">
                    {order.products?.image_url ? (
                      <img
                        src={order.products.image_url}
                        alt={order.products.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package size={24} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {order.products?.name ?? 'מוצר'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('he-IL', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-left flex-shrink-0 flex flex-col items-end gap-1">
                      <span className="font-bold text-gray-900">₪{order.amount.toLocaleString()}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
