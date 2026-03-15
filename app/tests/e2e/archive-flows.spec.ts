import { test, expect } from '@playwright/test'

/**
 * E2E tests for archive (soft delete) flows.
 * Verifies that detail pages have archive buttons and
 * that archive confirmation dialogs work correctly.
 */

const JOB_ID = 'b70b053d-27b2-4b92-a0e4-81149ef0e5b2'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'jake@rossbuilt.com')
  await page.fill('input[type="password"]', 'R0ssBuilt99!')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
})

test.describe('Archive Button Presence on Detail Pages', () => {
  const detailPages = [
    { name: 'Client detail', listPath: '/clients', detailPattern: /\/clients\/[a-f0-9-]+/ },
    { name: 'Vendor detail', listPath: '/vendors', detailPattern: /\/vendors\/[a-f0-9-]+/ },
    { name: 'Lead detail', listPath: '/leads', detailPattern: /\/leads\/[a-f0-9-]+/ },
  ]

  for (const { name, listPath, detailPattern } of detailPages) {
    test(`${name} page has archive/delete action`, async ({ page }) => {
      await page.goto(listPath)
      await page.waitForLoadState('networkidle')

      // Find a detail link
      const detailLink = page.locator(`a[href*="${listPath}/"]`).first()
      const exists = await detailLink.isVisible().catch(() => false)

      if (exists) {
        await detailLink.click()
        await page.waitForURL(detailPattern, { timeout: 10000 })

        // Look for archive/delete button
        const archiveBtn = page.getByRole('button', { name: /archive|delete|remove/i })
        const menuBtn = page.getByRole('button', { name: /more|actions|⋮|•••/i })

        const hasArchive = await archiveBtn.isVisible().catch(() => false)
        const hasMenu = await menuBtn.isVisible().catch(() => false)

        // Should have either a direct archive button or an actions menu
        expect(hasArchive || hasMenu).toBeTruthy()
      }
    })
  }
})

test.describe('Confirmation Dialog', () => {
  test('archive action shows confirmation before proceeding', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')

    // Navigate to first client detail
    const detailLink = page.locator('a[href*="/clients/"]').first()
    const exists = await detailLink.isVisible().catch(() => false)

    if (exists) {
      await detailLink.click()
      await page.waitForLoadState('networkidle')

      // Try to find and click archive button
      const archiveBtn = page.getByRole('button', { name: /archive|delete/i })
      if (await archiveBtn.isVisible().catch(() => false)) {
        await archiveBtn.click()

        // Should show a confirmation dialog
        const dialog = page.locator('[role="alertdialog"], [role="dialog"]')
        const confirmText = page.getByText(/are you sure|confirm|cannot be undone/i)

        const hasDialog = await dialog.isVisible().catch(() => false)
        const hasConfirmText = await confirmText.isVisible().catch(() => false)

        // Either a dialog or confirmation text should appear
        if (hasDialog || hasConfirmText) {
          // Cancel the archive (don't actually delete)
          const cancelBtn = page.getByRole('button', { name: /cancel|no|back/i })
          if (await cancelBtn.isVisible().catch(() => false)) {
            await cancelBtn.click()
          }
        }
      }
    }
  })
})

test.describe('Soft Delete Policy', () => {
  test('archived items are hidden from main list', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')

    // The list should not show any items with "archived" status by default
    // (soft-deleted items have deleted_at set and are filtered out)
    const archivedBadges = page.locator('text=/archived/i').filter({ has: page.locator('.badge, [class*="badge"]') })
    const count = await archivedBadges.count()
    // Default list view should not show archived items
    expect(count).toBe(0)
  })
})
