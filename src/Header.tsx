import Dropdown from "./Dropdown/Dropdown";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import LoginForm from "./Dropdown/LoginForm";
import DarkModeToggle from "./Dark";

function Header() {
  return (
    <header>
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
    </header>
  );
}

export default Header;
