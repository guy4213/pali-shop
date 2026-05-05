import { test, expect } from '@playwright/test'

test.describe('זרימת הזמנה', () => {
  test('דף מעקב הזמנה עם מזהה לא קיים לא קורס', async ({ page }) => {
    await page.goto('/track/00000000-0000-0000-0000-000000000000')
    await expect(page.locator('body')).toBeVisible()
    const status = await page.evaluate(() => document.readyState)
    expect(status).toBe('complete')
  })

  test('API הזמנה — validation חסרים שדות חובה', async ({ page }) => {
    const res = await page.request.post('/api/orders/create', {
      data: { buyer_name: 'ישראל' }, // missing required fields
    })
    expect(res.status()).toBe(400)
  })

  test('דף עגלת קניות נטען', async ({ page }) => {
    await page.goto('/cart')
    await expect(page).not.toHaveURL(/auth\/login/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('דף ברוך הבא נטען', async ({ page }) => {
    await page.goto('/welcome')
    await expect(page.locator('body')).toBeVisible()
  })
})
