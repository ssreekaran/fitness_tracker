import React, { useState } from "react";
import {
  FaWeight,
  FaInfoCircle,
  FaRuler,
  FaRunning,
  FaBullseye,
} from "react-icons/fa";
import "./WeightLossCalculator.css";

const activityLevels = [
  { label: "Sedentary (little or no exercise)", value: 1.2 },
  {
    label: "Lightly active (light exercise/sports 1-3 days/week)",
    value: 1.375,
  },
  {
    label: "Moderately active (moderate exercise/sports 3-5 days/week)",
    value: 1.55,
  },
  { label: "Very active (hard exercise/sports 6-7 days a week)", value: 1.725 },
  { label: "Super active (very hard exercise & a physical job)", value: 1.9 },
];

function calculateBMR(
  gender: string,
  weight: number,
  height: number,
  age: number
) {
  if (gender === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
}

const WeightLossCalculator: React.FC = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState(1.2);
  const [goal, setGoal] = useState("");
  const [calories, setCalories] = useState<number | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [goalUnit, setGoalUnit] = useState<"kg" | "lbs">("kg");

  const calculateWeightLoss = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert all to metric for calculation
    const heightCm =
      heightUnit === "cm" ? parseFloat(height) : parseFloat(height) * 2.54;
    const weightKg =
      weightUnit === "kg" ? parseFloat(weight) : parseFloat(weight) * 0.453592;
    const goalKg =
      goalUnit === "kg" ? parseFloat(goal) : parseFloat(goal) * 0.453592;

    const bmrValue = calculateBMR(gender, weightKg, heightCm, parseFloat(age));
    const tdeeValue = bmrValue * activity;

    // 1 kg fat ≈ 7700 kcal, so goalKg/week = (goalKg*7700)/7 kcal deficit/day
    const deficit = (goalKg * 7700) / 7;
    const targetCalories = Math.round(tdeeValue - deficit);

    setBmr(Math.round(bmrValue));
    setTdee(Math.round(tdeeValue));
    setCalories(targetCalories);
  };

  const getWeightLossCategory = (weeklyGoal: number) => {
    if (weeklyGoal <= 0.25) return "Conservative";
    if (weeklyGoal <= 0.5) return "Moderate";
    if (weeklyGoal <= 0.75) return "Aggressive";
    return "Very Aggressive";
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="calculator-hero wl-hero">
        <div className="calculator-hero-content">
          <h1>Weight Loss Calculator</h1>
          <p>
            Calculate your daily calorie needs to reach your weight loss goals
            safely and effectively.
          </p>
        </div>
        <div className="calculator-icon">
          <FaWeight />
        </div>
      </section>

      <div className="calculator-form wl-calculator">
        <form onSubmit={calculateWeightLoss} className="wl-form">
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
              <label>Current Weight</label>
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
          </div>

          {/* Weight Loss Goal */}
          <div className="form-group">
            <div className="form-header">
              <label>Weight Loss Goal</label>
              <div className="unit-toggle">
                <button
                  type="button"
                  className={`unit-btn ${goalUnit === "kg" ? "active" : ""}`}
                  onClick={() => setGoalUnit("kg")}
                >
                  kg/week
                </button>
                <button
                  type="button"
                  className={`unit-btn ${goalUnit === "lbs" ? "active" : ""}`}
                  onClick={() => setGoalUnit("lbs")}
                >
                  lbs/week
                </button>
              </div>
            </div>
            <div className="input-with-icon">
              <FaBullseye className="input-icon" />
              <input
                type="number"
                value={goal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGoal(e.target.value)
                }
                placeholder={
                  goalUnit === "kg"
                    ? "Goal (kg per week)"
                    : "Goal (lbs per week)"
                }
                required
                min={goalUnit === "kg" ? 0.1 : 0.2}
                max={goalUnit === "kg" ? 1.5 : 3.3}
                step="0.1"
                className="measurement-input"
              />
            </div>
            <div className="input-hint">
              Recommended: 0.5-1 kg (1-2 lbs) per week for sustainable weight
              loss
            </div>
          </div>

          <button type="submit" className="calculate-btn">
            Calculate Weight Loss Plan
          </button>
        </form>

        {calories !== null && (
          <div className="result-container">
            <h3>Your Weight Loss Plan</h3>

            <div className="wl-results">
              <div className="result-card primary">
                <div className="result-label">Daily Calories</div>
                <div className="result-value">{calories}</div>
                <div className="result-unit">kcal/day</div>
              </div>

              <div className="result-card secondary">
                <div className="result-label">BMR</div>
                <div className="result-value">{bmr}</div>
                <div className="result-unit">kcal/day</div>
              </div>

              <div className="result-card secondary">
                <div className="result-label">TDEE</div>
                <div className="result-value">{tdee}</div>
                <div className="result-unit">kcal/day</div>
              </div>
            </div>

            <div className="goal-analysis">
              <div
                className={`goal-category ${getWeightLossCategory(
                  goalUnit === "kg"
                    ? parseFloat(goal)
                    : parseFloat(goal) * 0.453592
                )
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {getWeightLossCategory(
                  goalUnit === "kg"
                    ? parseFloat(goal)
                    : parseFloat(goal) * 0.453592
                )}{" "}
                Goal
              </div>
              <div className="deficit-info">
                Daily calorie deficit: {tdee && calories ? tdee - calories : 0}{" "}
                kcal
              </div>
            </div>

            <div className="wl-info">
              <FaInfoCircle className="info-icon" />
              <div>
                <p>
                  <strong>BMR (Basal Metabolic Rate):</strong> Calories your
                  body needs at rest.
                </p>
                <p>
                  <strong>TDEE (Total Daily Energy Expenditure):</strong> Total
                  calories you burn including activity.
                </p>
                <p>
                  <strong>Important:</strong> Don't go below 1200 kcal/day
                  (women) or 1500 kcal/day (men) without medical supervision.
                  Sustainable weight loss is 0.5-1 kg (1-2 lbs) per week.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightLossCalculator;
