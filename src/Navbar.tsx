import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaMoon, FaSun, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import './Navbar.css';

const pages = [
  { title: 'Home', path: '/' },
  { title: 'About', path: '/about' },
  { title: 'BMI Calculator', path: '/bmi-calculator' },
  { title: 'Body Fat Calculator', path: '/body-fat-calculator' },
  { title: 'Food Database', path: '/food-database' },
  { title: 'Sign Up', path: '/signup' },
  { title: 'Profile', path: '/profile' },
  { title: 'Contact Us', path: '/contact' },
  { title: 'Weight Loss Calculator', path: '/weight-loss-calculator' },
  { title: 'Healthy Food', path: '/healthy-food' },
  { title: 'Personal Fitness', path: '/personal-fitness' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Filtered suggestions based on query (matching original SearchBar behavior)
  const filteredPages = searchQuery.trim()
    ? pages.filter(p => p.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : [];

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Close menu when clicking outside or when route changes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (navRef.current && !navRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      
      if (suggestionRef.current && !suggestionRef.current.contains(target) &&
          inputRef.current && !inputRef.current.contains(target)) {
        setShowSuggestions(false);
      }

      // Close user menu when clicking outside
      const userMenu = document.querySelector('.user-menu');
      if (userMenu && !userMenu.contains(target)) {
        setShowUserMenu(false);
      }
    };

    // Close menus when route changes
    setIsMenuOpen(false);
    setShowSuggestions(false);
    setShowUserMenu(false);

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Focus the search input when suggestions are shown
  useEffect(() => {
    if (showSuggestions) {
      inputRef.current?.focus();
    }
  }, [showSuggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredPages.length > 0) {
      // If there are matching pages, navigate to the first one
      navigate(filteredPages[0].path);
    } else if (searchQuery.trim()) {
      // If no matches, search on Google
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      window.open(googleUrl, '_blank');
    }
    // Clear the search and close suggestions
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Handle search input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleGoogleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const googleUrl = `https://www.google.com/search?q=site:${window.location.hostname}+${encodeURIComponent(searchQuery)}`;
    window.open(googleUrl, '_blank');
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <header className="navbar-container" ref={navRef}>
      <div className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="logo-link">
            <img
              src="/fitness_tracker_logo6.png"
              alt="Fitness Tracker"
              className="logo"
            />
          </Link>
        </div>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <div className="nav-left">
            <Link to="/" className="nav-link">Home</Link>
            
            <div className="dropdown">
              <button className="dropdown-btn">Food Options</button>
              <div className="dropdown-content">
                <Link to="/healthy-food" className="dropdown-link">Healthy Options</Link>
                <Link to="/food-database" className="dropdown-link">Food Database</Link>
              </div>
            </div>

            <div className="dropdown">
              <button className="dropdown-btn">Calculator</button>
              <div className="dropdown-content">
                <Link to="/weight-loss-calculator" className="dropdown-link">Weight Loss</Link>
                <Link to="/bmi-calculator" className="dropdown-link">BMI Calculator</Link>
                <Link to="/body-fat-calculator" className="dropdown-link">Body Fat</Link>
              </div>
            </div>

            <div className="dropdown">
              <button className="dropdown-btn">About Us</button>
              <div className="dropdown-content">
                <Link to="/about" className="dropdown-link">About Us</Link>
                <Link to="/contact" className="dropdown-link">Contact</Link>
              </div>
            </div>

            <Link to="/personal-fitness" className="nav-link">Personal Fitness</Link>
          </div>

          <div className="nav-right">
            <div className="search-container" ref={searchRef}>
              <form onSubmit={handleSearch} className="search-form">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search..."
                  className="search-input"
                  aria-label="Search"
                />
                <button type="submit" className="search-button" aria-label="Submit search">
                  <FaSearch />
                </button>
                {showSuggestions && searchQuery.trim() && (
                  <div 
                    ref={suggestionRef}
                    className="search-suggestions"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--background)',
                      border: '1px solid var(--border-color)',
                      borderTop: 'none',
                      borderRadius: '0 0 4px 4px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      maxHeight: '300px',
                      overflowY: 'auto',
                    }}
                  >
                    {filteredPages.length > 0 ? (
                      filteredPages.map((page) => (
                        <div
                          key={page.path}
                          onClick={(e) => handleSuggestionClick(e, page.path)}
                          className="search-suggestion"
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'background-color 0.2s',
                            fontSize: '0.95rem',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--background-secondary)')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {page.title}
                        </div>
                      ))
                    ) : (
                      <div
                        onClick={handleGoogleClick}
                        className="search-suggestion"
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          color: 'var(--primary-color)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.95rem',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--background-secondary)')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        onMouseDown={(e) => e.preventDefault()} // Prevents input blur
                      >
                        <span>Search "{searchQuery}" on Google</span>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <button 
              className="icon-button" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>

            {currentUser ? (
              <div className="user-menu-container">
                <button 
                  className="user-button" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label={`User menu for ${currentUser.displayName || 'User'}`}
                >
                  <FaUser className="user-icon" />
                  <div className="user-name">
                    {currentUser.displayName || 'User'}
                  </div>
                  <div className={`dropdown-arrow ${showUserMenu ? 'rotate' : ''}`}>
                    ▼
                  </div>
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      Profile
                    </Link>
                    <button 
                      className="dropdown-item"
                      onClick={async () => {
                        try {
                          await auth.signOut();
                          setShowUserMenu(false);
                          navigate('/');
                        } catch (error) {
                          console.error('Error signing out:', error);
                        }
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="login-button-container">
                <Link to="/login" className="login-button" aria-label="Login">
                  <FaUser />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
