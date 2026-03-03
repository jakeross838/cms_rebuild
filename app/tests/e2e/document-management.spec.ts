import { test, expect } from '@playwright/test'

const JOB_ID = 'b70b053d-27b2-4b92-a0e4-81149ef0e5b2'

/**
 * E2E tests for document management pages.
 * Tests files page, file upload form, document detail,
 * and job-scoped file management.
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test('files page loads', async ({ page }) => {
  await page.goto('/files')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /file|document/i }).first()).toBeVisible({ timeout: 10000 })
})

test('job files list page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/files`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /file|document/i }).first()).toBeVisible({ timeout: 10000 })
})

test('file upload form renders at job level', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/files/new`)
  await page.waitForSelector('input, button[type="submit"]', { state: 'visible', timeout: 15000 })
  // Page should not be a 404
  await expect(page.locator('body')).not.toContainText('404')
  // Should have file input or upload-related fields
  const formElements = page.locator('input, textarea, select, button[type="submit"]')
  expect(await formElements.count()).toBeGreaterThan(0)
})

test('docs page loads', async ({ page }) => {
  await page.goto('/docs')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /doc|knowledge/i }).first()).toBeVisible({ timeout: 10000 })
})

test('job photos page loads', async ({ page }) => {
  await page.goto(`/jobs/${JOB_ID}/photos`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1, h2').filter({ hasText: /photo/i }).first()).toBeVisible({ timeout: 10000 })
})
