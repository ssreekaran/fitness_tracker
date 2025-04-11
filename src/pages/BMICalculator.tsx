import React, { useState } from 'react';
import { Container, Form, Button, Alert, ButtonGroup } from 'react-bootstrap';
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
      <h1 className="page-title">BMI Calculator</h1>
      <Container className="bmi-calculator">
        <Form onSubmit={calculateBMI}>
          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label>Height</Form.Label>
              <ButtonGroup size="sm">
                <Button
                  variant={heightUnit === 'cm' ? 'primary' : 'outline-primary'}
                  onClick={() => handleHeightUnitChange('cm')}
                >
                  cm
                </Button>
                <Button
                  variant={heightUnit === 'in' ? 'primary' : 'outline-primary'}
                  onClick={() => handleHeightUnitChange('in')}
                >
                  in
                </Button>
              </ButtonGroup>
            </div>
            <Form.Control
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={getHeightPlaceholder()}
              required
              step="any"
              className="measurement-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label>Weight</Form.Label>
              <ButtonGroup size="sm">
                <Button
                  variant={weightUnit === 'kg' ? 'primary' : 'outline-primary'}
                  onClick={() => handleWeightUnitChange('kg')}
                >
                  kg
                </Button>
                <Button
                  variant={weightUnit === 'lbs' ? 'primary' : 'outline-primary'}
                  onClick={() => handleWeightUnitChange('lbs')}
                >
                  lbs
                </Button>
              </ButtonGroup>
            </div>
            <Form.Control
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={getWeightPlaceholder()}
              required
              step="any"
              className="measurement-input"
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="calculate-button">
            Calculate BMI
          </Button>
        </Form>

        {bmi !== null && (
          <Alert variant="info" className="mt-3">
            <h4>Your BMI: {bmi}</h4>
            <p>You are {category}.</p>
          </Alert>
        )}
      </Container>
    </div>
  );
};

export default BMICalculator;
