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
                <Badge bg="primary">Tracker → Workout Calendar</Badge> in the
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

      <style jsx>{`
        .workout-calendar-demo {
          margin: 2rem 0;
        }

        .demo-card {
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: none;
          overflow: hidden;
        }

        .demo-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 2rem;
        }

        .demo-header h3 {
          margin: 0 0 0.5rem 0;
          font-weight: 600;
        }

        .demo-header p {
          margin: 0;
          opacity: 0.9;
        }

        .feature-card {
          text-align: center;
          padding: 1.5rem;
          border-radius: 12px;
          background: #f8f9fa;
          height: 100%;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .feature-card h5 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .feature-card p {
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .demo-instructions {
          margin-top: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
        }

        .demo-instructions h5 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .demo-instructions ol {
          margin: 0;
          padding-left: 1.5rem;
        }

        .demo-instructions li {
          margin-bottom: 0.5rem;
          color: #495057;
        }

        /* Dark mode */
        :root.dark .feature-card {
          background: #3d3d3d;
        }

        :root.dark .feature-card h5 {
          color: #ffffff;
        }

        :root.dark .feature-card p {
          color: #b0b0b0;
        }

        :root.dark .demo-instructions {
          background: linear-gradient(135deg, #3d3d3d 0%, #4a4a4a 100%);
        }

        :root.dark .demo-instructions h5 {
          color: #ffffff;
        }

        :root.dark .demo-instructions li {
          color: #b0b0b0;
        }
      `}</style>
    </div>
  );
};

export default WorkoutCalendarDemo;
