import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Table, Collapse, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { WorkoutLog, saveWorkout, getUserWorkouts, deleteWorkout } from '../services/workoutService';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface WorkoutFormData {
  exercise: string;
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  date: string;
}

const exerciseMETs: Record<string, number> = {
  'running': 8,
  'cycling': 7,
  'swimming': 6,
  'walking': 3.5,
  'weight training': 4,
  'yoga': 3,
  'hiit': 9,
  'elliptical': 5,
  'rowing': 6,
  'jumping rope': 10,
};

// Time range options in days
const timeRanges = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 2 weeks' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last year' },
  { value: 0, label: 'All time' },
];

const WorkoutTracker: React.FC<{ userWeight: number }> = ({ userWeight }) => {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<number>(7); // Default to 7 days
  const [formData, setFormData] = useState<WorkoutFormData>({
    exercise: '',
    duration: 30,
    intensity: 'moderate',
    date: new Date().toISOString().substr(0, 16)
  });

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setLoading(true);
        const savedWorkouts = await getUserWorkouts();
        setWorkouts(savedWorkouts);
      } catch (err) {
        console.error('Error loading workouts:', err);
        setError('Failed to load workout history');
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, []);

  const calculateCaloriesBurned = (exercise: string, duration: number, intensity: 'low' | 'moderate' | 'high'): number => {
    const met = exerciseMETs[exercise.toLowerCase()] || 5;
    const intensityMultiplier = {
      low: 0.8,
      moderate: 1,
      high: 1.3
    }[intensity];
    
    return Math.round(met * userWeight * (duration / 60) * intensityMultiplier);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      const newWorkout = await saveWorkout({
        exercise: formData.exercise,
        duration: formData.duration,
        intensity: formData.intensity,
        date: new Date(formData.date),
        caloriesBurned: calculateCaloriesBurned(
          formData.exercise,
          formData.duration,
          formData.intensity
        )
      });
      
      setWorkouts([newWorkout, ...workouts]);
      setFormData({
        exercise: '',
        duration: 30,
        intensity: 'moderate',
        date: new Date().toISOString().substr(0, 16)
      });
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving workout:', err);
      setError('Failed to save workout. Please try again.');
    }
  };

  const handleDelete = async (workoutId: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await deleteWorkout(workoutId);
        setWorkouts(workouts.filter(workout => workout.id !== workoutId));
      } catch (err) {
        console.error('Error deleting workout:', err);
        setError('Failed to delete workout. Please try again.');
      }
    }
  };

  const getFilteredWorkouts = (days: number) => {
    if (days === 0) return [...workouts]; // Return all workouts for 'All time' option
    
    const date = new Date();
    date.setDate(date.getDate() - days);
    return workouts.filter(workout => {
      // Convert Timestamp to Date if needed
      const workoutDate = workout.date instanceof Date 
        ? workout.date 
        : workout.date.toDate(); // Convert Firestore Timestamp to JavaScript Date
      return workoutDate >= date;
    });
  };

  const getTotalCaloriesBurned = () => {
    return getFilteredWorkouts(timeRange).reduce((total, workout) => total + workout.caloriesBurned, 0);
  };

  const recentWorkouts = getFilteredWorkouts(timeRange);
  const selectedRangeLabel = timeRanges.find(range => range.value === timeRange)?.label || 'Custom range';

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Workout Tracker</h5>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          {isFormOpen ? 'Hide Form' : 'Log Workout'}
        </Button>
      </Card.Header>
      
      <Collapse in={isFormOpen}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Exercise</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.exercise}
                    onChange={(e) => setFormData({...formData, exercise: e.target.value})}
                    required
                  >
                    <option value="">Select an exercise</option>
                    {Object.keys(exerciseMETs).map(ex => (
                      <option key={ex} value={ex}>{ex.charAt(0).toUpperCase() + ex.slice(1)}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>
              
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                    required
                  />
                </Form.Group>
              </div>
              
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Intensity</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.intensity}
                    onChange={(e) => setFormData({...formData, intensity: e.target.value as 'low' | 'moderate' | 'high'})}
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </Form.Control>
                </Form.Group>
              </div>
              
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              
              <div className="col-12">
                <Button type="submit" variant="primary">
                  Log Workout
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Collapse>
      
      <Card.Body>
        <Row className="mb-3">
          <Col xs={12} md={6}>
            <h6 className="mb-0">Recent Workouts</h6>
          </Col>
          <Col xs={12} md={6} className="mt-2 mt-md-0">
            <Form.Select 
              size="sm" 
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="float-md-end"
              style={{ maxWidth: '200px' }}
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        
        {workouts.length > 0 && (
          <div className="mb-3">
            <small className="text-muted">
              Showing {recentWorkouts.length} workouts from {selectedRangeLabel.toLowerCase()} • {getTotalCaloriesBurned()} calories burned
            </small>
          </div>
        )}
        
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" size="sm" />
            <span className="ms-2">Loading workouts...</span>
          </div>
        ) : workouts.length > 0 ? (
          <div className="table-responsive">
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Exercise</th>
                  <th>Duration</th>
                  <th>Calories</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentWorkouts.map(workout => (
                  <tr key={workout.id}>
                    <td>{(workout.date instanceof Date ? workout.date : workout.date.toDate()).toLocaleDateString()}</td>
                    <td>{workout.exercise}</td>
                    <td>{workout.duration} min</td>
                    <td>{workout.caloriesBurned} cal</td>
                    <td className="text-end">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => workout.id && handleDelete(workout.id)}
                        title="Delete workout"
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <p className="text-muted">No workouts logged yet. Click 'Log Workout' to get started!</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default WorkoutTracker;
