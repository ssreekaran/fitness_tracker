import React, { useState } from "react";
import { Container, Form, Button, Alert, ButtonGroup } from "react-bootstrap";
import "./BMICalculator.css";

const activityLevels = [
  { label: "Sedentary (little or no exercise)", value: 1.2 },
  { label: "Lightly active (light exercise/sports 1-3 days/week)", value: 1.375 },
  { label: "Moderately active (moderate exercise/sports 3-5 days/week)", value: 1.55 },
  { label: "Very active (hard exercise/sports 6-7 days a week)", value: 1.725 },
  { label: "Super active (very hard exercise & a physical job)", value: 1.9 },
];

function calculateBMR(gender: string, weight: number, height: number, age: number) {
  if (gender === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }
}

const WeightLossCalculator: React.FC = () => {
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState(170); // default cm or in
  const [weight, setWeight] = useState(70); // default kg or lbs
  const [activity, setActivity] = useState(1.2);
  const [goal, setGoal] = useState(0.5); // default kg or lbs per week
  const [calories, setCalories] = useState<number | null>(null);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>("cm");
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>("kg");
  const [goalUnit, setGoalUnit] = useState<'kg' | 'lbs'>("kg");

  const handleHeightUnitChange = (unit: 'cm' | 'in') => {
    setHeightUnit(unit);
    setHeight(unit === 'cm' ? 170 : 67); // reasonable default
    setCalories(null);
  };

  const handleWeightUnitChange = (unit: 'kg' | 'lbs') => {
    setWeightUnit(unit);
    setWeight(unit === 'kg' ? 70 : 154);
    setCalories(null);
  };

  const handleGoalUnitChange = (unit: 'kg' | 'lbs') => {
    setGoalUnit(unit);
    setGoal(unit === 'kg' ? 0.5 : 1.1);
    setCalories(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert all to metric for calculation
    let heightCm = heightUnit === 'cm' ? height : height * 2.54;
    let weightKg = weightUnit === 'kg' ? weight : weight * 0.453592;
    let goalKg = goalUnit === 'kg' ? goal : goal * 0.453592;
    const bmr = calculateBMR(gender, weightKg, heightCm, age);
    const tdee = bmr * activity;
    // 1 kg fat ≈ 7700 kcal, so goalKg/week = (goalKg*7700)/7 kcal deficit/day
    const deficit = goalKg * 7700 / 7;
    setCalories(Math.round(tdee - deficit));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Weight Loss Calculator</h1>
      <Container className="bmi-calculator">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Age</Form.Label>
            <Form.Control type="number" value={age} min={10} max={100} onChange={e => setAge(Number(e.target.value))} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Form.Label className="mb-0">Sex</Form.Label>
              <ButtonGroup size="sm">
                <Button
                  variant={gender === "male" ? "primary" : "outline-primary"}
                  onClick={e => { e.preventDefault(); setGender("male"); }}
                >
                  Male
                </Button>
                <Button
                  variant={gender === "female" ? "primary" : "outline-primary"}
                  onClick={e => { e.preventDefault(); setGender("female"); }}
                >
                  Female
                </Button>
              </ButtonGroup>
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Form.Label className="mb-0">Height</Form.Label>
              <Form.Control
                type="number"
                value={height}
                min={heightUnit === 'cm' ? 100 : 39}
                max={heightUnit === 'cm' ? 250 : 98}
                onChange={e => setHeight(Number(e.target.value))}
                required
                placeholder={heightUnit === 'cm' ? 'Height (centimeters)' : 'Height (inches)'}
                className="measurement-input"
                style={{ width: '140px' }}
              />
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
          </Form.Group>
          <Form.Group className="mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Form.Label className="mb-0">Weight</Form.Label>
              <Form.Control
                type="number"
                value={weight}
                min={weightUnit === 'kg' ? 30 : 66}
                max={weightUnit === 'kg' ? 300 : 660}
                onChange={e => setWeight(Number(e.target.value))}
                required
                placeholder={weightUnit === 'kg' ? 'Weight (kilograms)' : 'Weight (pounds)'}
                className="measurement-input"
                style={{ width: '140px' }}
              />
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
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Activity Level</Form.Label>
            <Form.Select value={activity} onChange={e => setActivity(Number(e.target.value))}>
              {activityLevels.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label>Weight Loss Goal</Form.Label>
              <ButtonGroup size="sm">
                <Button
                  variant={goalUnit === 'kg' ? 'primary' : 'outline-primary'}
                  onClick={() => handleGoalUnitChange('kg')}
                >
                  kg/week
                </Button>
                <Button
                  variant={goalUnit === 'lbs' ? 'primary' : 'outline-primary'}
                  onClick={() => handleGoalUnitChange('lbs')}
                >
                  lbs/week
                </Button>
              </ButtonGroup>
            </div>
            <Form.Control
              type="number"
              value={goal}
              min={goalUnit === 'kg' ? 0.1 : 0.2}
              max={goalUnit === 'kg' ? 1.5 : 3.3}
              step={0.1}
              onChange={e => setGoal(Number(e.target.value))}
              required
              placeholder={goalUnit === 'kg' ? 'Goal (kg per week)' : 'Goal (lbs per week)'}
              className="measurement-input"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="calculate-button">Calculate</Button>
        </Form>
        {calories !== null && (
          <Alert variant="info" className="mt-3">
            <h4>Recommended daily calories for your goal: {calories} kcal</h4>
          </Alert>
        )}
      </Container>
    </div>
  );
};

export default WeightLossCalculator;
