/**
 * Workout Calendar Page
 *
 * A dedicated page for the modern workout calendar planner
 */

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import WorkoutCalendarPlanner from "../components/fitness/WorkoutCalendarPlanner";
import { auth } from "../firebase";
import { User } from "firebase/auth";
import "./WorkoutPlanner.css";

const WorkoutPlanner: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userWeight, setUserWeight] = useState(70); // Default weight in kg

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // You can integrate this with your user profile system to get actual weight
  useEffect(() => {
    // Load user weight from profile or localStorage
    const savedWeight = localStorage.getItem("userWeight");
    if (savedWeight) {
      setUserWeight(parseFloat(savedWeight));
    }
  }, []);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Please log in to access your workout planner.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="workout-planner-page">
      <Row>
        <Col>
          <div className="page-header mb-4">
            <h1 className="page-title">Workout Planner</h1>
            <p className="page-subtitle">
              Plan, schedule, and track your workouts with our modern calendar
              interface
            </p>
          </div>

          <WorkoutCalendarPlanner userWeight={userWeight} />
        </Col>
      </Row>
    </Container>
  );
};

export default WorkoutPlanner;
