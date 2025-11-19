/**
 * LoadingSpinner Component
 *
 * A sophisticated loading screen with animated progress bar and branding.
 * Used during lazy loading of components and initial app startup.
 *
 * Features:
 * - Delayed appearance (300ms) to avoid flashing on fast loads
 * - Animated progress bar with realistic progression
 * - Branded logo display with fallback text
 * - Graceful error handling for missing assets
 */

import React, { useEffect, useState } from "react";
import "./LoadingSpinner.css";

// App logo from public directory
const fitnessLogo = "/fitness_tracker_logo6.png";

const LoadingSpinner: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay showing spinner to avoid flash on fast loads
    const timer = setTimeout(() => {
      setShow(true);
    }, 300);

    // Animate progress bar with realistic increments
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Random increment between 1-10 for realistic feel
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 300);

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Don't render until delay period has passed
  if (!show) {
    return null;
  }

  return (
    <div className="app-loading-screen">
      <div className="loading-content">
        {/* App logo with fallback handling */}
        <img
          src={fitnessLogo}
          alt="Fitness Tracker"
          className="loading-logo"
          onError={(e) => {
            // Show text fallback if logo fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const fallback = document.querySelector(
              ".loading-title"
            ) as HTMLElement;
            if (fallback) fallback.style.display = "block";
          }}
        />
        <h1 className="loading-title" style={{ display: "none" }}>
          Fitness Tracker
        </h1>

        {/* Animated progress bar */}
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <p className="loading-text">Loading your fitness journey...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
