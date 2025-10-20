import React, { useState } from "react";
import {
  FaPizzaSlice,
  FaInfoCircle,
  FaRuler,
  FaWeight,
  FaRunning,
  FaBullseye,
} from "react-icons/fa";
import "./MacroCalculator.css";

const activityLevels = [
  { label: "Sedentary (little or no exercise)", value: 1.2 },
  { label: "Lightly active (light exercise 1-3 days/week)", value: 1.375 },
  { label: "Moderately active (moderate exercise 3-5 days/week)", value: 1.55 },
  { label: "Very active (hard exercise 6-7 days/week)", value: 1.725 },
  { label: "Super active (very hard exercise & physical job)", value: 1.9 },
];

const goals = [
  {
    label: "Weight Loss",
    value: "loss",
    deficit: 0.8,
    description: "20% calorie deficit",
  },
  {
    label: "Maintenance",
    value: "maintenance",
    deficit: 1.0,
    description: "Maintain current weight",
  },
  {
    label: "Lean Gain",
    value: "lean",
    deficit: 1.1,
    description: "10% calorie surplus",
  },
  {
    label: "Muscle Gain",
    value: "gain",
    deficit: 1.2,
    description: "20% calorie surplus",
  },
];

const macroSplits = [
  { name: "Balanced", protein: 25, carbs: 45, fat: 30 },
  { name: "High Protein", protein: 35, carbs: 35, fat: 30 },
  { name: "Low Carb", protein: 30, carbs: 20, fat: 50 },
  { name: "Keto", protein: 25, carbs: 5, fat: 70 },
  { name: "Endurance", protein: 20, carbs: 55, fat: 25 },
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

const MacroCalculator: React.FC = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState(1.2);
  const [goal, setGoal] = useState("maintenance");
  const [macroSplit, setMacroSplit] = useState(0); // Index of macroSplits array
  const [calories, setCalories] = useState<number | null>(null);
  const [macros, setMacros] = useState<{
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");

  const calculateMacros = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert all to metric for calculation
    const heightCm =
      heightUnit === "cm" ? parseFloat(height) : parseFloat(height) * 2.54;
    const weightKg =
      weightUnit === "kg" ? parseFloat(weight) : parseFloat(weight) * 0.453592;

    const bmr = calculateBMR(gender, weightKg, heightCm, parseFloat(age));
    const tdee = bmr * activity;

    // Apply goal modifier
    const goalData = goals.find((g) => g.value === goal);
    const targetCalories = Math.round(tdee * (goalData?.deficit || 1.0));

    // Calculate macros based on selected split
    const split = macroSplits[macroSplit];
    const proteinCalories = Math.round(targetCalories * (split.protein / 100));
    const carbCalories = Math.round(targetCalories * (split.carbs / 100));
    const fatCalories = Math.round(targetCalories * (split.fat / 100));

    // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
    const proteinGrams = Math.round(proteinCalories / 4);
    const carbGrams = Math.round(carbCalories / 4);
    const fatGrams = Math.round(fatCalories / 9);

    setCalories(targetCalories);
    setMacros({
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
    });
  };

  const getCurrentGoal = () => {
    return goals.find((g) => g.value === goal);
  };

  const getCurrentSplit = () => {
    return macroSplits[macroSplit];
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="calculator-hero macro-hero">
        <div className="calculator-hero-content">
          <h1>Macro Calculator</h1>
          <p>
            Calculate your optimal protein, carbohydrate, and fat intake based
            on your goals and preferences.
          </p>
        </div>
        <div className="calculator-icon">
          <FaPizzaSlice />
        </div>
      </section>

      <div className="calculator-form macro-calculator">
        <form onSubmit={calculateMacros} className="macro-form">
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
          </div>

          {/* Goal */}
          <div className="form-group">
            <div className="form-header">
              <label>Goal</label>
            </div>
            <div className="input-with-icon">
              <FaBullseye className="input-icon" />
              <select
                value={goal}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setGoal(e.target.value)
                }
                className="measurement-input activity-select"
                required
              >
                {goals.map((goalOption) => (
                  <option key={goalOption.value} value={goalOption.value}>
                    {goalOption.label} - {goalOption.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Macro Split */}
          <div className="form-group">
            <div className="form-header">
              <label>Macro Split</label>
            </div>
            <div className="macro-split-options">
              {macroSplits.map((split, index) => (
                <button
                  key={index}
                  type="button"
                  className={`split-btn ${
                    macroSplit === index ? "active" : ""
                  }`}
                  onClick={() => setMacroSplit(index)}
                >
                  <div className="split-name">{split.name}</div>
                  <div className="split-ratios">
                    P: {split.protein}% | C: {split.carbs}% | F: {split.fat}%
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="calculate-btn">
            Calculate Macros
          </button>
        </form>

        {macros !== null && (
          <div className="result-container">
            <h3>Your Macro Plan</h3>

            <div className="macro-results">
              <div className="result-card primary">
                <div className="result-label">Daily Calories</div>
                <div className="result-value">{calories}</div>
                <div className="result-unit">kcal</div>
              </div>

              <div className="result-card protein">
                <div className="result-label">Protein</div>
                <div className="result-value">{macros.protein}</div>
                <div className="result-unit">grams</div>
              </div>

              <div className="result-card carbs">
                <div className="result-label">Carbs</div>
                <div className="result-value">{macros.carbs}</div>
                <div className="result-unit">grams</div>
              </div>

              <div className="result-card fat">
                <div className="result-label">Fat</div>
                <div className="result-value">{macros.fat}</div>
                <div className="result-unit">grams</div>
              </div>
            </div>

            <div className="goal-summary">
              <div className="current-goal">
                <strong>Goal:</strong> {getCurrentGoal()?.label} (
                {getCurrentGoal()?.description})
              </div>
              <div className="current-split">
                <strong>Split:</strong> {getCurrentSplit()?.name}
                (P: {getCurrentSplit()?.protein}%, C: {getCurrentSplit()?.carbs}
                %, F: {getCurrentSplit()?.fat}%)
              </div>
            </div>

            <div className="macro-breakdown">
              <h4>Macro Breakdown by Calories</h4>
              <div className="macro-bars">
                <div className="macro-bar">
                  <div className="macro-bar-label">
                    <span>Protein</span>
                    <span>{macros.protein * 4} kcal</span>
                  </div>
                  <div className="macro-bar-track">
                    <div
                      className="macro-bar-fill protein-bar"
                      style={{ width: `${getCurrentSplit()?.protein}%` }}
                    ></div>
                  </div>
                </div>

                <div className="macro-bar">
                  <div className="macro-bar-label">
                    <span>Carbs</span>
                    <span>{macros.carbs * 4} kcal</span>
                  </div>
                  <div className="macro-bar-track">
                    <div
                      className="macro-bar-fill carbs-bar"
                      style={{ width: `${getCurrentSplit()?.carbs}%` }}
                    ></div>
                  </div>
                </div>

                <div className="macro-bar">
                  <div className="macro-bar-label">
                    <span>Fat</span>
                    <span>{macros.fat * 9} kcal</span>
                  </div>
                  <div className="macro-bar-track">
                    <div
                      className="macro-bar-fill fat-bar"
                      style={{ width: `${getCurrentSplit()?.fat}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="macro-info">
              <FaInfoCircle className="info-icon" />
              <div>
                <p>
                  <strong>Protein:</strong> 4 calories per gram. Essential for
                  muscle building and repair.
                </p>
                <p>
                  <strong>Carbohydrates:</strong> 4 calories per gram. Primary
                  energy source for workouts and brain function.
                </p>
                <p>
                  <strong>Fat:</strong> 9 calories per gram. Important for
                  hormone production and nutrient absorption.
                </p>
                <p>
                  These are starting recommendations. Adjust based on your
                  progress and preferences over time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MacroCalculator;
