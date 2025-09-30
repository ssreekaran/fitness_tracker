/**
 * Main App Component for Fitness Tracker Application
 *
 * This is the root component that handles:
 * - Routing configuration for all pages
 * - Authentication state management
 * - Lazy loading of page components for better performance
 * - Deep link handling for mobile OAuth redirects
 * - Theme management across route changes
 *
 * The app supports both web and mobile platforms using Capacitor
 */

import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Navbar } from "./components";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import { auth, handleRedirectResult } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import "./App.css";

// Lazy load all page components for code splitting and better performance
// This reduces the initial bundle size and loads pages only when needed

// Public pages (no authentication required)
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));

// Health calculators (public access)
const BMICalculator = lazy(() => import("./pages/BMICalculator"));
const BodyFatCalculator = lazy(() => import("./pages/BodyFatCalculator"));
const WeightLossCalculator = lazy(() => import("./pages/WeightLossCalculator"));
const TDEECalculator = lazy(() => import("./pages/TDEECalculator"));
const MacroCalculator = lazy(() => import("./pages/MacroCalculator"));
const OneRepMaxCalculator = lazy(() => import("./pages/OneRepMaxCalculator"));
const HeartRateZoneCalculator = lazy(
  () => import("./pages/HeartRateZoneCalculator")
);

// Authentication pages
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

// Information and database pages
const ContactUs = lazy(() => import("./pages/ContactUs"));
const FoodDatabase = lazy(() => import("./pages/FoodDatabase"));
const HealthyFood = lazy(() => import("./pages/HealthyFood"));
const DietRecommendations = lazy(() => import("./pages/DietRecommendations"));
const WorkoutRecommendations = lazy(
  () => import("./pages/WorkoutRecommendations")
);

// Protected pages (authentication required)
const PersonalFitness = lazy(() => import("./pages/PersonalFitness"));
const CalorieTracker = lazy(() => import("./pages/CalorieTracker"));
const WorkoutPlanner = lazy(() => import("./pages/WorkoutPlanner"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

/**
 * Legal pages components
 * These components render legal documents in iframes for better security and isolation
 */
const PrivacyPolicy = () => (
  <div className="legal-page">
    <iframe
      src="/legal/privacy-policy.html"
      title="Privacy Policy"
      className="legal-iframe"
    />
  </div>
);

const TermsOfService = () => (
  <div className="legal-page">
    <iframe
      src="/legal/terms-of-service.html"
      title="Terms of Service"
      className="legal-iframe"
    />
  </div>
);

/**
 * Deep link handler for OAuth redirects in mobile apps
 * Handles Firebase authentication redirects when the app is opened from external URLs
 */
const handleDeepLink = (url: string) => {
  if (url.includes("__/auth/handler")) {
    // This is a Firebase auth redirect, let Firebase handle it automatically
    return;
  }
};

// Set up deep link handling for mobile platforms
if (Capacitor.isNativePlatform()) {
  // Listen for app being opened from a URL (like OAuth redirect from Google)
  CapApp.addListener("appUrlOpen", (data: { url: string }) => {
    // Handle deep links for all platforms (including iOS universal links)
    if (data.url) {
      handleDeepLink(data.url);
    }
  });
}

/**
 * AppContent Component
 *
 * Main content component that handles:
 * - Authentication state management and redirects
 * - Firebase auth state observer setup
 * - Route configuration and protected routes
 * - Loading states for lazy-loaded components
 */
const AppContent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Handle Firebase authentication redirect results
     * This is called when users return from OAuth providers like Google
     */
    const handleAuthRedirect = async () => {
      try {
        const result = await handleRedirectResult();
        if (result?.user) {
          // Redirect to home page after successful authentication
          navigate("/");
        }
      } catch (error) {
        console.error("Error handling auth redirect:", error);
      }
    };

    /**
     * Set up Firebase authentication state observer
     * This listens for changes in user authentication status
     */
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated - log for debugging
        console.log("User is signed in:", user.uid);
      } else {
        // User is not authenticated
        console.log("User is signed out");
      }
    });

    // Check for authentication redirect result on app initialization
    handleAuthRedirect();

    // Cleanup function to unsubscribe from auth state changes
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Suspense
          fallback={
            <div className="page-loading">
              <LoadingSpinner />
              <p>Loading...</p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/bmi-calculator" element={<BMICalculator />} />
            <Route
              path="/body-fat-calculator"
              element={<BodyFatCalculator />}
            />
            <Route
              path="/weight-loss-calculator"
              element={<WeightLossCalculator />}
            />
            <Route path="/tdee-calculator" element={<TDEECalculator />} />
            <Route path="/macro-calculator" element={<MacroCalculator />} />
            <Route
              path="/one-rep-max-calculator"
              element={<OneRepMaxCalculator />}
            />
            <Route
              path="/heart-rate-zone-calculator"
              element={<HeartRateZoneCalculator />}
            />
            <Route path="/food-database" element={<FoodDatabase />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/healthy-food" element={<HealthyFood />} />
            <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
            <Route
              path="/legal/terms-of-service"
              element={<TermsOfService />}
            />
            <Route
              path="/diet-recommendations"
              element={<DietRecommendations />}
            />
            <Route
              path="/workout-recommendations"
              element={<WorkoutRecommendations />}
            />
            <Route
              path="/personal-fitness"
              element={
                <ProtectedRoute>
                  <PersonalFitness />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calorie-tracker"
              element={
                <ProtectedRoute>
                  <CalorieTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout-planner"
              element={
                <ProtectedRoute>
                  <WorkoutPlanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppWithLocation />
    </Router>
  );
}

/**
 * AppWithLocation Component
 *
 * Wrapper component that handles theme management across route changes
 * Ensures consistent theming when navigating between pages
 */
function AppWithLocation() {
  const location = useLocation();

  useEffect(() => {
    // Apply appropriate theme colors when route changes
    // This ensures consistent background colors across all pages
    const isDark = document.documentElement.classList.contains("dark");
    document.body.style.backgroundColor = isDark ? "#1a1a1a" : "#ffffff";
  }, [location.pathname]);

  return <AppContent />;
}

export default App;
