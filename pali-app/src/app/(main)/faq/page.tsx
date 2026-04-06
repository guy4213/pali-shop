export default function FAQPage() {
  const sections = [
    {
      title: 'משלוחים',
      items: [
        { q: 'כמה זמן לוקח המשלוח?', a: 'עד 3 ימי עסקים מרגע אישור ההזמנה.' },
        { q: 'מי משלם על המשלוח?', a: 'דמי המשלוח חלים על הלקוח.' },
        { q: 'האם המתנה נשלחת יחד עם המוצר?', a: 'לא — המתנה נשלחת בנפרד.' },
      ],
    },
    {
      title: 'החזרות וביטולים',
      items: [
        { q: 'מה מדיניות ההחזרות?', a: 'ההחזרות והביטולים מתבצעים בהתאם לחוק הגנת הצרכן הישראלי.' },
      ],
    },
    {
      title: 'תוכנית ממליצים',
      items: [
        { q: 'האם אני יכול לקנות דרך הקישור שלי?', a: 'כן, self-referral מותר כל עוד מדובר ברכישה אמיתית.' },
        { q: 'מתי הנקודות שלי נצברות?', a: 'הנקודות נצברות מיד לאחר השלמת הרכישה.' },
        { q: 'מתי אני יכול למשוך כסף?', a: 'כאשר יתרתך המצטברת עולה על 2,000 ש"ח, תוכל להגיש בקשת משיכה.' },
        { q: 'מה קורה אם יש חשד להונאה?', a: 'החברה רשאית לעכב או לבטל זכאות לנקודות ומשיכות בכל מקרה של הונאה או חשד להונאה.' },
      ],
    },
  ]

  return (
    <main dir="rtl" className="min-h-screen bg-gray-950 text-gray-100 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-yellow-400 mb-10 text-center">שאלות נפוצות</h1>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-yellow-500 border-b border-yellow-800 pb-2 mb-4">
                {section.title}
              </h2>

              <div className="space-y-3">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
                  >
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none font-semibold text-gray-100 hover:text-yellow-400 transition-colors">
                      <span>{item.q}</span>
                      <span className="text-yellow-500 text-lg leading-none transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-4 text-gray-300 text-sm leading-relaxed border-t border-gray-800 pt-3">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
