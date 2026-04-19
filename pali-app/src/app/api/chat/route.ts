import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ESCALATE_KEYWORDS = ['תלונה', 'ביטול', 'החזר', 'בעיית תשלום', 'בעיית משלוח', 'נציג']

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ reply: 'השירות אינו זמין כרגע', escalate: false })
  }

  const { messages } = await req.json()

  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name,price,description')
    .eq('is_visible', true)
    .limit(1)
    .single()

  const systemPrompt = `אתה נציג שירות לקוחות של חנות PALI. ענה תמיד בעברית בלבד.
אתה עוזר ללקוחות עם שאלות על:
- המוצר: ${product?.name || 'המוצר שלנו'}, מחיר: ₪${product?.price || ''}
- זמני משלוח: עד 3 ימי עסקים, הלקוח משלם דמי משלוח
- החזרות: בהתאם לחוק הגנת הצרכן הישראלי
- סטטוס הזמנה: הפנה את הלקוח לעמוד /track עם מספר ההזמנה והטלפון/מייל
- תוכנית ממליצים: נקודות נצברות מיד אחרי רכישה, משיכה מעל 2000 ש"ח
- קישור המלצה: נמצא בדשבורד האישי בכתובת /dashboard

אם הלקוח מתלונן, מבקש ביטול, החזר כספי, מדבר על בעיית תשלום או משלוח, או מבקש לדבר עם נציג —
ענה בנימוס שנציג יחזור אליו בהקדם וסיים בהודעה: "ESCALATE"

ענה בקצרה ובידידותיות. אל תמציא מידע שאינך בטוח בו.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    generationConfig: {
      maxOutputTokens: 400,
      temperature: 0.7,
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = await res.json()
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'מצטערים, אירעה שגיאה. נסה שוב.'

  const escalate = ESCALATE_KEYWORDS.some(kw => reply.includes(kw)) || reply.includes('ESCALATE')

  return NextResponse.json({ reply: reply.replace('ESCALATE', '').trim(), escalate })
}
