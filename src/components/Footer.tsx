/**
 * Footer Component
 *
 * Application footer with legal links and copyright information.
 * Provides consistent footer across all pages with proper legal compliance.
 *
 * Features:
 * - Links to Terms of Service and Privacy Policy
 * - Dynamic copyright year
 * - Responsive design
 */

import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        {/* Legal compliance links */}
        <div className="footer-links">
          <Link to="/legal/terms-of-service" className="footer-link">
            Terms of Service
          </Link>
          <span className="footer-separator">•</span>
          <Link to="/legal/privacy-policy" className="footer-link">
            Privacy Policy
          </Link>
        </div>
        {/* Copyright notice with dynamic year */}
        <div className="footer-copyright">
          © {new Date().getFullYear()} Fitness Tracker. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
