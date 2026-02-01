import { test, expect } from '@playwright/test'

test('should load homepage and display title', async ({ page }) => {
  await page.goto('/')
  // Check if page loads
  await expect(page).toHaveTitle(/Accueil/)
})

test('should navigate to coaches page', async ({ page }) => {
  await page.goto('/')
  await page.click('a[href="/coaches"]')
  await expect(page).toHaveURL(/\/coaches/)
})

test('should navigate to services page', async ({ page }) => {
  await page.goto('/')
  await page.click('a[href="/services"]')
  await expect(page).toHaveURL(/\/services/)
})
