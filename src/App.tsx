import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from "./Header.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from './components/LoadingSpinner.tsx';

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

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
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
              <Route path="/personal-fitness" element={
                <ProtectedRoute>
                  <PersonalFitness />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
