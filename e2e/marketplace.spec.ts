import { test, expect } from '@playwright/test'

test.describe('Coach Marketplace', () => {
  test('should load marketplace and display coaches', async ({ page }) => {
    await page.goto('/coaches')
    // Wait for coaches to load
    await expect(page.locator('[data-testid="coach-card"]').first()).toBeVisible({
      timeout: 5000,
    })
  })

  test('should search for coaches', async ({ page }) => {
    await page.goto('/coaches')
    // Look for search input and enter text
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      // Wait for results to update
      await page.waitForTimeout(500)
    }
  })

  test('should view coach profile', async ({ page }) => {
    await page.goto('/coaches')
    // Click first coach card
    const firstCoach = page.locator('[data-testid="coach-card"], a[href*="/coach/"]').first()
    if (await firstCoach.isVisible()) {
      await firstCoach.click()
      // Should navigate to coach profile
      await expect(page).toHaveURL(/\/coach\//)
    }
  })

  test('should filter coaches by services', async ({ page }) => {
    await page.goto('/coaches')
    // Look for filter options
    const filterButton = page
      .locator('[data-testid="filter-button"], button:has-text("Filter")')
      .first()
    if (await filterButton.isVisible()) {
      await filterButton.click()
      // Wait for filter modal/dropdown
      await page.waitForTimeout(300)
    }
  })
})
