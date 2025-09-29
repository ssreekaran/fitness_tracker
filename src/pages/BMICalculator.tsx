import React, { useState } from 'react';
import { FaCalculator, FaInfoCircle } from 'react-icons/fa';
import './BMICalculator.css';

const BMICalculator: React.FC = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert height to meters
    let heightInMeters: number;
    if (heightUnit === 'cm') {
      heightInMeters = parseFloat(height) / 100;
    } else {
      heightInMeters = parseFloat(height) * 0.0254; // Convert inches to meters
    }

    // Convert weight to kg
    let weightInKg: number;
    if (weightUnit === 'kg') {
      weightInKg = parseFloat(weight);
    } else {
      weightInKg = parseFloat(weight) * 0.453592; // Convert pounds to kg
    }
    
    if (heightInMeters > 0 && weightInKg > 0) {
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(parseFloat(bmiValue.toFixed(1)));
      
      // Determine BMI category
      if (bmiValue < 18.5) setCategory('Underweight');
      else if (bmiValue < 25) setCategory('Normal weight');
      else if (bmiValue < 30) setCategory('Overweight');
      else setCategory('Obese');
    }
  };

  // Clear form when units change
  const handleHeightUnitChange = (unit: 'cm' | 'in') => {
    setHeightUnit(unit);
    setHeight('');
    setBmi(null);
    setCategory('');
  };

  const handleWeightUnitChange = (unit: 'kg' | 'lbs') => {
    setWeightUnit(unit);
    setWeight('');
    setBmi(null);
    setCategory('');
  };

  const getHeightPlaceholder = () => {
    return heightUnit === 'cm' ? 'Height (centimeters)' : 'Height (inches)';
  };

  const getWeightPlaceholder = () => {
    return weightUnit === 'kg' ? 'Weight (kilograms)' : 'Weight (pounds)';
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="bmi-hero">
        <div className="bmi-hero-content">
          <h1>BMI Calculator</h1>
          <p>Calculate your Body Mass Index to understand your weight status and potential health risks.</p>
        </div>
        <div className="calculator-icon">
          <FaCalculator />
        </div>
      </section>

      <div className="bmi-calculator">
        <form onSubmit={calculateBMI} className="bmi-form">
          <div className="form-group">
            <div className="form-header">
              <label>Height</label>
              <div className="unit-toggle">
                <button 
                  type="button"
                  className={`unit-btn ${heightUnit === 'cm' ? 'active' : ''}`}
                  onClick={() => handleHeightUnitChange('cm')}
                >
                  cm
                </button>
                <button 
                  type="button"
                  className={`unit-btn ${heightUnit === 'in' ? 'active' : ''}`}
                  onClick={() => handleHeightUnitChange('in')}
                >
                  in
                </button>
              </div>
            </div>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={getHeightPlaceholder()}
              required
              step="0.1"
              className="measurement-input"
            />
          </div>

          <div className="form-group">
            <div className="form-header">
              <label>Weight</label>
              <div className="unit-toggle">
                <button 
                  type="button"
                  className={`unit-btn ${weightUnit === 'kg' ? 'active' : ''}`}
                  onClick={() => handleWeightUnitChange('kg')}
                >
                  kg
                </button>
                <button 
                  type="button"
                  className={`unit-btn ${weightUnit === 'lbs' ? 'active' : ''}`}
                  onClick={() => handleWeightUnitChange('lbs')}
                >
                  lbs
                </button>
              </div>
            </div>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={getWeightPlaceholder()}
              required
              step="0.1"
              className="measurement-input"
            />
          </div>

          <button type="submit" className="calculate-btn">
            Calculate BMI
          </button>
        </form>

        {bmi !== null && (
          <div className="result-container">
            <h3>Your Results</h3>
            <div className="bmi-result">
              <div className="bmi-value">{bmi.toFixed(1)}</div>
              <div className={`bmi-category ${category.toLowerCase().replace(' ', '-')}`}>
                {category}
              </div>
            </div>
            <div className="bmi-info">
              <FaInfoCircle className="info-icon" />
              <p>
                BMI is a screening tool that provides a quick estimate of body fat based on height and weight.
                It's not a diagnostic tool and doesn't account for muscle mass, bone density, or overall health.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BMICalculator;
