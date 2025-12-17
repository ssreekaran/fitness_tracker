/**
 * Modern Workout Calendar Planner
 *
 * A beautiful, modern calendar-based workout planning system with:
 * - Interactive calendar view with drag & drop
 * - Workout scheduling and management
 * - Visual workout intensity indicators
 * - Quick workout templates
 * - Progress tracking integration
 * - Responsive design with smooth animations
 */

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, View, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, addWeeks, addMonths, isAfter, isSameDay } from "date-fns";
import { notification } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { enUS } from "date-fns/locale";
import {
  Card,
  Button,
  Modal,
  Form,
  Badge,
  Row,
  Col,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
  Alert,
} from "react-bootstrap";
import {
  FaPlus,
  FaTrash,
  FaClock,
  FaDumbbell,
  FaRunning,
  FaHeart,
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  saveWorkout,
  getUserWorkouts,
  deleteWorkout,
} from "../../services/workoutService";
import { Timestamp } from "firebase/firestore";
import "./WorkoutCalendarPlanner.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    "en-US": enUS,
  },
});

interface WorkoutEvent extends Event {
  id?: string;
  title: string;
  exercise: string;
  duration: number;
  intensity: "low" | "moderate" | "high";
  caloriesBurned?: number;
  notes?: string;
  category: "cardio" | "strength" | "flexibility" | "sports" | "other";
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  seriesId?: string; // Unique ID to group recurring events
}

import RecurrenceOptions, { RecurrenceRule } from './RecurrenceOptions';

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: string[];
  duration: number;
  intensity: "low" | "moderate" | "high";
  category: "cardio" | "strength" | "flexibility" | "sports" | "other";
  color: string;
}

const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "morning-cardio",
    name: "Morning Cardio",
    exercises: ["Running (6 mph/9.7 kmh, 10:00 min/mi)", "Walking (brisk)"],
    duration: 30,
    intensity: "moderate",
    category: "cardio",
    color: "#ff6b6b",
  },
  {
    id: "strength-training",
    name: "Strength Training",
    exercises: ["Weight training (vigorous)", "Bodyweight exercises"],
    duration: 45,
    intensity: "high",
    category: "strength",
    color: "#4ecdc4",
  },
  {
    id: "yoga-flow",
    name: "Yoga Flow",
    exercises: ["Yoga (Vinyasa)", "Yoga (Hatha)"],
    duration: 60,
    intensity: "low",
    category: "flexibility",
    color: "#45b7d1",
  },
  {
    id: "hiit-workout",
    name: "HIIT Session",
    exercises: ["HIIT", "Circuit training"],
    duration: 25,
    intensity: "high",
    category: "cardio",
    color: "#f9ca24",
  },
  {
    id: "sports-activity",
    name: "Sports Activity",
    exercises: ["Basketball", "Tennis (singles)", "Soccer"],
    duration: 60,
    intensity: "moderate",
    category: "sports",
    color: "#6c5ce7",
  },
];

const intensityColors = {
  low: "#95e1d3",
  moderate: "#f38ba8",
  high: "#e74c3c",
};

const categoryIcons = {
  cardio: FaRunning,
  strength: FaDumbbell,
  flexibility: FaHeart,
  sports: FaCalendarAlt,
  other: FaClock,
};

interface WorkoutCalendarPlannerProps {
  userWeight: number;
}

const WorkoutCalendarPlanner: React.FC<WorkoutCalendarPlannerProps> = ({
  userWeight,
}) => {
  const [events, setEvents] = useState<WorkoutEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const notificationsEnabled = true;
  const [selectedEvent, setSelectedEvent] = useState<WorkoutEvent | null>(null);
  const [currentView, setCurrentView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    exercise: "",
    start: new Date(),
    end: new Date(),
    duration: 30,
    intensity: "moderate" as const,
    category: "cardio" as "cardio" | "strength" | "flexibility" | "sports" | "other",
    notes: "",
    isRecurring: false,
    recurrenceRule: null as RecurrenceRule | null,
  });

  // Load workouts from service
  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      const workouts = await getUserWorkouts();

      const calendarEvents: WorkoutEvent[] = workouts.map((workout) => {
        const workoutDate =
          workout.date instanceof Timestamp
            ? workout.date.toDate()
            : workout.date instanceof Date
            ? workout.date
            : new Date(workout.date);

        return {
          id: workout.id,
          title: workout.exercise,
          exercise: workout.exercise,
          start: workoutDate,
          end: new Date(workoutDate.getTime() + workout.duration * 60000),
          duration: workout.duration,
          intensity: "moderate" as const, // Default intensity
          caloriesBurned: workout.caloriesBurned,
          category: getCategoryFromExercise(workout.exercise),
          notes: "",
        };
      });

      setEvents(calendarEvents);
    } catch (err) {
      setError("Failed to load workouts");
      console.error("Error loading workouts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const getCategoryFromExercise = (
    exercise: string
  ): "cardio" | "strength" | "flexibility" | "sports" | "other" => {
    const cardioKeywords = [
      "running",
      "cycling",
      "swimming",
      "walking",
      "hiit",
      "cardio",
    ];
    const strengthKeywords = [
      "weight",
      "strength",
      "bodyweight",
      "kettlebell",
      "crossfit",
    ];
    const flexibilityKeywords = ["yoga", "pilates", "tai chi", "stretching"];
    const sportsKeywords = [
      "basketball",
      "soccer",
      "tennis",
      "volleyball",
      "golf",
      "martial arts",
    ];

    const exerciseLower = exercise.toLowerCase();

    if (cardioKeywords.some((keyword) => exerciseLower.includes(keyword)))
      return "cardio";
    if (strengthKeywords.some((keyword) => exerciseLower.includes(keyword)))
      return "strength";
    if (flexibilityKeywords.some((keyword) => exerciseLower.includes(keyword)))
      return "flexibility";
    if (sportsKeywords.some((keyword) => exerciseLower.includes(keyword)))
      return "sports";

    return "other";
  };

  const calculateCalories = useCallback((exercise: string, duration: number): number => {
    // Simplified MET calculation - you can expand this with your existing MET values
    const baseMET = 5; // Default MET value
    const hours = duration / 60;
    return Math.round(baseMET * userWeight * hours);
  }, [userWeight]);

  const cleanRecurrenceRule = (rule: RecurrenceRule | null | undefined): RecurrenceRule | undefined => {
    if (!rule) return undefined;
    
    const cleaned: Partial<RecurrenceRule> = { ...rule };
    
    // Remove undefined values
    (Object.keys(cleaned) as Array<keyof RecurrenceRule>).forEach(key => {
      if (cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });
    
    return cleaned as RecurrenceRule;
  };

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    setFormData({
      title: "",
      exercise: "",
      start,
      end: new Date(start.getTime() + 30 * 60000), // Default 30 min duration
      duration: 30,
      intensity: "moderate",
      category: "cardio",
      notes: "",
      isRecurring: false,
      recurrenceRule: null,
    });
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleSelectEvent = (event: WorkoutEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title || "",
      exercise: event.exercise,
      start: event.start as Date,
      end: event.end as Date,
      duration: event.duration,
      intensity: event.intensity,
      category: event.category,
      notes: event.notes || "",
      isRecurring: !!event.isRecurring,
      recurrenceRule: event.recurrenceRule || null,
    });
    setShowModal(true);
  };

  const generateRecurringEvents = (startDate: Date, rule: RecurrenceRule): Date[] => {
    if (!rule) return [];
    
    const { frequency, interval, count, endDate, weekdays } = rule;
    const endCondition = endDate ? new Date(endDate) : null;
    const maxOccurrences = count || 365; // Prevent infinite loops
    const events: Date[] = [];
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    
    if (frequency === 'weekly' && weekdays?.length) {
      // For weekly with specific weekdays, we need to generate occurrences differently
      const currentDate = new Date(startDate);
      let occurrences = 0;
      let weeksProcessed = 0;
      
      // Start from the beginning of the week of the start date
      const startOfWeekDate = startOfWeek(currentDate);
      
      while (occurrences < maxOccurrences) {
        // For each week in the interval
        const weekStart = addWeeks(startOfWeekDate, weeksProcessed * interval);
        
        // Check each selected weekday in this week
        for (const weekday of weekdays) {
          const targetDay = dayMap[weekday];
          const eventDate = addDays(weekStart, targetDay);
          
          // Only add if it's not before the start date and meets the end condition
          if (
            (eventDate >= startDate || isSameDay(eventDate, startDate)) &&
            (!endCondition || eventDate <= endCondition)
          ) {
            events.push(new Date(eventDate));
            occurrences++;
            
            if (occurrences >= maxOccurrences) break;
          }
        }
        
        weeksProcessed++;
        
        // Safety check to prevent infinite loops
        if (weeksProcessed > 1000) break;
      }
      
      // Sort all events by date and limit to maxOccurrences
      return events
        .sort((a, b) => a.getTime() - b.getTime())
        .slice(0, maxOccurrences);
    } 
    
    // Original logic for other frequency types
    let currentDate = new Date(startDate);
    events.push(new Date(currentDate));
    
    for (let i = 1; i < maxOccurrences; i++) {
      let nextDate: Date;
      
      switch (frequency) {
        case 'daily':
          nextDate = addDays(currentDate, interval);
          break;
        case 'weekly':
          nextDate = addWeeks(currentDate, interval);
          break;
        case 'monthly':
          nextDate = addMonths(currentDate, interval);
          // Adjust for specific day of month if specified
          if (rule.monthDay) {
            const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
            nextDate.setDate(Math.min(rule.monthDay, lastDayOfMonth));
          }
          break;
        case 'custom':
          nextDate = new Date(currentDate);
          if (rule.customDays) nextDate = addDays(nextDate, rule.customDays * interval);
          if (rule.customWeeks) nextDate = addWeeks(nextDate, rule.customWeeks * interval);
          if (rule.customMonths) nextDate = addMonths(nextDate, rule.customMonths * interval);
          break;
        default:
          return events;
      }
      
      // Stop if we've reached or passed the end date
      if (endCondition && isAfter(nextDate, endCondition)) {
        break;
      }
      
      events.push(new Date(nextDate));
      currentDate = nextDate;
    }
    
    return events;
  };

  const showWorkoutNotification = (exercise: string, duration: number) => {
    // Use the component's state instead of localStorage directly
    if (!notificationsEnabled) return;

    // Desktop notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Workout Logged', {
        body: `Great job! You've logged ${duration} minutes of ${exercise}`,
        icon: '/fitness_tracker_logo6.png'
      });
    }

    // In-app notification
    notification.success({
      message: 'Workout Logged',
      description: `Great job! You've logged ${duration} minutes of ${exercise}`,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      placement: 'topRight',
    });
  };



  const handleSaveWorkout = async () => {
    try {
      setLoading(true);
      setError("");

      const seriesId = selectedEvent?.seriesId || `series-${Date.now()}`;
      const workoutPromises = [];
      
      // Clean up the recurrence rule
      const cleanedRecurrenceRule = cleanRecurrenceRule(formData.recurrenceRule || undefined);
      
      // If this is a recurring event, generate all occurrences
      const eventDates = formData.isRecurring && cleanedRecurrenceRule
        ? generateRecurringEvents(formData.start, cleanedRecurrenceRule)
        : [formData.start];

      // Create a workout for each date
      for (const eventDate of eventDates) {
        const workoutData: Omit<WorkoutEvent, 'id'> & { date: Date } = {
          title: formData.title,
          exercise: formData.exercise || formData.title,
          duration: formData.duration,
          date: eventDate,
          intensity: formData.intensity || 'medium', // Default to 'medium' if not provided
          category: formData.category || 'other', // Default to 'other' if not provided
          caloriesBurned: calculateCalories(
            formData.exercise || formData.title,
            formData.duration
          ),
          isRecurring: formData.isRecurring,
          notes: formData.notes || '' // Add empty string as default for optional notes
        };
        
        // Only add seriesId and recurrenceRule for recurring events
        if (formData.isRecurring && cleanedRecurrenceRule) {
          workoutData.seriesId = seriesId;
          workoutData.recurrenceRule = cleanedRecurrenceRule;
        }

        // If editing an existing event in a series, delete it first
        if (selectedEvent?.id && !formData.isRecurring) {
          await deleteWorkout(selectedEvent.id);
        }

        workoutPromises.push(saveWorkout(workoutData));
      }

      // Wait for all workouts to be saved
      await Promise.all(workoutPromises);
      
      // Show notification for the saved workout
      if (formData.exercise || formData.title) {
        const exerciseName = formData.exercise || formData.title || 'workout';
        showWorkoutNotification(exerciseName, formData.duration);
      }
      
      // Reload all workouts
      await loadWorkouts();
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError("Failed to save workout");
      console.error("Error saving workout:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      setLoading(true);
      await deleteWorkout(id);
      await loadWorkouts();
      notification.success({
        message: 'Workout Deleted',
        description: 'The workout has been successfully deleted.',
        placement: 'topRight',
      });
    } catch (err) {
      setError("Failed to delete workout");
      console.error("Error deleting workout:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllWorkouts = async () => {
    try {
      setLoading(true);
      const allWorkouts = await getUserWorkouts();
      await Promise.all(allWorkouts.map(workout => 
        workout.id ? deleteWorkout(workout.id) : Promise.resolve()
      ));
      await loadWorkouts();
      setShowDeleteConfirm(false);
    } catch (err) {
      setError("Failed to delete all workouts");
      console.error("Error deleting all workouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: WorkoutTemplate) => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // Start 1 hour from now
    const end = new Date(start.getTime() + template.duration * 60000);

    setFormData({
      title: template.name,
      exercise: template.exercises[0],
      start,
      end,
      duration: template.duration,
      intensity: template.intensity,
      category: template.category,
      notes: `${template.name} workout session`,
      isRecurring: false,
      recurrenceRule: null,
    });

    setSelectedEvent(null); // Clear any selected event
    setShowModal(true); // Open the modal
  };

  const resetForm = () => {
    setFormData({
      title: "",
      exercise: "",
      start: new Date(),
      end: new Date(),
      duration: 30,
      intensity: "moderate",
      category: "cardio",
      notes: "",
      isRecurring: false,
      recurrenceRule: null,
    });
    setSelectedEvent(null);
  };

  const eventStyleGetter = (event: WorkoutEvent) => {
    const baseColor = intensityColors[event.intensity];
    return {
      style: {
        backgroundColor: baseColor,
        borderRadius: "8px",
        opacity: 0.9,
        color: "#2c3e50",
        border: "none",
        fontSize: "12px",
        fontWeight: "500",
      },
    };
  };

  const filteredEvents =
    filterCategory === "all"
      ? events
      : events.filter((event) => event.category === filterCategory);

  return (
    <div className="workout-calendar-planner">
      <Card className="calendar-card">
        <Card.Header className="calendar-header">
          <div className="header-content">
            <div className="header-title">
              <FaCalendarAlt className="header-icon" />
              <h4>Workout Calendar Planner</h4>
            </div>
            <div className="header-actions">
              <ButtonGroup size="sm" className="view-buttons">
                <Button
                  variant={
                    currentView === "month" ? "primary" : "outline-primary"
                  }
                  onClick={() => setCurrentView("month")}
                >
                  Month
                </Button>
                <Button
                  variant={
                    currentView === "week" ? "primary" : "outline-primary"
                  }
                  onClick={() => setCurrentView("week")}
                >
                  Week
                </Button>
                <Button
                  variant={
                    currentView === "day" ? "primary" : "outline-primary"
                  }
                  onClick={() => setCurrentView("day")}
                >
                  Day
                </Button>
              </ButtonGroup>

              <Form.Select
                size="sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="category-filter"
              >
                <option value="all">All Categories</option>
                <option value="cardio">Cardio</option>
                <option value="strength">Strength</option>
                <option value="flexibility">Flexibility</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </Form.Select>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setFormData({
                    ...formData,
                    start: new Date(),
                    end: new Date(Date.now() + 30 * 60000),
                  });
                  setShowModal(true);
                }}
                className="me-2"
              >
                <FaPlus /> Add Workout
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={events.length === 0 || loading}
                className="delete-all-btn"
              >
                <FaTrash /> Delete All
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="calendar-body">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <div className="calendar-container">
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              className="modern-calendar"
            />
          </div>

          {/* Quick Templates */}
          <div className="quick-templates">
            <h6 className="templates-title">Quick Templates</h6>
            <div className="templates-grid">
              {workoutTemplates.map((template) => {
                const IconComponent = categoryIcons[template.category];
                return (
                  <OverlayTrigger
                    key={template.id}
                    placement="top"
                    overlay={
                      <Tooltip>
                        {template.exercises.join(", ")} • {template.duration}min
                      </Tooltip>
                    }
                  >
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="template-button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTemplateSelect(template);
                      }}
                      style={{ borderColor: template.color }}
                    >
                      <IconComponent style={{ color: template.color }} />
                      <span>{template.name}</span>
                      <Badge
                        bg="secondary"
                        style={{
                          backgroundColor: intensityColors[template.intensity],
                        }}
                      >
                        {template.intensity}
                      </Badge>
                    </Button>
                  </OverlayTrigger>
                );
              })}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Workout Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        className="workout-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedEvent ? "Edit Workout" : "Add New Workout"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Workout Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter workout name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Exercise Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.exercise}
                    onChange={(e) =>
                      setFormData({ ...formData, exercise: e.target.value })
                    }
                    placeholder="e.g., Running, Weight training"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Intensity</Form.Label>
                  <Form.Select
                    value={formData.intensity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        intensity: e.target.value as "low" | "moderate" | "high",
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as
                          | "cardio"
                          | "strength"
                          | "flexibility"
                          | "sports"
                          | "other",
                      })
                    }
                  >
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={format(formData.start, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        start: new Date(e.target.value),
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={format(formData.end, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        end: new Date(e.target.value),
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any notes about this workout..."
              />
            </Form.Group>

            <RecurrenceOptions
              value={formData.recurrenceRule || null}
              onChange={(rule) => {
                setFormData(prev => ({
                  ...prev,
                  isRecurring: rule !== null,
                  recurrenceRule: rule
                }));
              }}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="modal-footer-content">
            {selectedEvent && (
              <Button
                variant="danger"
                onClick={handleDeleteWorkout}
                disabled={loading}
              >
                <FaTrash /> Delete
              </Button>
            )}
            <div className="footer-actions">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveWorkout}
                disabled={loading}
              >
                {loading ? "Saving..." : selectedEvent ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => !loading && setShowDeleteConfirm(false)}
        centered
      >
        <Modal.Header closeButton closeVariant={loading ? 'white' : undefined}>
          <Modal.Title className="text-danger">
            <FaExclamationTriangle className="me-2" />
            Delete All Workouts
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>all</strong> your workouts? This action cannot be undone.</p>
          <p className="text-muted">This will remove {events.length} workout{events.length !== 1 ? 's' : ''} from your calendar.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAllWorkouts}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              'Delete All Workouts'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WorkoutCalendarPlanner;
