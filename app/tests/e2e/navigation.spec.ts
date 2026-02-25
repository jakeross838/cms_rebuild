import { test, expect } from '@playwright/test'

/**
 * E2E tests for Skeleton Navigation — verifies the UnifiedNav renders
 * correctly in the browser.
 *
 * Note: The skeleton nav config uses authenticated paths (/dashboard, /jobs)
 * not skeleton paths (/skeleton, /skeleton/jobs). Navigation tests that check
 * URLs are skipped since clicking nav links navigates away from the skeleton.
 */

test.describe('Company-Level Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/skeleton')
  })

  test('renders a single header (no stacked nav bars)', async ({ page }) => {
    const headers = page.locator('header')
    await expect(headers).toHaveCount(1)
  })

  test('shows company nav items in left zone', async ({ page }) => {
    const header = page.locator('header')
    await expect(header.getByText('Dashboard')).toBeVisible()
    await expect(header.getByText('Sales')).toBeVisible()
    await expect(header.getByText('Jobs')).toBeVisible()
  })

  test('shows job-aggregate items after spacer', async ({ page }) => {
    const header = page.locator('header')
    await expect(header.getByText('Operations')).toBeVisible()
    await expect(header.getByText('Financial')).toBeVisible()
    await expect(header.getByText('Closeout')).toBeVisible()
  })

  test('right zone has settings gear icon and account avatar', async ({ page }) => {
    // Settings mega-menu is a gear icon button (consolidates Directory, Library, Settings)
    const settingsButton = page.locator('header button[title="Settings & More"]')
    await expect(settingsButton).toBeVisible()
    // Account avatar (JR initials)
    await expect(page.locator('header').getByText('JR')).toBeVisible()
  })

  test('Sales dropdown opens and shows correct items', async ({ page }) => {
    await page.locator('header').getByText('Sales').click()
    // Dropdown appears with sub-items — scope to the dropdown panel
    const dropdown = page.locator('header .absolute.top-full')
    await expect(dropdown.getByText('Leads')).toBeVisible()
    await expect(dropdown.getByText('Estimates')).toBeVisible()
    await expect(dropdown.getByText('Proposals')).toBeVisible()
    await expect(dropdown.getByText('Contracts', { exact: true }).first()).toBeVisible()
  })

  test('Settings mega-menu opens and shows sections', async ({ page }) => {
    await page.locator('header button[title="Settings & More"]').click()
    // Mega-menu shows Directory, Library, Settings sections
    await expect(page.getByText('Directory')).toBeVisible()
    await expect(page.getByText('Library')).toBeVisible()
    // Settings section has sub-items
    await expect(page.getByText('Clients')).toBeVisible()
    await expect(page.getByText('Vendors')).toBeVisible()
    await expect(page.getByText('Cost Codes')).toBeVisible()
  })
})

test.describe('Job-Level Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/skeleton/jobs/smith-residence')
  })

  test('renders a single header (no stacked nav bars)', async ({ page }) => {
    const headers = page.locator('header')
    await expect(headers).toHaveCount(1)
  })

  test('left zone transforms to job context', async ({ page }) => {
    const header = page.locator('header')
    await expect(header.getByText('← Company')).toBeVisible()
    await expect(header.getByText('Overview')).toBeVisible()
  })

  test('shows job lifecycle phases', async ({ page }) => {
    const header = page.locator('header')
    await expect(header.getByText('Pre-Con')).toBeVisible()
    await expect(header.getByText('Field')).toBeVisible()
    await expect(header.getByText('Financial')).toBeVisible()
    await expect(header.getByText('Docs')).toBeVisible()
    await expect(header.getByText('Closeout')).toBeVisible()
  })

  test('right zone persists in job context', async ({ page }) => {
    // Settings gear icon is still visible in job context
    const settingsButton = page.locator('header button[title="Settings & More"]')
    await expect(settingsButton).toBeVisible()
    // Search input
    await expect(page.locator('header input[placeholder="Search..."]')).toBeVisible()
  })

  test('company nav items are NOT visible in job context', async ({ page }) => {
    const header = page.locator('header')
    // Sales and Operations should not appear — they're company-level
    await expect(header.getByText('Sales')).not.toBeVisible()
    await expect(header.getByText('Operations')).not.toBeVisible()
  })

  test('Field dropdown opens with correct job-scoped items', async ({ page }) => {
    await page.locator('header').getByText('Field').click()
    const dropdown = page.locator('header .absolute.top-full')
    await expect(dropdown.getByText('Schedule')).toBeVisible()
    await expect(dropdown.getByText('Daily Logs')).toBeVisible()
    await expect(dropdown.getByText('Photos')).toBeVisible()
    await expect(dropdown.getByText('Permits')).toBeVisible()
    await expect(dropdown.getByText('Inspections')).toBeVisible()
  })
})
