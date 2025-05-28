import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { getAuth } from 'firebase/auth';
import { saveFitnessData, getFitnessData, FitnessData, getBMICategory } from '../services/fitnessService';
import { useNavigate } from 'react-router-dom';
import './PersonalFitness.css';

const PersonalFitness: React.FC = () => {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!auth.currentUser) {
          navigate('/login');
          return;
        }
        
        const data = await getFitnessData();
        if (data) {
          setFitnessData(data);
          setAge(data.age.toString());
          setHeight(data.height.toFixed(1));
          setWeight(data.weight.toFixed(1));
          setSex(data.sex);
        }
      } catch (err) {
        setError('Failed to load fitness data');
        console.error('Error loading fitness data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate inputs
      if (!age || !height || !weight) {
        throw new Error('Please fill in all fields');
      }

      const ageNum = parseInt(age, 10);
      const heightNum = parseFloat(height);
      const weightNum = parseFloat(weight);

      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        throw new Error('Please enter a valid age between 1 and 120');
      }

      if (isNaN(heightNum) || heightNum <= 0) {
        throw new Error('Please enter a valid height');
      }

      if (isNaN(weightNum) || weightNum <= 0) {
        throw new Error('Please enter a valid weight');
      }

      // Save the data
      await saveFitnessData(
        {
          age: ageNum,
          height: heightNum,
          weight: weightNum,
          sex
        },
        heightUnit,
        weightUnit
      );
      
      // Show success message
      setSuccess('Fitness data saved successfully!');
      
      // Reload the data to show updated values
      const updatedData = await getFitnessData();
      if (updatedData) {
        setFitnessData(updatedData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save fitness data';
      setError(errorMessage);
      console.error('Error in handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="personal-fitness-container">
      <div className="personal-fitness-content">
        <h1 className="personal-fitness-title">Personal Fitness Tracker</h1>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Your Fitness Stats</Card.Title>
            {fitnessData ? (
              <div className="fitness-stats">
                <p><strong>BMI:</strong> {fitnessData.bmi?.toFixed(1)} <small>({getBMICategory(fitnessData.bmi || 0)})</small></p>
                <p><strong>Height:</strong> {fitnessData.height} cm ({(fitnessData.height / 2.54).toFixed(1)} in)</p>
                <p><strong>Weight:</strong> {fitnessData.weight} kg ({(fitnessData.weight * 2.20462).toFixed(1)} lbs)</p>
                <p><strong>Age:</strong> {fitnessData.age}</p>
                <p><strong>Sex:</strong> {fitnessData.sex.charAt(0).toUpperCase() + fitnessData.sex.slice(1)}</p>
                <p className="text-muted">
                  Last updated: {fitnessData.lastUpdated ? 
                    (fitnessData.lastUpdated instanceof Date ? 
                      fitnessData.lastUpdated.toLocaleString() : 
                      'toDate' in fitnessData.lastUpdated ? 
                        fitnessData.lastUpdated.toDate().toLocaleString() : 
                        'Unknown') : 
                    'Unknown'}
                </p>
              </div>
            ) : (
              <p>No fitness data saved yet. Please fill out the form below.</p>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <Card.Title>Update Your Information</Card.Title>
            <Form onSubmit={handleSubmit} className="personal-fitness-form">
              <Form.Group className="form-group mb-3">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="measurement-input"
                  min="1"
                  max="120"
                  required
                />
              </Form.Group>

              <Form.Group className="form-group mb-3">
                <Form.Label>Height</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder={`Enter your height (${heightUnit})`}
                    className="measurement-input"
                    min="1"
                    step="0.1"
                    required
                  />
                  <div className="unit-toggle">
                    <button
                      type="button"
                      className={`unit-toggle-button ${heightUnit === 'cm' ? 'active' : ''}`}
                      onClick={() => setHeightUnit('cm')}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      className={`unit-toggle-button ${heightUnit === 'in' ? 'active' : ''}`}
                      onClick={() => setHeightUnit('in')}
                    >
                      in
                    </button>
                  </div>
                </div>
              </Form.Group>

              <Form.Group className="form-group mb-3">
                <Form.Label>Weight</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={`Enter your weight (${weightUnit})`}
                    className="measurement-input"
                    min="1"
                    step="0.1"
                    required
                  />
                  <div className="unit-toggle">
                    <button
                      type="button"
                      className={`unit-toggle-button ${weightUnit === 'kg' ? 'active' : ''}`}
                      onClick={() => setWeightUnit('kg')}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      className={`unit-toggle-button ${weightUnit === 'lbs' ? 'active' : ''}`}
                      onClick={() => setWeightUnit('lbs')}
                    >
                      lbs
                    </button>
                  </div>
                </div>
              </Form.Group>

              <Form.Group className="form-group mb-4">
                <Form.Label>Sex</Form.Label>
                <Form.Select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                  className="measurement-input"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100" size="lg">
                {fitnessData ? 'Update Information' : 'Save Information'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default PersonalFitness;
