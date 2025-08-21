import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { User } from 'firebase/auth';
import './styles.css';

interface UserMenuProps {
  user: User | null;
  onSignOut: () => Promise<void>;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await onSignOut();
    closeMenu();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="user-menu">
        <Link to="/login" className="login-button">
          <FaUserCircle className="user-icon" />
          <span>Login</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className={`user-button ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <FaUser className="user-icon" />
        <span className="user-name">
          {user.displayName || 'User'}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'rotate' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="user-dropdown">
          <Link to="/profile" className="dropdown-item" onClick={closeMenu}>
            <FaUser className="dropdown-icon" />
            <span>Profile</span>
          </Link>
          <button 
            className="dropdown-item"
            onClick={handleSignOut}
          >
            <FaSignOutAlt className="dropdown-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
