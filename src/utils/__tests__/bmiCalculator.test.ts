import { describe, it, expect } from "vitest";
import { calculateBMI, getBMICategory } from "../../services/fitnessService";

describe("BMI Calculator", () => {
  describe("calculateBMI", () => {
    it("calculates BMI correctly for valid inputs", () => {
      // Test with height in meters
      expect(calculateBMI(70, 1.75, "kg", "m")).toBeCloseTo(22.86);
      expect(calculateBMI(80, 1.8, "kg", "m")).toBeCloseTo(24.69);

      // Test with height in centimeters
      expect(calculateBMI(70, 175, "kg", "cm")).toBeCloseTo(22.86);
      expect(calculateBMI(80, 180, "kg", "cm")).toBeCloseTo(24.69);
    });

    it("throws error for zero or negative values", () => {
      expect(() => calculateBMI(0, 1.75, "kg", "m")).toThrow(
        "Weight and height must be positive numbers"
      );
      expect(() => calculateBMI(70, 0, "kg", "m")).toThrow(
        "Weight and height must be positive numbers"
      );
      expect(() => calculateBMI(-70, 1.75, "kg", "m")).toThrow(
        "Weight and height must be positive numbers"
      );
    });
  });

  describe("getBMICategory", () => {
    it("returns correct category for underweight", () => {
      expect(getBMICategory(18.4)).toBe("Underweight");
    });

    it("returns correct category for normal weight", () => {
      expect(getBMICategory(22)).toBe("Normal weight");
    });

    it("returns correct category for overweight", () => {
      expect(getBMICategory(27)).toBe("Overweight");
    });

    it("returns correct category for obese", () => {
      expect(getBMICategory(31)).toBe("Obese");
    });
  });
});
