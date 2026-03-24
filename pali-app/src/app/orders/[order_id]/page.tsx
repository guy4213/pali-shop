import Link from 'next/link'
import { CheckCircle2, Package, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  params: Promise<{ order_id: string }>
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { order_id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,
      buyer_name,
      buyer_email,
      amount,
      referral_code,
      created_at,
      products (
        name
      )
    `)
    .eq('id', order_id)
    .single()

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <Package size={56} className="text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-700 mb-2">ההזמנה לא נמצאה</h1>
        <p className="text-gray-400 text-sm mb-6">
          ייתכן שהקישור שגוי או שההזמנה לא קיימת במערכת.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
        >
          <ArrowRight size={16} className="rtl-flip" />
          חזרה לדף הבית
        </Link>
      </div>
    )
  }

const productObj=Array.isArray(order.products) 
    ? (order.products[0] ?? null) 
    : order.products 
  const productName = (productObj as { name: string } | null)?.name ?? 'מוצר'

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Success icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-sm">
            <CheckCircle2 size={44} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 text-center">תודה על הרכישה!</h1>
          <p className="text-gray-500 mt-2 text-center text-sm">
            ההזמנה שלך התקבלה בהצלחה
          </p>
        </div>

        {/* Order details card */}
        <Card className="shadow-md border-0 rounded-2xl overflow-hidden mb-4">
          <div className="bg-yellow-400 px-6 py-3">
            <p className="text-xs font-semibold text-yellow-900 uppercase tracking-wide">
              פרטי הזמנה
            </p>
          </div>
          <CardContent className="px-6 py-5 space-y-4">

            <Row label="מזהה הזמנה">
              <span className="font-mono text-sm text-gray-600">{order.id.slice(0, 8).toUpperCase()}</span>
            </Row>

            <Row label="מוצר">
              <span className="font-semibold text-gray-900">{productName}</span>
            </Row>

            <Row label="סכום ששולם">
              <span className="font-black text-gray-900 text-lg">₪{order.amount.toLocaleString()}</span>
            </Row>

            <Row label="שם">
              <span className="text-gray-700">{order.buyer_name}</span>
            </Row>

            <Row label="אימייל">
              <span className="text-gray-500 text-sm" dir="ltr">{order.buyer_email}</span>
            </Row>

          </CardContent>
        </Card>

        {/* Delivery note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-3 text-center">
          <p className="text-blue-700 text-sm font-medium">
            📦 המוצר יישלח תוך 3–5 ימי עסקים
          </p>
        </div>

        {/* Referral attribution note */}
        {order.referral_code && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 mb-3 text-center">
            <p className="text-green-700 text-sm font-medium">
              הרכישה זוכתה לשגריר שלך 🎉
            </p>
          </div>
        )}

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            <ArrowRight size={14} className="rtl-flip" />
            חזרה לדף הבית
          </Link>
        </div>

      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-gray-400 text-sm shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  )
}
