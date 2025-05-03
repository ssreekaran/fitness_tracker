import React, { useState } from 'react';
import { Container, Form, Button, ButtonGroup } from 'react-bootstrap';
import './PersonalFitness.css';

const PersonalFitness: React.FC = () => {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState('male');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with:', {
      age,
      height,
      weight,
      sex,
      heightUnit,
      weightUnit
    });
  };

  return (
    <Container className="personal-fitness-container">
      <div className="personal-fitness-content">
        <h1 className="personal-fitness-title">Personal Fitness Tracker</h1>
        <Form onSubmit={handleSubmit} className="personal-fitness-form">
          <Form.Group className="form-group">
            <Form.Label>Age</Form.Label>
            <Form.Control
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              className="measurement-input"
            />
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label>Height</Form.Label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Form.Control
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Enter your height"
                className="measurement-input"
                style={{ flex: 1 }}
              />
              <ButtonGroup>
                <Button
                  variant={heightUnit === 'cm' ? 'primary' : 'outline-primary'}
                  onClick={() => setHeightUnit('cm')}
                >
                  cm
                </Button>
                <Button
                  variant={heightUnit === 'in' ? 'primary' : 'outline-primary'}
                  onClick={() => setHeightUnit('in')}
                >
                  in
                </Button>
              </ButtonGroup>
            </div>
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label>Weight</Form.Label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Form.Control
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter your weight"
                className="measurement-input"
                style={{ flex: 1 }}
              />
              <ButtonGroup>
                <Button
                  variant={weightUnit === 'kg' ? 'primary' : 'outline-primary'}
                  onClick={() => setWeightUnit('kg')}
                >
                  kg
                </Button>
                <Button
                  variant={weightUnit === 'lbs' ? 'primary' : 'outline-primary'}
                  onClick={() => setWeightUnit('lbs')}
                >
                  lbs
                </Button>
              </ButtonGroup>
            </div>
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label>Sex</Form.Label>
            <Form.Select
              value={sex}
              onChange={(e) => setSex(e.target.value as 'male' | 'female')}
              className="measurement-input"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100">
            Submit
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default PersonalFitness;
