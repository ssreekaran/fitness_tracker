import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Modal, Form, Container } from 'react-bootstrap';
import { addDoc, collection, doc, deleteDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/Navbar/hooks/useAuth';
import './WorkoutPlanner.css';

// Setup the localizer by providing the required date-fns functions
import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define types for our workout events
interface WorkoutEvent {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  notes: string;
  userId: string;
}

const WorkoutPlanner: React.FC = () => {
  const [events, setEvents] = useState<WorkoutEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WorkoutEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState<Omit<WorkoutEvent, 'id'>>({
    title: '',
    start: new Date(),
    end: new Date(),
    type: 'strength',
    notes: '',
    userId: user?.uid || '',
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'start' || name === 'end' ? new Date(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const workoutData = {
        ...formData,
        userId: user.uid,
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'users', user.uid, 'workoutPlans'), workoutData);
      
      // Update local state
      setEvents([...events, { ...workoutData, id: docRef.id }]);
      
      // Reset form and close modal
      setFormData({
        title: '',
        start: new Date(),
        end: new Date(),
        type: 'strength',
        notes: '',
        userId: user.uid,
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  // Handle event selection
  const handleSelectEvent = (event: WorkoutEvent) => {
    setSelectedEvent(event);
  };

  // Handle slot selection (create new event)
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setFormData({
      title: '',
      start,
      end,
      type: 'strength',
      notes: '',
      userId: user?.uid || '',
    });
    setShowModal(true);
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id || !user) return;
    
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'workoutPlans', selectedEvent.id));
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  // Fetch user's workout plans
  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const q = query(collection(db, 'users', user.uid, 'workoutPlans'));
        const querySnapshot = await getDocs(q);
        const userWorkouts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            type: data.type,
            notes: data.notes,
            userId: data.userId,
            start: data.start?.toDate(),
            end: data.end?.toDate(),
          } as WorkoutEvent;
        });
        
        setEvents(userWorkouts);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, [user]);

  // Event style getter
  const eventStyleGetter = (event: WorkoutEvent) => {
    let backgroundColor = '';
    switch (event.type) {
      case 'strength':
        backgroundColor = '#3174ad';
        break;
      case 'cardio':
        backgroundColor = '#5cb85c';
        break;
      case 'flexibility':
        backgroundColor = '#f0ad4e';
        break;
      case 'rest':
        backgroundColor = '#d9534f';
        break;
      default:
        backgroundColor = '#777';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your workout plans...</p>
      </Container>
    );
  }

  return (
    <div className="workout-planner">
      <Container>
        <div className="text-center">
          <h1>Workout Planner</h1>
          <Button 
            variant="primary" 
            onClick={() => setShowModal(true)}
            size="lg"
            className="mb-4"
          >
            Add Workout
          </Button>
        </div>

        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
            defaultView="month"
            views={['month', 'week', 'day']}
            step={30}
            timeslots={2}
            dayLayoutAlgorithm="no-overlap"
            components={{
              month: {
                dateHeader: ({ label }: { label: string }) => (
                  <div className="rbc-date-cell">
                    <div className="rbc-button-link">{label}</div>
                  </div>
                ),
              },
            }}
            formats={{
              monthHeaderFormat: 'MMMM yyyy',
              weekdayFormat: 'EEEE',
              dayFormat: 'd',
              timeGutterFormat: 'h a',
              eventTimeRangeFormat: (range: { start: Date; end: Date }) => {
                const startTime = format(range.start, 'h:mm a');
                const endTime = format(range.end, 'h:mm a');
                return `${startTime} - ${endTime}`;
              },
            }}
          />
        </div>

        {/* Add/Edit Workout Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add Workout</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Workout Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Morning Run, Leg Day"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Workout Type</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="strength">Strength Training</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="rest">Rest Day</option>
                </Form.Select>
              </Form.Group>

              <div className="row mb-3">
                <Form.Group className="col-md-6">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start"
                    value={formData.start.toISOString().slice(0, 16)}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="col-md-6">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end"
                    value={formData.end.toISOString().slice(0, 16)}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Workout details, exercises, etc."
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Workout
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* View/Delete Event Modal */}
        <Modal show={!!selectedEvent} onHide={() => setSelectedEvent(null)}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedEvent?.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Type:</strong> {selectedEvent?.type}</p>
            <p><strong>Start:</strong> {selectedEvent?.start.toLocaleString()}</p>
            <p><strong>End:</strong> {selectedEvent?.end.toLocaleString()}</p>
            {selectedEvent?.notes && (
              <div className="mt-3">
                <h6>Notes:</h6>
                <p>{selectedEvent.notes}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleDeleteEvent}>
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default WorkoutPlanner;
