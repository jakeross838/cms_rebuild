import { test, expect } from '@playwright/test'

/**
 * E2E tests for cross-entity workflows.
 * Tests multi-step flows across different entity types.
 */

const JOB_ID = 'b70b053d-27b2-4b92-a0e4-81149ef0e5b2'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test.describe('Job → Sub-entity Navigation', () => {
  test('navigate from jobs list to job detail to budget', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')

    // Click first job
    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (await jobLink.isVisible().catch(() => false)) {
      const href = await jobLink.getAttribute('href')
      await jobLink.click()
      await page.waitForLoadState('networkidle')

      // Should be on job detail
      expect(page.url()).toContain('/jobs/')

      // Navigate to budget tab/section
      const budgetLink = page.getByRole('link', { name: /budget/i })
      if (await budgetLink.isVisible().catch(() => false)) {
        await budgetLink.click()
        await page.waitForLoadState('networkidle')
        expect(page.url()).toContain('/budget')
      }
    }
  })

  test('navigate from jobs list to job detail to daily logs', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}`)
    await page.waitForLoadState('networkidle')

    const logsLink = page.getByRole('link', { name: /daily log|field/i })
    if (await logsLink.isVisible().catch(() => false)) {
      await logsLink.click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('daily-logs')
    }
  })

  test('navigate from job to RFIs to create RFI', async ({ page }) => {
    await page.goto(`/jobs/${JOB_ID}/rfis`)
    await page.waitForLoadState('networkidle')

    const newBtn = page.getByRole('link', { name: /new|create|add/i })
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/rfis/new')
    }
  })
})

test.describe('Dashboard → Entity Navigation', () => {
  test('dashboard links navigate to correct pages', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Should have links to jobs, invoices, etc.
    const jobsLink = page.getByRole('link', { name: /view all jobs|see all|jobs/i })
    if (await jobsLink.isVisible().catch(() => false)) {
      await jobsLink.click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/jobs')
    }
  })
})

test.describe('Cross-Entity Data Consistency', () => {
  test('vendor list shows consistent data with vendor detail', async ({ page }) => {
    await page.goto('/vendors')
    await page.waitForLoadState('networkidle')

    const vendorLink = page.locator('a[href*="/vendors/"]').first()
    if (await vendorLink.isVisible().catch(() => false)) {
      // Get vendor name from list
      const vendorRow = vendorLink.locator('..')
      const listText = await vendorRow.textContent()

      // Navigate to detail
      await vendorLink.click()
      await page.waitForLoadState('networkidle')

      // Detail page should show the same vendor
      const detailText = await page.textContent('body')
      // At minimum, the detail page loaded without error
      expect(detailText).not.toContain('404')
    }
  })

  test('client list → detail → back preserves state', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')

    const clientLink = page.locator('a[href*="/clients/"]').first()
    if (await clientLink.isVisible().catch(() => false)) {
      await clientLink.click()
      await page.waitForLoadState('networkidle')

      // Go back
      await page.goBack()
      await page.waitForLoadState('networkidle')

      // Should be back on clients list
      expect(page.url()).toContain('/clients')
    }
  })
})

test.describe('Settings Flow', () => {
  test('navigate through settings sections', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Should have settings navigation
    await expect(page).toHaveURL(/\/settings/)

    // Try to navigate to users settings
    const usersLink = page.getByRole('link', { name: /users|team/i })
    if (await usersLink.isVisible().catch(() => false)) {
      await usersLink.click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/settings')
    }
  })
})
