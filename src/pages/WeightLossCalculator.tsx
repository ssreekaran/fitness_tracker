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
  const [height, setHeight] = useState(170); // cm
  const [weight, setWeight] = useState(70); // kg
  const [activity, setActivity] = useState(1.2);
  const [goal, setGoal] = useState(0.5); // kg per week
  const [calories, setCalories] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bmr = calculateBMR(gender, weight, height, age);
    const tdee = bmr * activity;
    // 1 kg fat ≈ 7700 kcal, so 0.5 kg/week = 3850 kcal deficit/week ≈ 550 kcal/day
    const deficit = goal * 7700 / 7;
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
            <Form.Label>Sex</Form.Label>
            <ButtonGroup className="mb-2">
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
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Height (cm)</Form.Label>
            <Form.Control type="number" value={height} min={100} max={250} onChange={e => setHeight(Number(e.target.value))} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Weight (kg)</Form.Label>
            <Form.Control type="number" value={weight} min={30} max={300} onChange={e => setWeight(Number(e.target.value))} required />
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
            <Form.Label>Weight Loss Goal (kg per week)</Form.Label>
            <Form.Control type="number" value={goal} min={0.1} max={1.5} step={0.1} onChange={e => setGoal(Number(e.target.value))} required />
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
