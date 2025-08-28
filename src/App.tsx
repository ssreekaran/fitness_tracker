import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components';
<<<<<<< HEAD
=======
import Footer from './components/Footer';
>>>>>>> 8eb212013a2b3467f5b307b8afb116c39294d8e8
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from './components/LoadingSpinner';
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
<<<<<<< HEAD
=======

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
>>>>>>> 8eb212013a2b3467f5b307b8afb116c39294d8e8

function App() {
  return (
    <Router>
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
<<<<<<< HEAD
=======
              <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms-of-service" element={<TermsOfService />} />
>>>>>>> 8eb212013a2b3467f5b307b8afb116c39294d8e8
              <Route path="/personal-fitness" element={
                <ProtectedRoute>
                  <PersonalFitness />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </main>
<<<<<<< HEAD
=======
        <Footer />
>>>>>>> 8eb212013a2b3467f5b307b8afb116c39294d8e8
      </div>
    </Router>
  );
}

export default App;
