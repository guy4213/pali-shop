import { Vonage } from '@vonage/server-sdk'

// ─── Email (Brevo) ────────────────────────────────────────────────────────────
// Required env vars: BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME ?? 'PALI'

  if (!apiKey || !senderEmail) {
    console.warn('Email skipped: BREVO_API_KEY or BREVO_SENDER_EMAIL is not set')
    return
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('Brevo error:', err)
    }
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

export async function sendSaleNotification(
  email: string,
  pointsEarned: number,
  _buyerName?: string
) {
  await sendEmail(
    email,
    `מזל טוב! צברת עוד ${pointsEarned} ₪`,
    `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #b8860b;">🎉 מזל טוב!</h1>
      <p>מישהו רכש דרך הקישור האישי שלך!</p>
      <p>צברת עוד <strong>${pointsEarned} נקודות (${pointsEarned} ₪)</strong> לארנק PALI שלך.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="background-color: #b8860b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          צפה בדשבורד שלי
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">צוות PALI</p>
    </div>`
  )
}

export async function sendWelcomeEmail(email: string, referralUrl: string) {
  await sendEmail(
    email,
    'ברוך הבא לתוכנית PALI – הקישור האישי שלך',
    `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #b8860b;">ברוך הבא לתוכנית PALI! 🚀</h1>
      <p>הקישור האישי שלך מוכן. כל רכישה שתגיע דרכו תזכה אותך בנקודות שניתן לממש לכסף.</p>
      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold;">הקישור שלך:</p>
        <a href="${referralUrl}" style="color: #b8860b;">${referralUrl}</a>
      </div>
      <p>
        <a href="${referralUrl}"
           style="background-color: #b8860b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          התחל להמליץ ולהרוויח
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">צוות PALI</p>
    </div>`
  )
}

// ─── SMS ─────────────────────────────────────────────────────────────────────
// Required env vars: VONAGE_API_KEY, VONAGE_API_SECRET

function normalizeIsraeliPhone(phone: string): string {
  const trimmed = phone.trim()
  if (trimmed.startsWith('+972')) return trimmed
  if (trimmed.startsWith('972')) return `+${trimmed}`
  if (trimmed.startsWith('0')) return `+972${trimmed.slice(1)}`
  return `+972${trimmed}`
}

export async function sendSMS(to: string, message: string): Promise<void> {
  const apiKey = process.env.VONAGE_API_KEY
  const apiSecret = process.env.VONAGE_API_SECRET

  if (!apiKey || !apiSecret) {
    console.warn('SMS skipped: VONAGE_API_KEY or VONAGE_API_SECRET is not set')
    return
  }

  const normalizedTo = normalizeIsraeliPhone(to)

  try {
    const vonage = new Vonage({ apiKey, apiSecret })
    await vonage.sms.send({ to: normalizedTo, from: 'PALI', text: message })
    console.log(`SMS sent to ${normalizedTo}`)
  } catch (error) {
    console.error(`Failed to send SMS to ${normalizedTo}:`, error)
  }
}

export async function sendOrderConfirmationSMS(
  phone: string,
  buyerName: string,
  orderId: string
): Promise<void> {
  const message = `שלום ${buyerName}, הזמנתך #${orderId.slice(0, 8).toUpperCase()} התקבלה בהצלחה! נעדכן אותך כשתישלח.`
  await sendSMS(phone, message)
}

export async function sendCommissionEarnedSMS(
  phone: string,
  referrerName: string,
  points: number
): Promise<void> {
  const message = `היי ${referrerName}! צברת ${points} נקודות על רכישה דרך הקישור שלך 🎉`
  await sendSMS(phone, message)
}

export async function sendShippingUpdateSMS(
  phone: string,
  buyerName: string,
  trackingNumber: string
): Promise<void> {
  const message = `שלום ${buyerName}, הזמנתך נשלחה! מספר מעקב: ${trackingNumber}`
  await sendSMS(phone, message)
}
