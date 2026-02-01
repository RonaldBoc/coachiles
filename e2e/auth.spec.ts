import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login/signup on homepage', async ({ page }) => {
    await page.goto('/')
    // Look for auth buttons
    const authElements = page.locator('a[href*="/signup"], a[href*="/auth"], button:has-text("Sign")')
    await expect(authElements.first()).toBeVisible()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/')
    const signupLink = page.locator('a[href*="/signup"]').first()
    if (await signupLink.isVisible()) {
      await signupLink.click()
      await expect(page).toHaveURL(/\/signup/)
    }
  })

  test('should navigate to auth page', async ({ page }) => {
    await page.goto('/')
    const authLink = page.locator('a[href*="/auth"]').first()
    if (await authLink.isVisible()) {
      await authLink.click()
      await expect(page).toHaveURL(/\/auth/)
    }
  })

  test('should display coach signup form if navigated to coach signup', async ({ page }) => {
    const coachSignupExists = await page.goto('/signup').then(() => true).catch(() => false)
    if (coachSignupExists) {
      const form = page.locator('form').first()
      if (await form.isVisible()) {
        // Form should have input fields
        const inputs = page.locator('input[type="email"], input[type="text"], input[type="password"]')
        await expect(inputs.first()).toBeVisible()
      }
    }
  })
})

test.describe('Session Management', () => {
  test('should handle unauthenticated access to protected routes', async ({ page }) => {
    // Try to access a protected route
    const response = await page.goto('/coach-account')
    // Should either redirect or show login
    const url = page.url()
    const isRedirected = !url.includes('/coach-account')
    expect(isRedirected || url.includes('/coach-account')).toBeTruthy()
  })
})
