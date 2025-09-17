import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">All-in-one fitness companion</div>
          <h1 className="hero-title">Track. Fuel. Improve.</h1>
          <p className="hero-subtitle">
            Log workouts, monitor nutrition, and reach your goals with insightful analytics.
          </p>
          <div className="cta-buttons">
            <Link className="btn btn-primary" to="/signup">Get started</Link>
            <Link className="btn btn-secondary" to="/personal-fitness">Go to dashboard</Link>
          </div>
          <div className="hero-quick">
            <Link to="/bmi-calculator">BMI</Link>
            <span className="dot" aria-hidden>•</span>
            <Link to="/body-fat-calculator">Body Fat</Link>
            <span className="dot" aria-hidden>•</span>
            <Link to="/calorie-tracker">Calories</Link>
            <span className="dot" aria-hidden>•</span>
            <Link to="/workout-planner">Workout Planner</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden>
          <div className="ring r1"></div>
          <div className="ring r2"></div>
          <div className="ring r3"></div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="features-grid">
          <article className="feature-card">
            <div className="feature-icon" aria-hidden>💪</div>
            <h3>Workout Logging</h3>
            <p>Build routines and track sets, reps, and intensity across sessions.</p>
            <Link to="/personal-fitness" className="feature-link">Open dashboard →</Link>
          </article>
          <article className="feature-card">
            <div className="feature-icon" aria-hidden>🍎</div>
            <h3>Nutrition Tracking</h3>
            <p>Search foods and log meals to stay aligned with your calorie targets.</p>
            <Link to="/calorie-tracker" className="feature-link">Track calories →</Link>
          </article>
          <article className="feature-card">
            <div className="feature-icon" aria-hidden>📊</div>
            <h3>Progress Analytics</h3>
            <p>Visualize trends, PRs, and body metrics to optimize your plan.</p>
            <Link to="/profile" className="feature-link">View profile →</Link>
          </article>
          <article className="feature-card">
            <div className="feature-icon" aria-hidden>🧮</div>
            <h3>Health Calculators</h3>
            <p>Quickly calculate BMI, body fat %, and weight-loss timelines.</p>
            <div className="pill-links">
              <Link to="/bmi-calculator" className="pill">BMI</Link>
              <Link to="/body-fat-calculator" className="pill">Body Fat</Link>
              <Link to="/weight-loss-calculator" className="pill">Weight Loss</Link>
            </div>
          </article>
        </div>
      </section>

      {/* Metrics */}
      <section className="section metrics">
        <div className="metric">
          <div className="metric-value">24k+</div>
          <div className="metric-label">Workouts logged</div>
        </div>
        <div className="metric">
          <div className="metric-value">1M+</div>
          <div className="metric-label">Foods in database</div>
        </div>
        <div className="metric">
          <div className="metric-value">4.9★</div>
          <div className="metric-label">User satisfaction</div>
        </div>
      </section>

      {/* Quick links */}
      <section className="section quick-links">
        <h2>Jump back in</h2>
        <div className="links">
          <Link to="/workout-planner" className="link-tile">Plan a workout</Link>
          <Link to="/food-database" className="link-tile">Search foods</Link>
          <Link to="/healthy-food" className="link-tile">Healthy recipes</Link>
          <Link to="/about" className="link-tile">About the app</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
