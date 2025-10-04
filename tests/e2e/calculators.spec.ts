import { test, expect } from "@playwright/test";

test.describe("Health Calculators", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("BMI Calculator functionality", async ({ page }) => {
    await page.goto("/bmi-calculator");

    // Check if calculator is loaded
    await expect(
      page.getByRole("heading", { name: /bmi calculator/i })
    ).toBeVisible();

    // Fill in the form
    await page.getByLabel(/height/i).fill("175");
    await page.getByLabel(/weight/i).fill("70");

    // Submit the form
    await page.getByRole("button", { name: /calculate/i }).click();

    // Check if result is displayed
    await expect(page.getByText(/your bmi is/i)).toBeVisible();
    await expect(page.getByText(/22.86/)).toBeVisible();
    await expect(page.getByText(/normal weight/i)).toBeVisible();
  });

  test("TDEE Calculator functionality", async ({ page }) => {
    await page.goto("/tdee-calculator");

    // Check if calculator is loaded
    await expect(
      page.getByRole("heading", { name: /tdee calculator/i })
    ).toBeVisible();

    // Fill in the form
    await page.getByLabel(/age/i).fill("30");
    await page.getByLabel(/height/i).fill("175");
    await page.getByLabel(/weight/i).fill("70");
    await page.selectOption('select[name="gender"]', "male");
    await page.selectOption(
      'select[name="activityLevel"]',
      "moderately_active"
    );

    // Submit the form
    await page.getByRole("button", { name: /calculate/i }).click();

    // Check if result is displayed
    await expect(page.getByText(/your tdee is/i)).toBeVisible();
    await expect(page.locator('[data-testid="tdee-result"]')).toBeVisible();
  });

  test("Weight Loss Calculator functionality", async ({ page }) => {
    await page.goto("/weight-loss-calculator");

    // Check if calculator is loaded
    await expect(
      page.getByRole("heading", { name: /weight loss calculator/i })
    ).toBeVisible();

    // Fill in the form
    await page.getByLabel(/current weight/i).fill("80");
    await page.getByLabel(/target weight/i).fill("70");
    await page.getByLabel(/weekly goal/i).fill("0.5");

    // Submit the form
    await page.getByRole("button", { name: /calculate/i }).click();

    // Check if result is displayed
    await expect(page.getByText(/weight loss plan/i)).toBeVisible();
    await expect(page.getByText(/weeks to reach goal/i)).toBeVisible();
  });

  test("Calculator navigation from home page", async ({ page }) => {
    // Test navigation to different calculators
    const calculators = [
      { name: "BMI Calculator", url: "/bmi-calculator" },
      { name: "TDEE Calculator", url: "/tdee-calculator" },
      { name: "Body Fat Calculator", url: "/body-fat-calculator" },
      { name: "Weight Loss Calculator", url: "/weight-loss-calculator" },
    ];

    for (const calculator of calculators) {
      await page.goto("/");
      await page
        .getByRole("link", { name: new RegExp(calculator.name, "i") })
        .click();
      await expect(page).toHaveURL(calculator.url);
      await expect(
        page.getByRole("heading", { name: new RegExp(calculator.name, "i") })
      ).toBeVisible();
    }
  });
});
