import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Form,
  Table,
  Alert,
  Container,
  Row,
  Col,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { useAuth } from "../components/Navbar/hooks/useAuth";
import {
  addFoodEntry,
  getFoodEntries,
  deleteFoodEntry,
  FoodEntry,
} from "../services/foodService";
import {
  getFoodByCode,
  initFoodDatabase,
  checkDatabaseReady,
} from "../services/foodDatabase";
import "./CalorieTracker.css";

const CalorieTracker: React.FC = () => {
  const { user } = useAuth();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);

  // Initialize food database when component mounts
  useEffect(() => {
    initFoodDatabase().catch((error: Error) => {
      console.error("Failed to initialize food database:", error);
    });
  }, []);
  const [foodCode, setFoodCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [formData, setFormData] = useState<Omit<FoodEntry, "id" | "userId">>(
    () => {
      const now = new Date();
      // Format time as HH:MM for the time input
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");

      return {
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        date: now.toISOString().split("T")[0],
        time: `${hours}:${minutes}`,
      };
    }
  );
  const [loading, setLoading] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Check if food database is loaded
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        // Use the dedicated database readiness check
        const isReady = await checkDatabaseReady();
        if (!isReady) {
          console.warn("Food database is not ready");
        }
      } catch (error) {
        console.error("Error checking database status:", error);
      } finally {
        setIsDbLoading(false);
      }
    };

    checkDbStatus();
  }, []);

  // Load food entries
  const loadFoodEntries = useCallback(async () => {
    if (!user) {
      console.log("No user found");
      return;
    }

    setLoading(true);
    try {
      console.log("Loading food entries for user:", user.uid);
      let entries = await getFoodEntries(user.uid);
      console.log("Received entries:", entries);

      if (!Array.isArray(entries)) {
        throw new Error(
          "Expected an array of entries but received: " + typeof entries
        );
      }

      // Sort entries by date (newest first) and time (newest first)
      entries = entries.sort((a: FoodEntry, b: FoodEntry) => {
        // First sort by date (newest first)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;

        // If same date, sort by time (newest first)
        const timeA = a.time || "00:00";
        const timeB = b.time || "00:00";
        return timeB.localeCompare(timeA);
      });

      setFoodEntries(entries);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Error loading food entries:", {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : "No stack trace",
        user: user ? { uid: user.uid } : "No user",
      });
      setError(`Failed to load food entries: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load food entries when user changes
  useEffect(() => {
    if (user) {
      loadFoodEntries();
    }
  }, [user, loadFoodEntries]);

  const handleFoodCodeLookup = async () => {
    const trimmedCode = foodCode.trim();

    if (!trimmedCode) {
      setSearchError("Please enter a food code");
      return;
    }

    // Validate food code format (alphanumeric, 1-10 characters)
    const foodCodeRegex = /^[a-zA-Z0-9]{1,10}$/;
    if (!foodCodeRegex.test(trimmedCode)) {
      setSearchError("Food code must be 1-10 alphanumeric characters");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const foodItem = await getFoodByCode(trimmedCode);
      if (foodItem) {
        setFormData((prev) => ({
          ...prev,
          name: foodItem.foodName,
          calories: foodItem.calories,
          protein: foodItem.protein,
          carbs: foodItem.carbs,
          fat: foodItem.fat,
        }));
      } else {
        setSearchError(`No food found with code: ${foodCode}`);
      }
    } catch (error) {
      console.error("Error looking up food code:", error);
      setSearchError("Failed to look up food. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Helper function to round numbers to specified precision
  const roundTo = (value: number, precision: number): number => {
    const factor = Math.pow(10, precision);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  };

  // Field-specific precision mapping
  const fieldPrecision: Record<string, number> = {
    calories: 0, // Whole numbers for calories
    protein: 1, // 1 decimal for protein
    carbs: 1, // 1 decimal for carbs
    fat: 1, // 1 decimal for fat
    // Add other numeric fields with their precision as needed
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Handle number inputs
    if (type === "number") {
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [name]: "",
        }));
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          const precision = fieldPrecision[name] ?? 2; // Default to 2 decimals if field not in map
          const roundedValue = roundTo(numValue, precision);
          setFormData((prev) => ({
            ...prev,
            [name]: roundedValue,
          }));
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to add food entries");
      return;
    }

    // Clear any previous search errors
    setSearchError("");

    try {
      const newEntry = {
        ...formData,
        userId: user.uid,
        date: formData.date || new Date().toISOString().split("T")[0],
        time: formData.time || new Date().toTimeString().substring(0, 5),
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
      };

      await addFoodEntry(newEntry);
      setSuccess("Food entry added successfully!");

      // Reset form state
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");

      setFormData({
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        date: now.toISOString().split("T")[0],
        time: `${hours}:${minutes}`,
      });

      // Clear food code input
      setFoodCode("");

      // Refresh the entries list
      await loadFoodEntries();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add food entry");
      console.error("Error adding food entry:", err);
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
      setFoodEntries((prev) =>
        prev.filter((entry) => entry.id !== entryToDelete)
      );
      setSuccess("Food entry deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete food entry");
      console.error("Error deleting food entry:", err);
    } finally {
      setShowDeleteModal(false);
      setEntryToDelete(null);
    }
  };

  // Calculate totals
  const totalCalories = foodEntries.reduce(
    (sum, entry) => sum + (entry.calories || 0),
    0
  );
  const totalProtein = foodEntries.reduce(
    (sum, entry) => sum + (entry.protein || 0),
    0
  );
  const totalCarbs = foodEntries.reduce(
    (sum, entry) => sum + (entry.carbs || 0),
    0
  );
  const totalFat = foodEntries.reduce(
    (sum, entry) => sum + (entry.fat || 0),
    0
  );

  return (
    <div className="calorie-tracker-container">
      <Container fluid className="px-4 px-md-5">
        <div className="calorie-tracker-content">
          <div className="ct-hero">
            <h1 className="ct-title">Calorie Tracker</h1>
            <p className="ct-subtitle">
              Track your daily nutrition and stay on top of your fitness goals
            </p>
            <div className="ct-stats-grid">
              <div className="ct-stat">
                <div className="ct-stat-value">
                  {totalCalories}
                  <span className="unit"> kcal</span>
                </div>
                <div className="ct-stat-label">Total Calories</div>
              </div>
              <div className="ct-stat">
                <div className="ct-stat-value">
                  {totalProtein.toFixed(1)}
                  <span className="unit"> g</span>
                </div>
                <div className="ct-stat-label">Protein</div>
              </div>
              <div className="ct-stat">
                <div className="ct-stat-value">
                  {totalCarbs.toFixed(1)}
                  <span className="unit"> g</span>
                </div>
                <div className="ct-stat-label">Carbs</div>
              </div>
              <div className="ct-stat">
                <div className="ct-stat-value">
                  {totalFat.toFixed(1)}
                  <span className="unit"> g</span>
                </div>
                <div className="ct-stat-label">Fat</div>
              </div>
            </div>
          </div>

          {isDbLoading && (
            <Alert variant="info" className="d-flex align-items-center mb-4">
              <div
                className="spinner-border spinner-border-sm me-2"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              Loading food database...
            </Alert>
          )}
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-4">
              {success}
            </Alert>
          )}

          <div className="row g-4">
            <div className="col-md-4">
              <Card className="h-100 pf-card pf-card--violet">
                <Card.Body>
                  <Card.Title className="mb-3">Add Food Entry</Card.Title>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="foodCode" className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="mb-0">
                          Food Code (Optional)
                        </Form.Label>
                        <a
                          href="/food-database"
                          className="small food-db-link"
                          title="Browse the food database to find food codes"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Browse Food Database
                        </a>
                      </div>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Enter food code"
                          value={foodCode}
                          onChange={(e) => setFoodCode(e.target.value)}
                          disabled={isSearching || isDbLoading}
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={handleFoodCodeLookup}
                          disabled={
                            isSearching || !foodCode.trim() || isDbLoading
                          }
                        >
                          {isSearching ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Looking Up...
                            </>
                          ) : (
                            "Lookup"
                          )}
                        </Button>
                      </InputGroup>
                      {searchError && (
                        <Form.Text className="text-danger">
                          {searchError}
                        </Form.Text>
                      )}
                      {isDbLoading && (
                        <Form.Text className="text-muted">
                          Food database is still loading. Lookup will be
                          available shortly.
                        </Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group controlId="formFoodName" className="mb-3">
                      <Form.Label>Food Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter food name"
                        required
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
                            step="0.01"
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
                            step="0.01"
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
                            step="0.01"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add Food"}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </div>

            <div className="col-md-8">
              <Card className="h-100 pf-card pf-card--teal">
                <Card.Body>
                  <Card.Title className="mb-3">Food Log</Card.Title>
                  {foodEntries.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted">
                        No food entries yet. Add your first food above!
                      </p>
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
                                {new Date(entry.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    weekday: "short",
                                  }
                                )}
                              </td>
                              <td>
                                {entry.time
                                  ? new Date(
                                      `2000-01-01T${entry.time}`
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                  : "N/A"}
                              </td>
                              <td>{entry.calories}</td>
                              <td>{entry.protein}g</td>
                              <td>{entry.carbs}g</td>
                              <td>{entry.fat}g</td>
                              <td>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    entry.id && handleDeleteClick(entry.id)
                                  }
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
            </div>
          </div>
        </div>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        className="ct-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this food entry? This action cannot be
          undone.
        </Modal.Body>
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
