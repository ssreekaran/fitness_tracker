import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./NotFound.css";

/**
 * NotFound — shown for any URL that does not match a route, instead of
 * rendering a blank page (header/footer only, empty main area).
 */
const NotFound: React.FC = () => {
  const location = useLocation();
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>
        We couldn&apos;t find <code>{location.pathname}</code>. It may have
        moved, or the link may be mistyped.
      </p>
      <div className="not-found-actions">
        <Link className="btn btn-primary" to="/">
          Go to the homepage
        </Link>
        <Link className="btn btn-secondary" to="/bmi-calculator">
          BMI Calculator
        </Link>
        <Link className="btn btn-secondary" to="/food-database">
          Food Database
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
