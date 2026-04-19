import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ reply: 'השירות אינו זמין כרגע', escalate: false })

  const { messages } = await req.json()

  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('name,price,description')
    .eq('is_visible', true)
    .order('created_at')

  const systemPrompt = `
אתה נציג שירות לקוחות של חנות PALI. ענה תמיד בעברית בלבד.
אתה עוזר ללקוחות עם שאלות על:
- המוצרים הזמינים בחנות:
  ${products?.map(p => `• ${p.name} — ₪${p.price}${p.description ? ` — ${p.description}` : ''}`).join('\n  ') || 'המוצרים שלנו'}
- זמני משלוח: עד 3 ימי עסקים, הלקוח משלם דמי משלוח
- החזרות: בהתאם לחוק הגנת הצרכן הישראלי
- סטטוס הזמנה: הפנה את הלקוח לעמוד /track עם מספר ההזמנה והטלפון/מייל
- תוכנית ממליצים: נקודות נצברות מיד אחרי רכישה, משיכה מעל 2000 ש"ח
- קישור המלצה: נמצא בדשבורד האישי בכתובת /dashboard

אם הלקוח מתלונן, מבקש ביטול, החזר כספי, מדבר על בעיית תשלום או משלוח, או מבקש לדבר עם נציג —
ענה בנימוס שנציג יחזור אליו בהקדם וסיים בהודעה: "ESCALATE"

ענה בקצרה ובידידותיות. אל תמציא מידע שאינך בטוח בו.
`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ]
    })
  })

  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content ?? 'מצטערים, אירעה שגיאה. נסה שוב.'
  const escalate = ['תלונה', 'ביטול', 'החזר', 'בעיית תשלום', 'בעיית משלוח', 'נציג', 'ESCALATE'].some(k => reply.includes(k))

  return NextResponse.json({ reply, escalate })
}
