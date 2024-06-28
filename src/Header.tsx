import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
function Header() {
  return (
    <body>
      <div className="bgimg w3-display-container w3-animate-opacity">
        <nav className="navbar fixed-top navbar-expand-md navbar-light bg-transparent">
          <div className="container">
            <Navbar />
            <SearchBar />
          </div>
        </nav>
      </div>
    </body>
  );
}

export default Header;
