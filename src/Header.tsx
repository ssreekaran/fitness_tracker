import Dropdown from "./Dropdown/Dropdown";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import LoginForm from "./Dropdown/LoginForm";
function Header() {
  return (
    <body>
      <div className="bgimg w3-display-container w3-animate-opacity">
        <nav className="navbar fixed-top navbar-expand-md navbar-light bg-transparent">
          <div className="container">
            <Navbar />
            <SearchBar />
            <Dropdown buttonText="Login" content={<LoginForm />} />
          </div>
        </nav>
      </div>
    </body>
  );
}

export default Header;
