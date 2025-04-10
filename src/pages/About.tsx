import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About Fitness Tracker</h1>
        <section className="about-section">
          <h2>Who are we?</h2>
          <p>
            Fitness Tracker is a web application created by Sarmilan Sreekaran, a software developer and undergraduate student from Toronto Metropolitan University, who recently found a passion for fitness and health.

          </p>
        </section>
        
        <section className="about-section">
          <h2>Features</h2>
          <p>
            Our web application offers a range of features to help users track their fitness goals and progress, including:
            <ul>
              <li>Healthy food options and a large database of nutritional information</li>
              <li>Track daily exercise</li>
              <li>Set and track personal goals</li>
            </ul>
          </p>
        </section>
        
        <section className="about-section">
          <h2>Why Choose Us</h2>
          <p>
            We believe that fitness should be accessible to everyone, so our web application is designed be a simple and free tool for tracking your fitness goals. Other fitness tracking apps are often expensive or ask for a lot of personal information, but our goal is to make fitness accessible to everyone.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
