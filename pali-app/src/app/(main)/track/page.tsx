import { createClient } from '@/lib/supabase/server'

const SHIPPING_STEPS = [
  { key: 'received',   label: 'התקבלה' },
  { key: 'processing', label: 'בעיבוד' },
  { key: 'packed',     label: 'נארזה' },
  { key: 'shipped',    label: 'נשלחה' },
  { key: 'in_transit', label: 'בדרך' },
  { key: 'delivered',  label: 'נמסרה' },
  { key: 'exception',  label: 'תקלה' },
]

export default async function TrackPage({
  searchParams,
}: {
  searchParams: { order_id?: string }
}) {
  const { order_id } = searchParams

  let order: {
    id: string
    buyer_name: string
    shipping_status: string
    tracking_number: string | null
  } | null = null

  let notFound = false

  if (order_id) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select('id, buyer_name, shipping_status, tracking_number')
      .eq('id', order_id)
      .maybeSingle()

    if (data) {
      order = data
    } else {
      notFound = true
    }
  }

  const currentIndex = order
    ? SHIPPING_STEPS.findIndex((s) => s.key === order!.shipping_status)
    : -1

  return (
    <main dir="rtl" className="min-h-screen bg-gray-950 text-gray-100 px-4 py-12">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-black text-yellow-400 mb-8 text-center">מעקב הזמנה</h1>

        {/* Search form */}
        <form method="GET" className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              מספר הזמנה
            </label>
            <input
              name="order_id"
              defaultValue={order_id ?? ''}
              required
              placeholder="הכנס מספר הזמנה"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold py-2.5 rounded-lg transition-colors"
          >
            חפש הזמנה
          </button>
        </form>

        {/* Not found */}
        {notFound && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-5 text-center text-red-300 font-medium">
            לא נמצאה הזמנה עם הפרטים שהוזנו
          </div>
        )}

        {/* Order found */}
        {order && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">שלום, {order.buyer_name}</p>
            <p className="text-xs text-gray-600 font-mono mb-6">#{order.id}</p>

            {/* Tracking number */}
            {order.tracking_number && (
              <div className="mb-6 bg-gray-800 rounded-lg px-4 py-3 text-sm">
                <span className="text-gray-400">מספר מעקב: </span>
                <span className="font-mono font-bold text-yellow-400">{order.tracking_number}</span>
              </div>
            )}

            {/* Vertical stepper */}
            <div className="space-y-0">
              {SHIPPING_STEPS.map((step, index) => {
                const isDone = index <= currentIndex && step.key !== 'exception'
                const isCurrent = index === currentIndex
                const isException = step.key === 'exception'
                const showException = isCurrent && isException

                // Hide exception step unless it's the current status
                if (isException && !showException) return null

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${
                          showException
                            ? 'border-red-500 bg-red-500'
                            : isCurrent
                            ? 'border-yellow-400 bg-yellow-400'
                            : isDone
                            ? 'border-yellow-600 bg-yellow-600'
                            : 'border-gray-700 bg-gray-800'
                        }`}
                      />
                      {index < SHIPPING_STEPS.length - 2 && (
                        <div
                          className={`w-0.5 flex-1 my-1 ${
                            isDone && !isCurrent ? 'bg-yellow-700' : 'bg-gray-800'
                          }`}
                          style={{ minHeight: '1.5rem' }}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className="pb-5">
                      <span
                        className={`text-sm font-semibold ${
                          showException
                            ? 'text-red-400'
                            : isCurrent
                            ? 'text-yellow-400'
                            : isDone
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
