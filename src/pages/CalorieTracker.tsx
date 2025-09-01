import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Table, Alert, Container, Row, Col, Modal } from 'react-bootstrap';
import { useAuth } from '../components/Navbar/hooks/useAuth';
import { 
  addFoodEntry, 
  getFoodEntries, 
  deleteFoodEntry,
  FoodEntry
} from '../services/foodService';
import './CalorieTracker.css';


const CalorieTracker: React.FC = () => {
  const { user } = useAuth();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [formData, setFormData] = useState<Omit<FoodEntry, 'id' | 'userId'>>(() => {
    const now = new Date();
    // Format time as HH:MM for the time input
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    return { 
      name: '', 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0, 
      date: now.toISOString().split('T')[0],
      time: `${hours}:${minutes}`
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Load food entries
  useEffect(() => {
    if (user) {
      loadFoodEntries();
    }
  }, [user]);

  const loadFoodEntries = async () => {
    if (!user) {
      console.log('No user found');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Loading food entries for user:', user.uid);
      let entries = await getFoodEntries(user.uid);
      console.log('Received entries:', entries);
      
      if (!Array.isArray(entries)) {
        throw new Error('Expected an array of entries but received: ' + typeof entries);
      }
      
      // Sort entries by date (newest first) and time (newest first)
      entries = entries.sort((a: FoodEntry, b: FoodEntry) => {
        // First sort by date (newest first)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        
        // If same date, sort by time (newest first)
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeB.localeCompare(timeA);
      });
      
      setFoodEntries(entries);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error loading food entries:', {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace',
        user: user ? { uid: user.uid } : 'No user'
      });
      setError(`Failed to load food entries: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Special handling for time input
    if (name === 'time') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }
    
    // Handle number inputs
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value) || 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to add food entries');
      return;
    }

    try {
      const newEntry = {
        ...formData,
        userId: user.uid,
        date: formData.date || new Date().toISOString().split('T')[0],
        time: formData.time || new Date().toTimeString().substring(0, 5),
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat)
      };

      await addFoodEntry(newEntry);
      setSuccess('Food entry added successfully!');
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    setFormData({ 
      name: '', 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0,
      date: now.toISOString().split('T')[0],
      time: `${hours}:${minutes}`
    });
      loadFoodEntries();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add food entry');
      console.error('Error adding food entry:', err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setEntryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    
    try {
      await deleteFoodEntry(entryToDelete);
      setFoodEntries(prev => prev.filter(entry => entry.id !== entryToDelete));
      setSuccess('Food entry deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete food entry');
      console.error('Error deleting food entry:', err);
    } finally {
      setShowDeleteModal(false);
      setEntryToDelete(null);
    }
  };

  // Calculate totals
  const totalCalories = foodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
  const totalProtein = foodEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
  const totalCarbs = foodEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
  const totalFat = foodEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0);

  return (
    <div className="calorie-tracker">
      <div className="page-header">
        <h2>Calorie Tracker</h2>
        <p className="text-muted">Track your daily nutrition and stay on top of your fitness goals</p>
      </div>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      <Container fluid>
        <Row>
          <Col lg={4} className="mb-4">
            <Card className="add-food-card">
              <Card.Header>Add Food Entry</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Food Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Chicken Breast"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Calories</Form.Label>
                      <Form.Control
                        type="number"
                        name="calories"
                        value={formData.calories}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Protein (g)</Form.Label>
                      <Form.Control
                        type="number"
                        name="protein"
                        value={formData.protein}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Carbs (g)</Form.Label>
                      <Form.Control
                        type="number"
                        name="carbs"
                        value={formData.carbs}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fat (g)</Form.Label>
                      <Form.Control
                        type="number"
                        name="fat"
                        value={formData.fat}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Food'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="food-log-card">
            <Card.Header>Food Log</Card.Header>
            <Card.Body>
              {foodEntries.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No food entries yet. Add your first food above!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead>
                      <tr>
                        <th>Food</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Calories</th>
                        <th>Protein</th>
                        <th>Carbs</th>
                        <th>Fat</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.name}</td>
                          <td>
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </td>
                          <td>
                            {entry.time ? (
                              new Date(`2000-01-01T${entry.time}`).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })
                            ) : 'N/A'}
                          </td>
                          <td>{entry.calories}</td>
                          <td>{entry.protein}g</td>
                          <td>{entry.carbs}g</td>
                          <td>{entry.fat}g</td>
                          <td>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => entry.id && handleDeleteClick(entry.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="summary-card mt-4">
            <Card.Header>Daily Summary</Card.Header>
            <Card.Body>
              <div className="summary-item">
                <span>Total Calories:</span>
                <strong>{totalCalories} kcal</strong>
              </div>
              <div className="summary-item">
                <span>Protein:</span>
                <strong>{totalProtein}g</strong>
              </div>
              <div className="summary-item">
                <span>Carbs:</span>
                <strong>{totalCarbs}g</strong>
              </div>
              <div className="summary-item">
                <span>Fat:</span>
                <strong>{totalFat}g</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>

    {/* Delete Confirmation Modal */}
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this food entry? This action cannot be undone.</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
  );
};

export default CalorieTracker;
