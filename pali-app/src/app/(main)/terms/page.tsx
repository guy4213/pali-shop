export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-black mb-8 text-yellow-400">תנאי שימוש – תוכנית ממליצים</h1>

        {/* Draft notice */}
        <div className="bg-amber-900/40 border border-amber-600 text-amber-200 rounded-xl px-6 py-4 mb-10 text-sm leading-relaxed">
          <p className="font-bold text-base mb-1">⚠️ הערת טיוטה</p>
          <p>מסמך זה הוא טיוטה זמנית בלבד. לפני ההשקה המסחרית המלאה, התוכן יועבר לבדיקה ולהתאמה משפטית.</p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-yellow-300 mb-2">1. כללי</h2>
            <p className="text-gray-300 leading-relaxed">
              האתר מופעל על ידי PALI. השימוש באתר מהווה הסכמה לתנאים אלו.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-300 mb-2">2. תוכנית ממליצים</h2>
            <p className="text-gray-300 leading-relaxed">
              השתתפות בתוכנית מותנית ברכישה אמיתית. הנקודות נצברות מיד לאחר השלמת הרכישה.
              ניתן למשוך כסף כאשר היתרה המצטברת עולה על 2,000 ש״ח.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-300 mb-2">3. ביטול נקודות והגבלות</h2>
            <p className="text-gray-300 leading-relaxed">
              החברה רשאית לבטל נקודות, לעכב משיכות לבדיקה, ולשנות את תנאי התוכנית בכל עת במקרה של:
              הונאה או חשד להונאה, ביטול עסקה, החזר כספי (refund), או חיוב חוזר (chargeback).
              במקרה שבוצעה משיכה לפני ביטול העסקה, יבוצע קיזוז מול משיכות עתידיות.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-300 mb-2">4. משלוחים והחזרות</h2>
            <p className="text-gray-300 leading-relaxed">
              זמן אספקה: עד 3 ימי עסקים. דמי משלוח חלים על הלקוח.
              החזרות וביטולים מתבצעים בהתאם לחוק הגנת הצרכן הישראלי.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-300 mb-2">5. יצירת קשר</h2>
            <p className="text-gray-300 leading-relaxed">
              לכל שאלה ניתן לפנות אלינו דרך הצ׳אט באתר.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
