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

import { lazy, Suspense, useEffect, useCallback } from "react";
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
import NotificationCenter from "./components/NotificationCenter";
import {
  auth,
  handleRedirectResult,
  handleAuthRedirectResult,
} from "./firebase";
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
const MobileLoginPage = lazy(() => import("./pages/MobileLoginPage"));
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
const AIWorkoutPlanner = lazy(() => import("./pages/AIWorkoutPlanner"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

/**
 * Legal pages components
 */
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

/**
 * AppContent Component
 *
 * Main content component that handles:
 * - Authentication state management and redirects
 * - Firebase auth state observer setup
 * - Route configuration and protected routes
 * - Loading states for lazy-loaded components
 * - Deep link handling for OAuth callbacks
 */
const AppContent = () => {
  const navigate = useNavigate();

  /**
   * Deep link handler for OAuth redirects in mobile apps
   * Handles OAuth callbacks when the app is opened from external URLs
   */
  const handleDeepLink = useCallback(
    (url: string) => {
      console.log("Deep link received:", url);

      if (url.includes("__/auth/handler") || url.includes("firebaseapp.com")) {
        // This is a Firebase auth redirect, let Firebase handle it automatically
        // The auth state change listener will handle the successful login
        return;
      }

      // Handle mobile authentication success
      if (url.includes("auth-success")) {
        console.log("Mobile authentication completed, checking auth state...");

        // The user completed authentication in the browser
        // We need to trigger a re-authentication in the mobile app
        // Force a check of the authentication state
        setTimeout(async () => {
          try {
            // Force reload the auth state
            await auth.authStateReady();
            const currentUser = auth.currentUser;

            if (currentUser) {
              console.log("User is authenticated:", currentUser);
              navigate("/");
            } else {
              console.log(
                "User not authenticated in mobile app, need to sign in again"
              );
              // The authentication didn't transfer, which is expected
              // The user will need to use the regular mobile auth flow
            }
          } catch (error) {
            console.error("Error checking auth state:", error);
          }
        }, 1000);
      }
    },
    [navigate]
  );

  useEffect(() => {
    /**
     * Handle Firebase authentication redirect results
     * This is called when users return from OAuth providers like Google
     */
    const handleAuthRedirect = async () => {
      try {
        // Check for redirect results (for mobile)
        const redirectUser = await handleAuthRedirectResult();
        if (redirectUser) {
          console.log(
            "Mobile redirect authentication successful:",
            redirectUser
          );
          navigate("/");
          return;
        }

        // Fallback to original method
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

    // Set up deep link handling for mobile platforms
    let deepLinkListenerPromise: Promise<{ remove: () => void }> | undefined;
    if (Capacitor.isNativePlatform()) {
      // Listen for app being opened from a URL (like OAuth redirect from Google)
      deepLinkListenerPromise = CapApp.addListener(
        "appUrlOpen",
        (data: { url: string }) => {
          // Handle deep links for OAuth callbacks
          if (data.url) {
            handleDeepLink(data.url);
          }
        }
      );
    }

    // Check for authentication redirect result on app initialization
    handleAuthRedirect();

    // Cleanup function to unsubscribe from auth state changes and remove listeners
    return () => {
      unsubscribe();
      if (deepLinkListenerPromise) {
        deepLinkListenerPromise.then((listener) => listener.remove());
      }
    };
  }, [navigate, handleDeepLink]);

  return (
    <div className="app">
      <Navbar />
      <NotificationCenter />
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
            <Route path="/mobile-login" element={<MobileLoginPage />} />
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
              path="/ai-workout-planner"
              element={
                <ProtectedRoute>
                  <AIWorkoutPlanner />
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
