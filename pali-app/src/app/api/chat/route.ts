import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        reply: 'השירות האוטומטי אינו זמין כרגע. לחצו למטה כדי לפנות ישירות לנציג.',
        escalate: true,
      })
    }

    const { messages } = await req.json()

    const supabase = await createClient()
    const { data: products } = await supabase
      .from('products')
      .select('name,price,description')
      .eq('is_visible', true)
      .order('created_at')

    const productList =
      products
        ?.map(p => `  • ${p.name} — ₪${p.price}${p.description ? ` — ${p.description}` : ''}`)
        .join('\n') ?? ''

    const systemPrompt = `אתה נציג שירות לקוחות של חנות PALI. ענה תמיד בעברית בלבד, בקצרה וידידותית.

תחומי האחריות שלך:
1. שאלות כלליות על המוצרים. המוצרים הזמינים:
${productList}
2. זמני משלוח: עד 3 ימי עסקים מרגע התשלום. הלקוח משלם דמי משלוח.
3. מדיניות החזרות: בהתאם לחוק הגנת הצרכן הישראלי — ניתן להחזיר תוך 14 יום מיום קבלת המוצר.
4. סטטוס הזמנה: הפנה את הלקוח לעמוד /track עם מספר ההזמנה והטלפון או המייל.
5. תוכנית נקודות/ארנק: נקודות נצברות אחרי כל רכישה דרך קישור המלצה של הלקוח. ניתן למשוך החל מסף של 2000 ש"ח.
6. קישור המלצה: הקישור האישי זמין בדשבורד בכתובת /dashboard אחרי התחברות.

כללי ESCALATION — העבר לנציג אנושי במקרים הבאים. הוסף את השורה "ESCALATE" (באנגלית, בפני עצמה, בשורה האחרונה) אם אחד מאלה מתקיים:
- הלקוח מתלונן
- הלקוח מבקש לבטל הזמנה או לקבל החזר כספי
- בעיית תשלום
- בעיית משלוח (אבידה, עיכוב מעבר לסביר, פגם במוצר)
- הלקוח מבקש לדבר עם נציג אנושי
- אינך בטוח בתשובה — עדיף להסלים מאשר לתת מידע שגוי

כללים חשובים:
- אל תמציא מידע. אם אינך יודע — הסלם.
- אל תבטיח מועדי משלוח ספציפיים, החזרים כספיים, או פיצויים.
- ענה תמיד בעברית בלבד.
- אל תציג את המילה ESCALATE ללקוח בתשובתך — זו הוראה פנימית בלבד. ההמשכה תתבצע אוטומטית.`

    let res: Response
    try {
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 400,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
      })
    } catch (err) {
      console.error('OpenAI fetch failed:', err)
      return NextResponse.json({ reply: 'אירעה שגיאה. נעביר אותך לנציג.', escalate: true })
    }

    if (!res.ok) {
      console.error('OpenAI non-2xx response:', res.status)
      return NextResponse.json({ reply: 'אירעה שגיאה. נעביר אותך לנציג.', escalate: true })
    }

    const data = await res.json()
    const rawReply: string = data.choices?.[0]?.message?.content ?? ''

    if (!rawReply) {
      return NextResponse.json({ reply: 'אירעה שגיאה. נעביר אותך לנציג.', escalate: true })
    }

    const escalateRe = /(^|\n)\s*ESCALATE\s*($|\n)/i
    const escalate = escalateRe.test(rawReply)

    let reply = rawReply
    if (escalate) {
      reply = rawReply.replace(/(^|\n)\s*ESCALATE\s*($|\n)/gi, '\n').trim()
      if (!reply) {
        reply = 'מעביר אותך לנציג שירות 👋'
      }
    }

    return NextResponse.json({ reply, escalate })
  } catch (err) {
    console.error('Chat handler error:', err)
    return NextResponse.json({ reply: 'אירעה שגיאה. נעביר אותך לנציג.', escalate: true })
  }
}
