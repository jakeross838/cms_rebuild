import { test, expect } from '@playwright/test'

const JOB_ID = 'b70b053d-27b2-4b92-a0e4-81149ef0e5b2'

test.beforeEach(async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('daily log detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/daily-logs`)
  await page.waitForLoadState('networkidle')

  // Check list page
  const heading = page.locator('text=Daily Logs')
  await expect(heading.first()).toBeVisible()

  // Click first log item
  const firstItem = page.locator('a[href*="/daily-logs/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    // Should show detail page with Back link
    await expect(page.locator('text=Back to Daily Logs')).toBeVisible({ timeout: 10000 })
  }
})

test('RFI detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/rfis`)
  await page.waitForLoadState('networkidle')

  const heading = page.locator('text=RFIs')
  await expect(heading.first()).toBeVisible()

  const firstItem = page.locator('a[href*="/rfis/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to RFIs')).toBeVisible({ timeout: 10000 })
  }
})

test('change order detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/change-orders`)
  await page.waitForLoadState('networkidle')

  const heading = page.locator('text=Change Orders')
  await expect(heading.first()).toBeVisible()

  const firstItem = page.locator('a[href*="/change-orders/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Change Orders')).toBeVisible({ timeout: 10000 })
  }
})

test('draw request detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/draws`)
  await page.waitForLoadState('networkidle')

  const heading = page.locator('text=Draw Requests')
  await expect(heading.first()).toBeVisible()

  const firstItem = page.locator('a[href*="/draws/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Draw Requests')).toBeVisible({ timeout: 10000 })
  }
})

test('permit detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/permits`)
  await page.waitForLoadState('networkidle')

  const heading = page.locator('text=Permits')
  await expect(heading.first()).toBeVisible()

  const firstItem = page.locator('a[href*="/permits/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Permits')).toBeVisible({ timeout: 10000 })
  }
})

test('warranty detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/warranties`)
  await page.waitForLoadState('networkidle')

  const heading = page.locator('text=Warranties')
  await expect(heading.first()).toBeVisible()

  const firstItem = page.locator('a[href*="/warranties/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Warranties')).toBeVisible({ timeout: 10000 })
  }
})

test('time clock entry detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/time-clock`)
  await page.waitForLoadState('networkidle')

  const heading = page.locator('text=Time Clock')
  await expect(heading.first()).toBeVisible()

  const firstItem = page.locator('a[href*="/time-clock/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Time Clock')).toBeVisible({ timeout: 10000 })
  }
})

test('job edit page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}`)
  await page.waitForLoadState('networkidle')

  // Click Edit Job button
  const editBtn = page.locator('text=Edit Job')
  if (await editBtn.isVisible()) {
    await editBtn.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Job')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('h1:has-text("Edit Job")')).toBeVisible()
  }
})
