import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Alert, Form, Tabs, Tab, Button, Modal } from 'react-bootstrap';
import { getFitnessData, saveFitnessData, clearFitnessData, FitnessData } from '../services/fitnessService';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import WorkoutTracker from '../components/WorkoutTracker';

const PersonalFitness: React.FC = () => {
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showClearModal, setShowClearModal] = useState(false);
  
  // Refs for form inputs
  const heightRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const dateOfBirthRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);

  const calculateAge = (dateString: string): number => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (0-11)
    const currentDay = today.getDate();
    
    // Parse the birth date string (YYYY-MM-DD format)
    const [year, month, day] = dateString.split('-').map(Number);
    
    let age = currentYear - year;
    
    // Adjust age if birthday hasn't occurred yet this year
    if (currentMonth < month - 1 || (currentMonth === month - 1 && currentDay < day)) {
      age--;
    }
    
    return age;
  };

  const getMinMaxBirthDate = () => {
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 150);
    
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 13);
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };

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
      const dateOfBirth = dateOfBirthRef.current?.value || '';
      const gender = genderRef.current?.value || 'male';

      const heightValue = parseFloat(height);
      const weightValue = parseFloat(weight);
      
      if (!dateOfBirth) {
        throw new Error('Please enter your date of birth');
      }

      // Save the data
      await saveFitnessData(
        {
          height: heightValue,
          weight: weightValue,
          dateOfBirth,
          gender: gender as 'male' | 'female'
        }
      );

      // Reload the data to update the UI
      await loadFitnessData();
      
      // Reset form
      if (heightRef.current) heightRef.current.value = '';
      if (weightRef.current) weightRef.current.value = '';
      if (dateOfBirthRef.current) dateOfBirthRef.current.value = '';
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

  const formatDateForInput = (dateString?: string | Date): string => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toISOString().split('T')[0];
  };

  const handleClearData = async () => {
    try {
      await clearFitnessData();
      setFitnessData(null);
      setSuccess('Your personal data has been cleared successfully.');
      setError('');
      setShowClearModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear personal data';
      setError(errorMessage);
      console.error('Error clearing personal data:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const DashboardTab = () => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      // Use toLocaleDateString with timeZone: 'UTC' to prevent timezone-related date shifts
      return date.toLocaleDateString('en-CA', { timeZone: 'UTC' });
    };

    // Always calculate current age based on date of birth
    const currentAge = fitnessData?.dateOfBirth 
      ? calculateAge(fitnessData.dateOfBirth) 
      : fitnessData?.age || 0;

    return (
      <div className="row g-4">
        <div className="col-md-4">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">Your Fitness Stats</Card.Title>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => setShowClearModal(true)}
                >
                  <i className="bi bi-trash me-1"></i> Clear Data
                </Button>
              </div>
              {fitnessData ? (
                <div className="fitness-stats">
                  <p><strong>BMI:</strong> {fitnessData.bmi?.toFixed(1)} <small>({getBMICategory(fitnessData.bmi || 0)})</small></p>
                  <p><strong>Height:</strong> {fitnessData.height} cm ({(fitnessData.height / 2.54).toFixed(1)} in)</p>
                  <p><strong>Weight:</strong> {fitnessData.weight} kg ({(fitnessData.weight * 2.20462).toFixed(1)} lbs)</p>
                  <p><strong>Age:</strong> {currentAge} years old</p>
                  {fitnessData.dateOfBirth && (
                    <p><strong>Date of Birth:</strong> {formatDate(fitnessData.dateOfBirth)}</p>
                  )}
                  <p><strong>Gender:</strong> {fitnessData.gender.charAt(0).toUpperCase() + fitnessData.gender.slice(1)}</p>
                  <p className="text-muted small mt-3 mb-0">
                    Last updated: {fitnessData.lastUpdated ? 
                      (fitnessData.lastUpdated instanceof Date ? 
                        formatDate(fitnessData.lastUpdated.toISOString()) : 
                        'toDate' in fitnessData.lastUpdated ? 
                          formatDate(fitnessData.lastUpdated.toDate().toISOString()) : 
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
  };

  const UpdateInfoTab = () => {
    const { min, max } = getMinMaxBirthDate();
    
    return (
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
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control 
                        type="date"
                        ref={dateOfBirthRef}
                        defaultValue={fitnessData?.dateOfBirth ? formatDateForInput(fitnessData.dateOfBirth) : ''}
                        min={min}
                        max={max}
                        required
                        className="measurement-input"
                      />
                      <Form.Text className="text-muted">
                        Must be at least 13 years old
                      </Form.Text>
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
  };

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

          {/* Clear Data Confirmation Modal */}
          <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
            <Modal.Header closeButton className="text-dark">
              <Modal.Title>Clear Personal Data</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-dark">
              <p className="mb-2">Are you sure you want to clear all your personal fitness data? This action cannot be undone.</p>
              <p className="mb-0">This will remove your height, weight, date of birth, and gender information.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowClearModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleClearData}>
                Yes, Clear My Data
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Container>
    </div>
  );
};

export default PersonalFitness;