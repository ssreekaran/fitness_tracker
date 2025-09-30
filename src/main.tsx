/**
 * Main entry point for the Fitness Tracker React application
 *
 * This file initializes the React application and renders it to the DOM.
 * It uses React 18's createRoot API for improved performance and concurrent features.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./App.css";

// Create the root element and render the app with React.StrictMode
// StrictMode helps identify potential problems in the application during development
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
