import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login and signup options", async ({ page }) => {
    // Check if login button is visible
    await expect(page.getByRole("link", { name: /login/i })).toBeVisible();

    // Check if signup button is visible
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.getByRole("link", { name: /login/i }).click();
    await expect(page).toHaveURL("/login");

    // Check if login form is present
    await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should navigate to signup page", async ({ page }) => {
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/signup");

    // Check if signup form is present
    await expect(page.getByRole("heading", { name: /sign up/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should show validation errors for empty login form", async ({
    page,
  }) => {
    await page.goto("/login");

    // Try to submit empty form
    await page.getByRole("button", { name: /login/i }).click();

    // Check for validation messages
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test("should show validation errors for invalid email", async ({ page }) => {
    await page.goto("/login");

    // Enter invalid email
    await page.getByLabel(/email/i).fill("invalid-email");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /login/i }).click();

    // Check for email validation message
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });
});
