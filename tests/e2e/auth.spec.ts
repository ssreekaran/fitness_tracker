import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should be able to access login page", async ({ page }) => {
    // Navigate directly to login page (works regardless of navbar state)
    await page.goto("/login");
    await expect(page).toHaveURL("/login");

    // Check if login form is present
    await expect(
      page.getByRole("heading", { name: /welcome back/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should be able to navigate to signup from login page", async ({
    page,
  }) => {
    // Go to login page
    await page.goto("/login");
    await expect(page).toHaveURL("/login");

    // Click sign up link from login page
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/signup");

    // Check if signup form is present
    await expect(
      page.getByRole("heading", { name: /create your account/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
  });

  test("should handle empty login form submission", async ({ page }) => {
    await page.goto("/login");

    // Try to submit empty form
    await page.getByRole("button", { name: /sign in/i }).click();

    // HTML5 validation will prevent submission, form should still be there
    await expect(
      page.getByRole("heading", { name: /welcome back/i })
    ).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
  });

  test("should handle invalid email in login form", async ({ page }) => {
    await page.goto("/login");

    // Enter invalid email
    await page.getByLabel(/email address/i).fill("invalid-email");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();

    // HTML5 validation or Firebase error should keep us on login page
    await expect(page.getByLabel(/email address/i)).toBeVisible();
  });

  test("should display home page content", async ({ page }) => {
    // Just verify the home page loads with expected content
    await expect(page.getByText(/fitness tracker/i)).toBeVisible();

    // Check that we can navigate to various pages
    await page.goto("/about");
    await expect(page).toHaveURL("/about");
  });
});
