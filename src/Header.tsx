import Dropdown from "./Dropdown/Dropdown";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import LoginForm from "./Dropdown/LoginForm";
import DarkModeToggle from "./dark";

function Header() {
  return (
    <body>
      <div className="bgimg w3-display-container w3-animate-opacity">
        <nav className="navbar fixed-top navbar-expand-md navbar-light bg-transparent">
          <div className="container">
            <Navbar />
            <SearchBar />
            <div className="d-flex align-items-center gap-3">
              <DarkModeToggle />
              <Dropdown buttonText="Login" content={<LoginForm />} />
            </div>
          </div>
        </nav>
      </div>
    </body>
  );
}

export default Header;
