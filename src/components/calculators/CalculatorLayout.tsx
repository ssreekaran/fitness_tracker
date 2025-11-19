/**
 * Shared Calculator Layout Component
 *
 * Provides consistent layout and styling for all calculator pages
 */

import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import "../../styles/CalculatorBase.css";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  result?: React.ReactNode;
  info?: string;
  heroGradient?: string;
}

const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  title,
  description,
  icon,
  children,
  result,
  info,
  heroGradient = "linear-gradient(135deg, #2ecc71, #27ae60)",
}) => {
  return (
    <div className="calculator-container">
      {/* Hero Section */}
      <div className="calculator-hero" style={{ background: heroGradient }}>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="calculator-icon">{icon}</div>
      </div>

      {/* Calculator Form */}
      <div className="calculator-form">
        {children}

        {/* Results Section */}
        {result && (
          <div className="result-container">
            <h3>Results</h3>
            {result}
          </div>
        )}

        {/* Info Section */}
        {info && (
          <div className="bmi-info">
            <FaInfoCircle className="info-icon" />
            <p>{info}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorLayout;
