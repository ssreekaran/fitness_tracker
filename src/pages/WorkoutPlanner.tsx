import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parseISO, parse, isValid, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Modal, Form, Container } from 'react-bootstrap';
import { addDoc, collection, doc, deleteDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/Navbar/hooks/useAuth';
import './WorkoutPlanner.css';

// Helper function to convert Date to local datetime string in format YYYY-MM-DDTHH:MM
const toLocalDatetimeString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};


const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
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
    setFormData(prev => {
      if (name === 'start' || name === 'end') {
        try {
          // Parse the datetime-local input using date-fns parse with explicit format
          const parsedDate = parse(value, "yyyy-MM-dd'T'HH:mm", new Date());
          
          // Only update if the parsed date is valid
          if (isValid(parsedDate)) {
            return { ...prev, [name]: parsedDate };
          } else {
            console.warn(`Invalid date input: ${value}`);
            // Keep the previous value if parsing fails
            return prev;
          }
        } catch (error) {
          console.error('Error parsing date:', error);
          // Keep the previous value if an error occurs during parsing
          return prev;
        }
      }
      return { ...prev, [name]: value };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const now = new Date();
      const workoutData = {
        ...formData,
        userId: user.uid,
        createdAt: now,
        updatedAt: now
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

  const getNextWholeHour = (date: Date): Date => {
    const nextHour = new Date(date);
    nextHour.setHours(date.getHours() + 1, 0, 0, 0); // Set to next whole hour, 0 minutes, 0 seconds, 0 ms
    return nextHour;
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const now = new Date();
    let startTime = new Date(start);
    let endTime = new Date(end);

    // If the selected time is in the past or within the current hour
    if (startTime <= now || 
        (startTime.getHours() === now.getHours() && 
         startTime.getDate() === now.getDate())) {
      startTime = getNextWholeHour(now);
      endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
    }

    setFormData({
      title: '',
      start: startTime,
      end: endTime,
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
        console.log('Fetching workout plans for user:', user.uid);
        const q = query(collection(db, 'users', user.uid, 'workoutPlans'));
        const querySnapshot = await getDocs(q);
        console.log('Workout plans query result:', querySnapshot.docs.length, 'documents');
        
        let skippedCount = 0;
        const userWorkouts = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            
            // Validate timestamps
            const start = data.start?.toDate ? data.start.toDate() : null;
            const end = data.end?.toDate ? data.end.toDate() : null;
            
            // Skip documents with invalid timestamps
            if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
              console.warn('Skipping workout plan with invalid timestamps:', doc.id, { start, end });
              skippedCount++;
              return null;
            }
            
            const event = {
              id: doc.id,
              title: data.title || 'No Title',
              type: data.type || 'strength',
              notes: data.notes || '',
              userId: data.userId,
              start,
              end,
            } as WorkoutEvent;
            
            return event;
          })
          .filter((event): event is WorkoutEvent => event !== null);
          
        if (skippedCount > 0) {
          console.warn(`Skipped ${skippedCount} workout plans due to invalid timestamps`);
        }
        
        setEvents(userWorkouts);
        console.log('Set events:', userWorkouts.length);
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
    const t = (event.type || '').toLowerCase();
    switch (t) {
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
        <div className="wp-layout">
          <div className="wp-hero">
            <div className="wp-hero-text">
              <h1 className="wp-title">Workout Planner</h1>
              <p className="wp-subtitle">Plan your training week and stay consistent.</p>
            </div>
            <div className="wp-actions">
              <Button 
                variant="primary" 
                onClick={() => {
                  const startTime = getNextWholeHour(new Date());
                  const endTime = new Date(startTime);
                  endTime.setHours(startTime.getHours() + 1);
                  
                  setFormData({
                    title: '',
                    start: startTime,
                    end: endTime,
                    type: 'strength',
                    notes: '',
                    userId: user?.uid || '',
                  });
                  setShowModal(true);
                }}
                size="lg"
                className="wp-add-btn"
              >
                Add Workout
              </Button>
            </div>
            <div className="type-legend inside-hero">
              <span className="legend-item"><span className="dot strength"></span>Strength</span>
              <span className="legend-item"><span className="dot cardio"></span>Cardio</span>
              <span className="legend-item"><span className="dot flexibility"></span>Flexibility</span>
              <span className="legend-item"><span className="dot rest"></span>Rest</span>
            </div>
          </div>

          <div className="calendar-container wp-card">
            <div className="wp-card-header">
              <h2>Workout Calendar</h2>
            </div>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 820, minHeight: 820 }}
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
        </div>

        {/* Add/Edit Workout Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} className="wp-modal">
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
                    value={toLocalDatetimeString(formData.start)}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="col-md-6">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end"
                    value={toLocalDatetimeString(formData.end)}
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
        <Modal show={!!selectedEvent} onHide={() => setSelectedEvent(null)} className="wp-modal">
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
