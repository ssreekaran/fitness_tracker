import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-page-wrapper">
      <div className="about-container">
        <div className="about-content">
        <h1>About Fitness Tracker</h1>
        <section className="about-section">
          <h2>Who We Are</h2>
          <p>
            Fitness Tracker is a comprehensive health and fitness companion created by Sarmilan Sreekaran, a software developer and undergraduate student from Toronto Metropolitan University. Born from a personal passion for health and wellness, our mission is to provide accessible, user-friendly tools to help everyone achieve their fitness goals.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Our Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Nutrition Tracking</h3>
              <ul>
                <li>Comprehensive food database with nutritional information</li>
                <li>Calorie tracking and meal planning</li>
                <li>Personalized diet recommendations</li>
                <li>Healthy food suggestions and alternatives</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <h3>Fitness Tools</h3>
              <ul>
                <li>BMI and body fat percentage calculators</li>
                <li>Weight loss tracking and projections</li>
                <li>Workout planning and scheduling</li>
                <li>Personalized workout recommendations</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <h3>Progress Tracking</h3>
              <ul>
                <li>Set and monitor personal fitness goals</li>
                <li>Track daily exercise and activity</li>
                <li>Visual progress reports and analytics</li>
                <li>Customizable profile and settings</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <h3>User Experience</h3>
              <ul>
                <li>Secure authentication and profile management</li>
                <li>Responsive design for all devices</li>
                <li>Intuitive interface and easy navigation</li>
                <li>Privacy-focused with no hidden fees</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Why Choose Us</h2>
          <p>
            Unlike other fitness tracking solutions that can be expensive or overly complex, Fitness Tracker is designed with simplicity and accessibility in mind. We believe that everyone deserves access to quality health and fitness tools without compromising on privacy or breaking the bank. Our application is completely free to use, respects your data privacy, and provides all the essential features you need to stay on top of your fitness journey.
          </p>
          <p>
            Whether you're just starting your fitness journey or looking to take your training to the next level, Fitness Tracker is here to support you every step of the way.
          </p>
        </section>
        </div>
      </div>
    </div>
  );
};

export default About;
