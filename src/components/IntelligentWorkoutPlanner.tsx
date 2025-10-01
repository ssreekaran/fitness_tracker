/**
 * Intelligent Workout Planner Component
 *
 * Provides AI-powered workout planning with:
 * - Smart workout recommendations
 * - Personalized plan generation
 * - Performance insights and analytics
 * - Integration with workout tracking
 * - Adaptive planning based on progress
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Badge,
  Spinner,
  Modal,
  Tabs,
  Tab,
  ProgressBar,
  ListGroup,
} from "react-bootstrap";
import {
  generateSmartRecommendations,
  generateWorkoutInsights,
  suggestNextWorkout,
  getWorkoutTemplates,
  createPersonalizedPlan,
  SmartRecommendation,
  WorkoutInsight,
  WorkoutTemplate,
} from "../services/workoutPlanningService";
import { getUserGoals } from "../services/goalsService";
import "./IntelligentWorkoutPlanner.css";

interface IntelligentWorkoutPlannerProps {
  userId: string;
  userWeight?: number;
  onWorkoutSelected?: (template: WorkoutTemplate) => void;
}

const IntelligentWorkoutPlanner: React.FC<IntelligentWorkoutPlannerProps> = ({
  userId,
  userWeight: _userWeight,
  onWorkoutSelected,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState("recommendations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data state
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>(
    []
  );
  const [insights, setInsights] = useState<WorkoutInsight[]>([]);
  const [suggestedWorkout, setSuggestedWorkout] =
    useState<WorkoutTemplate | null>(null);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [userGoals, setUserGoals] = useState<any[]>([]);

  // Plan creation state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    name: "",
    duration: 4, // weeks
    workoutsPerWeek: 3,
    fitnessLevel: "beginner" as "beginner" | "intermediate" | "advanced",
    preferredTypes: [] as string[],
    targetGoals: [] as string[],
  });

  // Template details modal
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkoutTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadPlanningData();
  }, [userId]);

  const loadPlanningData = async () => {
    try {
      setLoading(true);
      setError("");

      const [recs, insightsData, suggested, templates, goals] =
        await Promise.all([
          generateSmartRecommendations(userId),
          generateWorkoutInsights(userId),
          suggestNextWorkout(userId),
          getWorkoutTemplates(),
          getUserGoals(),
        ]);

      setRecommendations(recs);
      setInsights(insightsData);
      setSuggestedWorkout(suggested);
      setWorkoutTemplates(templates);
      setUserGoals(Array.isArray(goals) ? goals : []);
    } catch (err) {
      setError("Failed to load planning data. Please try again.");
      console.error("Error loading planning data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      setLoading(true);
      await createPersonalizedPlan(
        userId,
        planFormData.name,
        planFormData.duration,
        planFormData.targetGoals,
        planFormData.fitnessLevel,
        planFormData.workoutsPerWeek,
        planFormData.preferredTypes
      );

      setShowPlanModal(false);
      setPlanFormData({
        name: "",
        duration: 4,
        workoutsPerWeek: 3,
        fitnessLevel: "beginner",
        preferredTypes: [],
        targetGoals: [],
      });

      // Refresh data
      await loadPlanningData();
    } catch (err) {
      setError("Failed to create workout plan. Please try again.");
      console.error("Error creating plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: WorkoutTemplate) => {
    if (onWorkoutSelected) {
      onWorkoutSelected(template);
    } else {
      setSelectedTemplate(template);
      setShowTemplateModal(true);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "secondary";
      default:
        return "primary";
    }
  };

  const getInsightColor = (category: string) => {
    switch (category) {
      case "performance":
        return "success";
      case "recovery":
        return "info";
      case "consistency":
        return "warning";
      case "progression":
        return "primary";
      default:
        return "secondary";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <Card className="intelligent-planner-card">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" className="mb-3" />
          <p>Analyzing your workout data...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="intelligent-workout-planner">
      <Card className="intelligent-planner-card">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title className="mb-1">
                🧠 Intelligent Workout Planner
              </Card.Title>
              <small className="text-muted">
                AI-powered fitness planning and insights
              </small>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowPlanModal(true)}
              size="sm"
            >
              Create Plan
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "recommendations")}
            className="mb-4"
          >
            {/* Smart Recommendations Tab */}
            <Tab
              eventKey="recommendations"
              title={`Recommendations (${recommendations.length})`}
            >
              <div className="recommendations-section">
                {recommendations.length === 0 ? (
                  <Alert variant="info">
                    <h6>No specific recommendations at this time</h6>
                    <p className="mb-0">
                      Keep logging workouts to unlock personalized
                      recommendations!
                    </p>
                  </Alert>
                ) : (
                  <Row>
                    {recommendations.map((rec, index) => (
                      <Col md={6} lg={4} key={index} className="mb-3">
                        <Card className="recommendation-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Badge
                                bg={getPriorityColor(rec.priority)}
                                className="mb-2"
                              >
                                {rec.priority.toUpperCase()}
                              </Badge>
                              <Badge
                                bg="light"
                                text="dark"
                                className="workout-type-badge"
                              >
                                {rec.type}
                              </Badge>
                            </div>
                            <h6 className="recommendation-title">
                              {rec.title}
                            </h6>
                            <p className="recommendation-description">
                              {rec.description}
                            </p>
                            <div className="recommendation-details">
                              <small className="text-muted d-block mb-2">
                                <strong>Why:</strong> {rec.reasoning}
                              </small>
                              <small className="text-muted d-block mb-2">
                                <strong>Benefit:</strong> {rec.estimatedBenefit}
                              </small>
                              <small className="text-muted">
                                <strong>Timeline:</strong> {rec.timeframe}
                              </small>
                            </div>
                            {rec.actionItems.length > 0 && (
                              <div className="mt-3">
                                <small>
                                  <strong>Action Items:</strong>
                                </small>
                                <ul className="action-items">
                                  {rec.actionItems.map((item, i) => (
                                    <li key={i}>
                                      <small>{item}</small>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Tab>

            {/* Workout Suggestions Tab */}
            <Tab eventKey="suggestions" title="Workout Suggestions">
              <div className="suggestions-section">
                {/* Next Workout Suggestion */}
                {suggestedWorkout && (
                  <Card className="suggested-workout-card mb-4">
                    <Card.Header>
                      <h6 className="mb-0">🎯 Suggested Next Workout</h6>
                    </Card.Header>
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col md={8}>
                          <h5>{suggestedWorkout.name}</h5>
                          <p className="mb-2">{suggestedWorkout.description}</p>
                          <div className="workout-meta">
                            <Badge
                              bg={getDifficultyColor(
                                suggestedWorkout.difficulty
                              )}
                              className="me-2"
                            >
                              {suggestedWorkout.difficulty}
                            </Badge>
                            <Badge bg="secondary" className="me-2">
                              {suggestedWorkout.duration} min
                            </Badge>
                            <Badge bg="info" className="me-2">
                              ~{suggestedWorkout.caloriesBurnedEstimate} cal
                            </Badge>
                            <Badge bg="success">{suggestedWorkout.type}</Badge>
                          </div>
                        </Col>
                        <Col md={4} className="text-end">
                          <Button
                            variant="primary"
                            onClick={() =>
                              handleTemplateSelect(suggestedWorkout)
                            }
                            className="mb-2 w-100"
                          >
                            Start This Workout
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(suggestedWorkout);
                              setShowTemplateModal(true);
                            }}
                            className="w-100"
                          >
                            View Details
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {/* Workout Templates Library */}
                <h6 className="mb-3">Workout Templates Library</h6>
                <Row>
                  {workoutTemplates.map((template) => (
                    <Col md={6} lg={4} key={template.id} className="mb-3">
                      <Card className="template-card h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Badge bg={getDifficultyColor(template.difficulty)}>
                              {template.difficulty}
                            </Badge>
                            <Badge bg="outline-primary">{template.type}</Badge>
                          </div>
                          <h6 className="template-title">{template.name}</h6>
                          <p className="template-description">
                            {template.description}
                          </p>
                          <div className="template-meta mb-3">
                            <small className="text-muted d-block">
                              Duration: {template.duration} minutes
                            </small>
                            <small className="text-muted d-block">
                              Calories: ~{template.caloriesBurnedEstimate}
                            </small>
                            <small className="text-muted">
                              Exercises: {template.exercises.length}
                            </small>
                          </div>
                          <div className="template-actions">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleTemplateSelect(template)}
                              className="me-2"
                            >
                              Use Template
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setShowTemplateModal(true);
                              }}
                            >
                              Details
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Tab>

            {/* Performance Insights Tab */}
            <Tab eventKey="insights" title={`Insights (${insights.length})`}>
              <div className="insights-section">
                {insights.length === 0 ? (
                  <Alert variant="info">
                    <h6>Building your fitness profile...</h6>
                    <p className="mb-0">
                      Complete more workouts to unlock detailed performance
                      insights and analytics.
                    </p>
                  </Alert>
                ) : (
                  <Row>
                    {insights.map((insight, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <Card className="insight-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Badge bg={getInsightColor(insight.category)}>
                                {insight.category}
                              </Badge>
                              <div className="confidence-score">
                                <small className="text-muted">
                                  {insight.confidence}% confidence
                                </small>
                                <ProgressBar
                                  variant="success"
                                  now={insight.confidence}
                                  style={{ height: "4px" }}
                                />
                              </div>
                            </div>
                            <h6 className="insight-title">{insight.insight}</h6>
                            <p className="insight-recommendation">
                              {insight.recommendation}
                            </p>
                            {insight.dataPoints.length > 0 && (
                              <div className="data-points">
                                <small className="text-muted">
                                  <strong>Based on:</strong>
                                </small>
                                <ul className="data-points-list">
                                  {insight.dataPoints.map((point, i) => (
                                    <li key={i}>
                                      <small>{point}</small>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Create Plan Modal */}
      <Modal
        show={showPlanModal}
        onHide={() => setShowPlanModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Personalized Workout Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Plan Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={planFormData.name}
                    onChange={(e) =>
                      setPlanFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Summer Fitness Challenge"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (weeks)</Form.Label>
                  <Form.Select
                    value={planFormData.duration}
                    onChange={(e) =>
                      setPlanFormData((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value),
                      }))
                    }
                  >
                    <option value={2}>2 weeks</option>
                    <option value={4}>4 weeks</option>
                    <option value={6}>6 weeks</option>
                    <option value={8}>8 weeks</option>
                    <option value={12}>12 weeks</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Workouts per Week</Form.Label>
                  <Form.Select
                    value={planFormData.workoutsPerWeek}
                    onChange={(e) =>
                      setPlanFormData((prev) => ({
                        ...prev,
                        workoutsPerWeek: parseInt(e.target.value),
                      }))
                    }
                  >
                    <option value={2}>2 workouts</option>
                    <option value={3}>3 workouts</option>
                    <option value={4}>4 workouts</option>
                    <option value={5}>5 workouts</option>
                    <option value={6}>6 workouts</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fitness Level</Form.Label>
                  <Form.Select
                    value={planFormData.fitnessLevel}
                    onChange={(e) =>
                      setPlanFormData((prev) => ({
                        ...prev,
                        fitnessLevel: e.target.value as any,
                      }))
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Target Goals</Form.Label>
              {userGoals.length > 0 ? (
                <div className="goals-selection">
                  {userGoals.map((goal) => (
                    <Form.Check
                      key={goal.id}
                      type="checkbox"
                      id={`goal-${goal.id}`}
                      label={goal.name}
                      checked={planFormData.targetGoals.includes(goal.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlanFormData((prev) => ({
                            ...prev,
                            targetGoals: [...prev.targetGoals, goal.id],
                          }));
                        } else {
                          setPlanFormData((prev) => ({
                            ...prev,
                            targetGoals: prev.targetGoals.filter(
                              (id) => id !== goal.id
                            ),
                          }));
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="mb-0">
                  <small>
                    No goals found. Create some goals first to get a more
                    targeted plan.
                  </small>
                </Alert>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Preferred Workout Types</Form.Label>
              <div className="workout-types-selection">
                {["strength", "cardio", "flexibility", "hiit"].map((type) => (
                  <Form.Check
                    key={type}
                    type="checkbox"
                    id={`type-${type}`}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    checked={planFormData.preferredTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPlanFormData((prev) => ({
                          ...prev,
                          preferredTypes: [...prev.preferredTypes, type],
                        }));
                      } else {
                        setPlanFormData((prev) => ({
                          ...prev,
                          preferredTypes: prev.preferredTypes.filter(
                            (t) => t !== type
                          ),
                        }));
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPlanModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreatePlan}
            disabled={!planFormData.name || loading}
          >
            {loading ? "Creating..." : "Create Plan"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Template Details Modal */}
      <Modal
        show={showTemplateModal}
        onHide={() => setShowTemplateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedTemplate?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTemplate && (
            <div>
              <div className="template-overview mb-4">
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Type:</strong> {selectedTemplate.type}
                    </p>
                    <p>
                      <strong>Difficulty:</strong> {selectedTemplate.difficulty}
                    </p>
                    <p>
                      <strong>Duration:</strong> {selectedTemplate.duration}{" "}
                      minutes
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Estimated Calories:</strong>{" "}
                      {selectedTemplate.caloriesBurnedEstimate}
                    </p>
                    <p>
                      <strong>Equipment:</strong>{" "}
                      {selectedTemplate.equipment.join(", ")}
                    </p>
                    <p>
                      <strong>Target Areas:</strong>{" "}
                      {selectedTemplate.targetMuscleGroups.join(", ")}
                    </p>
                  </Col>
                </Row>
                <p className="template-description">
                  {selectedTemplate.description}
                </p>
              </div>

              <h6>Exercises ({selectedTemplate.exercises.length})</h6>
              <ListGroup>
                {selectedTemplate.exercises.map((exercise, index) => (
                  <ListGroup.Item key={index}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{exercise.name}</h6>
                        <p className="mb-1 text-muted">
                          {exercise.instructions}
                        </p>
                        <small className="text-muted">
                          Target: {exercise.muscleGroups.join(", ")}
                        </small>
                      </div>
                      <div className="text-end">
                        {exercise.sets && exercise.reps && (
                          <Badge bg="primary" className="me-1">
                            {exercise.sets} × {exercise.reps}
                          </Badge>
                        )}
                        {exercise.duration && (
                          <Badge bg="info" className="me-1">
                            {exercise.duration}s
                          </Badge>
                        )}
                        <Badge bg="secondary">Rest: {exercise.restTime}s</Badge>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTemplateModal(false)}
          >
            Close
          </Button>
          {selectedTemplate && (
            <Button
              variant="primary"
              onClick={() => {
                handleTemplateSelect(selectedTemplate);
                setShowTemplateModal(false);
              }}
            >
              Use This Template
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default IntelligentWorkoutPlanner;
