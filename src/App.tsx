import Header from "./Header.tsx";
import About from "./pages/About";
import Home from "./pages/Home";
import BMICalculator from "./pages/BMICalculator";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import BodyFatCalculator from "./pages/BodyFatCalculator";
import ContactUs from "./pages/ContactUs";
import FoodDatabase from "./pages/FoodDatabase";
import WeightLossCalculator from "./pages/WeightLossCalculator";
import HealthyFood from "./pages/HealthyFood";
import PersonalFitness from "./pages/PersonalFitness";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/bmi-calculator" element={<BMICalculator />} />
            <Route path="/body-fat-calculator" element={<BodyFatCalculator />} />
            <Route path="/food-database" element={<FoodDatabase />} />
            <Route path="/signup" element={<SignUpPage />} />
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
        </main>
      </div>
    </Router>
  );
}

export default App;
