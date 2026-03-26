'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Copy, CheckCheck, Share2, Sparkles, TrendingUp, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

function WelcomeContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const referralUrl = searchParams.get('url') ? decodeURIComponent(searchParams.get('url')!) : ''
  const referralCode = searchParams.get('code') || ''

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      toast({ title: 'הקישור הועתק!', description: 'עכשיו שתף אותו ברשתות החברתיות.' })
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast({ title: 'שגיאה', description: 'לא ניתן להעתיק. העתק ידנית.', variant: 'destructive' })
    }
  }

  const shareText = `גיליתי מוצר מדהים! תסתכלו על זה 👇 ${referralUrl}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gold-gradient mb-6 shadow-lg">
            <Sparkles size={40} className="text-gray-900" />
          </div>

          <h1 className="text-4xl font-black mb-4 leading-tight">
            ברכותינו! 🎉
          </h1>
          <p className="text-xl text-yellow-300 font-semibold mb-3">
            זכית להיכלל בקבוצה נבחרת של לקוחות
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            עכשיו תוכל לקבל את עלות הרכישה בחזרה — ואפילו להרוויח{' '}
            <span className="text-yellow-300 font-bold">פי 10, פי 100 ואף פי 1,000</span>{' '}
            מהסכום המקורי.
          </p>
        </div>

        {/* Referral Link Box */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <p className="text-sm text-gray-300 mb-2 font-medium">הקישורית האישית שלך:</p>
          <div className="flex items-center gap-3 bg-black/30 rounded-xl p-4">
            <p className="flex-1 text-yellow-300 font-mono text-sm break-all" dir="ltr">
              {referralUrl || `https://pali.co.il/share/${referralCode}`}
            </p>
            <button
              onClick={copyLink}
              className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
              {copied ? 'הועתק!' : 'העתק'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            💡 שמור את הקישור — תצטרך אותו לשיתוף ולמעקב אחר הרווחים שלך
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-yellow-400" />
            איך מרוויחים?
          </h2>
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'שתף',
                desc: 'שלח את הקישור לחברים, פרסם בסטורי, שתף בקבוצות וואטסאפ',
              },
              {
                step: '2',
                title: 'הם קונים',
                desc: 'כל אחד שיקנה דרך הקישור שלך מזכה אותך בנקודות (1 נקודה = 1 ₪)',
              },
              {
                step: '3',
                title: 'אתה מרוויח',
                desc: 'מעל 2,000 נקודות — משוך מזומן לחשבון הבנק שלך',
              },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gold-gradient flex items-center justify-center font-black text-gray-900 text-sm">
                  {item.step}
                </div>
                <div>
                  <p className="font-bold text-white">{item.title}</p>
                  <p className="text-sm text-gray-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3 mb-8">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 gap-2 text-base">
              <Share2 size={18} />
              שתף בוואטסאפ
            </Button>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 gap-2 text-base">
              <Share2 size={18} />
              שתף בפייסבוק
            </Button>
          </a>
        </div>

        {/* Dashboard CTA */}
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10 py-4 gap-2 font-semibold"
          >
            לדשבורד שלי
            <ArrowLeft size={18} className="rtl-flip" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <WelcomeContent />
    </Suspense>
  )
}
