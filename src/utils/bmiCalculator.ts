/**
 * Calculate BMI (Body Mass Index)
 * @param weight - Weight in kilograms
 * @param height - Height in meters
 * @returns BMI value
 */
export const calculateBMI = (weight: number, height: number): number => {
  if (weight <= 0 || height <= 0) {
    throw new Error("Weight and height must be positive numbers");
  }
  return weight / (height * height);
};

/**
 * Get BMI category based on BMI value
 * @param bmi - BMI value
 * @returns BMI category string
 */
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
};
