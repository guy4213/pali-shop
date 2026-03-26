'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart, Zap, Star, Shield, Truck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/components/providers/CartProvider'
import type { Product } from '@/types'
import { useRouter } from 'next/navigation'

interface ProductPageProps {
  product: Product
  referralCode?: string
}

export default function ProductPage({ product, referralCode }: ProductPageProps) {
  const router = useRouter()
  const [orderOpen, setOrderOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [pointsUsed, setPointsUsed] = useState(0)
  const { toast } = useToast()
  const { addItem } = useCart()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  // Load user balance when dialog opens
  useEffect(() => {
    if (!orderOpen) return
    fetch('/api/wallet/balance')
      .then(r => r.json())
      .then(data => setUserBalance(data.balance ?? 0))
      .catch(() => {})
  }, [orderOpen])

  const maxPoints = Math.min(userBalance, Math.floor(product.price) - 1)
  const finalPrice = product.price - pointsUsed

  function handleAddToCart() {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })
    toast({ title: 'נוסף לעגלה!', description: product.name })
  }

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          referral_code: referralCode || null,
          buyer_name: form.name,
          buyer_email: form.email,
          buyer_phone: form.phone,
          buyer_address: form.address,
          points_to_redeem: pointsUsed > 0 ? pointsUsed : undefined
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'שגיאה ביצירת ההזמנה')

    setOrderOpen(false)
    router.push(`/orders/${data.order_id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה ביצירת ההזמנה'
      toast({ title: 'שגיאה', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Product Image */}
            <div className="relative bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center min-h-[400px] p-8">
              {product.image_url ? (
                <div className="relative w-full h-80">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                  <span className="text-6xl font-black text-white">P</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-500">(128 ביקורות)</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {product.description && (
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {product.description}
                  </p>
                )}

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield size={16} className="text-green-500 flex-shrink-0" />
                    <span>אחריות מלאה + החזרה תוך 30 יום</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck size={16} className="text-blue-500 flex-shrink-0" />
                    <span>משלוח חינם לכל הארץ</span>
                  </div>
                  {referralCode && (
                    <div className="flex items-center gap-2 text-sm text-yellow-700 font-medium bg-yellow-50 px-3 py-2 rounded-lg">
                      <Zap size={16} className="text-yellow-500 flex-shrink-0" />
                      <span>הגעת דרך המלצה – תקבל מתנה עם הרכישה!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & CTA */}
              <div>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black text-gray-900">
                    ₪{product.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm">כולל מע&quot;מ</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setOrderOpen(true)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-lg py-6 gap-2"
                    size="lg"
                  >
                    <Zap size={20} />
                    קנה עכשיו
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddToCart}
                    className="px-6 py-6 border-2"
                    size="lg"
                    title="הוסף לעגלה"
                  >
                    <ShoppingCart size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: '🔒', text: 'תשלום מאובטח' },
            { icon: '📦', text: 'משלוח מהיר' },
            { icon: '⭐', text: 'אלפי לקוחות מרוצים' },
          ].map((badge) => (
            <div key={badge.text} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{badge.icon}</div>
              <p className="text-sm text-gray-600 font-medium">{badge.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={orderOpen} onOpenChange={open => { setOrderOpen(open); if (!open) setPointsUsed(0) }}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">פרטי הזמנה</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleOrder} className="space-y-4">
            <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800 font-medium">
              <strong>{product.name}</strong> — ₪{product.price.toLocaleString()}
            </div>

            <div>
              <Label htmlFor="name" className="text-right block mb-1">שם מלא *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ישראל ישראלי"
                className="text-right"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-right block mb-1">אימייל *</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="israel@example.com"
                className="text-right"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-right block mb-1">טלפון *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="050-0000000"
                className="text-right"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-right block mb-1">כתובת למשלוח *</Label>
              <Textarea
                id="address"
                required
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="רחוב, מספר בית, עיר, מיקוד"
                className="text-right"
                rows={2}
              />
            </div>

            {/* Use points */}
            {userBalance > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                <p className="text-sm font-semibold text-green-800">
                  יתרת נקודות: {userBalance.toLocaleString()} (= ₪{userBalance.toLocaleString()})
                </p>
                <Label className="text-right block text-sm text-green-700">
                  כמה נקודות להשתמש? (מקסימום {maxPoints})
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={maxPoints}
                  value={pointsUsed}
                  onChange={e => setPointsUsed(Math.min(maxPoints, Math.max(0, Number(e.target.value))))}
                  className="text-right"
                  dir="ltr"
                />
                {pointsUsed > 0 && (
                  <p className="text-xs text-green-700 font-medium">
                    חיסכון: ₪{pointsUsed} — מחיר סופי: ₪{finalPrice.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-6 text-base gap-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" />שולח הזמנה...</>
                : `אשר הזמנה – ₪${finalPrice.toLocaleString()}`}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              בלחיצה על הכפתור אתה מאשר את תנאי השימוש ומדיניות הפרטיות
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
