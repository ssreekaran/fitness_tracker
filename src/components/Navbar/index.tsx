import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import useSearch from "./hooks/useSearch";
import { auth } from "../../firebase";
import { NavLinkItem } from "./types";
import NavLinks from "./components/NavLinks";
import SearchBar from "./components/SearchBar";
import ThemeToggle from "./components/ThemeToggle";
import UserMenu from "./components/UserMenu";
import MobileMenu from "./components/MobileMenu";
import "./styles.css";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
  };

  // Navigation links with dropdowns
  const navLinks: NavLinkItem[] = [
    { title: "Home", path: "/" },
    {
      title: "Food Options",
      path: "#",
      children: [
        { title: "Healthy Food", path: "/healthy-food" },
        { title: "Food Database", path: "/food-database" },
      ],
    },
    {
      title: "Calculators",
      path: "#",
      children: [
        { title: "BMI Calculator", path: "/bmi-calculator" },
        { title: "Body Fat Calculator", path: "/body-fat-calculator" },
        { title: "Weight Loss Calculator", path: "/weight-loss-calculator" },
        { title: "TDEE Calculator", path: "/tdee-calculator" },
        { title: "Macro Calculator", path: "/macro-calculator" },
        { title: "One Rep Max Calculator", path: "/one-rep-max-calculator" },
        {
          title: "Heart Rate Zone Calculator",
          path: "/heart-rate-zone-calculator",
        },
      ],
    },
    {
      title: "Tracker",
      path: "#",
      children: [
        { title: "Personal Fitness", path: "/personal-fitness" },
        { title: "Calorie Tracker", path: "/calorie-tracker" },
        { title: "Workout Planner", path: "/workout-planner" },
      ],
    },
    {
      title: "AI Tools",
      path: "#",
      children: [
        { title: "AI Workout Planner", path: "/ai-workout-planner" },
        { title: "Nutrition Coach", path: "/diet-recommendations" },
        { title: "Fitness Coach", path: "/workout-recommendations" },
      ],
    },
    {
      title: "About Us",
      path: "#",
      children: [
        { title: "About Us", path: "/about" },
        { title: "Contact Us", path: "/contact" },
      ],
    },
  ];

  // Search functionality
  const {
    searchQuery,
    showSuggestions,
    suggestions,
    handleSearchChange,
    handleSearchSubmit,
    handleSuggestionClick,
  } = useSearch();

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-header">
          <Link to="/" className="logo">
            <img
              src="/fitness_tracker_logo6.png"
              alt="Fitness Tracker"
              className="logo-img"
            />
          </Link>

          <button
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="nav-content desktop-only">
          <nav className="nav-links-container">
            <NavLinks links={navLinks} user={user} isMobile={false} />
          </nav>

          <div className="nav-actions">
            <div className="search-bar-desktop">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                showSuggestions={showSuggestions}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>

            <div className="nav-actions-group">
              <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              <UserMenu user={user} onSignOut={handleSignOut} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu}>
        <NavLinks
          links={navLinks}
          user={user}
          isMobile={true}
          onLinkClick={toggleMenu}
        />
        <div className="mobile-actions">
          <UserMenu user={user} onSignOut={handleSignOut} />
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      </MobileMenu>
    </header>
  );
};

export default Navbar;
