'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Gift, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import type { GiftItem } from '@/types'

function GiftPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const orderId = searchParams.get('order')
  const refCode = searchParams.get('ref')

  const [step, setStep] = useState<'select' | 'form' | 'loading'>('select')
  const [giftItems, setGiftItems] = useState<GiftItem[]>([])
  const [selectedGift, setSelectedGift] = useState<string | null>(null)
  const [loadingItems, setLoadingItems] = useState(true)

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })

  useEffect(() => {
    fetch('/api/gift/items')
      .then(r => r.json())
      .then(data => setGiftItems(data.items || []))
      .finally(() => setLoadingItems(false))
  }, [])

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedGift) return

    const selectedItem = giftItems.find(i => i.id === selectedGift)
    if (!selectedItem || selectedItem.stock_count === 0) {
      toast({
        title: 'שגיאה',
        description: 'המתנה שבחרת אזלה מהמלאי. אנא בחר מתנה אחרת.',
        variant: 'destructive',
      })
      setStep('select')
      return
    }

    setStep('loading')

    try {
      const res = await fetch('/api/gift/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          gift_item_id: selectedGift,
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          referral_code: refCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'שגיאה בתביעת המתנה')

      router.push(`/welcome?code=${data.referral_code}&url=${encodeURIComponent(data.referral_url)}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה בתביעת המתנה'
      toast({ title: 'שגיאה', description: message, variant: 'destructive' })
      setStep('select')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <Gift size={32} className="text-yellow-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            נהנית מהמוצר? מגיעה לך מתנה!
          </h1>
          <p className="text-gray-600">
            בחר מתנה, השאר פרטים — ונשלח אליך אותה חינם.
          </p>
        </div>

        {/* Step 1: Select Gift */}
        {(step === 'select' || step === 'form') && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              1. בחר את המתנה שלך
            </h2>

            {loadingItems ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-yellow-500" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {giftItems.map(item => {
                  const outOfStock = item.stock_count === 0
                  return (
                    <button
                      key={item.id}
                      disabled={outOfStock}
                      onClick={outOfStock ? undefined : () => { setSelectedGift(item.id); setStep('form') }}
                      className={`relative border-2 rounded-xl p-4 text-center transition-all ${
                        outOfStock
                          ? 'border-gray-200 opacity-60 cursor-not-allowed'
                          : selectedGift === item.id
                            ? 'border-yellow-500 bg-yellow-50 shadow-md'
                            : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                      }`}
                    >
                      {!outOfStock && selectedGift === item.id && (
                        <div className="absolute top-2 left-2">
                          <CheckCircle size={20} className="text-yellow-500" />
                        </div>
                      )}
                      <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-100">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement
                              t.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
                        )}
                        {outOfStock && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                              אזל המלאי
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-green-600 font-medium mt-1">חינם!</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Form */}
        {step === 'form' && selectedGift && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              2. לאן לשלוח את המתנה?
            </h2>

            <form onSubmit={handleClaim} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-right block mb-1">שם מלא *</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="ישראל ישראלי"
                    className="text-right"
                  />
                </div>
                <div>
                  <Label className="text-right block mb-1">טלפון *</Label>
                  <Input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="050-0000000"
                    className="text-right"
                  />
                </div>
              </div>

              <div>
                <Label className="text-right block mb-1">אימייל *</Label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="israel@example.com"
                  dir="ltr"
                  className="text-right"
                />
              </div>

              <div>
                <Label className="text-right block mb-1">כתובת מלאה למשלוח *</Label>
                <Textarea
                  required
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="רחוב, מספר בית, עיר, מיקוד"
                  className="text-right"
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-6 text-base"
              >
                שלחו לי את המתנה! 🎁
              </Button>

              <p className="text-xs text-gray-400 text-center">
                המתנה תשלח תוך 7-14 ימי עסקים. לא כולל הוצאות משלוח נוספות.
              </p>
            </form>
          </div>
        )}

        {/* Loading */}
        {step === 'loading' && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Loader2 className="animate-spin text-yellow-500 mx-auto mb-4" size={48} />
            <p className="text-lg font-semibold text-gray-700">מכין את המתנה שלך...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GiftPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-500" size={48} />
      </div>
    }>
      <GiftPageContent />
    </Suspense>
  )
}
