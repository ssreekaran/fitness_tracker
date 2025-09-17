import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parseISO, parse, isValid, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Modal, Form, Container } from 'react-bootstrap';
import { collection, doc, deleteDoc, getDocs, query, writeBatch, where } from 'firebase/firestore';
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
  // Optional series grouping identifier if created via recurrence
  seriesId?: string;
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

  // Delete-all confirmation state
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Recurrence state
  const [repeatEnabled, setRepeatEnabled] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'daily'|'weekly'|'biweekly'|'monthly'|'custom'>('daily');
  const [customEvery, setCustomEvery] = useState<number>(2);
  const [customUnit, setCustomUnit] = useState<'days'|'weeks'|'months'>('weeks');
  const [repeatUntil, setRepeatUntil] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return toLocalDatetimeString(d).split('T')[0]; // date-only input value
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

  // Delete all future occurrences after a cutoff date (preserve past)
  const [deleteAfterDate, setDeleteAfterDate] = useState<string>("");
  const handleDeleteSeriesAfter = async () => {
    if (!selectedEvent?.seriesId || !user || !deleteAfterDate) return;
    try {
      const cutoff = new Date(`${deleteAfterDate}T00:00:00`);
      const colRef = collection(db, 'users', user.uid, 'workoutPlans');
      const q = query(colRef, where('seriesId', '==', selectedEvent.seriesId));
      const snap = await getDocs(q);
      let batch = writeBatch(db);
      let count = 0;
      snap.forEach((d) => {
        const data: any = d.data();
        const start: Date = data.start?.toDate ? data.start.toDate() : data.start;
        if (start && start > cutoff) {
          batch.delete(d.ref);
          count++;
          if (count % 500 === 0) {
            batch.commit();
            batch = writeBatch(db);
          }
        }
      });
      await batch.commit();
      // Update local state
      setEvents(prev => prev.filter(ev => ev.seriesId !== selectedEvent.seriesId || ev.start <= cutoff));
      setSelectedEvent(null);
      setDeleteAfterDate("");
    } catch (err) {
      console.error('Error deleting series after date:', err);
    }
  };

  // Helpers for recurrence
  const addInterval = (date: Date, mode: 'daily'|'weekly'|'biweekly'|'monthly'|'custom', every: number, unit: 'days'|'weeks'|'months'): Date => {
    const d = new Date(date);
    switch (mode) {
      case 'daily': d.setDate(d.getDate() + 1); break;
      case 'weekly': d.setDate(d.getDate() + 7); break;
      case 'biweekly': d.setDate(d.getDate() + 14); break;
      case 'monthly': d.setMonth(d.getMonth() + 1); break;
      case 'custom':
        if (unit === 'days') d.setDate(d.getDate() + every);
        if (unit === 'weeks') d.setDate(d.getDate() + every * 7);
        if (unit === 'months') d.setMonth(d.getMonth() + every);
        break;
    }
    return d;
  };

  const getMaxUntilDate = (from: Date): Date => {
    const max = new Date(from);
    max.setFullYear(max.getFullYear() + 5);
    return max;
  };

  const generateSeriesId = () => `series_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const now = new Date();
      const seriesId = repeatEnabled ? generateSeriesId() : undefined;

      // Determine repeat-until cap (max 5 years from start)
      const start0 = formData.start;
      const maxUntil = getMaxUntilDate(start0);
      const userUntil = repeatUntil ? new Date(`${repeatUntil}T23:59`) : start0;
      const untilDate = userUntil > maxUntil ? maxUntil : userUntil;

      // Prepare occurrences
      const occurrences: { start: Date; end: Date }[] = [];
      let curStart = new Date(formData.start);
      let curEnd = new Date(formData.end);
      occurrences.push({ start: curStart, end: curEnd });

      if (repeatEnabled) {
        let nextStart = addInterval(curStart, repeatMode, customEvery, customUnit);
        let nextEnd = addInterval(curEnd, repeatMode, customEvery, customUnit);
        // Safety cap to avoid runaway loops; 5 years daily ~ 1827
        const hardCap = 2000;
        let count = 0;
        while (nextStart <= untilDate && count < hardCap) {
          occurrences.push({ start: nextStart, end: nextEnd });
          nextStart = addInterval(nextStart, repeatMode, customEvery, customUnit);
          nextEnd = addInterval(nextEnd, repeatMode, customEvery, customUnit);
          count++;
        }
      }

      // Write to Firestore in batches of 500
      const colRef = collection(db, 'users', user.uid, 'workoutPlans');
      const newEvents: WorkoutEvent[] = [];
      let batch = writeBatch(db);
      let batchCount = 0;
      for (let i = 0; i < occurrences.length; i++) {
        const occ = occurrences[i];
        const docRef = doc(colRef);
        const record = {
          title: formData.title,
          type: formData.type,
          notes: formData.notes,
          userId: user.uid,
          start: occ.start,
          end: occ.end,
          seriesId: seriesId || null,
          createdAt: now,
          updatedAt: now,
        };
        batch.set(docRef, record as any);
        newEvents.push({
          id: docRef.id,
          title: record.title,
          type: record.type,
          notes: record.notes,
          userId: record.userId,
          start: occ.start,
          end: occ.end,
          seriesId: record.seriesId || undefined,
        });
        batchCount++;
        if (batchCount === 500 || i === occurrences.length - 1) {
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      }

      // Update local state (append newly created events)
      setEvents([...events, ...newEvents]);

      // Reset form and close modal
      setFormData({
        title: '',
        start: new Date(),
        end: new Date(),
        type: 'strength',
        notes: '',
        userId: user.uid,
      });
      setRepeatEnabled(false);
      setRepeatMode('daily');
      setCustomEvery(2);
      setCustomUnit('weeks');
      const d = new Date(); d.setMonth(d.getMonth() + 1); setRepeatUntil(toLocalDatetimeString(d).split('T')[0]);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  // Handle event selection
  const handleSelectEvent = (event: WorkoutEvent) => {
    setSelectedEvent(event);
  };

  // Delete entire series by seriesId
  const handleDeleteSeries = async () => {
    if (!selectedEvent?.seriesId || !user) return;
    try {
      const colRef = collection(db, 'users', user.uid, 'workoutPlans');
      const q = query(colRef, where('seriesId', '==', selectedEvent.seriesId));
      const snap = await getDocs(q);
      let batch = writeBatch(db);
      let count = 0;
      snap.forEach((d) => {
        batch.delete(d.ref);
        count++;
        if (count % 500 === 0) {
          batch.commit();
          batch = writeBatch(db);
        }
      });
      await batch.commit();
      // Update local state: remove all events in this series
      setEvents(prev => prev.filter(ev => ev.seriesId !== selectedEvent.seriesId));
      setSelectedEvent(null);
    } catch (err) {
      console.error('Error deleting series:', err);
    }
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
              <Button 
                variant="danger" 
                size="lg"
                className="wp-delete-btn ms-2"
                onClick={() => setShowDeleteAllModal(true)}
              >
                Delete All
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

              {/* Recurrence controls */}
              <hr />
              <Form.Check 
                type="switch" 
                id="repeat-enabled" 
                label="Repeat this workout" 
                checked={repeatEnabled}
                onChange={(e) => setRepeatEnabled(e.target.checked)}
                className="mb-3"
              />
              {repeatEnabled && (
                <>
                  <div className="row g-3 align-items-end mb-3">
                    <Form.Group className="col-md-6">
                      <Form.Label>Frequency</Form.Label>
                      <Form.Select
                        value={repeatMode}
                        onChange={(e) => setRepeatMode(e.target.value as any)}
                      >
                        <option value="daily">Every day</option>
                        <option value="weekly">Every week</option>
                        <option value="biweekly">Every 2 weeks</option>
                        <option value="monthly">Every month</option>
                        <option value="custom">Custom interval</option>
                      </Form.Select>
                    </Form.Group>
                    {repeatMode === 'custom' && (
                      <>
                        <Form.Group className="col-md-3">
                          <Form.Label>Every</Form.Label>
                          <Form.Control type="number" min={1} value={customEvery} onChange={(e) => setCustomEvery(Math.max(1, parseInt(e.target.value || '1')))} />
                        </Form.Group>
                        <Form.Group className="col-md-3">
                          <Form.Label>Unit</Form.Label>
                          <Form.Select value={customUnit} onChange={(e) => setCustomUnit(e.target.value as any)}>
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                            <option value="months">Months</option>
                          </Form.Select>
                        </Form.Group>
                      </>
                    )}
                  </div>
                  <Form.Group className="mb-3">
                    <Form.Label>Repeat until</Form.Label>
                    <Form.Control 
                      type="date"
                      value={repeatUntil}
                      onChange={(e) => setRepeatUntil(e.target.value)}
                      min={toLocalDatetimeString(formData.start).split('T')[0]}
                      max={(() => { const m = getMaxUntilDate(formData.start); return toLocalDatetimeString(m).split('T')[0]; })()}
                    />
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      <Button size="sm" variant="outline-secondary" onClick={() => { const d=new Date(formData.start); d.setMonth(d.getMonth()+1); setRepeatUntil(toLocalDatetimeString(d).split('T')[0]); }}>+1 mo</Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => { const d=new Date(formData.start); d.setMonth(d.getMonth()+3); setRepeatUntil(toLocalDatetimeString(d).split('T')[0]); }}>+3 mo</Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => { const d=new Date(formData.start); d.setMonth(d.getMonth()+6); setRepeatUntil(toLocalDatetimeString(d).split('T')[0]); }}>+6 mo</Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => { const d=new Date(formData.start); d.setFullYear(d.getFullYear()+1); setRepeatUntil(toLocalDatetimeString(d).split('T')[0]); }}>+1 yr</Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => { const d=new Date(formData.start); d.setFullYear(d.getFullYear()+2); setRepeatUntil(toLocalDatetimeString(d).split('T')[0]); }}>+2 yr</Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => { const d=getMaxUntilDate(formData.start); setRepeatUntil(toLocalDatetimeString(d).split('T')[0]); }}>Max (5 yr)</Button>
                    </div>
                    <Form.Text muted>Recurrence is capped at 5 years to avoid clutter.</Form.Text>
                  </Form.Group>
                </>
              )}

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

        {/* Confirm Delete All Modal */}
        <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} className="wp-modal">
          <Modal.Header closeButton>
            <Modal.Title>Delete all workouts</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              This will permanently delete all workouts in your planner. This action cannot be undone.
              If you want to keep past data, consider deleting a series or deleting occurrences after a specific date instead.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={isDeletingAll} onClick={async () => {
              if (!user) return;
              try {
                setIsDeletingAll(true);
                const colRef = collection(db, 'users', user.uid, 'workoutPlans');
                const snap = await getDocs(colRef);
                let batch = writeBatch(db);
                let count = 0;
                snap.forEach((d) => {
                  batch.delete(d.ref);
                  count++;
                  if (count % 500 === 0) {
                    batch.commit();
                    batch = writeBatch(db);
                  }
                });
                await batch.commit();
                setEvents([]);
              } catch (err) {
                console.error('Error deleting all workouts:', err);
              } finally {
                setIsDeletingAll(false);
                setShowDeleteAllModal(false);
              }
            }}>
              {isDeletingAll ? 'Deleting…' : 'Delete All'}
            </Button>
          </Modal.Footer>
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
            {selectedEvent?.seriesId && (
              <div className="mt-3">
                <small className="text-muted">This event is part of a recurring series.</small>
                <div className="row g-2 align-items-end mt-2">
                  <div className="col-md-7">
                    <Form.Label className="mb-1">Delete all occurrences after</Form.Label>
                    <Form.Control 
                      type="date"
                      value={deleteAfterDate}
                      onChange={(e) => setDeleteAfterDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-5 d-grid">
                    <Button 
                      variant="outline-danger" 
                      disabled={!deleteAfterDate}
                      onClick={handleDeleteSeriesAfter}
                    >
                      Delete after date
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            {selectedEvent?.seriesId && (
              <Button variant="outline-danger" onClick={handleDeleteSeries}>
                Delete entire series
              </Button>
            )}
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
