import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { MobileMenuProps } from '../../types';
import './styles.css';

const MobileMenu: React.FC<MobileMenuProps> = ({ isMenuOpen, toggleMenu, children }) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  if (!isMenuOpen) return null;

  return (
    <div className="mobile-menu-overlay">
      <div className="mobile-menu-content">
        <button 
          className="mobile-menu-close" 
          onClick={toggleMenu}
          aria-label="Close menu"
        >
          <FaTimes />
        </button>
        <div className="mobile-menu-items">
          {React.Children.map(children, (child, index) => (
            <div 
              className="mobile-menu-item" 
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
