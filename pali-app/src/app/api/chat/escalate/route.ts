import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/notifications'

// Inlined — not exported from notifications.ts
function normalizeIsraeliPhone(phone: string): string {
  const trimmed = phone.trim()
  if (trimmed.startsWith('+972')) return trimmed
  if (trimmed.startsWith('972')) return `+${trimmed}`
  if (trimmed.startsWith('0')) return `+972${trimmed.slice(1)}`
  return `+972${trimmed}`
}

// Inlined — not exported from notifications.ts
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const PHONE_RE = /^(\+972|972|0)5\d{8}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'בקשה לא תקינה' }, { status: 400 })
  }

  const {
    buyer_name,
    buyer_phone,
    buyer_email,
    issue_summary,
    chat_history,
  } = body as Record<string, unknown>

  // ── Validate buyer_name ─────────────────────────────────────────────────────
  const name = typeof buyer_name === 'string' ? buyer_name.trim() : ''
  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: 'נא למלא שם מלא (2–100 תווים)' }, { status: 400 })
  }

  // ── Validate buyer_phone ────────────────────────────────────────────────────
  const rawPhone = typeof buyer_phone === 'string' ? buyer_phone.replace(/[\s-]/g, '') : ''
  if (!PHONE_RE.test(rawPhone)) {
    return NextResponse.json({ error: 'מספר טלפון לא תקין (לדוגמה 0501234567)' }, { status: 400 })
  }

  // ── Validate buyer_email (optional) ────────────────────────────────────────
  let email: string | undefined
  if (buyer_email !== undefined && buyer_email !== null && buyer_email !== '') {
    if (typeof buyer_email !== 'string') {
      return NextResponse.json({ error: 'כתובת מייל לא תקינה' }, { status: 400 })
    }
    const trimmedEmail = buyer_email.trim()
    if (!EMAIL_RE.test(trimmedEmail)) {
      return NextResponse.json({ error: 'כתובת מייל לא תקינה' }, { status: 400 })
    }
    email = trimmedEmail
  }

  // ── Validate issue_summary ──────────────────────────────────────────────────
  const summary = typeof issue_summary === 'string' ? issue_summary.trim() : ''
  if (summary.length < 5 || summary.length > 500) {
    return NextResponse.json({ error: 'נא לתאר את הבעיה (5–500 תווים)' }, { status: 400 })
  }

  // ── Validate chat_history ───────────────────────────────────────────────────
  if (!Array.isArray(chat_history) || chat_history.length > 50) {
    return NextResponse.json({ error: 'היסטוריית שיחה לא תקינה' }, { status: 400 })
  }
  for (const item of chat_history) {
    const entry = item as Record<string, unknown>
    if (
      typeof item !== 'object' ||
      item === null ||
      !['user', 'assistant'].includes(entry.role as string) ||
      typeof entry.content !== 'string'
    ) {
      return NextResponse.json({ error: 'היסטוריית שיחה לא תקינה' }, { status: 400 })
    }
  }

  const normalizedPhone = normalizeIsraeliPhone(rawPhone)

  // ── Resolve optional auth user ──────────────────────────────────────────────
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {
    // unauthenticated — allowed
  }

  // ── Insert ticket ───────────────────────────────────────────────────────────
  let ticketId: string
  let createdAt: string
  try {
    const service = await createServiceClient()
    const { data, error } = await service
      .from('support_tickets')
      .insert({
        user_id: userId,
        buyer_name: name,
        buyer_phone: normalizedPhone,
        buyer_email: email ?? null,
        issue_summary: summary,
        chat_history,
      })
      .select('id, created_at')
      .single()

    if (error || !data) {
      console.error('support_tickets insert failed:', error?.message)
      return NextResponse.json({ error: 'שגיאה בשמירת הפנייה' }, { status: 500 })
    }
    ticketId = data.id
    createdAt = data.created_at
  } catch (err) {
    console.error('support_tickets insert threw:', err)
    return NextResponse.json({ error: 'שגיאה בשמירת הפנייה' }, { status: 500 })
  }

  // ── Fire-and-forget notifications ──────────────────────────────────────────
  const lastFive = (chat_history as Array<{ role: string; content: string }>).slice(-5)
  const transcriptHtml = lastFive.length > 0
    ? lastFive
        .map(m => `<p style="margin:4px 0;"><strong>${m.role === 'user' ? 'לקוח' : 'בוט'}:</strong> ${m.content}</p>`)
        .join('')
    : '<p style="color:#999;">אין היסטוריה</p>'

  const emailNotification = (async () => {
    const resend = getResend()
    const adminEmail = process.env.ADMIN_EMAIL
    if (!resend || !adminEmail) {
      console.warn('Escalation email skipped: RESEND_API_KEY or ADMIN_EMAIL not configured')
      return
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    try {
      await resend.emails.send({
        from: 'PALI <noreply@pali.co.il>',
        to: adminEmail,
        subject: `פנייה חדשה לשירות לקוחות — ${name}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #b8860b;">פנייה חדשה לשירות לקוחות</h2>
            <p><strong>שם:</strong> ${name}</p>
            <p><strong>טלפון:</strong> <a href="tel:${normalizedPhone}">${normalizedPhone}</a></p>
            <p><strong>מייל:</strong> ${email ?? '—'}</p>
            <p><strong>בעיה:</strong> ${summary}</p>
            <p><strong>מספר פנייה:</strong> ${ticketId}</p>
            <p><strong>קישור לפנייה:</strong>
              <a href="${siteUrl}/admin/support">${siteUrl}/admin/support</a>
            </p>
            <hr style="margin: 20px 0;" />
            <h3 style="color: #666; font-size: 14px;">5 ההודעות האחרונות בשיחה:</h3>
            <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
              ${transcriptHtml}
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              נוצר: ${new Date(createdAt).toLocaleString('he-IL')}
            </p>
          </div>
        `,
      })
    } catch (err) {
      console.error('Escalation email send failed:', err)
    }
  })()

  const smsNotification = (async () => {
    const adminPhone = process.env.ADMIN_PHONE
    if (!adminPhone) {
      console.warn('Escalation SMS skipped: ADMIN_PHONE not configured')
      return
    }
    try {
      await sendSMS(
        adminPhone,
        `פנייה חדשה ב-PALI מ-${name} (${normalizedPhone}): ${summary.slice(0, 80)}`
      )
    } catch (err) {
      console.error('Escalation SMS send failed:', err)
    }
  })()

  await Promise.allSettled([emailNotification, smsNotification])

  return NextResponse.json({ ok: true, ticket_id: ticketId }, { status: 201 })
}
