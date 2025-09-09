import React, { useState } from 'react';
import { Container, Form, Button, ButtonGroup, Alert } from 'react-bootstrap';
import '../styles/CalculatorBase.css';
import './BodyFatCalculator.css';

const BodyFatCalculator: React.FC = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [neckUnit, setNeckUnit] = useState<'cm' | 'in'>('cm');
  const [waistUnit, setWaistUnit] = useState<'cm' | 'in'>('cm');
  const [circumferenceUnit, setCircumferenceUnit] = useState<'cm' | 'in'>('cm'); // legacy, will be removed

  const calculateBodyFat = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert all measurements to cm
    let heightCm = parseFloat(height);
    let neckCm = parseFloat(neck);
    let waistCm = parseFloat(waist);
    let hipCm = parseFloat(hip);
    if (heightUnit === 'in') heightCm *= 2.54;
    if (neckUnit === 'in') neckCm *= 2.54;
    if (waistUnit === 'in') waistCm *= 2.54;
    if (circumferenceUnit === 'in') hipCm *= 2.54; // Only for hip, as neck/waist now have their own units
    // U.S. Navy Method
    let bf = 0;
    if (gender === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
    } else {
      bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
    }
    setBodyFat(parseFloat(bf.toFixed(1)));
    // Category (simplified)
    if (gender === 'male') {
      if (bf < 6) setCategory('Essential fat');
      else if (bf < 14) setCategory('Athletes');
      else if (bf < 18) setCategory('Fitness');
      else if (bf < 25) setCategory('Average');
      else setCategory('Obese');
    } else {
      if (bf < 14) setCategory('Essential fat');
      else if (bf < 21) setCategory('Athletes');
      else if (bf < 25) setCategory('Fitness');
      else if (bf < 32) setCategory('Average');
      else setCategory('Obese');
    }
  };

  return (
    <div className="calculator-container">
      <h2 className="calculator-title">Body Fat Calculator</h2>
      <Container className="calculator-form mx-auto">
        <Form onSubmit={calculateBodyFat}>
            <Form.Group className="mb-4">
              <Form.Label className="mb-2">Age</Form.Label>
              <Form.Control
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                required
                min={10}
                max={120}
                placeholder="Enter your age"
                className="measurement-input"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                <div className="d-flex align-items-center gap-2">
                  <Form.Label className="mb-0">Gender</Form.Label>
                  <ButtonGroup size="sm">
                    <Button
                      variant={gender === 'male' ? 'primary' : 'outline-primary'}
                      onClick={e => { e.preventDefault(); setGender('male'); }}
                    >
                      Male
                    </Button>
                    <Button
                      variant={gender === 'female' ? 'primary' : 'outline-primary'}
                      onClick={e => { e.preventDefault(); setGender('female'); }}
                    >
                      Female
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label className="mb-2">Height</Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                required
                min={50}
                max={300}
                placeholder={heightUnit === 'cm' ? 'Height (cm)' : 'Height (in)'}
                className="measurement-input"
                style={{ width: '160px' }}
              />
              <ButtonGroup size="sm">
                <Button
                  variant={heightUnit === 'cm' ? 'primary' : 'outline-primary'}
                  onClick={e => { e.preventDefault(); setHeightUnit('cm'); }}
                >cm</Button>
                <Button
                  variant={heightUnit === 'in' ? 'primary' : 'outline-primary'}
                  onClick={e => { e.preventDefault(); setHeightUnit('in'); }}
                >in</Button>
              </ButtonGroup>
            </div>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label className="mb-2">Neck Circumference</Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type="number"
                value={neck}
                onChange={e => setNeck(e.target.value)}
                required
                min={neckUnit === 'cm' ? 20 : 8}
                max={neckUnit === 'cm' ? 80 : 32}
                placeholder={neckUnit === 'cm' ? 'Neck (cm)' : 'Neck (in)'}
                className="measurement-input"
                style={{ width: '160px' }}
              />
              <ButtonGroup size="sm">
                <Button
                  variant={neckUnit === 'cm' ? 'primary' : 'outline-primary'}
                  onClick={e => { e.preventDefault(); setNeckUnit('cm'); }}
                >cm</Button>
                <Button
                  variant={neckUnit === 'in' ? 'primary' : 'outline-primary'}
                  onClick={e => { e.preventDefault(); setNeckUnit('in'); }}
                >in</Button>
              </ButtonGroup>
            </div>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label className="mb-2">Waist Circumference</Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type="number"
                value={waist}
                onChange={e => setWaist(e.target.value)}
                required
                min={waistUnit === 'cm' ? 30 : 12}
                max={waistUnit === 'cm' ? 200 : 80}
                placeholder={waistUnit === 'cm' ? 'Waist (cm)' : 'Waist (in)'}
                className="measurement-input"
                style={{ width: '160px' }}
              />
              <ButtonGroup size="sm">
                <Button
                  variant={waistUnit === 'cm' ? 'primary' : 'outline-primary'}
                  onClick={e => { e.preventDefault(); setWaistUnit('cm'); }}
                >cm</Button>
                <Button
                  variant={waistUnit === 'in' ? 'primary' : 'outline-primary'}
                  onClick={e => { e.preventDefault(); setWaistUnit('in'); }}
                >in</Button>
              </ButtonGroup>
            </div>
          </Form.Group>
          
          {gender === 'female' && (
            <Form.Group className="mb-4">
              <Form.Label className="mb-2">Hip Circumference</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="number"
                  value={hip}
                  onChange={e => setHip(e.target.value)}
                  required
                  min={circumferenceUnit === 'cm' ? 30 : 12}
                  max={circumferenceUnit === 'cm' ? 200 : 80}
                  placeholder={circumferenceUnit === 'cm' ? 'Hip (cm)' : 'Hip (in)'}
                  className="measurement-input"
                  style={{ width: '160px' }}
                />
                <ButtonGroup size="sm">
                  <Button
                    variant={circumferenceUnit === 'cm' ? 'primary' : 'outline-primary'}
                    onClick={e => { e.preventDefault(); setCircumferenceUnit('cm'); }}
                  >cm</Button>
                  <Button
                    variant={circumferenceUnit === 'in' ? 'primary' : 'outline-primary'}
                    onClick={e => { e.preventDefault(); setCircumferenceUnit('in'); }}
                  >in</Button>
                </ButtonGroup>
              </div>
            </Form.Group>
          )}
          
          <div className="text-center mt-4">
            <Button variant="primary" type="submit" className="calculate-button">
              Calculate Body Fat
            </Button>
          </div>
          
          {bodyFat !== null && (
            <Alert variant="info" className="mt-4">
              <h4 className="text-center">Your Body Fat Percentage: {bodyFat}%</h4>
              <p className="text-center mb-0">Category: <strong>{category}</strong></p>
            </Alert>
          )}
        </Form>
      </Container>
    </div>
  );
};

export default BodyFatCalculator;
