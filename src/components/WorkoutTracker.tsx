import React, { useState } from 'react';
import { Card, Button, Form, Table, Collapse, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { WorkoutLog, saveWorkout, getUserWorkouts, deleteWorkout } from '../services/workoutService';

interface WorkoutFormData {
  exercise: string;
  duration: number;
  date: string;
}

const exerciseMETs: Record<string, number> = {
  // Cardio Exercises
  'Running (5 mph/8 kmh, 12:00 min/mi)': 8,
  'Running (6 mph/9.7 kmh, 10:00 min/mi)': 10,
  'Running (7 mph/11.3 kmh, 8:34 min/mi)': 11.5,
  'Running (8 mph/12.9 kmh, 7:30 min/mi)': 12,
  'Running (9 mph/14.5 kmh, 6:40 min/mi)': 13.5,
  'Running (10 mph/16.1 kmh, 6:00 min/mi)': 15,
  'Running (11 mph/17.7 kmh, 5:27 min/mi)': 16.5,
  'Running (12 mph/19.3 kmh, 5:00 min/mi)': 18,
  'Cycling (leisurely)': 6,
  'Cycling (moderate)': 8,
  'Cycling (vigorous)': 12,
  'Swimming (freestyle)': 7,
  'Swimming (breaststroke)': 8,
  'Walking (brisk)': 4.5,
  'Walking (leisurely)': 3.5,
  // Hiking by terrain (no pack)
  'Hiking (flat terrain)': 5,
  'Hiking (rolling hills, 500-1500 ft/150-450 m gain)': 7,
  'Hiking (moderate hills, 1500-3000 ft/450-900 m gain)': 8,
  'Hiking (steep hills, 3000-4500 ft/900-1350 m gain)': 9,
  'Hiking (mountainous, 4500+ ft/1350+ m gain)': 10,
  
  // Hiking with light pack (10-20 lb/4.5-9 kg)
  'Hiking (flat, light pack)': 7,
  'Hiking (rolling hills, light pack)': 8,
  'Hiking (moderate hills, light pack)': 9,
  'Hiking (steep hills, light pack)': 10,
  'Hiking (mountainous, light pack)': 11,
  
  // Hiking with medium pack (20-30 lb/9-14 kg)
  'Hiking (flat, medium pack)': 8,
  'Hiking (rolling hills, medium pack)': 9,
  'Hiking (moderate hills, medium pack)': 10,
  'Hiking (steep hills, medium pack)': 11,
  'Hiking (mountainous, medium pack)': 12,
  
  // Hiking with heavy pack (30+ lb/14+ kg)
  'Hiking (flat, heavy pack)': 9,
  'Hiking (rolling hills, heavy pack)': 10,
  'Hiking (moderate hills, heavy pack)': 11,
  'Hiking (steep hills, heavy pack)': 12,
  'Hiking (mountainous, heavy pack)': 13,
  'Stair climbing': 8,
  'Jumping rope': 10,
  'Rowing (moderate)': 7,
  'Rowing (vigorous)': 12,
  'Elliptical trainer': 5.5,
  'Stair stepper': 6,
  'HIIT': 9,
  'Circuit training': 8,
  
  // Strength Training
  'Weight training (general)': 4,
  'Weight training (vigorous)': 6,
  'Bodyweight exercises': 4.5,
  'Kettlebell training': 8,
  'CrossFit': 8,
  'Calisthenics': 8,
  
  // Mind-Body Exercises
  'Yoga (Hatha)': 3,
  'Yoga (Vinyasa)': 4,
  'Yoga (Power)': 5,
  'Pilates': 4,
  'Tai Chi': 3,
  
  // Sports
  'Basketball': 8,
  'Soccer': 7,
  'Tennis (singles)': 8,
  'Tennis (doubles)': 6,
  'Volleyball': 4,
  'Golf (walking)': 4.5,
  'Golf (cart)': 3,
  'Dancing (aerobic)': 7,
  'Dancing (ballroom)': 3,
  'Martial arts': 10,
  'Boxing (sparring)': 9,
  'Rock climbing': 8,
  'Surfing': 5,
  'Skiing (downhill)': 6,
  'Snowboarding': 5,
};

// Rest of the file remains the same...

// Time range options in days
const timeRanges = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 2 weeks' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 180, label: 'Last 180 days' },
  { value: 365, label: 'Last year' },
  { value: 0, label: 'All time' },
];

const calculateCaloriesBurned = (exercise: string, duration: number, weightKg: number): number => {
  const met = exerciseMETs[exercise] || 3.5; // Default to light activity if exercise not found
  const hours = duration / 60; // Convert minutes to hours
  return Math.round(met * weightKg * hours);
};

const WorkoutTracker: React.FC<{ userWeight: number }> = ({ userWeight }) => {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<number>(7); // Default to 7 days
  // Function to get current local datetime in format YYYY-MM-DDThh:mm
  const getLocalDateTimeString = () => {
    const now = new Date();
    // Get local timezone offset in minutes and convert to milliseconds
    const tzOffset = now.getTimezoneOffset() * 60000;
    // Create a new date adjusted for timezone
    const localDate = new Date(now.getTime() - tzOffset);
    // Return in format YYYY-MM-DDThh:mm
    return localDate.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<WorkoutFormData>({
    exercise: '',
    duration: 30,
    date: getLocalDateTimeString()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const selectedDate = new Date(formData.date);
    const currentDate = new Date();
    
    // Check if the selected date is in the future
    if (selectedDate > currentDate) {
      setError('Cannot log workouts in the future. Please select a date and time that is not in the future.');
      setLoading(false);
      return;
    }
    
    try {
      const workout: Omit<WorkoutLog, 'id' | 'userId' | 'createdAt'> = {
        ...formData,
        caloriesBurned: calculateCaloriesBurned(formData.exercise, formData.duration, userWeight),
        date: selectedDate
      };
      
      await saveWorkout(workout);
      
      // Refresh the workouts list
      const userWorkouts = await getUserWorkouts();
      setWorkouts(userWorkouts);
      
      // Reset form with current local time
      setFormData({
        exercise: '',
        duration: 30,
        date: getLocalDateTimeString()
      });
      
      setError('');
    } catch (err) {
      setError('Failed to save workout. Please try again.');
      console.error('Error saving workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value, 10) : value
    }));
  };

  // Load workouts on component mount and when timeRange changes
  React.useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setLoading(true);
        const userWorkouts = await getUserWorkouts();
        setWorkouts(userWorkouts);
      } catch (err) {
        setError('Failed to load workouts. Please try again.');
        console.error('Error loading workouts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, [timeRange]);

  const handleDeleteWorkout = async (workoutId: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        setLoading(true);
        await deleteWorkout(workoutId);
        // Refresh the workouts list after deletion
        const userWorkouts = await getUserWorkouts();
        setWorkouts(userWorkouts);
      } catch (err) {
        setError('Failed to delete workout. Please try again.');
        console.error('Error deleting workout:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAllInTimeRange = async () => {
    if (filteredWorkouts.length === 0) return;
    
    const timeRangeLabel = timeRanges.find(r => r.value === timeRange)?.label || 'selected time range';
    if (window.confirm(`Are you sure you want to delete all ${filteredWorkouts.length} workouts in the ${timeRangeLabel.toLowerCase()}? This action cannot be undone.`)) {
      try {
        setLoading(true);
        // Delete all workouts in the filtered list
        await Promise.all(filteredWorkouts.map(workout => deleteWorkout(workout.id!)));
        // Refresh the workouts list after deletion
        const userWorkouts = await getUserWorkouts();
        setWorkouts(userWorkouts);
      } catch (err) {
        setError('Failed to delete workouts. Please try again.');
        console.error('Error deleting workouts:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportCSV = () => {
    // Filter workouts based on selected time range
    const filteredWorkouts = timeRange === 0 
      ? workouts 
      : workouts.filter(workout => {
          const workoutDate = workout.date instanceof Date ? workout.date : workout.date.toDate();
          const cutoffDate = new Date();
          if (timeRange === 7) {
            cutoffDate.setDate(cutoffDate.getDate() - 7);
          } else if (timeRange === 14) {
            cutoffDate.setDate(cutoffDate.getDate() - 14);
          } else if (timeRange === 30) {
            cutoffDate.setDate(cutoffDate.getDate() - 30);
          } else if (timeRange === 60) {
            cutoffDate.setDate(cutoffDate.getDate() - 60);
          } else if (timeRange === 90) {
            cutoffDate.setDate(cutoffDate.getDate() - 90);
          } else if (timeRange === 180) {
            cutoffDate.setDate(cutoffDate.getDate() - 180);
          } else if (timeRange === 365) {
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
          }
          return workoutDate >= cutoffDate;
        });

    // Get time range label for filename
    const timeRangeLabel = timeRanges.find(r => r.value === timeRange)?.label || 'all-time';
    const safeTimeRangeLabel = timeRangeLabel.toLowerCase().replace(/\s+/g, '-');

    // Create CSV content
    const headers = ['Date', 'Exercise', 'Duration (min)', 'Calories Burned'];
    const csvRows = [
      headers.join(','),
      ...filteredWorkouts.map(workout => {
        const date = workout.date instanceof Date ? workout.date : workout.date.toDate();
        return [
          `"${date.toLocaleString()}"`,
          `"${workout.exercise}"`,
          workout.duration,
          workout.caloriesBurned
        ].join(',');
      })
    ].join('\n');

    // Create download link with time range in filename
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workouts_${safeTimeRangeLabel}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter workouts based on the selected time range
  const getFilteredWorkouts = () => {
    if (!workouts.length) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    // Set the cutoff date based on the selected time range
    if (timeRange === 7) {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === 14) {
      cutoffDate.setDate(now.getDate() - 14);
    } else if (timeRange === 30) {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (timeRange === 60) {
      cutoffDate.setDate(now.getDate() - 60);
    } else if (timeRange === 90) {
      cutoffDate.setDate(now.getDate() - 90);
    } else if (timeRange === 180) {
      cutoffDate.setDate(now.getDate() - 180);
    } else if (timeRange === 365) {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    } else if (timeRange === 0) {
      // If 'All Time' is selected, return all workouts
      return [...workouts].sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : a.date.toDate();
        const dateB = b.date instanceof Date ? b.date : b.date.toDate();
        return dateB.getTime() - dateA.getTime();
      });
    }
    
    // Filter and sort workouts
    return workouts
      .filter(workout => {
        const workoutDate = workout.date instanceof Date ? workout.date : workout.date.toDate();
        return workoutDate >= cutoffDate;
      })
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : a.date.toDate();
        const dateB = b.date instanceof Date ? b.date : b.date.toDate();
        return dateB.getTime() - dateA.getTime();
      });
  };
  
  const filteredWorkouts = getFilteredWorkouts();
  
  return (
    <Card className="mb-4">
      <Card.Header 
        as="div" 
        className="d-flex justify-content-between align-items-center"
        onClick={() => setIsFormOpen(!isFormOpen)}
        style={{ cursor: 'pointer' }}
      >
        <Card.Title className="mb-0">Workout Tracker</Card.Title>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsFormOpen(!isFormOpen);
          }}
        >
          {isFormOpen ? 'Hide Form' : 'Log Workout'}
        </Button>
      </Card.Header>
      
      <Collapse in={isFormOpen}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Exercise</Form.Label>
                  <Form.Select 
                    name="exercise" 
                    value={formData.exercise}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select an exercise</option>
                    {Object.keys(exerciseMETs).map(exercise => (
                      <option key={exercise} value={exercise}>
                        {exercise}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (min)</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="duration"
                    min="1"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date & Time</Form.Label>
                  <Form.Control 
                    type="datetime-local" 
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Workout'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Collapse>
      
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Recent Workouts</h5>
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={handleExportCSV}
              disabled={workouts.length === 0 || loading}
              className="me-2"
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Export to CSV'}
            </Button>
            <Form.Select
              size="sm"
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              style={{ width: 'auto' }}
              disabled={loading}
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" />
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <Alert variant="info">No workouts found for the selected time period. Try adjusting the time range.</Alert>
        ) : (
          <div className="table-responsive" style={{ maxWidth: '100vw', overflowX: 'auto' }}>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exercise</th>
                <th>Duration</th>
                <th>Calories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkouts.map((workout) => (
                <tr key={workout.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div>{
                        (workout.date instanceof Date ? workout.date : workout.date.toDate()).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })
                      }</div>
                      <div style={{ fontSize: '0.8em', opacity: 0.8 }}>
                        {(workout.date instanceof Date ? workout.date : workout.date.toDate()).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  </td>
                  <td>{workout.exercise}</td>
                  <td>{workout.duration} min</td>
                  <td>{Math.round(workout.caloriesBurned || 0)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteWorkout(workout.id!)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="text-end"><strong>Total ({timeRanges.find(r => r.value === timeRange)?.label || 'Selected Period'}):</strong></td>
                <td><strong>{filteredWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)} min</strong></td>
                <td><strong>{Math.round(filteredWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0))}</strong></td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteAllInTimeRange}
                    disabled={filteredWorkouts.length === 0 || loading}
                  >
                    <strong>DELETE ALL</strong>
                  </Button>
                </td>
              </tr>
            </tfoot>
          </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default WorkoutTracker;
