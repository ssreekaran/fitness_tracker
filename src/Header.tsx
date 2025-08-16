import React from 'react';
import { Capacitor } from '@capacitor/core';
import Dropdown from "./Dropdown/Dropdown";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import LoginForm from "./Dropdown/LoginForm";
import UserDropdownContent from "./Dropdown/UserDropdownContent";
import DarkModeToggle from "./DarkMode";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";

function Header() {
  // State to control dropdown open/close from parent
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    
    // Check if running on native platform or mobile browser
    const isNativePlatform = Capacitor.isNativePlatform();
    const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    setIsMobile(isNativePlatform || isMobileBrowser);
    
    return () => unsubscribe();
  }, []);

  return (
    <header>
      <nav className="navbar fixed-top navbar-expand-md navbar-light bg-transparent">
        <div className="container">
          <Navbar />
          {!isMobile && <SearchBar />}
          <div className="d-flex align-items-center gap-3">
            <DarkModeToggle />
            <Dropdown
              isOpen={dropdownOpen}
              toggle={() => setDropdownOpen(!dropdownOpen)}
              buttonText={user ? (user.displayName || "Account") : "Login"}
              content={user ? (
                <UserDropdownContent displayName={user.displayName} onLogout={() => setDropdownOpen(false)} />
              ) : (
                <LoginForm onSignUpClick={() => setDropdownOpen(false)} />
              )}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
