'use client'

import Link from 'next/link'
import { ArrowRight, Copy, Instagram, Facebook, MessageCircle, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const templates = [
  {
    platform: 'וואטסאפ',
    icon: MessageCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    text: `הי [שם]! ממש נהניתי מ-[שם המוצר] שקניתי לאחרונה מ-PALI.
תסתכל/י, זה ממש שווה: [הקישור שלך]
אם אתה/את קונה דרך הקישור שלי, אתה/את עוזר/ת לי לצבור נקודות. תודה!`,
  },
  {
    platform: 'אינסטגרם (סטורי/פוסט)',
    icon: Instagram,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    text: `✨ זה המוצר שאני כל הזמן מדברת עליו!
[תיאור קצר שלך על המוצר]
הקישור לרכישה בביו או כאן: [הקישור שלך]
#PALI #המלצה #שווה`,
  },
  {
    platform: 'פייסבוק',
    icon: Facebook,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    text: `חברים, גיליתי מוצר מדהים שרציתי לשתף אתכם!

[ספר/י בשורה-שתיים מה אהבת במוצר]

אפשר להזמין ישירות כאן: [הקישור שלך]

שאלות? ישר אליי 😊`,
  },
  {
    platform: 'מייל',
    icon: Mail,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    text: `נושא: גיליתי משהו שחשבתי שיעניין אותך

שלום [שם],

לפני כמה ימים קניתי [שם המוצר] ופשוט אין לי מילים.
[משפט אחד על מה שאהבת]

אם מעניין אותך, אפשר לקנות כאן (יש גם משלוח חינם):
[הקישור שלך]

בברכה,
[שמך]`,
  },
]

const tips = [
  { emoji: '✅', tip: 'המלצה אמינה עובדת – ספר/י מה אהבת במוצר, אל תסתפק/י בלינק בלבד' },
  { emoji: '🎯', tip: 'כוון/י לאנשים שבאמת מתאים להם המוצר – זה מעלה את אחוז ההמרה' },
  { emoji: '⏰', tip: 'תדירות: פרסם/י פעם-פעמיים בשבוע, לא יותר – כדי לא להציף' },
  { emoji: '📸', tip: 'תמונה של המוצר אצלך מאמינה פי 3 מתמונת הסטוק' },
  { emoji: '💬', tip: 'ענה/י על שאלות מיד – זה בונה אמון ומגדיל מכירות' },
  { emoji: '🔗', tip: 'שמור/י את הקישור שלך בביו האינסטגרם לחשיפה קבועה' },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowRight size={16} className="rtl-flip" />
          חזרה לדשבורד
        </Link>

        <h1 className="text-3xl font-black text-gray-900 mb-2">מדריך לממליץ</h1>
        <p className="text-gray-500 mb-8">
          כל מה שצריך לדעת כדי למקסם את הרווחים שלך מתוכנית PALI
        </p>

        {/* Tips */}
        <Card className="shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold">טיפים לשיתוף נכון</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tips.map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">{t.emoji}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{t.tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">תבניות מוכנות לשיתוף</h2>
        <p className="text-sm text-gray-500 mb-6">
          העתק את התבנית, החלף את הפרטים בסוגריים [ ] והוסף את הקישור האישי שלך.
        </p>

        <div className="space-y-5">
          {templates.map((t) => (
            <Card key={t.platform} className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${t.bg}`}>
                    <t.icon size={18} className={t.color} />
                  </div>
                  {t.platform}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans border border-gray-200">
                    {t.text}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(t.text)}
                    className="absolute top-3 left-3 p-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    title="העתק"
                  >
                    <Copy size={14} className="text-gray-500" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reminder */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
          <p className="font-bold text-yellow-800 mb-1">זכור/י: המלצה אמינה היא החזקה ביותר</p>
          <p className="text-sm text-yellow-700">
            אל תציף/י, פשוט שתף/י את החוויה האמיתית שלך מהמוצר.
            אנשים קונים מאנשים שהם סומכים עליהם.
          </p>
        </div>
      </div>
    </div>
  )
}
