import React, { useState } from "react";
import { FaHeartbeat, FaInfoCircle, FaRunning } from "react-icons/fa";
import "./HeartRateZoneCalculator.css";

const methods = [
  {
    name: "Age-Based (220 - Age)",
    value: "age",
    description: "Simple formula using age only",
  },
  {
    name: "Karvonen (Heart Rate Reserve)",
    value: "karvonen",
    description: "More accurate, uses resting heart rate",
  },
];

const zones = [
  {
    name: "Zone 1 - Recovery",
    range: [50, 60],
    color: "#95a5a6",
    description: "Active recovery, very light intensity",
    benefits: "Recovery, fat burning, base fitness",
  },
  {
    name: "Zone 2 - Aerobic Base",
    range: [60, 70],
    color: "#3498db",
    description: "Comfortable, conversational pace",
    benefits: "Fat burning, aerobic base building, endurance",
  },
  {
    name: "Zone 3 - Aerobic",
    range: [70, 80],
    color: "#2ecc71",
    description: "Moderate intensity, slightly breathless",
    benefits: "Aerobic fitness, endurance improvement",
  },
  {
    name: "Zone 4 - Lactate Threshold",
    range: [80, 90],
    color: "#f39c12",
    description: "Hard intensity, challenging but sustainable",
    benefits: "Lactate threshold, race pace training",
  },
  {
    name: "Zone 5 - Neuromuscular Power",
    range: [90, 100],
    color: "#e74c3c",
    description: "Maximum intensity, very hard effort",
    benefits: "VO2 max, anaerobic power, speed",
  },
];

const HeartRateZoneCalculator: React.FC = () => {
  const [age, setAge] = useState("");
  const [restingHR, setRestingHR] = useState("");
  const [method, setMethod] = useState("karvonen");
  const [maxHR, setMaxHR] = useState<number | null>(null);
  const [heartRateZones, setHeartRateZones] = useState<{
    [key: string]: [number, number];
  } | null>(null);

  const calculateHeartRateZones = (e: React.FormEvent) => {
    e.preventDefault();

    const ageValue = parseInt(age);
    const restingHRValue = method === "karvonen" ? parseInt(restingHR) : 0;

    // Calculate maximum heart rate
    let maxHeartRate: number;
    if (method === "age") {
      maxHeartRate = 220 - ageValue;
    } else {
      // Karvonen method also uses 220 - age for max HR
      maxHeartRate = 220 - ageValue;
    }

    setMaxHR(maxHeartRate);

    // Calculate zones
    const calculatedZones: { [key: string]: [number, number] } = {};

    zones.forEach((zone) => {
      let lowerBound: number;
      let upperBound: number;

      if (method === "age") {
        // Simple age-based method
        lowerBound = Math.round(maxHeartRate * (zone.range[0] / 100));
        upperBound = Math.round(maxHeartRate * (zone.range[1] / 100));
      } else {
        // Karvonen method (Heart Rate Reserve)
        const heartRateReserve = maxHeartRate - restingHRValue;
        lowerBound = Math.round(
          heartRateReserve * (zone.range[0] / 100) + restingHRValue
        );
        upperBound = Math.round(
          heartRateReserve * (zone.range[1] / 100) + restingHRValue
        );
      }

      calculatedZones[zone.name] = [lowerBound, upperBound];
    });

    setHeartRateZones(calculatedZones);
  };

  const getMethodDescription = () => {
    return methods.find((m) => m.value === method)?.description || "";
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hr-hero">
        <div className="hr-hero-content">
          <h1>Heart Rate Zone Calculator</h1>
          <p>
            Calculate your target heart rate zones for optimal training
            intensity and cardiovascular fitness.
          </p>
        </div>
        <div className="calculator-icon">
          <FaHeartbeat />
        </div>
      </section>

      <div className="hr-calculator">
        <form onSubmit={calculateHeartRateZones} className="hr-form">
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
                max={100}
                className="measurement-input"
              />
            </div>
          </div>

          {/* Method Selection */}
          <div className="form-group">
            <div className="form-header">
              <label>Calculation Method</label>
            </div>
            <div className="method-options">
              {methods.map((methodOption) => (
                <button
                  key={methodOption.value}
                  type="button"
                  className={`method-btn ${
                    method === methodOption.value ? "active" : ""
                  }`}
                  onClick={() => setMethod(methodOption.value)}
                >
                  <div className="method-name">{methodOption.name}</div>
                  <div className="method-description">
                    {methodOption.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resting Heart Rate (only for Karvonen method) */}
          {method === "karvonen" && (
            <div className="form-group">
              <div className="form-header">
                <label>Resting Heart Rate</label>
              </div>
              <div className="input-with-icon">
                <FaHeartbeat className="input-icon" />
                <input
                  type="number"
                  value={restingHR}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRestingHR(e.target.value)
                  }
                  placeholder="Resting HR (bpm)"
                  required
                  min={30}
                  max={100}
                  className="measurement-input"
                />
              </div>
              <div className="input-hint">
                Measure your resting heart rate first thing in the morning
                before getting out of bed
              </div>
            </div>
          )}

          <button type="submit" className="calculate-btn">
            Calculate Heart Rate Zones
          </button>
        </form>

        {heartRateZones !== null && (
          <div className="result-container">
            <h3>Your Heart Rate Zones</h3>

            <div className="hr-summary">
              <div className="summary-item">
                <strong>Method:</strong>{" "}
                {methods.find((m) => m.value === method)?.name}
              </div>
              <div className="summary-item">
                <strong>Max Heart Rate:</strong> {maxHR} bpm
              </div>
              {method === "karvonen" && (
                <div className="summary-item">
                  <strong>Resting Heart Rate:</strong> {restingHR} bpm
                </div>
              )}
            </div>

            <div className="zones-container">
              {zones.map((zone, index) => {
                const [lower, upper] = heartRateZones[zone.name] || [0, 0];
                return (
                  <div
                    key={zone.name}
                    className="zone-card"
                    style={{ borderLeftColor: zone.color }}
                  >
                    <div className="zone-header">
                      <div className="zone-name">{zone.name}</div>
                      <div className="zone-range" style={{ color: zone.color }}>
                        {lower} - {upper} bpm
                      </div>
                    </div>
                    <div className="zone-description">{zone.description}</div>
                    <div className="zone-benefits">
                      <strong>Benefits:</strong> {zone.benefits}
                    </div>
                    <div className="zone-bar">
                      <div
                        className="zone-fill"
                        style={{
                          backgroundColor: zone.color,
                          width: `${zone.range[1] - zone.range[0]}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="training-recommendations">
              <h4>Training Recommendations</h4>
              <div className="recommendation-grid">
                <div className="recommendation-card">
                  <div className="rec-title">Beginner</div>
                  <div className="rec-zones">Focus on Zones 1-2</div>
                  <div className="rec-description">
                    Build aerobic base and improve fat burning
                  </div>
                </div>
                <div className="recommendation-card">
                  <div className="rec-title">Intermediate</div>
                  <div className="rec-zones">Mix of Zones 2-4</div>
                  <div className="rec-description">
                    Develop endurance and lactate threshold
                  </div>
                </div>
                <div className="recommendation-card">
                  <div className="rec-title">Advanced</div>
                  <div className="rec-zones">All Zones 1-5</div>
                  <div className="rec-description">
                    Periodized training across all intensities
                  </div>
                </div>
              </div>
            </div>

            <div className="hr-info">
              <FaInfoCircle className="info-icon" />
              <div>
                <p>
                  <strong>Heart Rate Zones:</strong> Training in different heart
                  rate zones targets specific physiological adaptations and
                  energy systems.
                </p>
                <p>
                  <strong>Karvonen Method:</strong> More accurate as it
                  considers your resting heart rate and calculates based on
                  heart rate reserve.
                </p>
                <p>
                  <strong>Training Tips:</strong> Spend 80% of your training
                  time in Zones 1-2 and 20% in Zones 3-5 for optimal endurance
                  development.
                </p>
                <p>
                  <strong>Note:</strong> These are estimates. Individual
                  responses may vary. Consider getting a professional fitness
                  assessment for personalized zones.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeartRateZoneCalculator;
