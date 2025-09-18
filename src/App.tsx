import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components';
import Footer from './components/Footer';
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from './components/LoadingSpinner';
import { auth, handleRedirectResult } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import './App.css';

// Lazy load all page components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const BMICalculator = lazy(() => import('./pages/BMICalculator'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BodyFatCalculator = lazy(() => import('./pages/BodyFatCalculator'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FoodDatabase = lazy(() => import('./pages/FoodDatabase'));
const WeightLossCalculator = lazy(() => import('./pages/WeightLossCalculator'));
const HealthyFood = lazy(() => import('./pages/HealthyFood'));
const PersonalFitness = lazy(() => import('./pages/PersonalFitness'));
const CalorieTracker = lazy(() => import('./pages/CalorieTracker'));
const WorkoutPlanner = lazy(() => import('./pages/WorkoutPlanner'));
const DietRecommendations = lazy(() => import('./pages/DietRecommendations'));
const WorkoutRecommendations = lazy(() => import('./pages/WorkoutRecommendations'));

// Legal pages
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

// Handle deep links for OAuth redirects
const handleDeepLink = (url: string) => {
  if (url.includes('__/auth/handler')) {
    // This is a Firebase auth redirect, let it handle it
    return;
  }
};

// Add URL handler in mobile app
if (Capacitor.isNativePlatform()) {
  // Handle app opened from a URL (like OAuth redirect)
  CapApp.addListener('appUrlOpen', (data: { url: string }) => {
    // Consolidated handler for all platforms (including iOS universal links)
    if (data.url) {
      handleDeepLink(data.url);
    }
  });
}

// Create a separate component for the app content that needs access to routing
const AppContent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the redirect result when the app loads
    const handleAuthRedirect = async () => {
      try {
        const result = await handleRedirectResult();
        if (result?.user) {
          // Redirect to home or dashboard after successful login
          navigate('/');
        }
      } catch (error) {
        console.error('Error handling auth redirect:', error);
      }
    };

    // Set up auth state observer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        console.log('User is signed in:', user.uid);
      } else {
        // User is signed out
        console.log('User is signed out');
      }
    });

    // Check for redirect result on initial load
    handleAuthRedirect();

    // Clean up subscription
    return () => unsubscribe();
  }, [navigate]);

  return (
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Suspense fallback={
            <div className="page-loading">
              <LoadingSpinner />
              <p>Loading...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/bmi-calculator" element={<BMICalculator />} />
              <Route path="/body-fat-calculator" element={<BodyFatCalculator />} />
              <Route path="/food-database" element={<FoodDatabase />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/weight-loss-calculator" element={<WeightLossCalculator />} />
              <Route path="/healthy-food" element={<HealthyFood />} />
              <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms-of-service" element={<TermsOfService />} />
              <Route path="/diet-recommendations" element={<DietRecommendations />} />
              <Route path="/workout-recommendations" element={<WorkoutRecommendations />} />
              <Route path="/personal-fitness" element={
                <ProtectedRoute>
                  <PersonalFitness />
                </ProtectedRoute>
              } />
              <Route path="/calorie-tracker" element={
                <ProtectedRoute>
                  <CalorieTracker />
                </ProtectedRoute>
              } />
              <Route path="/workout-planner" element={
                <ProtectedRoute>
                  <WorkoutPlanner />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
