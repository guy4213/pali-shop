'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/components/providers/CartProvider'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const { items, count, total, removeItem, updateQty, clearCart } = useCart()
  const { toast } = useToast()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })

async function handleCheckout(e: React.FormEvent) {
  e.preventDefault()
  if (items.length === 0) return
  setLoading(true)

  let lastOrderId: string | null = null

  try {
    for (const item of items) {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id:   item.product_id,
          buyer_name:   form.name,
          buyer_email:  form.email,
          buyer_phone:  form.phone,
          buyer_address: form.address,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'שגיאה ביצירת הזמנה')
      }

      lastOrderId = data.order_id
    }

    clearCart()
    setCheckoutOpen(false)

    if (lastOrderId) {
      router.push(`/orders/${lastOrderId}`)
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'שגיאה'
    toast({ title: 'שגיאה', description: message, variant: 'destructive' })
  } finally {
    setLoading(false)
  }
}

  if (count === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-gray-400">
        <ShoppingCart size={56} className="opacity-20" />
        <p className="text-xl font-semibold">העגלה ריקה</p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowRight size={16} />
            חזרה לחנות
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingCart size={24} className="text-yellow-600" />
          עגלת הקניות
        </h1>

        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div key={item.product_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={24} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-yellow-600 font-bold">₪{item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateQty(item.product_id, item.quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.product_id, item.quantity + 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 mr-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">סה&quot;כ</span>
            <span className="text-2xl font-black text-gray-900">₪{total.toLocaleString()}</span>
          </div>
          <Button
            onClick={() => setCheckoutOpen(true)}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-6 text-base"
          >
            להמשך לתשלום
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">פרטי הזמנה</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800 font-medium">
              {items.length} פריטים — סה&quot;כ ₪{total.toLocaleString()}
            </div>
            <div>
              <Label className="text-right block mb-1">שם מלא *</Label>
              <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ישראל ישראלי" className="text-right" />
            </div>
            <div>
              <Label className="text-right block mb-1">אימייל *</Label>
              <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="israel@example.com" className="text-right" dir="ltr" />
            </div>
            <div>
              <Label className="text-right block mb-1">טלפון *</Label>
              <Input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="050-0000000" className="text-right" />
            </div>
            <div>
              <Label className="text-right block mb-1">כתובת למשלוח *</Label>
              <Textarea required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="רחוב, מספר בית, עיר, מיקוד" className="text-right" rows={2} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-6 text-base gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> שולח...</> : `אשר הזמנה – ₪${total.toLocaleString()}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
