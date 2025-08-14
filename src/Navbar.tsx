import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navbarRef = useRef<HTMLDivElement>(null);
  const togglerRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu when clicking outside or when route changes
  useEffect(() => {
    const closeMenu = () => {
      const mobileMenu = document.getElementById('navbarNav');
      if (mobileMenu?.classList.contains('show') && togglerRef.current) {
        togglerRef.current.click(); // Simulate click to close
      }
    };

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (navbarRef.current && 
          togglerRef.current && 
          !navbarRef.current.contains(target) && 
          !togglerRef.current.contains(target)) {
        closeMenu();
      }
    };

    // Close menu when route changes
    closeMenu();

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [location.pathname]); // Re-run when route changes

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <img
            src="/fitness_tracker_logo6.png"
            alt="Fitness Tracker"
            width="125"
            height="125"
            className="d-inline-block align-top"
          />
        </Link>
        <button
          ref={togglerRef}
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav" ref={navbarRef}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            
            <li className="nav-item dropdown">
              <Link 
                className="nav-link dropdown-toggle" 
                to="#" 
                id="foodDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                Food Options
              </Link>
              <ul className="dropdown-menu" aria-labelledby="foodDropdown">
                <li><Link to="/healthy-food" className="dropdown-item">Healthy Options</Link></li>
                <li><Link to="/food-database" className="dropdown-item">Food Database</Link></li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <Link 
                className="nav-link dropdown-toggle" 
                to="#" 
                id="calculatorDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                Calculator
              </Link>
              <ul className="dropdown-menu" aria-labelledby="calculatorDropdown">
                <li><Link to="/weight-loss-calculator" className="dropdown-item">Weight Loss Calculator</Link></li>
                <li><Link to="/bmi-calculator" className="dropdown-item">BMI Calculator</Link></li>
                <li><Link to="/body-fat-calculator" className="dropdown-item">Body Fat Calculator</Link></li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <Link 
                className="nav-link dropdown-toggle" 
                to="#" 
                id="aboutDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                About Us
              </Link>
              <ul className="dropdown-menu" aria-labelledby="aboutDropdown">
                <li><Link to="/about" className="dropdown-item">About Fitness Tracker</Link></li>
                <li><Link to="/contact" className="dropdown-item">Contact Us</Link></li>
              </ul>
            </li>

            <li className="nav-item">
              <Link to="/personal-fitness" className="nav-link">Personal Fitness</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
