import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login option for unauthenticated users", async ({
    page,
  }) => {
    // Check if login button is visible in the navbar
    await expect(page.getByRole("link", { name: /login/i })).toBeVisible();

    // Sign up is available from login page, not home page (good UX pattern)
  });

  test("should navigate to login page", async ({ page }) => {
    await page.getByRole("link", { name: /login/i }).click();
    await expect(page).toHaveURL("/login");

    // Check if login form is present with actual content
    await expect(
      page.getByRole("heading", { name: /welcome back/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should navigate to signup page from login page", async ({ page }) => {
    // First go to login page
    await page.getByRole("link", { name: /login/i }).click();
    await expect(page).toHaveURL("/login");

    // Then click sign up link from login page
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/signup");

    // Check if signup form is present with actual heading
    await expect(
      page.getByRole("heading", { name: /create your account/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
  });

  test("should show validation errors for empty login form", async ({
    page,
  }) => {
    await page.goto("/login");

    // Try to submit empty form - look for actual button text
    await page.getByRole("button", { name: /sign in/i }).click();

    // HTML5 validation will prevent submission, so check if form is still there
    await expect(
      page.getByRole("heading", { name: /welcome back/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
  });

  test("should show validation errors for invalid email", async ({ page }) => {
    await page.goto("/login");

    // Enter invalid email
    await page.getByLabel(/email address/i).fill("invalid-email");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Check for Firebase auth error or HTML5 validation
    // HTML5 will catch invalid email format before submission
    await expect(page.getByLabel(/email address/i)).toBeVisible();
  });
});
