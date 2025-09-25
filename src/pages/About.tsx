import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

const About: React.FC = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-hero-badge">
            Your Fitness Journey Starts Here
          </div>
          <h1 className="about-hero-title">About Fitness Tracker</h1>
          <p className="about-hero-subtitle">
            Empowering your fitness journey with intuitive tools and
            comprehensive tracking.
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="section">
        <h2>Who We Are</h2>
        <div className="content-card">
          <p>
            Fitness Tracker is a comprehensive health and fitness companion
            created by Sarmilan Sreekaran, a software developer and
            undergraduate student from Toronto Metropolitan University. Born
            from a personal passion for health and wellness, our mission is to
            provide accessible, user-friendly tools to help everyone achieve
            their fitness goals.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <h2>Our Features</h2>
        <div className="features-grid">
          <article className="feature-card">
            <div className="feature-icon" aria-hidden>
              🍎
            </div>
            <h3>Nutrition Tracking</h3>
            <ul className="feature-list">
              <li>Comprehensive food database</li>
              <li>Calorie tracking and meal planning</li>
              <li>Personalized diet recommendations</li>
              <li>Healthy food suggestions</li>
            </ul>
            <Link to="/calorie-tracker" className="feature-link">
              Track nutrition →
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-icon" aria-hidden>
              💪
            </div>
            <h3>Fitness Tools</h3>
            <ul className="feature-list">
              <li>BMI and body fat calculators</li>
              <li>Weight loss tracking</li>
              <li>Workout planning</li>
              <li>Personalized recommendations</li>
            </ul>
            <Link to="/workout-planner" className="feature-link">
              Plan workout →
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-icon" aria-hidden>
              📊
            </div>
            <h3>Progress Tracking</h3>
            <ul className="feature-list">
              <li>Set and monitor goals</li>
              <li>Track exercise and activity</li>
              <li>Visual progress reports</li>
              <li>Customizable profile</li>
            </ul>
            <Link to="/personal-fitness" className="feature-link">
              View dashboard →
            </Link>
          </article>

          <article className="feature-card">
            <div className="feature-icon" aria-hidden>
              🔒
            </div>
            <h3>User Experience</h3>
            <ul className="feature-list">
              <li>Secure authentication</li>
              <li>Responsive design</li>
              <li>Intuitive interface</li>
              <li>Privacy-focused</li>
            </ul>
            <Link to="/signup" className="feature-link">
              Get started →
            </Link>
          </article>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section">
        <h2>Why Choose Us</h2>
        <div className="content-card">
          <p>
            Unlike other fitness tracking solutions that can be expensive or
            overly complex, Fitness Tracker is designed with simplicity and
            accessibility in mind. We believe that everyone deserves access to
            quality health and fitness tools without compromising on privacy or
            breaking the bank.
          </p>
          <p className="mt-4">
            Our application is completely free to use, respects your data
            privacy, and provides all the essential features you need to stay on
            top of your fitness journey. Whether you're just starting out or
            looking to take your training to the next level, Fitness Tracker is
            here to support you every step of the way.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section cta-section">
        <h2>Ready to start your journey?</h2>
        <div className="cta-buttons">
          <Link to="/signup" className="btn btn-primary">
            Sign Up Free
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
