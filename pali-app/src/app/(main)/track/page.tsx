import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, PackageSearch, CheckCircle2, Circle, AlertTriangle } from 'lucide-react'

// ── Status config ────────────────────────────────────────────────────────────

type ShippingStatus =
  | 'received'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'exception'

const STATUS_LABELS: Record<ShippingStatus, string> = {
  received:   'התקבלה הזמנה',
  processing: 'בטיפול',
  packed:     'נארזה',
  shipped:    'נשלחה',
  in_transit: 'בדרך',
  delivered:  'נמסרה',
  exception:  'חריגה / בעיה במשלוח',
}

// Linear timeline order (exception is handled separately)
const TIMELINE: ShippingStatus[] = [
  'received',
  'processing',
  'packed',
  'shipped',
  'in_transit',
  'delivered',
]

// ── Search form (pure HTML — no client JS needed) ────────────────────────────

function SearchForm({ orderId, contact }: { orderId?: string; contact?: string }) {
  return (
    <form
      method="GET"
      action="/track"
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 w-full max-w-md mx-auto"
    >
      <div className="flex flex-col items-center gap-2 mb-7">
        <PackageSearch className="text-yellow-500" size={36} />
        <h2 className="text-xl font-black text-gray-900">מעקב הזמנה</h2>
        <p className="text-sm text-gray-500 text-center">
          הזינו את מספר ההזמנה ואת כתובת המייל או הטלפון שלכם
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="order_id" className="text-sm font-semibold text-gray-700">
            מספר הזמנה
          </label>
          <input
            id="order_id"
            name="order_id"
            type="text"
            required
            defaultValue={orderId ?? ''}
            placeholder="e.g. a1b2c3d4..."
            dir="ltr"
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="contact" className="text-sm font-semibold text-gray-700">
            טלפון או מייל
          </label>
          <input
            id="contact"
            name="contact"
            type="text"
            required
            defaultValue={contact ?? ''}
            placeholder="05X-XXXXXXX או name@example.com"
            dir="ltr"
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-300"
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
        >
          חפש
        </button>
      </div>
    </form>
  )
}

// ── Status timeline ──────────────────────────────────────────────────────────

function StatusTimeline({ status }: { status: ShippingStatus }) {
  const isException = status === 'exception'
  // For exception, we don't advance the timeline position — show all gray
  const currentIndex = isException ? -1 : TIMELINE.indexOf(status)

  return (
    <div className="flex flex-col gap-0">
      {TIMELINE.map((step, i) => {
        const isDone    = i < currentIndex
        const isCurrent = i === currentIndex
        const isFuture  = i > currentIndex

        return (
          <div key={step} className="flex items-start gap-3">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                  isDone    ? 'bg-yellow-500 text-white'  : '',
                  isCurrent ? 'bg-yellow-500 text-white ring-4 ring-yellow-200' : '',
                  isFuture  ? 'bg-gray-100 text-gray-300' : '',
                  isException ? 'bg-gray-100 text-gray-300' : '',
                ].join(' ')}
              >
                {isDone ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Circle size={16} />
                )}
              </div>
              {/* Connector line */}
              {i < TIMELINE.length - 1 && (
                <div
                  className={[
                    'w-0.5 h-8',
                    isDone ? 'bg-yellow-400' : 'bg-gray-200',
                  ].join(' ')}
                />
              )}
            </div>

            {/* Label column */}
            <div className="pt-1.5 pb-1">
              <span
                className={[
                  'text-sm font-semibold',
                  isDone    ? 'text-yellow-700' : '',
                  isCurrent ? 'text-yellow-600' : '',
                  isFuture  ? 'text-gray-300'   : '',
                  isException ? 'text-gray-300' : '',
                ].join(' ')}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
          </div>
        )
      })}

      {/* Exception banner */}
      {isException && (
        <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{STATUS_LABELS.exception}</span>
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: { order_id?: string; contact?: string }
}

export default async function TrackPage({ searchParams }: PageProps) {
  const { order_id, contact } = searchParams
  const hasQuery = order_id && contact

  let order: {
    id: string
    created_at: string
    shipping_status: string
    tracking_number: string | null
    products: { name: string } | null
  } | null = null

  let notFound = false

  if (hasQuery) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        shipping_status,
        tracking_number,
        products ( name )
      `)
      .eq('id', order_id)
      .or(`buyer_email.eq.${contact},buyer_phone.eq.${contact}`)
      .maybeSingle()

    if (!data) {
      notFound = true
    } else {
      order = {
        ...data,
        products: Array.isArray(data.products)
          ? (data.products[0] ?? null)
          : data.products,
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowRight size={16} />
          חזרה לחנות
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-8">מעקב הזמנה</h1>

        {/* Always show the search form */}
        <SearchForm orderId={order_id} contact={contact} />

        {/* Error state */}
        {notFound && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <p className="text-red-700 font-semibold text-sm">
              לא נמצאה הזמנה עם הפרטים שהוזנו
            </p>
            <p className="text-red-500 text-xs mt-1">
              אנא בדקו שמספר ההזמנה וכתובת המייל / הטלפון נכונים
            </p>
          </div>
        )}

        {/* Order result */}
        {order && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {/* Order meta */}
            <div className="mb-6 pb-5 border-b border-gray-100 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">מספר הזמנה</span>
                <span className="font-mono text-xs text-gray-600" dir="ltr">
                  {order.id.slice(0, 8)}…
                </span>
              </div>
              {order.products?.name && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">מוצר</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {order.products.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">תאריך הזמנה</span>
                <span className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('he-IL')}
                </span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">מספר מעקב</span>
                  <span className="font-mono text-sm font-bold text-yellow-700" dir="ltr">
                    {order.tracking_number}
                  </span>
                </div>
              )}
            </div>

            {/* Status timeline */}
            <StatusTimeline status={order.shipping_status as ShippingStatus} />
          </div>
        )}
      </div>
    </div>
  )
}
