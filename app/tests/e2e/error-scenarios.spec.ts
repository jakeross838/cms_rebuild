import { test, expect } from '@playwright/test'

/**
 * E2E tests for error scenarios.
 * Tests 404 pages, invalid routes, error boundaries,
 * and graceful degradation.
 */

test.describe('404 Pages', () => {
  test('shows 404 for invalid top-level route', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')
    // Should show 404 or not-found page
    const notFoundText = page.getByText(/not found|404|page.*not.*exist/i)
    await expect(notFoundText.first()).toBeVisible({ timeout: 10000 })
  })

  test('shows 404 for invalid nested route', async ({ page }) => {
    await page.goto('/skeleton/this-does-not-exist')
    const notFoundText = page.getByText(/not found|404/i)
    await expect(notFoundText.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Invalid Detail Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'jake@rossbuilt.com')
    await page.fill('input[type="password"]', 'R0ssBuilt99!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
  })

  test('handles non-existent job ID gracefully', async ({ page }) => {
    await page.goto('/jobs/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')

    // Should show not-found message or redirect, not crash
    const errorText = page.getByText(/not found|no.*found|error|does not exist/i)
    const redirected = page.url().includes('/jobs') && !page.url().includes('00000000')

    const hasError = await errorText.isVisible().catch(() => false)
    expect(hasError || redirected).toBeTruthy()
  })

  test('handles non-existent client ID gracefully', async ({ page }) => {
    await page.goto('/clients/00000000-0000-0000-0000-000000000000')
    await page.waitForLoadState('networkidle')

    const errorText = page.getByText(/not found|no.*found|error|does not exist/i)
    const redirected = !page.url().includes('00000000')
    const hasError = await errorText.isVisible().catch(() => false)
    expect(hasError || redirected).toBeTruthy()
  })

  test('handles malformed UUID in URL gracefully', async ({ page }) => {
    await page.goto('/jobs/not-a-valid-uuid')
    await page.waitForLoadState('networkidle')

    // Should not show a raw error/stack trace
    const stackTrace = page.getByText(/TypeError|ReferenceError|SyntaxError|at Object/)
    const hasStackTrace = await stackTrace.isVisible().catch(() => false)
    expect(hasStackTrace).toBeFalsy()
  })
})

test.describe('Error Boundaries', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'jake@rossbuilt.com')
    await page.fill('input[type="password"]', 'R0ssBuilt99!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
  })

  test('error page has recovery options', async ({ page }) => {
    // Visit a page that might trigger an error boundary
    await page.goto('/jobs/invalid-id-format')
    await page.waitForLoadState('networkidle')

    // If error boundary renders, it should have recovery options
    const tryAgainBtn = page.getByRole('button', { name: /try again|retry/i })
    const dashboardLink = page.getByRole('link', { name: /dashboard|home/i })

    const hasTryAgain = await tryAgainBtn.isVisible().catch(() => false)
    const hasDashboard = await dashboardLink.isVisible().catch(() => false)

    // If we hit an error boundary, both should be present
    // If no error (graceful handling), that's also fine
    if (hasTryAgain) {
      expect(hasDashboard).toBeTruthy()
    }
  })
})

test.describe('API Error Handling', () => {
  test('search with special characters does not crash', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'jake@rossbuilt.com')
    await page.fill('input[type="password"]', 'R0ssBuilt99!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })

    // Navigate to jobs with special characters in search
    await page.goto('/jobs?search=%3Cscript%3Ealert(1)%3C/script%3E')
    await page.waitForLoadState('networkidle')

    // Should render normally without XSS
    const scriptTag = page.locator('script:has-text("alert")')
    const hasXSS = await scriptTag.count()
    expect(hasXSS).toBe(0)
  })

  test('extremely long search query is handled', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'jake@rossbuilt.com')
    await page.fill('input[type="password"]', 'R0ssBuilt99!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })

    const longQuery = 'a'.repeat(500)
    await page.goto(`/jobs?search=${longQuery}`)
    await page.waitForLoadState('networkidle')

    // Should not crash
    await expect(page.getByText(/jobs/i).first()).toBeVisible()
  })
})

test.describe('Skeleton Pages Stability', () => {
  const skeletonPages = [
    '/skeleton',
    '/skeleton/jobs/test-id',
    '/skeleton/financial/dashboard',
    '/skeleton/operations/equipment',
    '/skeleton/intelligence/trade-intuition',
  ]

  for (const path of skeletonPages) {
    test(`${path} loads without errors`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      // Should not show unhandled error
      const errorOverlay = page.locator('#__next-build-error, [class*="nextjs-container-errors"]')
      const hasError = await errorOverlay.isVisible().catch(() => false)
      expect(hasError).toBeFalsy()
    })
  }
})
