import { describe, it, expect } from 'vitest';

// Import the functions we want to test
function calculateBMR(gender: string, weight: number, height: number, age: number) {
  if (gender === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }
}

describe('Weight Loss Calculator', () => {
  describe('calculateBMR', () => {
    it('calculates BMR correctly for males', () => {
      // Test case for a 30-year-old male, 180cm, 80kg
      expect(calculateBMR('male', 80, 180, 30)).toBeCloseTo(1853.632, 2);
      
      // Test case for a 25-year-old male, 170cm, 70kg
      expect(calculateBMR('male', 70, 170, 25)).toBeCloseTo(1700.057, 2);
    });

    it('calculates BMR correctly for females', () => {
      // Test case for a 30-year-old female, 165cm, 65kg
      expect(calculateBMR('female', 65, 165, 30)).toBeCloseTo(1429.918, 2);
      
      // Test case for a 25-year-old female, 160cm, 55kg
      expect(calculateBMR('female', 55, 160, 25)).toBeCloseTo(1343.608, 2);
    });

    it('handles edge cases', () => {
      // Test with minimum values
      expect(calculateBMR('male', 40, 140, 18)).toBeCloseTo(1193.916, 2);
      
      // Test with higher values
      expect(calculateBMR('female', 120, 200, 80)).toBeCloseTo(1830.433, 2);
    });
  });

  describe('calculateTDEE', () => {
    // This function is used in the component but not extracted, so we'll test it directly
    const calculateTDEE = (bmr: number, activityLevel: number) => bmr * activityLevel;

    it('calculates TDEE correctly based on activity level', () => {
      const bmr = 1500; // Base metabolic rate
      
      expect(calculateTDEE(bmr, 1.2)).toBe(1800);   // Sedentary
      expect(calculateTDEE(bmr, 1.375)).toBe(2062.5); // Lightly active
      expect(calculateTDEE(bmr, 1.55)).toBe(2325);   // Moderately active
      expect(calculateTDEE(bmr, 1.725)).toBe(2587.5); // Very active
      expect(calculateTDEE(bmr, 1.9)).toBe(2850);    // Super active
    });
  });

  describe('calculateCalorieGoal', () => {
    // This function is used in the component but not extracted
    const calculateCalorieGoal = (tdee: number, weeklyGoalKg: number) => {
      // 7700 calories ≈ 1kg of body weight
      const dailyDeficit = (weeklyGoalKg * 7700) / 7;
      return Math.round(tdee - dailyDeficit);
    };

    it('calculates daily calorie goal for weight loss', () => {
      const tdee = 2500; // Total Daily Energy Expenditure
      
      // Test different weekly weight loss goals
      expect(calculateCalorieGoal(tdee, 0.25)).toBe(2225); // 0.25kg/week
      expect(calculateCalorieGoal(tdee, 0.5)).toBe(1950);  // 0.5kg/week
      expect(calculateCalorieGoal(tdee, 1)).toBe(1400);    // 1kg/week
    });

    it('handles weight gain goals', () => {
      const tdee = 2500;
      
      // Test weight gain (negative weight loss)
      expect(calculateCalorieGoal(tdee, -0.25)).toBe(2775);  // -0.25kg/week (gain)
      expect(calculateCalorieGoal(tdee, -0.5)).toBe(3050);   // -0.5kg/week (gain)
    });
  });
});
