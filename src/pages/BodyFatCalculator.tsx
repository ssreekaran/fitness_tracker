import React, { useState } from "react";
import { FaRuler, FaInfoCircle, FaRulerHorizontal } from "react-icons/fa";
import "./BodyFatCalculator.css";

const BodyFatCalculator: React.FC = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [neck, setNeck] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [neckUnit, setNeckUnit] = useState<"cm" | "in">("cm");
  const [waistUnit, setWaistUnit] = useState<"cm" | "in">("cm");
  const [circumferenceUnit, setCircumferenceUnit] = useState<"cm" | "in">("cm"); // legacy, will be removed

  const calculateBodyFat = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert all measurements to cm
    let heightCm = parseFloat(height);
    let neckCm = parseFloat(neck);
    let waistCm = parseFloat(waist);
    let hipCm = parseFloat(hip);
    if (heightUnit === "in") heightCm *= 2.54;
    if (neckUnit === "in") neckCm *= 2.54;
    if (waistUnit === "in") waistCm *= 2.54;
    if (circumferenceUnit === "in") hipCm *= 2.54; // Only for hip, as neck/waist now have their own units
    // U.S. Navy Method
    let bf = 0;
    if (gender === "male") {
      bf =
        495 /
          (1.0324 -
            0.19077 * Math.log10(waistCm - neckCm) +
            0.15456 * Math.log10(heightCm)) -
        450;
    } else {
      bf =
        495 /
          (1.29579 -
            0.35004 * Math.log10(waistCm + hipCm - neckCm) +
            0.221 * Math.log10(heightCm)) -
        450;
    }
    setBodyFat(parseFloat(bf.toFixed(1)));
    // Category (simplified)
    if (gender === "male") {
      if (bf < 6) setCategory("Essential fat");
      else if (bf < 14) setCategory("Athletes");
      else if (bf < 18) setCategory("Fitness");
      else if (bf < 25) setCategory("Average");
      else setCategory("Obese");
    } else {
      if (bf < 14) setCategory("Essential fat");
      else if (bf < 21) setCategory("Athletes");
      else if (bf < 25) setCategory("Fitness");
      else if (bf < 32) setCategory("Average");
      else setCategory("Obese");
    }
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="bf-hero">
        <div className="bf-hero-content">
          <h1>Body Fat Calculator</h1>
          <p>
            Estimate your body fat percentage using the U.S. Navy method with
            just a few measurements.
          </p>
        </div>
        <div className="calculator-icon">
          <FaRuler />
        </div>
      </section>

      <div className="bf-calculator">
        <form onSubmit={calculateBodyFat} className="bf-form">
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

          {/* Neck Circumference */}
          <div className="form-group">
            <div className="form-header">
              <label>Neck Circumference</label>
              <div className="unit-toggle">
                <button
                  type="button"
                  className={`unit-btn ${neckUnit === "cm" ? "active" : ""}`}
                  onClick={() => setNeckUnit("cm")}
                >
                  cm
                </button>
                <button
                  type="button"
                  className={`unit-btn ${neckUnit === "in" ? "active" : ""}`}
                  onClick={() => setNeckUnit("in")}
                >
                  in
                </button>
              </div>
            </div>
            <div className="input-with-icon">
              <FaRulerHorizontal className="input-icon" />
              <input
                type="number"
                value={neck}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNeck(e.target.value)
                }
                placeholder={neckUnit === "cm" ? "Neck (cm)" : "Neck (in)"}
                required
                min={neckUnit === "cm" ? 20 : 8}
                max={neckUnit === "cm" ? 80 : 32}
                step="0.1"
                className="measurement-input"
              />
            </div>
          </div>

          {/* Waist Circumference */}
          <div className="form-group">
            <div className="form-header">
              <label>Waist Circumference</label>
              <div className="unit-toggle">
                <button
                  type="button"
                  className={`unit-btn ${waistUnit === "cm" ? "active" : ""}`}
                  onClick={() => setWaistUnit("cm")}
                >
                  cm
                </button>
                <button
                  type="button"
                  className={`unit-btn ${waistUnit === "in" ? "active" : ""}`}
                  onClick={() => setWaistUnit("in")}
                >
                  in
                </button>
              </div>
            </div>
            <div className="input-with-icon">
              <FaRulerHorizontal className="input-icon" />
              <input
                type="number"
                value={waist}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setWaist(e.target.value)
                }
                placeholder={waistUnit === "cm" ? "Waist (cm)" : "Waist (in)"}
                required
                min={waistUnit === "cm" ? 30 : 12}
                max={waistUnit === "cm" ? 200 : 80}
                step="0.1"
                className="measurement-input"
              />
            </div>
            <div className="input-hint">
              Measure at the narrowest point for men, or at the navel for women
            </div>
          </div>

          {/* Hip Circumference (only for women) */}
          {gender === "female" && (
            <div className="form-group">
              <div className="form-header">
                <label>Hip Circumference</label>
                <div className="unit-toggle">
                  <button
                    type="button"
                    className={`unit-btn ${
                      circumferenceUnit === "cm" ? "active" : ""
                    }`}
                    onClick={() => setCircumferenceUnit("cm")}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    className={`unit-btn ${
                      circumferenceUnit === "in" ? "active" : ""
                    }`}
                    onClick={() => setCircumferenceUnit("in")}
                  >
                    in
                  </button>
                </div>
              </div>
              <div className="input-with-icon">
                <FaRulerHorizontal className="input-icon" />
                <input
                  type="number"
                  value={hip}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setHip(e.target.value)
                  }
                  placeholder={
                    circumferenceUnit === "cm" ? "Hip (cm)" : "Hip (in)"
                  }
                  required
                  min={circumferenceUnit === "cm" ? 30 : 12}
                  max={circumferenceUnit === "cm" ? 200 : 80}
                  step="0.1"
                  className="measurement-input"
                />
              </div>
              <div className="input-hint">
                Measure at the widest part of your hips
              </div>
            </div>
          )}

          <button type="submit" className="calculate-btn">
            Calculate Body Fat
          </button>
        </form>

        {bodyFat !== null && (
          <div className="result-container">
            <h3>Your Results</h3>
            <div className="bf-result">
              <div className="bf-value">{bodyFat}%</div>
              <div
                className={`bf-category ${category
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {category}
              </div>
            </div>

            <div className="bf-scale">
              <div className="scale-labels">
                <span>Essential</span>
                <span>{gender === "male" ? "Athletes" : "Essential"}</span>
                <span>{gender === "male" ? "Fitness" : "Athletes"}</span>
                <span>{gender === "male" ? "Average" : "Fitness"}</span>
                <span>{gender === "male" ? "Obese" : "Average"}</span>
                <span>{gender === "female" ? "Obese" : ""}</span>
              </div>
              <div className="scale-bar">
                <div
                  className="scale-indicator"
                  style={{
                    left:
                      gender === "male"
                        ? `${Math.min(100, Math.max(0, (bodyFat - 2) * 3.33))}%`
                        : `${Math.min(
                            100,
                            Math.max(0, (bodyFat - 10) * 2.5)
                          )}%`,
                  }}
                >
                  <div className="indicator-line"></div>
                  <div className="indicator-dot"></div>
                </div>
              </div>
              <div className="scale-markers">
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
              </div>
              <div className="scale-values">
                <span>{gender === "male" ? "2-5%" : "10-13%"}</span>
                <span>{gender === "male" ? "6-13%" : "14-20%"}</span>
                <span>{gender === "male" ? "14-17%" : "21-24%"}</span>
                <span>{gender === "male" ? "18-24%" : "25-31%"}</span>
                <span>{gender === "male" ? "25%+" : "32%+"}</span>
              </div>
            </div>

            <div className="bf-info">
              <FaInfoCircle className="info-icon" />
              <p>
                This calculator uses the U.S. Navy method to estimate body fat
                percentage. For best results, take measurements in the morning
                before eating or exercising, and ensure the tape is level and
                snug but not compressing the skin.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyFatCalculator;
