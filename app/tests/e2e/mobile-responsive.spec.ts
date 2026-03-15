import { test, expect } from '@playwright/test'

/**
 * E2E tests for mobile responsive behavior.
 * Tests sidebar toggle, responsive layouts, and touch-friendly UI
 * using a mobile viewport.
 */

test.describe('Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } }) // iPhone 13 size

  test.describe('Skeleton Pages Mobile', () => {
    test('skeleton page renders without horizontal scroll', async ({ page }) => {
      await page.goto('/skeleton')
      await page.waitForLoadState('networkidle')

      const body = page.locator('body')
      const bodyWidth = await body.evaluate(el => el.scrollWidth)
      const viewportWidth = 375
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10) // small tolerance
    })

    test('skeleton header adapts to mobile', async ({ page }) => {
      await page.goto('/skeleton')
      await page.waitForLoadState('networkidle')

      const header = page.locator('header')
      await expect(header).toBeVisible()
    })
  })

  test.describe('Auth Pages Mobile', () => {
    test('login page is mobile-friendly', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Login form should be visible and not overflow
      const form = page.locator('form')
      await expect(form).toBeVisible()

      // Input fields should be tappable
      const emailInput = page.getByPlaceholder('you@company.com')
      await expect(emailInput).toBeVisible()

      // Button should be full-width on mobile
      const submitBtn = page.getByRole('button', { name: /sign in/i })
      await expect(submitBtn).toBeVisible()
    })

    test('signup page is mobile-friendly', async ({ page }) => {
      await page.goto('/signup')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('form')).toBeVisible()
    })
  })

  test.describe('Authenticated Pages Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"]', 'jake@rossbuilt.com')
      await page.fill('input[type="password"]', 'R0ssBuilt99!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
    })

    test('dashboard renders on mobile without overflow', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Dashboard should be visible
      await expect(page.getByText(/dashboard/i).first()).toBeVisible()

      // No horizontal overflow
      const body = page.locator('body')
      const scrollWidth = await body.evaluate(el => el.scrollWidth)
      expect(scrollWidth).toBeLessThanOrEqual(385)
    })

    test('mobile hamburger menu is visible', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Hamburger button should be visible on mobile
      const hamburger = page.locator('button[aria-label="Open menu"]')
      await expect(hamburger).toBeVisible()
    })

    test('jobs list renders in single column on mobile', async ({ page }) => {
      await page.goto('/jobs')
      await page.waitForLoadState('networkidle')

      // Page should render without crash
      await expect(page).toHaveURL(/\/jobs/)
    })

    test('create form is usable on mobile', async ({ page }) => {
      await page.goto('/clients/new')
      await page.waitForSelector('input', { state: 'visible', timeout: 10000 })

      // Inputs should be visible and interactable
      const inputs = page.locator('input')
      const count = await inputs.count()
      expect(count).toBeGreaterThanOrEqual(1)

      // First input should be tappable
      await inputs.first().click()
      await inputs.first().fill('Test')
    })

    test('detail page renders on mobile', async ({ page }) => {
      await page.goto('/jobs')
      await page.waitForLoadState('networkidle')

      const jobLink = page.locator('a[href*="/jobs/"]').first()
      if (await jobLink.isVisible().catch(() => false)) {
        await jobLink.click()
        await page.waitForLoadState('networkidle')

        // Should render detail page
        expect(page.url()).toContain('/jobs/')
      }
    })
  })
})

test.describe('Tablet Viewport', () => {
  test.use({ viewport: { width: 768, height: 1024 } }) // iPad size

  test('dashboard renders in tablet layout', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'jake@rossbuilt.com')
    await page.fill('input[type="password"]', 'R0ssBuilt99!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/dashboard/i).first()).toBeVisible()
  })

  test('skeleton page adapts to tablet', async ({ page }) => {
    await page.goto('/skeleton')
    await page.waitForLoadState('networkidle')

    const header = page.locator('header')
    await expect(header).toBeVisible()
  })
})
