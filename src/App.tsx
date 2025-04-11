import Header from "./Header.tsx";
import About from "./pages/About";
import Home from "./pages/Home";
import BMICalculator from "./pages/BMICalculator";
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
