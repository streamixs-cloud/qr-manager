import { test, expect } from '@playwright/test'

// Unique email per test run so we never collide with existing accounts.
const testEmail = `e2e-${Date.now()}@test.local`
const testPassword = 'TestPassword123!'
const testDestination = 'https://example.com/e2e-target'
const updatedDestination = 'https://example.com/e2e-updated'

let createdSlug: string

// ---------------------------------------------------------------------------
// Helper: log in with an existing account
// ---------------------------------------------------------------------------
async function loginAs(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/')
}

// ---------------------------------------------------------------------------
// 1. Register
// ---------------------------------------------------------------------------
test('register creates an account and redirects to home', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.getByLabel('Email').fill(testEmail)
  await page.getByLabel('Password').fill(testPassword)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.locator('h1')).toContainText('QR Manager')
})

// ---------------------------------------------------------------------------
// 2. Login
// ---------------------------------------------------------------------------
test('login authenticates an existing user and redirects to home', async ({ page }) => {
  await loginAs(page, testEmail, testPassword)

  await expect(page.locator('h1')).toContainText('QR Manager')
})

// ---------------------------------------------------------------------------
// 3. Create a link
// ---------------------------------------------------------------------------
test('create link adds it to the dashboard', async ({ page }) => {
  await loginAs(page, testEmail, testPassword)

  await page.getByLabel('Destination URL').fill(testDestination)
  await page.getByRole('button', { name: 'Create link' }).click()

  // Success message appears
  await expect(page.getByRole('status')).toContainText('Link created')

  // The new link appears in the list
  const linkItem = page.locator('ul li').filter({ hasText: testDestination }).first()
  await expect(linkItem).toBeVisible()

  // Capture the slug for use in subsequent tests
  const slugEl = linkItem.locator('span.font-semibold').first()
  const slugText = await slugEl.textContent()
  createdSlug = (slugText ?? '').replace(/^\//, '')
  expect(createdSlug).toBeTruthy()
})

// ---------------------------------------------------------------------------
// 4. Redirect via /r/[slug]
// ---------------------------------------------------------------------------
test('/r/[slug] redirects to the destination URL', async ({ page }) => {
  expect(createdSlug, 'slug must be set by the previous test').toBeTruthy()

  // Playwright follows redirects by default; the final URL should be the destination.
  await page.goto(`/r/${createdSlug}`)
  await expect(page).toHaveURL(testDestination)
})

// ---------------------------------------------------------------------------
// 5. Scan count increments after redirect
// ---------------------------------------------------------------------------
test('scan count increments after following the redirect', async ({ page }) => {
  expect(createdSlug, 'slug must be set by the create-link test').toBeTruthy()

  await loginAs(page, testEmail, testPassword)

  // Read current count
  const linkItem = page.locator('ul li').filter({ hasText: testDestination }).first()
  const countText = await linkItem.locator('p.text-xs').first().textContent()
  const before = parseInt(countText ?? '0', 10)

  // Trigger another scan (use a separate context to avoid auth cookie affecting the route)
  const scanPage = page
  await scanPage.goto(`/r/${createdSlug}`, { waitUntil: 'commit' })

  // Go back to dashboard and wait for the incremented count
  await page.goto('/')
  await loginAs(page, testEmail, testPassword)

  const updatedItem = page.locator('ul li').filter({ hasText: testDestination }).first()
  await expect(async () => {
    const text = await updatedItem.locator('p.text-xs').first().textContent()
    const after = parseInt(text ?? '0', 10)
    expect(after).toBeGreaterThan(before)
  }).toPass({ timeout: 5000 })
})

// ---------------------------------------------------------------------------
// 6. Edit destination — redirect follows new URL
// ---------------------------------------------------------------------------
test('editing destination causes /r/[slug] to redirect to the new URL', async ({ page }) => {
  expect(createdSlug, 'slug must be set by the create-link test').toBeTruthy()

  await loginAs(page, testEmail, testPassword)

  const linkItem = page.locator('ul li').filter({ hasText: testDestination }).first()
  await linkItem.getByRole('button', { name: 'Edit' }).click()

  // The edit form expands inline — clear the destination field and type the new URL
  const destinationInput = linkItem.locator('input[type="url"]')
  await destinationInput.fill(updatedDestination)
  await linkItem.getByRole('button', { name: 'Save' }).click()

  // The list should now show the updated destination
  await expect(page.locator('ul li').filter({ hasText: updatedDestination }).first()).toBeVisible()

  // The redirect should now point to the updated URL
  await page.goto(`/r/${createdSlug}`)
  await expect(page).toHaveURL(updatedDestination)
})

// ---------------------------------------------------------------------------
// 7. Delete link — redirect returns 404
// ---------------------------------------------------------------------------
test('deleting a link causes /r/[slug] to return 404', async ({ page }) => {
  expect(createdSlug, 'slug must be set by the create-link test').toBeTruthy()

  await loginAs(page, testEmail, testPassword)

  const linkItem = page.locator('ul li').filter({ hasText: updatedDestination }).first()
  await linkItem.getByRole('button', { name: 'Delete' }).click()

  // The item should be gone from the list
  await expect(page.locator('ul li').filter({ hasText: updatedDestination })).toHaveCount(0)

  // The redirect route should now return 404
  const response = await page.request.get(`/r/${createdSlug}`)
  expect(response.status()).toBe(404)
})
