import { describe, it, expect } from "vitest";
import { calculateMacros } from "../macroCalculator";

const BALANCED = { name: "Balanced", protein: 25, carbs: 45, fat: 30 };

describe("calculateMacros", () => {
  it("reconciles the audit case: parts sum exactly to the 2,628 kcal total", () => {
    const result = calculateMacros(2628, BALANCED);
    expect(result.calories).toBe(2628);
    expect(result.protein).toBe(164);
    expect(result.carbs).toBe(295);
    expect(result.fat).toBe(88);
    expect(result.protein * 4 + result.carbs * 4 + result.fat * 9).toBe(
      result.calories
    );
  });

  it("parts always sum to the displayed total across splits and targets", () => {
    const splits = [
      BALANCED,
      { name: "High Protein", protein: 35, carbs: 35, fat: 30 },
      { name: "Low Carb", protein: 30, carbs: 20, fat: 50 },
      { name: "Keto", protein: 25, carbs: 5, fat: 70 },
      { name: "Endurance", protein: 20, carbs: 55, fat: 25 },
    ];
    for (const split of splits) {
      for (const target of [1500, 2000, 2628, 3000, 2500]) {
        const result = calculateMacros(target, split);
        expect(
          result.protein * 4 + result.carbs * 4 + result.fat * 9
        ).toBe(result.calories);
        // Reconciled total stays within a few kcal of the target.
        expect(Math.abs(result.calories - target)).toBeLessThanOrEqual(4);
      }
    }
  });
});
