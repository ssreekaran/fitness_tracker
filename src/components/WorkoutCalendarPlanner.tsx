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
import { format, parse, startOfWeek, getDay } from "date-fns";
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
} from "react-icons/fa";
import {
  saveWorkout,
  getUserWorkouts,
  deleteWorkout,
} from "../services/workoutService";
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
  intensity: "low" | "medium" | "high";
  caloriesBurned?: number;
  notes?: string;
  category: "cardio" | "strength" | "flexibility" | "sports" | "other";
}

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: string[];
  duration: number;
  intensity: "low" | "medium" | "high";
  category: "cardio" | "strength" | "flexibility" | "sports" | "other";
  color: string;
}

const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "morning-cardio",
    name: "Morning Cardio",
    exercises: ["Running (6 mph/9.7 kmh, 10:00 min/mi)", "Walking (brisk)"],
    duration: 30,
    intensity: "medium",
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
    intensity: "medium",
    category: "sports",
    color: "#6c5ce7",
  },
];

const intensityColors = {
  low: "#95e1d3",
  medium: "#f38ba8",
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
    intensity: "medium" as "low" | "medium" | "high",
    category: "cardio" as
      | "cardio"
      | "strength"
      | "flexibility"
      | "sports"
      | "other",
    notes: "",
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
          intensity: "medium" as const, // Default intensity
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

  const calculateCalories = (_exercise: string, duration: number): number => {
    // Simplified MET calculation - you can expand this with your existing MET values
    const baseMET = 5; // Default MET value
    const hours = duration / 60;
    return Math.round(baseMET * userWeight * hours);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const duration = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60)
    );
    setFormData({
      title: "",
      exercise: "",
      start,
      end,
      duration: duration > 0 ? duration : 30,
      intensity: "medium",
      category: "cardio",
      notes: "",
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
    });
    setShowModal(true);
  };

  const handleSaveWorkout = async () => {
    try {
      setLoading(true);

      const workoutData = {
        exercise: formData.exercise || formData.title,
        duration: formData.duration,
        date: formData.start,
        caloriesBurned: calculateCalories(
          formData.exercise || formData.title,
          formData.duration
        ),
      };

      if (selectedEvent?.id) {
        // Update existing workout
        await deleteWorkout(selectedEvent.id);
      }

      await saveWorkout(workoutData);
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

  const handleDeleteWorkout = async () => {
    if (!selectedEvent?.id) return;

    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        setLoading(true);
        await deleteWorkout(selectedEvent.id);
        await loadWorkouts();
        setShowModal(false);
        resetForm();
      } catch (err) {
        setError("Failed to delete workout");
        console.error("Error deleting workout:", err);
      } finally {
        setLoading(false);
      }
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
      intensity: "medium",
      category: "cardio",
      notes: "",
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
              >
                <FaPlus /> Add Workout
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
                        intensity: e.target.value as any,
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
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
                        category: e.target.value as any,
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
    </div>
  );
};

export default WorkoutCalendarPlanner;
