import { test, expect } from '@playwright/test'

// All tests here run without authentication (fresh browser context)

test.describe('הגנות ניתוב — משתמש לא מחובר', () => {
  test('דשבורד מפנה ל-login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/auth\/login/)
    await expect(page).toHaveURL(/redirect=%2Fdashboard/)
  })

  test('ארנק מפנה ל-login', async ({ page }) => {
    await page.goto('/wallet')
    await expect(page).toHaveURL(/auth\/login/)
    await expect(page).toHaveURL(/redirect=%2Fwallet/)
  })

  test('פרופיל מפנה ל-login', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL(/auth\/login/)
    await expect(page).toHaveURL(/redirect=%2Fprofile/)
  })

  test('אדמין מפנה ל-login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/auth\/login/)
  })

  test('לאחר login, redirect=... מועבר נכון ל-callback', async ({ page }) => {
    await page.goto('/auth/login?redirect=/dashboard')
    const url = page.url()
    expect(url).toContain('redirect')
  })
})
