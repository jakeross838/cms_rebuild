import { test, expect } from '@playwright/test'

/**
 * E2E tests for Navigation — verifies the nav renders and functions
 * correctly in the actual browser.
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

  test('shows support items in right zone', async ({ page }) => {
    const header = page.locator('header')
    await expect(header.getByText('Directory')).toBeVisible()
    await expect(header.getByText('Library')).toBeVisible()
    await expect(header.getByText('Settings')).toBeVisible()
  })

  test('Sales dropdown opens and shows correct items', async ({ page }) => {
    await page.locator('header').getByText('Sales').click()
    const dropdown = page.locator('.absolute.top-full')
    await expect(dropdown.getByText('Leads')).toBeVisible()
    await expect(dropdown.getByText('Estimates')).toBeVisible()
    await expect(dropdown.getByText('Proposals')).toBeVisible()
    await expect(dropdown.getByText('Contracts')).toBeVisible()
  })

  test('clicking a dropdown link navigates correctly', async ({ page }) => {
    await page.getByText('Sales').click()
    await page.getByText('Leads').click()
    await expect(page).toHaveURL(/\/skeleton\/leads/)
  })

  test('Dashboard link navigates to /skeleton', async ({ page }) => {
    await page.goto('/skeleton/leads')
    await page.locator('header').getByText('Dashboard').click()
    await expect(page).toHaveURL(/\/skeleton$/)
  })

  test('Jobs link navigates to /skeleton/jobs', async ({ page }) => {
    await page.locator('header').getByText('Jobs', { exact: true }).click()
    await expect(page).toHaveURL(/\/skeleton\/jobs/)
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

  test('right zone persists (same as company view)', async ({ page }) => {
    const header = page.locator('header')
    await expect(header.getByText('Directory')).toBeVisible()
    await expect(header.getByText('Library')).toBeVisible()
    await expect(header.getByText('Settings')).toBeVisible()
  })

  test('company nav items are NOT visible in job context', async ({ page }) => {
    const header = page.locator('header')
    // Sales and Operations should not appear — they're company-level
    await expect(header.getByText('Sales')).not.toBeVisible()
    await expect(header.getByText('Operations')).not.toBeVisible()
  })

  test('job context bar shows job details', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Smith Residence' })).toBeVisible()
    await expect(page.getByText(/John.*Sarah Smith/)).toBeVisible()
    await expect(page.getByText('In Progress')).toBeVisible()
  })

  test('← Company navigates back to jobs list', async ({ page }) => {
    await page.getByText('← Company').click()
    await expect(page).toHaveURL(/\/skeleton\/jobs$/)
  })

  test('Field dropdown opens with correct job-scoped items', async ({ page }) => {
    await page.locator('header').getByText('Field').click()
    const dropdown = page.locator('.absolute.top-full')
    await expect(dropdown.getByText('Schedule')).toBeVisible()
    await expect(dropdown.getByText('Daily Logs')).toBeVisible()
    await expect(dropdown.getByText('Photos')).toBeVisible()
    await expect(dropdown.getByText('Permits')).toBeVisible()
    await expect(dropdown.getByText('Inspections')).toBeVisible()
  })
})
