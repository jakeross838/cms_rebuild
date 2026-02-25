import { test, expect } from '@playwright/test'

const JOB_ID = 'b70b053d-27b2-4b92-a0e4-81149ef0e5b2'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('schedule task detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/schedule`)
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/schedule/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Schedule')).toBeVisible({ timeout: 10000 })
  }
})

test('budget line detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/budget`)
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/budget/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Budget')).toBeVisible({ timeout: 10000 })
  }
})

test('photo detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/photos`)
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/photos/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Photos')).toBeVisible({ timeout: 10000 })
  }
})

test('purchase order detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/purchase-orders`)
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/purchase-orders/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Purchase Orders')).toBeVisible({ timeout: 10000 })
  }
})

test('communication detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/communications`)
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/communications/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Communications')).toBeVisible({ timeout: 10000 })
  }
})

test('lien waiver detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/lien-waivers`)
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/lien-waivers/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Lien Waivers')).toBeVisible({ timeout: 10000 })
  }
})

test('inspection detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/inspections`)
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/inspections/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Inspections')).toBeVisible({ timeout: 10000 })
  }
})

test('submittal detail page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/submittals`)
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/submittals/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Submittals')).toBeVisible({ timeout: 10000 })
  }
})

test('vendor detail page loads', async ({ page }) => {
  await page.goto('/vendors')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/vendors/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Vendors')).toBeVisible({ timeout: 10000 })
  }
})

test('client detail page loads', async ({ page }) => {
  await page.goto('/clients')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/clients/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Clients')).toBeVisible({ timeout: 10000 })
  }
})

test('receivable detail page loads', async ({ page }) => {
  await page.goto('/financial/receivables')
  await page.waitForLoadState('networkidle')
  const firstItem = page.locator('a[href*="/receivables/"]').first()
  if (await firstItem.isVisible()) {
    await firstItem.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Back to Receivables')).toBeVisible({ timeout: 10000 })
  }
})
