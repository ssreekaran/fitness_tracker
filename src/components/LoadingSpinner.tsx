import React, { useEffect, useState } from 'react';
import './LoadingSpinner.css';
// Using absolute path from public directory
const fitnessLogo = '/fitness_tracker_logo6.png';

const LoadingSpinner: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-loading-screen">
      <div className="loading-content">
        <img 
          src={fitnessLogo} 
          alt="Fitness Tracker" 
          className="loading-logo"
          onError={(e) => {
            // Fallback in case image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = document.querySelector('.loading-title') as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        <h1 className="loading-title" style={{ display: 'none' }}>Fitness Tracker</h1>
        
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
