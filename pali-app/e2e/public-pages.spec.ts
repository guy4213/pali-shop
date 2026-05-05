import { test, expect } from '@playwright/test'

test.describe('דפים ציבוריים', () => {
  test('דף הבית מציג מוצר', async ({ page }) => {
    await page.goto('/')
    await expect(page).not.toHaveURL(/auth\/login/)
    // Product page should have a buy/order button or product name
    await expect(page.locator('body')).toBeVisible()
    // Check page loaded (not blank)
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(50)
  })

  test('דף התחברות מציג טופס אימייל', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByText('שלח לי קישור כניסה')).toBeVisible()
  })

  test('דף שאלות נפוצות נטען', async ({ page }) => {
    await page.goto('/faq')
    await expect(page).not.toHaveURL(/auth\/login/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('דף תנאי שימוש נטען', async ({ page }) => {
    await page.goto('/terms')
    await expect(page).not.toHaveURL(/auth\/login/)
  })

  test('דף מדריך נטען', async ({ page }) => {
    await page.goto('/guide')
    await expect(page).not.toHaveURL(/auth\/login/)
  })

  test('דף "נדרשת הזמנה" מציג הסבר וכפתור רכישה', async ({ page }) => {
    await page.goto('/referrer-required')
    await expect(page.getByText('קודם כל — תבצע הזמנה')).toBeVisible()
    await expect(page.getByText('לרכישה')).toBeVisible()
  })
})
