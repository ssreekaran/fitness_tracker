import React, { useState } from "react";
import { FaDumbbell, FaInfoCircle, FaWeight, FaRedoAlt } from "react-icons/fa";
import "./OneRepMaxCalculator.css";

const formulas = [
  {
    name: "Epley",
    formula: (weight: number, reps: number) => weight * (1 + reps / 30),
  },
  {
    name: "Brzycki",
    formula: (weight: number, reps: number) => weight * (36 / (37 - reps)),
  },
  {
    name: "Lander",
    formula: (weight: number, reps: number) =>
      (100 * weight) / (101.3 - 2.67123 * reps),
  },
  {
    name: "Lombardi",
    formula: (weight: number, reps: number) => weight * Math.pow(reps, 0.1),
  },
  {
    name: "Mayhew",
    formula: (weight: number, reps: number) =>
      (100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * reps)),
  },
  {
    name: "O'Conner",
    formula: (weight: number, reps: number) => weight * (1 + 0.025 * reps),
  },
];

const exercises = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Incline Bench Press",
  "Front Squat",
  "Sumo Deadlift",
  "Close Grip Bench Press",
  "Romanian Deadlift",
  "Bulgarian Split Squat",
  "Dumbbell Press",
  "Other",
];

const OneRepMaxCalculator: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [exercise, setExercise] = useState("Bench Press");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [oneRepMax, setOneRepMax] = useState<{ [key: string]: number } | null>(
    null
  );
  const [percentages, setPercentages] = useState<number[] | null>(null);

  const calculateOneRepMax = (e: React.FormEvent) => {
    e.preventDefault();

    const weightValue = parseFloat(weight);
    const repsValue = parseInt(reps);

    if (repsValue === 1) {
      // If already 1 rep, that's the 1RM
      const result = { Actual: weightValue };
      setOneRepMax(result);
    } else if (repsValue > 12) {
      // Most formulas become inaccurate above 12 reps
      alert(
        "For best accuracy, use weights you can lift for 12 reps or fewer."
      );
      return;
    } else {
      const results: { [key: string]: number } = {};

      formulas.forEach((formula) => {
        const result = formula.formula(weightValue, repsValue);
        results[formula.name] = Math.round(result * 10) / 10; // Round to 1 decimal
      });

      setOneRepMax(results);
    }

    // Calculate percentage-based training loads
    const avgOneRM =
      Object.values(oneRepMax || {}).reduce((a, b) => a + b, 0) /
      Object.values(oneRepMax || {}).length;
    const finalOneRM = repsValue === 1 ? weightValue : avgOneRM;

    const trainingPercentages = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
    const trainingWeights = trainingPercentages.map(
      (percentage) => Math.round(((finalOneRM * percentage) / 100) * 10) / 10
    );

    setPercentages(trainingWeights);
  };

  const getAverageOneRM = () => {
    if (!oneRepMax) return 0;
    const values = Object.values(oneRepMax);
    return (
      Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
    );
  };

  const getRepRange = (percentage: number) => {
    if (percentage >= 95) return "1 rep";
    if (percentage >= 90) return "1-2 reps";
    if (percentage >= 85) return "2-4 reps";
    if (percentage >= 80) return "4-6 reps";
    if (percentage >= 75) return "6-8 reps";
    if (percentage >= 70) return "8-10 reps";
    if (percentage >= 65) return "10-12 reps";
    if (percentage >= 60) return "12-15 reps";
    if (percentage >= 55) return "15-18 reps";
    return "18+ reps";
  };

  const getTrainingFocus = (percentage: number) => {
    if (percentage >= 90) return "Max Strength";
    if (percentage >= 80) return "Strength";
    if (percentage >= 70) return "Strength/Hypertrophy";
    if (percentage >= 60) return "Hypertrophy";
    return "Endurance";
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="calculator-hero orm-hero">
        <div className="calculator-hero-content">
          <h1>One Rep Max Calculator</h1>
          <p>
            Estimate your maximum lift capacity and plan your training loads
            based on proven formulas.
          </p>
        </div>
        <div className="calculator-icon">
          <FaDumbbell />
        </div>
      </section>

      <div className="calculator-form orm-calculator">
        <form onSubmit={calculateOneRepMax} className="orm-form">
          {/* Exercise Selection */}
          <div className="form-group">
            <div className="form-header">
              <label>Exercise</label>
            </div>
            <div className="input-with-icon">
              <FaDumbbell className="input-icon" />
              <select
                value={exercise}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setExercise(e.target.value)
                }
                className="measurement-input activity-select"
                required
              >
                {exercises.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weight */}
          <div className="form-group">
            <div className="form-header">
              <label>Weight Lifted</label>
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
                placeholder={`Weight (${weightUnit})`}
                required
                min={weightUnit === "kg" ? 10 : 20}
                max={weightUnit === "kg" ? 500 : 1100}
                step="0.5"
                className="measurement-input"
              />
            </div>
          </div>

          {/* Repetitions */}
          <div className="form-group">
            <div className="form-header">
              <label>Repetitions Completed</label>
            </div>
            <div className="input-with-icon">
              <FaRedoAlt className="input-icon" />
              <input
                type="number"
                value={reps}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setReps(e.target.value)
                }
                placeholder="Number of reps"
                required
                min={1}
                max={20}
                className="measurement-input"
              />
            </div>
            <div className="input-hint">
              For best accuracy, use weights you can lift for 1-12 reps
            </div>
          </div>

          <button type="submit" className="calculate-btn">
            Calculate 1RM
          </button>
        </form>

        {oneRepMax !== null && (
          <div className="result-container">
            <h3>Your One Rep Max Results</h3>

            <div className="exercise-info">
              <strong>Exercise:</strong> {exercise}
              <br />
              <strong>Test Weight:</strong> {weight} {weightUnit} × {reps} reps
            </div>

            {parseInt(reps) === 1 ? (
              <div className="orm-results">
                <div className="result-card primary">
                  <div className="result-label">Actual 1RM</div>
                  <div className="result-value">{oneRepMax.Actual}</div>
                  <div className="result-unit">{weightUnit}</div>
                </div>
              </div>
            ) : (
              <>
                <div className="orm-results">
                  <div className="result-card primary">
                    <div className="result-label">Average 1RM</div>
                    <div className="result-value">{getAverageOneRM()}</div>
                    <div className="result-unit">{weightUnit}</div>
                  </div>
                </div>

                <div className="formula-results">
                  <h4>Results by Formula</h4>
                  <div className="formula-grid">
                    {Object.entries(oneRepMax).map(([formula, value]) => (
                      <div key={formula} className="formula-card">
                        <div className="formula-name">{formula}</div>
                        <div className="formula-value">
                          {value} {weightUnit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {percentages && (
              <div className="training-loads">
                <h4>Training Load Recommendations</h4>
                <div className="percentage-table">
                  {[95, 90, 85, 80, 75, 70, 65, 60, 55, 50].map(
                    (percentage, index) => (
                      <div key={percentage} className="percentage-row">
                        <div className="percentage-label">{percentage}%</div>
                        <div className="percentage-weight">
                          {percentages[index]} {weightUnit}
                        </div>
                        <div className="percentage-reps">
                          {getRepRange(percentage)}
                        </div>
                        <div className="percentage-focus">
                          {getTrainingFocus(percentage)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="orm-info">
              <FaInfoCircle className="info-icon" />
              <div>
                <p>
                  <strong>1RM (One Rep Max):</strong> The maximum weight you can
                  lift for a single repetition with proper form.
                </p>
                <p>
                  <strong>Training Recommendations:</strong> Use 70-85% of your
                  1RM for strength training, 60-75% for hypertrophy, and 50-65%
                  for endurance work.
                </p>
                <p>
                  <strong>Safety Note:</strong> Always warm up properly and
                  consider having a spotter when attempting heavy lifts. These
                  are estimates - actual performance may vary.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OneRepMaxCalculator;
