import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavLinkItem } from '../../types';
import './styles.css';

interface NavLinksProps {
  links: NavLinkItem[];
  onLinkClick?: () => void;
  isMobile?: boolean;
  user: any; // Replace 'any' with your User type
}

const NavLinks: React.FC<NavLinksProps> = ({ links, onLinkClick, isMobile = false, user }) => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile && activeDropdown) {
        const dropdownElement = dropdownRefs.current[activeDropdown];
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown, isMobile]);

  // Close dropdown when location changes
  useEffect(() => {
    setActiveDropdown(null);
  }, [location]);

  // Filter links based on authentication status
  const filteredLinks = links.filter(link => {
    if (link.requiresAuth && !user) return false;
    if (link.hideWhenAuth && user) return false;
    return true;
  });

  const toggleDropdown = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === title ? null : title);
  };

  const handleLinkClick = (e: React.MouseEvent, link: NavLinkItem) => {
    if (link.children) {
      toggleDropdown(e, link.title);
    } else if (onLinkClick) {
      onLinkClick();
    }
  };

  const renderLink = (link: NavLinkItem, isChild = false) => {
    const isActive = location.pathname === link.path;
    const hasChildren = link.children && link.children.length > 0;
    const isDropdownOpen = activeDropdown === link.title;
    
    if (isChild) {
      return (
        <Link
          key={link.path}
          to={link.path}
          className={`nav-link ${isActive ? 'active' : ''} ${isChild ? 'dropdown-item' : ''}`}
          onClick={onLinkClick}
        >
          {link.title}
        </Link>
      );
    }

    return (
      <div 
        key={link.path} 
        className={`nav-item ${hasChildren ? 'has-dropdown' : ''} ${isDropdownOpen ? 'dropdown-open' : ''}`}
        ref={el => dropdownRefs.current[link.title] = el}
      >
        <Link
          to={link.path}
          className={`nav-link ${isActive ? 'active' : ''} ${hasChildren ? 'has-arrow' : ''}`}
          onClick={(e) => handleLinkClick(e, link)}
        >
          {link.title}
          {hasChildren && (
            <span className={`dropdown-arrow ${isDropdownOpen ? 'rotate' : ''}`} />
          )}
        </Link>
        
        {hasChildren && (
          <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
            {link.children?.map(childLink => renderLink(childLink, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`nav-links ${isMobile ? 'mobile' : 'desktop'}`}>
      {filteredLinks.map(link => renderLink(link))}
    </div>
  );
};

export default NavLinks;
