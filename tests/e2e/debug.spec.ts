import { test, expect } from "@playwright/test";

test.describe("Debug - What's on the page", () => {
  test("should show what elements are actually on the home page", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Take a screenshot to see what's there
    await page.screenshot({ path: "debug-homepage.png", fullPage: true });

    // Log all links on the page
    const links = await page.locator("a").all();
    console.log(`Found ${links.length} links on the page`);

    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const text = await links[i].textContent();
      const href = await links[i].getAttribute("href");
      console.log(`Link ${i + 1}: "${text}" -> ${href}`);
    }

    // Check if navbar exists
    const navbar = page.locator("nav, .navbar, header");
    const navbarCount = await navbar.count();
    console.log(`Found ${navbarCount} navbar elements`);

    // Check page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // This test always passes - it's just for debugging
    expect(true).toBe(true);
  });
});
