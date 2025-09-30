/**
 * TDEE Calculator Page Component
 *
 * Total Daily Energy Expenditure calculator that determines how many calories
 * a person burns per day based on their BMR and activity level.
 *
 * Features:
 * - BMR calculation using Mifflin-St Jeor equation
 * - Multiple activity level options
 * - Gender-specific calculations
 * - Detailed calorie breakdowns for different goals
 * - Unit conversion support
 */

import React, { useState } from "react";
import {
  FaFire,
  FaInfoCircle,
  FaRuler,
  FaWeight,
  FaRunning,
} from "react-icons/fa";
import "./TDEECalculator.css";

/**
 * Activity level multipliers for TDEE calculation
 * Based on standard fitness industry guidelines
 */
const activityLevels = [
  {
    label: "Sedentary (little or no exercise)",
    value: 1.2,
    description: "Desk job, no exercise",
  },
  {
    label: "Lightly active (light exercise 1-3 days/week)",
    value: 1.375,
    description: "Light exercise or sports 1-3 days/week",
  },
  {
    label: "Moderately active (moderate exercise 3-5 days/week)",
    value: 1.55,
    description: "Moderate exercise or sports 3-5 days/week",
  },
  {
    label: "Very active (hard exercise 6-7 days/week)",
    value: 1.725,
    description: "Hard exercise or sports 6-7 days/week",
  },
  {
    label: "Super active (very hard exercise & physical job)",
    value: 1.9,
    description: "Very hard exercise, physical job, or training twice a day",
  },
];

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation
 * This is the most accurate formula for BMR calculation in healthy individuals
 *
 * @param gender - "male" or "female"
 * @param weight - Weight in kilograms
 * @param height - Height in centimeters
 * @param age - Age in years
 * @returns BMR in calories per day
 */
function calculateBMR(
  gender: string,
  weight: number,
  height: number,
  age: number
) {
  if (gender === "male") {
    // Mifflin-St Jeor equation for men
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    // Mifflin-St Jeor equation for women
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
}

const TDEECalculator: React.FC = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState(1.2);
  const [bmr, setBmr] = useState<number | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");

  const calculateTDEE = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert all to metric for calculation
    const heightCm =
      heightUnit === "cm" ? parseFloat(height) : parseFloat(height) * 2.54;
    const weightKg =
      weightUnit === "kg" ? parseFloat(weight) : parseFloat(weight) * 0.453592;

    const bmrValue = calculateBMR(gender, weightKg, heightCm, parseFloat(age));
    const tdeeValue = bmrValue * activity;

    setBmr(Math.round(bmrValue));
    setTdee(Math.round(tdeeValue));
  };

  const getActivityLevel = () => {
    return (
      activityLevels.find((level) => level.value === activity)?.label || ""
    );
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="tdee-hero">
        <div className="tdee-hero-content">
          <h1>TDEE Calculator</h1>
          <p>
            Calculate your Total Daily Energy Expenditure to understand how many
            calories you burn per day.
          </p>
        </div>
        <div className="calculator-icon">
          <FaFire />
        </div>
      </section>

      <div className="tdee-calculator">
        <form onSubmit={calculateTDEE} className="tdee-form">
          {/* Gender Selection */}
          <div className="form-group">
            <div className="form-header">
              <label>Gender</label>
              <div className="gender-toggle">
                <button
                  type="button"
                  className={`gender-btn ${gender === "male" ? "active" : ""}`}
                  onClick={() => setGender("male")}
                >
                  <span className="gender-icon">♂</span>
                  <span>Male</span>
                </button>
                <button
                  type="button"
                  className={`gender-btn ${
                    gender === "female" ? "active" : ""
                  }`}
                  onClick={() => setGender("female")}
                >
                  <span className="gender-icon">♀</span>
                  <span>Female</span>
                </button>
              </div>
            </div>
          </div>

          {/* Age */}
          <div className="form-group">
            <div className="form-header">
              <label>Age</label>
            </div>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                type="number"
                value={age}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAge(e.target.value)
                }
                placeholder="Enter your age"
                required
                min={10}
                max={120}
                className="measurement-input"
              />
            </div>
          </div>

          {/* Height */}
          <div className="form-group">
            <div className="form-header">
              <label>Height</label>
              <div className="unit-toggle">
                <button
                  type="button"
                  className={`unit-btn ${heightUnit === "cm" ? "active" : ""}`}
                  onClick={() => setHeightUnit("cm")}
                >
                  cm
                </button>
                <button
                  type="button"
                  className={`unit-btn ${heightUnit === "in" ? "active" : ""}`}
                  onClick={() => setHeightUnit("in")}
                >
                  in
                </button>
              </div>
            </div>
            <div className="input-with-icon">
              <FaRuler className="input-icon" />
              <input
                type="number"
                value={height}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHeight(e.target.value)
                }
                placeholder={
                  heightUnit === "cm" ? "Height (cm)" : "Height (in)"
                }
                required
                min={heightUnit === "cm" ? 50 : 20}
                max={heightUnit === "cm" ? 300 : 120}
                step="0.1"
                className="measurement-input"
              />
            </div>
          </div>

          {/* Weight */}
          <div className="form-group">
            <div className="form-header">
              <label>Weight</label>
              <div className="unit-toggle">
                <button
                  type="button"
                  className={`unit-btn ${weightUnit === "kg" ? "active" : ""}`}
                  onClick={() => setWeightUnit("kg")}
                >
                  kg
                </button>
                <button
                  type="button"
                  className={`unit-btn ${weightUnit === "lbs" ? "active" : ""}`}
                  onClick={() => setWeightUnit("lbs")}
                >
                  lbs
                </button>
              </div>
            </div>
            <div className="input-with-icon">
              <FaWeight className="input-icon" />
              <input
                type="number"
                value={weight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setWeight(e.target.value)
                }
                placeholder={
                  weightUnit === "kg" ? "Weight (kg)" : "Weight (lbs)"
                }
                required
                min={weightUnit === "kg" ? 30 : 66}
                max={weightUnit === "kg" ? 300 : 660}
                step="0.1"
                className="measurement-input"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div className="form-group">
            <div className="form-header">
              <label>Activity Level</label>
            </div>
            <div className="input-with-icon">
              <FaRunning className="input-icon" />
              <select
                value={activity}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setActivity(Number(e.target.value))
                }
                className="measurement-input activity-select"
                required
              >
                {activityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-hint">
              Choose the activity level that best describes your lifestyle
            </div>
          </div>

          <button type="submit" className="calculate-btn">
            Calculate TDEE
          </button>
        </form>

        {tdee !== null && (
          <div className="result-container">
            <h3>Your Energy Expenditure</h3>

            <div className="tdee-results">
              <div className="result-card primary">
                <div className="result-label">TDEE</div>
                <div className="result-value">{tdee}</div>
                <div className="result-unit">kcal/day</div>
              </div>

              <div className="result-card secondary">
                <div className="result-label">BMR</div>
                <div className="result-value">{bmr}</div>
                <div className="result-unit">kcal/day</div>
              </div>

              <div className="result-card secondary">
                <div className="result-label">Activity Factor</div>
                <div className="result-value">{activity}</div>
                <div className="result-unit">multiplier</div>
              </div>
            </div>

            <div className="activity-info">
              <div className="activity-level">
                Current Activity Level: {getActivityLevel()}
              </div>
            </div>

            <div className="calorie-breakdown">
              <h4>Calorie Goals by Objective</h4>
              <div className="goal-cards">
                <div className="goal-card weight-loss">
                  <div className="goal-title">Weight Loss</div>
                  <div className="goal-calories">
                    {Math.round(tdee * 0.8)} kcal/day
                  </div>
                  <div className="goal-description">20% deficit</div>
                </div>
                <div className="goal-card maintenance">
                  <div className="goal-title">Maintenance</div>
                  <div className="goal-calories">{tdee} kcal/day</div>
                  <div className="goal-description">Current TDEE</div>
                </div>
                <div className="goal-card weight-gain">
                  <div className="goal-title">Weight Gain</div>
                  <div className="goal-calories">
                    {Math.round(tdee * 1.15)} kcal/day
                  </div>
                  <div className="goal-description">15% surplus</div>
                </div>
              </div>
            </div>

            <div className="tdee-info">
              <FaInfoCircle className="info-icon" />
              <div>
                <p>
                  <strong>TDEE (Total Daily Energy Expenditure):</strong> The
                  total number of calories you burn in a day, including your BMR
                  and physical activity.
                </p>
                <p>
                  <strong>BMR (Basal Metabolic Rate):</strong> The calories your
                  body needs to maintain basic physiological functions at rest.
                </p>
                <p>
                  Use these numbers as a starting point and adjust based on your
                  results over 2-3 weeks.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TDEECalculator;
