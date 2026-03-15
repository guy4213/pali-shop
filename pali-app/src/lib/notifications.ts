import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function sendSaleNotification(
  email: string,
  pointsEarned: number,
  _buyerName?: string
) {
  const resend = getResend()
  if (!resend) return

  try {
    await resend.emails.send({
      from: 'PALI <noreply@pali.co.il>',
      to: email,
      subject: `מזל טוב! צברת עוד ${pointsEarned} ₪`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send sale notification:', error)
  }
}

export async function sendWelcomeEmail(email: string, referralUrl: string) {
  const resend = getResend()
  if (!resend) return

  try {
    await resend.emails.send({
      from: 'PALI <noreply@pali.co.il>',
      to: email,
      subject: 'ברוך הבא לתוכנית PALI – הקישור האישי שלך',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}
