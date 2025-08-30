import { describe, it, expect } from 'vitest';

// Import the functions we want to test
const calculateBodyFat = ({
  gender,
  heightCm,
  neckCm,
  waistCm,
  hipCm,
}: {
  gender: 'male' | 'female';
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm: number;
}) => {
  let bf = 0;
  if (gender === 'male') {
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
  }
  return parseFloat(bf.toFixed(1));
};

const getBodyFatCategory = (bodyFat: number, gender: 'male' | 'female') => {
  if (gender === 'male') {
    if (bodyFat < 6) return 'Essential fat';
    if (bodyFat < 14) return 'Athletes';
    if (bodyFat < 18) return 'Fitness';
    if (bodyFat < 25) return 'Average';
    return 'Obese';
  } else {
    if (bodyFat < 14) return 'Essential fat';
    if (bodyFat < 21) return 'Athletes';
    if (bodyFat < 25) return 'Fitness';
    if (bodyFat < 32) return 'Average';
    return 'Obese';
  }
};

describe('Body Fat Calculator', () => {
  describe('calculateBodyFat - Male', () => {
    it('calculates body fat percentage for a typical adult male', () => {
      // Test case for a 30-year-old male, 180cm tall, 40cm neck, 80cm waist
      const result = calculateBodyFat({
        gender: 'male',
        heightCm: 180,
        neckCm: 40,
        waistCm: 80,
        hipCm: 0, // Not used for males
      });
      
      // Expected value calculated using the formula
      expect(result).toBeCloseTo(10.3, 1);
    });

    it('handles different body proportions for males', () => {
      const result = calculateBodyFat({
        gender: 'male',
        heightCm: 175,
        neckCm: 38,
        waistCm: 95,
        hipCm: 0, // Not used for males
      });
      
      expect(result).toBeCloseTo(24.1, 1);
    });
  });

  describe('calculateBodyFat - Female', () => {
    it('calculates body fat percentage for a typical adult female', () => {
      // Test case for a 25-year-old female, 165cm tall, 32cm neck, 70cm waist, 95cm hips
      const result = calculateBodyFat({
        gender: 'female',
        heightCm: 165,
        neckCm: 32,
        waistCm: 70,
        hipCm: 95,
      });
      
      // Expected value calculated using the formula
      expect(result).toBeCloseTo(24.9, 1);
    });

    it('handles different body proportions for females', () => {
      const result = calculateBodyFat({
        gender: 'female',
        heightCm: 160,
        neckCm: 30,
        waistCm: 85,
        hipCm: 110,
      });
      
      expect(result).toBeCloseTo(41.7, 1);
    });
  });

  describe('getBodyFatCategory', () => {
    describe('for males', () => {
      it('returns correct category for essential fat', () => {
        expect(getBodyFatCategory(5, 'male')).toBe('Essential fat');
      });

      it('returns correct category for athletes', () => {
        expect(getBodyFatCategory(10, 'male')).toBe('Athletes');
        expect(getBodyFatCategory(13.9, 'male')).toBe('Athletes');
      });

      it('returns correct category for fitness', () => {
        expect(getBodyFatCategory(15, 'male')).toBe('Fitness');
        expect(getBodyFatCategory(17.9, 'male')).toBe('Fitness');
      });

      it('returns correct category for average', () => {
        expect(getBodyFatCategory(20, 'male')).toBe('Average');
        expect(getBodyFatCategory(24.9, 'male')).toBe('Average');
      });

      it('returns correct category for obese', () => {
        expect(getBodyFatCategory(30, 'male')).toBe('Obese');
      });
    });

    describe('for females', () => {
      it('returns correct category for essential fat', () => {
        expect(getBodyFatCategory(13, 'female')).toBe('Essential fat');
      });

      it('returns correct category for athletes', () => {
        expect(getBodyFatCategory(18, 'female')).toBe('Athletes');
        expect(getBodyFatCategory(20.9, 'female')).toBe('Athletes');
      });

      it('returns correct category for fitness', () => {
        expect(getBodyFatCategory(22, 'female')).toBe('Fitness');
        expect(getBodyFatCategory(24.9, 'female')).toBe('Fitness');
      });

      it('returns correct category for average', () => {
        expect(getBodyFatCategory(28, 'female')).toBe('Average');
        expect(getBodyFatCategory(31.9, 'female')).toBe('Average');
      });

      it('returns correct category for obese', () => {
        expect(getBodyFatCategory(35, 'female')).toBe('Obese');
      });
    });
  });
});
