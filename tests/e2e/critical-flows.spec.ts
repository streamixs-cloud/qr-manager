import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

// Unique email per test run so we never collide with existing accounts.
const testEmail = `e2e-${Date.now()}@test.local`;
const testPassword = "TestPassword123!";
const testDestination = "https://example.com/e2e-target";
const updatedDestination = "https://example.com/e2e-updated";

let createdSlug: string;

async function loginAs(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).first().click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.locator("form").getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");
}

async function registerAs(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Create account" }).first().click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page
    .locator("form")
    .getByRole("button", { name: "Create account" })
    .click();
  await expect(page).toHaveURL("/");
}

test("register creates an account and redirects to home", async ({ page }) => {
  await registerAs(page, testEmail, testPassword);
  await expect(page.locator("h1")).toContainText("QR Manager");
});

test("login authenticates an existing user and redirects to home", async ({
  page,
}) => {
  await loginAs(page, testEmail, testPassword);
  await expect(page.locator("h1")).toContainText("QR Manager");
});

test("create link adds it to the dashboard", async ({ page }) => {
  await loginAs(page, testEmail, testPassword);

  await page.getByLabel("Destination URL").fill(testDestination);
  await page.getByRole("button", { name: "Create link" }).click();

  await expect(page.getByRole("status")).toContainText("Link created");

  const linkItem = page
    .locator("ul li")
    .filter({ hasText: testDestination })
    .first();
  await expect(linkItem).toBeVisible();

  const slugEl = linkItem.locator("span.font-semibold").first();
  const slugText = await slugEl.textContent();
  createdSlug = (slugText ?? "").replace(/^\//, "");
  expect(createdSlug).toBeTruthy();
});

test("/r/[slug] redirects to the destination URL", async ({ page }) => {
  expect(createdSlug, "slug must be set by the previous test").toBeTruthy();

  await page.goto(`/r/${createdSlug}`);
  await expect(page).toHaveURL(testDestination);
});

test("scan count increments after following the redirect", async ({
  page,
  context,
}) => {
  expect(createdSlug, "slug must be set by the create-link test").toBeTruthy();

  await loginAs(page, testEmail, testPassword);

  const linkItem = page
    .locator("ul li")
    .filter({ hasText: testDestination })
    .first();
  const countText = await linkItem.locator("p.text-xs").first().textContent();
  const before = parseInt(countText ?? "0", 10);

  const scanPage = await context.newPage();
  await scanPage.goto(`/r/${createdSlug}`);
  await scanPage.waitForURL(testDestination);
  await scanPage.close();

  await page.goto("/");

  const updatedItem = page
    .locator("ul li")
    .filter({ hasText: testDestination })
    .first();
  await expect(async () => {
    const text = await updatedItem.locator("p.text-xs").first().textContent();
    const after = parseInt(text ?? "0", 10);
    expect(after).toBeGreaterThan(before);
  }).toPass({ timeout: 5000 });
});

test("editing destination causes /r/[slug] to redirect to the new URL", async ({
  page,
}) => {
  expect(createdSlug, "slug must be set by the create-link test").toBeTruthy();

  await loginAs(page, testEmail, testPassword);

  const linkItem = page
    .locator("ul li")
    .filter({ hasText: testDestination })
    .first();
  await linkItem.getByRole("button", { name: "Edit" }).click();

  const destinationInput = linkItem.locator('input[type="url"]');
  await destinationInput.fill(updatedDestination);
  await linkItem.getByRole("button", { name: "Save" }).click();

  await expect(
    page.locator("ul li").filter({ hasText: updatedDestination }).first(),
  ).toBeVisible();

  await page.goto(`/r/${createdSlug}`);
  await expect(page).toHaveURL(updatedDestination);
});

test("deleting a link causes /r/[slug] to return 404", async ({ page }) => {
  expect(createdSlug, "slug must be set by the create-link test").toBeTruthy();

  await loginAs(page, testEmail, testPassword);

  const linkItem = page
    .locator("ul li")
    .filter({ hasText: updatedDestination })
    .first();
  await linkItem.getByRole("button", { name: "Delete" }).click();

  await expect(
    page.locator("ul li").filter({ hasText: updatedDestination }),
  ).toHaveCount(0);

  const response = await page.request.get(`/r/${createdSlug}`);
  expect(response.status()).toBe(404);
});
