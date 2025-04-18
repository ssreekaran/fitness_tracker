import React from 'react';
import Dropdown from "./Dropdown/Dropdown";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import LoginForm from "./Dropdown/LoginForm";
import DarkModeToggle from "./Dark";

function Header() {
  // State to control dropdown open/close from parent
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

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
              buttonText="Login"
              content={<LoginForm onSignUpClick={() => setDropdownOpen(false)} />}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
