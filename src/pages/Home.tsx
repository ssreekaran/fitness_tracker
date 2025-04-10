import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to Fitness Tracker</h1>
        <div className="hero-section">
          <p className="hero-text">
            Your journey to a healthier lifestyle starts here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
