import { test, expect } from "@playwright/test";

test.describe("Navigation and Routing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display main navigation elements", async ({ page }) => {
    // Check if main navigation is visible
    await expect(page.getByRole("navigation")).toBeVisible();

    // Check for key navigation links
    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /about/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /calculators/i })
    ).toBeVisible();
  });

  test("should navigate to About page", async ({ page }) => {
    await page.getByRole("link", { name: /about/i }).click();
    await expect(page).toHaveURL("/about");
    await expect(page.getByRole("heading", { name: /about/i })).toBeVisible();
  });

  test("should display footer with legal links", async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer elements
    await expect(
      page.getByRole("link", { name: /privacy policy/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /terms of service/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /contact/i })).toBeVisible();
  });

  test("should handle mobile navigation", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile menu toggle is visible
    const mobileMenuToggle = page.getByRole("button", { name: /menu/i });
    await expect(mobileMenuToggle).toBeVisible();

    // Open mobile menu
    await mobileMenuToggle.click();

    // Check if mobile menu items are visible
    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /about/i })).toBeVisible();
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    await page.goto("/non-existent-page");

    // Should redirect to home or show 404 page
    // Since you have a catch-all route, it should show the home page
    await expect(page).toHaveURL("/non-existent-page");
  });

  test("should maintain theme across navigation", async ({ page }) => {
    // Check initial theme
    const body = page.locator("body");

    // Navigate to different pages and check theme consistency
    await page.goto("/about");
    await expect(body).toHaveCSS(
      "background-color",
      /rgb\(255, 255, 255\)|rgb\(26, 26, 26\)/
    );

    await page.goto("/bmi-calculator");
    await expect(body).toHaveCSS(
      "background-color",
      /rgb\(255, 255, 255\)|rgb\(26, 26, 26\)/
    );
  });
});
