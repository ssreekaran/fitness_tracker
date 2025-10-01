/**
 * AI Workout Planner Page
 *
 * A dedicated page for AI-powered workout planning and recommendations
 */

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import IntelligentWorkoutPlanner from "../components/IntelligentWorkoutPlanner";
import { auth } from "../firebase";
import { User } from "firebase/auth";
import "./AIWorkoutPlanner.css";

const AIWorkoutPlanner: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
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
          Please log in to access the AI Workout Planner.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="ai-workout-planner-page">
      <Row>
        <Col>
          <div className="page-header mb-4">
            <h1 className="page-title">🤖 AI Workout Planner</h1>
            <p className="page-subtitle">
              Get personalized workout recommendations powered by artificial
              intelligence
            </p>
          </div>

          <IntelligentWorkoutPlanner />
        </Col>
      </Row>
    </Container>
  );
};

export default AIWorkoutPlanner;
