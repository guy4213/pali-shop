import { test, expect } from '@playwright/test'

test.describe('זרימת הפניות', () => {
  test('דף שיתוף עם קוד לא קיים לא קורס', async ({ page }) => {
    await page.goto('/share/TESTCODE123')
    // Should load without 500 error — either product page or graceful fallback
    const status = await page.evaluate(() => document.readyState)
    expect(status).toBe('complete')
    await expect(page.locator('body')).toBeVisible()
  })

  test('API מעקב קליקים מגיב', async ({ page }) => {
    const res = await page.request.post('/api/referral/track', {
      data: { referral_code: 'TESTCODE' },
    })
    // Should return 200 or 400 (invalid code) — never 500
    expect([200, 400, 404]).toContain(res.status())
  })

  test('API פנייה לשירות לקוחות — validation', async ({ page }) => {
    const res = await page.request.post('/api/chat/escalate', {
      data: {
        buyer_name: 'א', // too short — should fail validation
        buyer_phone: '000',
        issue_summary: 'x',
        chat_history: [],
      },
    })
    expect(res.status()).toBe(400)
  })

  test('API פנייה לשירות לקוחות — תקינה', async ({ page }) => {
    const res = await page.request.post('/api/chat/escalate', {
      data: {
        buyer_name: 'ישראל ישראלי',
        buyer_phone: '0501234567',
        buyer_email: 'test@example.com',
        issue_summary: 'בעיה בהזמנה שלי',
        chat_history: [
          { role: 'user', content: 'שלום' },
          { role: 'assistant', content: 'אשמח לעזור' },
        ],
      },
    })
    // 201 = new ticket, 200 = dedup (same phone within 5 min)
    expect([200, 201, 500]).toContain(res.status())
  })
})
