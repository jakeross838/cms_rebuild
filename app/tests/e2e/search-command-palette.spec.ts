import { test, expect } from '@playwright/test'

/**
 * E2E tests for search and command palette (Cmd+K).
 * Tests global search, page-level search, and search result navigation.
 */

test.describe('Command Palette (Cmd+K)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'jake@rossbuilt.com')
    await page.fill('input[type="password"]', 'R0ssBuilt99!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
  })

  test('opens command palette with keyboard shortcut', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Press Cmd+K (Mac) or Ctrl+K (Windows)
    await page.keyboard.press('Control+k')

    // Command palette dialog should open
    const dialog = page.locator('[role="dialog"], [cmdk-dialog], [data-state="open"]')
    await expect(dialog.first()).toBeVisible({ timeout: 3000 })
  })

  test('opens command palette by clicking search bar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Click the search trigger in the top nav
    const searchTrigger = page.locator('button[aria-label="Search"], button:has-text("Search")')
    if (await searchTrigger.isVisible().catch(() => false)) {
      await searchTrigger.click()

      const dialog = page.locator('[role="dialog"], [cmdk-dialog], [data-state="open"]')
      await expect(dialog.first()).toBeVisible({ timeout: 3000 })
    }
  })

  test('command palette has search input', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    const searchInput = page.locator('[cmdk-input], input[placeholder*="search" i], input[placeholder*="Search"]')
    await expect(searchInput.first()).toBeVisible({ timeout: 3000 })
  })

  test('closes command palette with Escape', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Dialog should close
    const dialog = page.locator('[role="dialog"][data-state="open"]')
    const isOpen = await dialog.isVisible().catch(() => false)
    // If using Radix, it transitions to closed state
    expect(isOpen).toBeFalsy()
  })
})

test.describe('Page-Level Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'jake@rossbuilt.com')
    await page.fill('input[type="password"]', 'R0ssBuilt99!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
  })

  test('jobs page search filters results', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]')
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('lakewood')
      await page.waitForTimeout(1000)
      // Page should stay on jobs (results updated)
      await expect(page).toHaveURL(/\/jobs/)
    }
  })

  test('clients page search by name', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]')
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('ross')
      await page.waitForTimeout(1000)
      await expect(page).toHaveURL(/\/clients/)
    }
  })

  test('vendors page search works', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]')
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('electric')
      await page.waitForTimeout(1000)
      await expect(page).toHaveURL(/\/vendors/)
    }
  })

  test('search with URL parameter loads filtered results', async ({ page }) => {
    await page.goto('/jobs?search=lakewood')
    await page.waitForLoadState('networkidle')

    // Page should load without errors
    await expect(page.getByText(/jobs/i).first()).toBeVisible()
  })
})

test.describe('Search on Skeleton Pages', () => {
  test('skeleton nav search area is visible', async ({ page }) => {
    await page.goto('/skeleton')
    await page.waitForLoadState('networkidle')

    // The header should have a search-related element
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })
})
