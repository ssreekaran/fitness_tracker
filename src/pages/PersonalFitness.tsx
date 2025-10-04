import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Card,
  Alert,
  Form,
  Tabs,
  Tab,
  Button,
  Modal,
} from "react-bootstrap";
import {
  getFitnessData,
  saveFitnessData,
  clearFitnessData,
  FitnessData,
} from "../services/fitnessService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import WorkoutTracker from "../components/WorkoutTracker";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import "./PersonalFitness.css";

const PersonalFitness: React.FC = () => {
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showClearModal, setShowClearModal] = useState(false);
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");

  // Refs for form inputs
  const heightRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const dateOfBirthRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);

  const calculateAge = (dateString: string): number => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (0-11)
    const currentDay = today.getDate();

    // Parse the birth date string (YYYY-MM-DD format)
    const [year, month, day] = dateString.split("-").map(Number);

    let age = currentYear - year;

    // Adjust age if birthday hasn't occurred yet this year
    if (
      currentMonth < month - 1 ||
      (currentMonth === month - 1 && currentDay < day)
    ) {
      age--;
    }

    return age;
  };

  const getMinMaxBirthDate = () => {
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 150);

    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() - 13);

    return {
      min: minDate.toISOString().split("T")[0],
      max: maxDate.toISOString().split("T")[0],
    };
  };

  // Load user data on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadFitnessData();
      } else {
        setUserId(null);
        setFitnessData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadFitnessData = async () => {
    try {
      const data = await getFitnessData();
      if (data) {
        setFitnessData(data);
      }
    } catch (error) {
      setError("Failed to load fitness data");
      console.error("Error loading fitness data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      // Get values directly from refs
      const height = heightRef.current?.value || "";
      const weight = weightRef.current?.value || "";
      const dateOfBirth = dateOfBirthRef.current?.value || "";
      const gender = genderRef.current?.value || "male";

      let heightValue = parseFloat(height);
      let weightValue = parseFloat(weight);

      // Convert height to cm if in inches
      if (heightUnit === "in") {
        heightValue = heightValue * 2.54; // Convert inches to cm
      }

      // Convert weight to kg if in lbs
      if (weightUnit === "lbs") {
        weightValue = weightValue * 0.453592; // Convert lbs to kg
      }

      if (!dateOfBirth) {
        throw new Error("Please enter your date of birth");
      }

      // Save the data (all values in standard units: cm and kg)
      await saveFitnessData({
        height: heightValue,
        weight: weightValue,
        dateOfBirth,
        gender: gender as "male" | "female",
      });

      // Reload the data to update the UI
      await loadFitnessData();

      // Reset form
      if (heightRef.current) heightRef.current.value = "";
      if (weightRef.current) weightRef.current.value = "";
      if (dateOfBirthRef.current) dateOfBirthRef.current.value = "";
      if (genderRef.current) genderRef.current.value = "male";

      setSuccess("Fitness data updated successfully!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update fitness data";
      setError(errorMessage);
      console.error("Error updating fitness data:", error);
      setTimeout(() => setError(""), 5000);
    }
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const formatDateForInput = (dateString?: string | Date): string => {
    if (!dateString) return "";
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toISOString().split("T")[0];
  };

  const handleClearData = async () => {
    try {
      await clearFitnessData();
      setFitnessData(null);
      setSuccess("Your personal data has been cleared successfully.");
      setError("");
      setShowClearModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to clear personal data";
      setError(errorMessage);
      console.error("Error clearing personal data:", error);
      setTimeout(() => setError(""), 5000);
    }
  };

  const DashboardTab = () => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      // Use toLocaleDateString with timeZone: 'UTC' to prevent timezone-related date shifts
      return date.toLocaleDateString("en-CA", { timeZone: "UTC" });
    };

    // Always calculate current age based on date of birth
    const currentAge = fitnessData?.dateOfBirth
      ? calculateAge(fitnessData.dateOfBirth)
      : fitnessData?.age || 0;

    return (
      <div className="row g-4">
        <div className="col-md-4">
          <Card className="h-100 pf-card pf-card--indigo">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">Your Fitness Stats</Card.Title>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowClearModal(true)}
                >
                  <i className="bi bi-trash me-1"></i> Clear Data
                </Button>
              </div>
              {fitnessData ? (
                <div className="fitness-stats">
                  <div className="stat-row">
                    <span className="label">BMI</span>
                    <span className="value">
                      {fitnessData.bmi?.toFixed(1)}{" "}
                      <small className="muted">
                        ({getBMICategory(fitnessData.bmi || 0)})
                      </small>
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Height</span>
                    <span className="value">
                      {fitnessData.height} cm{" "}
                      <span className="muted">
                        ({(fitnessData.height / 2.54).toFixed(1)} in)
                      </span>
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Weight</span>
                    <span className="value">
                      {fitnessData.weight} kg{" "}
                      <span className="muted">
                        ({(fitnessData.weight * 2.20462).toFixed(1)} lbs)
                      </span>
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Age</span>
                    <span className="value">{currentAge} years</span>
                  </div>
                  {fitnessData.dateOfBirth && (
                    <div className="stat-row">
                      <span className="label">Date of Birth</span>
                      <span className="value">
                        {formatDate(fitnessData.dateOfBirth)}
                      </span>
                    </div>
                  )}
                  <div className="stat-row">
                    <span className="label">Gender</span>
                    <span className="value">
                      {fitnessData.gender.charAt(0).toUpperCase() +
                        fitnessData.gender.slice(1)}
                    </span>
                  </div>
                  <p className="muted small mt-3 mb-0">
                    Last updated:{" "}
                    {fitnessData.lastUpdated
                      ? fitnessData.lastUpdated instanceof Date
                        ? formatDate(fitnessData.lastUpdated.toISOString())
                        : "toDate" in fitnessData.lastUpdated
                        ? formatDate(
                            fitnessData.lastUpdated.toDate().toISOString()
                          )
                        : "Unknown"
                      : "N/A"}
                  </p>
                </div>
              ) : (
                <p>
                  No fitness data saved yet. Please update your information.
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-8">
          <div className="pf-card pf-card--teal h-100">
            <WorkoutTracker userWeight={fitnessData?.weight || 70} />
          </div>
        </div>
      </div>
    );
  };

  const UpdateInfoTab = () => {
    const { min, max } = getMinMaxBirthDate();

    return (
      <div className="row">
        <div className="col-12">
          <Card className="pf-card pf-card--violet">
            <Card.Body>
              <Card.Title>Update Your Information</Card.Title>
              <Form onSubmit={handleSubmit} className="mt-3">
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Height</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          ref={heightRef}
                          defaultValue={
                            fitnessData?.height
                              ? (heightUnit === "cm"
                                  ? fitnessData.height
                                  : fitnessData.height / 2.54
                                ).toFixed(1)
                              : ""
                          }
                          min={heightUnit === "cm" ? "100" : "39.4"}
                          max={heightUnit === "cm" ? "250" : "98.4"}
                          step="0.1"
                          required
                          className="measurement-input"
                        />
                        <select
                          className="form-select"
                          style={{ maxWidth: "80px" }}
                          value={heightUnit}
                          onChange={(e) =>
                            setHeightUnit(e.target.value as "cm" | "in")
                          }
                        >
                          <option value="cm">cm</option>
                          <option value="in">in</option>
                        </select>
                      </div>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Weight</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="number"
                          ref={weightRef}
                          defaultValue={
                            fitnessData?.weight
                              ? (weightUnit === "kg"
                                  ? fitnessData.weight
                                  : fitnessData.weight * 2.20462
                                ).toFixed(1)
                              : ""
                          }
                          min={weightUnit === "kg" ? "30" : "66.1"}
                          max={weightUnit === "kg" ? "300" : "661.4"}
                          step="0.1"
                          required
                          className="measurement-input"
                        />
                        <select
                          className="form-select"
                          style={{ maxWidth: "80px" }}
                          value={weightUnit}
                          onChange={(e) =>
                            setWeightUnit(e.target.value as "kg" | "lbs")
                          }
                        >
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </div>
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        ref={dateOfBirthRef}
                        defaultValue={
                          fitnessData?.dateOfBirth
                            ? formatDateForInput(fitnessData.dateOfBirth)
                            : ""
                        }
                        min={min}
                        max={max}
                        required
                        className="measurement-input"
                      />
                      <Form.Text className="text-muted">
                        Must be at least 13 years old
                      </Form.Text>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        ref={genderRef}
                        defaultValue={fitnessData?.gender || "male"}
                        className="form-select"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-primary">
                    Update Information
                  </button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="personal-fitness-container">
      <Container fluid className="px-4 px-md-5">
        <div className="personal-fitness-content">
          <div className="pf-hero">
            <h1 className="pf-title">Personal Fitness Tracker</h1>
            <p className="pf-subtitle">
              Manage your stats, log workouts, and stay on track.
            </p>
            {fitnessData && (
              <div className="pf-stats-grid">
                <div className="pf-stat">
                  <div className="pf-stat-value">
                    {fitnessData.bmi?.toFixed(1) || "--"}
                  </div>
                  <div className="pf-stat-label">BMI</div>
                </div>
                <div className="pf-stat">
                  <div className="pf-stat-value">
                    {fitnessData.weight?.toFixed(1)}
                    <span className="unit"> kg</span>
                  </div>
                  <div className="pf-stat-label">Weight</div>
                </div>
                <div className="pf-stat">
                  <div className="pf-stat-value">
                    {fitnessData.height?.toFixed(0)}
                    <span className="unit"> cm</span>
                  </div>
                  <div className="pf-stat-label">Height</div>
                </div>
              </div>
            )}
          </div>
          {error && (
            <Alert
              variant="danger"
              className="mx-auto"
              style={{ maxWidth: "100%" }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              variant="success"
              className="mx-auto"
              style={{ maxWidth: "100%" }}
            >
              {success}
            </Alert>
          )}

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "dashboard")}
            className="mb-4 pf-tabs"
            id="fitness-tabs"
          >
            <Tab eventKey="dashboard" title="Dashboard">
              <DashboardTab />
            </Tab>
            <Tab eventKey="update" title="Update Information">
              <UpdateInfoTab />
            </Tab>
            <Tab eventKey="analytics" title="Analytics">
              <div className="analytics-tab-content">
                <AnalyticsDashboard className="pf-analytics" />
              </div>
            </Tab>
          </Tabs>

          {/* Clear Data Confirmation Modal */}
          <Modal
            show={showClearModal}
            onHide={() => setShowClearModal(false)}
            className="pf-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>Clear Personal Data</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-2">
                Are you sure you want to clear all your personal fitness data?
                This action cannot be undone.
              </p>
              <p className="mb-0">
                This will remove your height, weight, date of birth, and gender
                information.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleClearData}>
                Yes, Clear My Data
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Container>
    </div>
  );
};

export default PersonalFitness;
