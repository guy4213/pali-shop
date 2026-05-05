import Link from 'next/link'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReferrerRequiredPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6">
          <ShoppingBag size={32} className="text-yellow-600" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-3">
          קודם כל — תבצע הזמנה
        </h1>

        <p className="text-gray-500 mb-2 leading-relaxed">
          כדי לגשת לדשבורד, הארנק ולהתחיל לצבור עמלות — עליך לרכוש את המוצר תחילה.
        </p>
        <p className="text-gray-500 mb-8 leading-relaxed">
          לאחר ביצוע הרכישה תהפוך לממליץ ותקבל גישה מלאה לאזור האישי שלך.
        </p>

        <Link href="/">
          <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-5 gap-2 text-base">
            <ShoppingBag size={18} />
            לרכישה
          </Button>
        </Link>

        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1 mt-4 text-sm text-gray-400 hover:text-gray-600"
        >
          <ArrowRight size={14} className="rtl-flip" />
          כניסה עם חשבון אחר
        </Link>
      </div>
    </div>
  )
}
