import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div id="NavContainer">
      <Link to="/">
        <img
          className="navbar-brand d-line-block align-top"
          src="/fitness_tracker_logo5.png"
          alt="Fitness Tracker"
          width={125}
          height={125}
        />
      </Link>
      {/*<!-- Collapsing Navbar if page too small -->*/}
      <button
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        className="navbar-toggler"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item dropdown">
            <Link to="#" className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Food Options
            </Link>
            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
              <li>
                <Link to="/healthy-food" className="dropdown-item">
                  Healthy Options
                </Link>
              </li>
              <li>
                <Link to="/food-database" className="dropdown-item">
                  Food Database
                </Link>
              </li>
            </ul>
          </li>
          <li className="nav-item dropdown">
            <Link to="#" className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Calculator
            </Link>
            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
              <li>
                <Link to="/weight-loss-calculator" className="dropdown-item">
                  Weight Loss Calculator
                </Link>
              </li>
              <li>
                <Link to="/bmi-calculator" className="dropdown-item">
                  BMI Calculator
                </Link>
              </li>
              <li>
                <Link to="/body-fat-calculator" className="dropdown-item">
                  Body Fat Calculator
                </Link>
              </li>
            </ul>
          </li>
          <li className="nav-item dropdown">
            <Link to="#" className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              About Us
            </Link>
            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
              <li>
                <Link to="/about" className="dropdown-item">
                  About Fitness Tracker
                </Link>
              </li>
              <li>
                <Link to="/contact" className="dropdown-item">
                  Contact Us
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
