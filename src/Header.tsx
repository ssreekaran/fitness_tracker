import React from 'react';
import Dropdown from "./Dropdown/Dropdown";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import LoginForm from "./Dropdown/LoginForm";
import UserDropdownContent from "./Dropdown/UserDropdownContent";
import DarkModeToggle from "./Dark";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

function Header() {
  // State to control dropdown open/close from parent
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header>
      <nav className="navbar fixed-top navbar-expand-md navbar-light bg-transparent">
        <div className="container">
          <Navbar />
          <SearchBar />
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
