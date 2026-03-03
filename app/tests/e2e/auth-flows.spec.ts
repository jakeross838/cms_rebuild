import { test, expect } from '@playwright/test'

/**
 * E2E tests for authentication flows.
 * Tests login, signup, forgot-password pages, form validation,
 * logout behavior, and protected route redirects.
 */

test.describe('Auth Flows', () => {
  test('login page renders with email and password fields', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Page should show the login card title
    await expect(page.locator('text=Ross Built CMS')).toBeVisible({ timeout: 10000 })

    // Email and password fields should be present
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // Submit button should be present
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Links to signup and forgot password should be present
    await expect(page.locator('a[href="/signup"]')).toBeVisible()
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible()
  })

  test('login form validates required fields on submit', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Both inputs have the "required" attribute — submitting empty should not navigate away
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveAttribute('required', '')

    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toHaveAttribute('required', '')

    // Click submit with empty fields — page should stay on /login
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'WrongPassword123!')
    await page.click('button[type="submit"]')

    // Should show an error message and stay on login page
    await expect(page.locator('.text-destructive, [class*="destructive"]')).toBeVisible({ timeout: 15000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('signup page renders with registration form', async ({ page }) => {
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')

    // Should show the create account heading
    await expect(page.locator('text=Create your account')).toBeVisible({ timeout: 10000 })

    // All registration fields should be present
    await expect(page.locator('input#name')).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#companyName')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('input#confirmPassword')).toBeVisible()

    // Submit button should be present
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Link back to login should be present
    await expect(page.locator('a[href="/login"]')).toBeVisible()
  })

  test('forgot password page renders with email field', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')

    // Should show the reset password heading
    await expect(page.locator('text=Reset your password')).toBeVisible({ timeout: 10000 })

    // Email field should be present
    await expect(page.locator('input[type="email"]')).toBeVisible()

    // Submit button should be present
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Link back to login should be present
    await expect(page.locator('a[href="/login"]')).toBeVisible()
  })

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'jake@rossbuilt.com')
    await page.fill('input[type="password"]', 'R0ssBuilt99!')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard or jobs after successful login
    await page.waitForURL(/\/(dashboard|jobs)/, { timeout: 15000 })
  })

  test('protected pages redirect to login when not authenticated', async ({ page }) => {
    // Clear any existing auth state by going directly to a protected route
    await page.context().clearCookies()
    await page.goto('/dashboard')

    // Should redirect to login page
    await page.waitForURL(/\/login/, { timeout: 15000 })
  })

  test('login page has forgot password link that navigates correctly', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Click the forgot password link
    await page.click('a[href="/forgot-password"]')
    await page.waitForURL(/\/forgot-password/, { timeout: 10000 })

    // Verify we're on the forgot password page
    await expect(page.locator('text=Reset your password')).toBeVisible({ timeout: 10000 })
  })

  test('signup page has sign-in link that navigates to login', async ({ page }) => {
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')

    // Click the sign in link
    await page.click('a[href="/login"]')
    await page.waitForURL(/\/login/, { timeout: 10000 })

    // Verify we're on the login page
    await expect(page.locator('text=Ross Built CMS')).toBeVisible({ timeout: 10000 })
  })
})
