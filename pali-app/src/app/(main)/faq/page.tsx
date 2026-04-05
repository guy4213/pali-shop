'use client'

import { useState } from 'react'

const sections = [
  {
    title: 'משלוחים',
    items: [
      {
        q: 'כמה זמן לוקח המשלוח?',
        a: 'עד 3 ימי עסקים מרגע אישור ההזמנה.',
      },
      {
        q: 'מי משלם על המשלוח?',
        a: 'דמי המשלוח חלים על הלקוח.',
      },
      {
        q: 'האם המתנה נשלחת יחד עם המוצר?',
        a: 'לא — המתנה נשלחת בנפרד.',
      },
    ],
  },
  {
    title: 'החזרות וביטולים',
    items: [
      {
        q: 'מה מדיניות ההחזרות?',
        a: 'ההחזרות והביטולים מתבצעים בהתאם לחוק הגנת הצרכן הישראלי.',
      },
    ],
  },
  {
    title: 'תוכנית ממליצים',
    items: [
      {
        q: 'האם אני יכול לקנות דרך הקישור שלי?',
        a: 'כן, self-referral מותר כל עוד מדובר ברכישה אמיתית.',
      },
      {
        q: 'מתי הנקודות שלי נצברות?',
        a: 'הנקודות נצברות מיד לאחר השלמת הרכישה.',
      },
      {
        q: 'מתי אני יכול למשוך כסף?',
        a: 'כאשר יתרתך המצטברת עולה על 2,000 ש"ח, תוכל להגיש בקשת משיכה.',
      },
      {
        q: 'מה קורה אם יש חשד להונאה?',
        a: 'החברה רשאית לעכב או לבטל זכאות לנקודות ומשיכות בכל מקרה של הונאה או חשד להונאה.',
      },
    ],
  },
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-right text-gray-900 font-semibold hover:text-yellow-600 transition-colors"
        aria-expanded={open}
      >
        <span className="flex-1">{q}</span>
        <span
          className={`text-yellow-500 text-xl leading-none transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
          aria-hidden
        >
          +
        </span>
      </button>
      {open && (
        <p className="pb-4 text-gray-600 text-sm leading-relaxed">
          {a}
        </p>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2">שאלות נפוצות</h1>
          <p className="text-gray-500">כל מה שרצית לדעת על PALI</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Section heading */}
              <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-4">
                <h2 className="text-base font-bold text-yellow-800">{section.title}</h2>
              </div>

              {/* Items */}
              <div className="px-6">
                {section.items.map((item) => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
