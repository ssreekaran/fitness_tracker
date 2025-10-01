/**
 * Workout Calendar Demo Component
 *
 * A demonstration component showing the key features of the new workout calendar planner
 */

import React from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaPlus,
  FaDumbbell,
  FaRunning,
  FaHeart,
} from "react-icons/fa";
import "./WorkoutCalendarDemo.css";

const WorkoutCalendarDemo: React.FC = () => {
  const features = [
    {
      icon: <FaCalendarAlt />,
      title: "Interactive Calendar",
      description:
        "Click on any date to schedule a workout. Switch between month, week, and day views.",
      color: "#667eea",
    },
    {
      icon: <FaPlus />,
      title: "Quick Templates",
      description:
        "Use pre-built workout templates for common exercises like cardio, strength training, and yoga.",
      color: "#4ecdc4",
    },
    {
      icon: <FaDumbbell />,
      title: "Workout Categories",
      description:
        "Organize workouts by type: cardio, strength, flexibility, sports, and more.",
      color: "#f9ca24",
    },
    {
      icon: <FaRunning />,
      title: "Intensity Tracking",
      description:
        "Track workout intensity with visual color coding: low (green), medium (orange), high (red).",
      color: "#ff6b6b",
    },
    {
      icon: <FaHeart />,
      title: "Progress Integration",
      description:
        "Seamlessly integrates with your existing workout tracking and calorie calculations.",
      color: "#6c5ce7",
    },
  ];

  return (
    <div className="workout-calendar-demo">
      <Card className="demo-card">
        <Card.Header className="demo-header">
          <h3>🎉 New Workout Calendar Planner Features</h3>
          <p>Your modern, beautiful workout scheduling system is ready!</p>
        </Card.Header>
        <Card.Body>
          <Row>
            {features.map((feature, index) => (
              <Col md={6} lg={4} key={index} className="mb-4">
                <div className="feature-card">
                  <div
                    className="feature-icon"
                    style={{ color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h5>{feature.title}</h5>
                  <p>{feature.description}</p>
                </div>
              </Col>
            ))}
          </Row>

          <div className="demo-instructions">
            <h5>How to Use:</h5>
            <ol>
              <li>
                Navigate to{" "}
                <Badge bg="primary">Tracker → Workout Planner</Badge> in the
                menu
              </li>
              <li>Click on any date to schedule a new workout</li>
              <li>Use the quick templates for common workout types</li>
              <li>
                Switch between month, week, and day views using the buttons
              </li>
              <li>Filter workouts by category using the dropdown</li>
              <li>Click on existing workouts to edit or delete them</li>
            </ol>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default WorkoutCalendarDemo;
