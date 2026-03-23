import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth'
import OrdersTable from './OrdersTable'

export default async function AdminOrdersPage() {
  if (!await isAdmin()) redirect('/')

  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      buyer_name,
      buyer_email,
      amount,
      points_redeemed,
      status,
      payment_status,
      tracking_number,
      created_at,
      products (
        name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowRight size={16} className="rtl-flip" />
          חזרה לניהול
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-6">הזמנות</h1>

        <OrdersTable initialOrders={orders ?? []} />
      </div>
    </div>
  )
}
