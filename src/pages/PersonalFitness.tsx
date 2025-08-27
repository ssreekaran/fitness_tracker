import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Alert, Form, Tabs, Tab } from 'react-bootstrap';
import { getFitnessData, saveFitnessData, FitnessData } from '../services/fitnessService';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import WorkoutTracker from '../components/WorkoutTracker';

interface FormState {
  height: string;
  weight: string;
  age: string;
  gender: string;
}

const PersonalFitness: React.FC = () => {
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Refs for form inputs
  const heightRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);

  // Load user data on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadFitnessData();
      } else {
        setUserId(null);
        setFitnessData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadFitnessData = async () => {
    try {
      const data = await getFitnessData();
      if (data) {
        setFitnessData(data);
      }
    } catch (error) {
      setError('Failed to load fitness data');
      console.error('Error loading fitness data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    
    try {
      // Get values directly from refs
      const height = heightRef.current?.value || '';
      const weight = weightRef.current?.value || '';
      const age = ageRef.current?.value || '';
      const gender = genderRef.current?.value || 'male';

      const heightValue = parseFloat(height);
      const weightValue = parseFloat(weight);
      const ageValue = parseInt(age);

      if (isNaN(heightValue) || isNaN(weightValue) || isNaN(ageValue)) {
        throw new Error('Please enter valid numbers for all fields');
      }

      // Save the data
      await saveFitnessData(
        {
          height: heightValue,
          weight: weightValue,
          age: ageValue,
          gender: gender as 'male' | 'female'
        },
        'cm',  // heightUnit
        'kg'   // weightUnit
      );

      // Reload the data to update the UI
      await loadFitnessData();
      
      // Reset form
      if (heightRef.current) heightRef.current.value = '';
      if (weightRef.current) weightRef.current.value = '';
      if (ageRef.current) ageRef.current.value = '';
      if (genderRef.current) genderRef.current.value = 'male';
      
      setSuccess('Fitness data updated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update fitness data';
      setError(errorMessage);
      console.error('Error updating fitness data:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const DashboardTab = () => (
    <div className="row g-4">
      <div className="col-md-4">
        <Card className="h-100">
          <Card.Body>
            <Card.Title>Your Fitness Stats</Card.Title>
            {fitnessData ? (
              <div className="fitness-stats">
                <p><strong>BMI:</strong> {fitnessData.bmi?.toFixed(1)} <small>({getBMICategory(fitnessData.bmi || 0)})</small></p>
                <p><strong>Height:</strong> {fitnessData.height} cm ({(fitnessData.height / 2.54).toFixed(1)} in)</p>
                <p><strong>Weight:</strong> {fitnessData.weight} kg ({(fitnessData.weight * 2.20462).toFixed(1)} lbs)</p>
                <p><strong>Age:</strong> {fitnessData.age}</p>
                <p><strong>Gender:</strong> {fitnessData.gender.charAt(0).toUpperCase() + fitnessData.gender.slice(1)}</p>
                <p className="text-muted small mt-3 mb-0">
                  Last updated: {fitnessData.lastUpdated ? 
                    (fitnessData.lastUpdated instanceof Date ? 
                      fitnessData.lastUpdated.toLocaleDateString() : 
                      'toDate' in fitnessData.lastUpdated ? 
                        fitnessData.lastUpdated.toDate().toLocaleDateString() : 
                        'Unknown') : 
                    'N/A'}
                </p>
              </div>
            ) : (
              <p>No fitness data saved yet. Please update your information.</p>
            )}
          </Card.Body>
        </Card>
      </div>
      <div className="col-md-8">
        <WorkoutTracker userWeight={fitnessData?.weight || 70} />
      </div>
    </div>
  );

  const UpdateInfoTab = () => (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <Card>
          <Card.Body>
            <Card.Title>Update Your Information</Card.Title>
            <Form onSubmit={handleSubmit} className="mt-3">
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Height (cm)</Form.Label>
                    <Form.Control 
                      type="number"
                      ref={heightRef}
                      defaultValue={fitnessData?.height || ''}
                      min="100"
                      max="250"
                      step="0.1"
                      required
                      className="measurement-input"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Weight (kg)</Form.Label>
                    <Form.Control 
                      type="number"
                      ref={weightRef}
                      defaultValue={fitnessData?.weight || ''}
                      min="30"
                      max="300"
                      step="0.1"
                      required
                      className="measurement-input"
                    />
                  </Form.Group>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Age</Form.Label>
                    <Form.Control 
                      type="number"
                      ref={ageRef}
                      defaultValue={fitnessData?.age || ''}
                      min="1"
                      max="120"
                      required
                      className="measurement-input"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select 
                      ref={genderRef}
                      defaultValue={fitnessData?.gender || 'male'}
                      className="form-select"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
              
              <div className="d-grid gap-2 mt-4">
                <button type="submit" className="btn btn-primary">
                  Update Information
                </button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="personal-fitness-wrapper" style={{ padding: '100px 2rem 2rem', minHeight: 'calc(100vh - 150px)' }}>
      <Container className="personal-fitness-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="personal-fitness-content" style={{ width: '100%' }}>
          <h1 className="mb-4 text-center" style={{ margin: '0 0 2rem', fontSize: '2.5rem', fontWeight: 'bold' }}>Personal Fitness Tracker</h1>
          {error && <Alert variant="danger" style={{ maxWidth: '800px' }}>{error}</Alert>}
          {success && <Alert variant="success" style={{ maxWidth: '800px' }}>{success}</Alert>}

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'dashboard')}
            className="mb-4"
            id="fitness-tabs"
          >
            <Tab eventKey="dashboard" title="Dashboard">
              <DashboardTab />
            </Tab>
            <Tab eventKey="update" title="Update Information">
              <UpdateInfoTab />
            </Tab>
          </Tabs>
        </div>
      </Container>
    </div>
  );
};

export default PersonalFitness;
