import Dropdown from "./Dropdown/Dropdown";
import DropdownItem from "./Dropdown/DropdownItem";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
function Header() {
  const items = [1, 2, 3, 4];
  return (
    <body>
      <div className="bgimg w3-display-container w3-animate-opacity">
        <nav className="navbar fixed-top navbar-expand-md navbar-light bg-transparent">
          <div className="container">
            <Navbar />
            <SearchBar />
            <Dropdown
              buttonText="Dropdown button"
              content={
                <>
                  {items.map((item) => (
                    <DropdownItem key={item}>{`Item ${item}`}</DropdownItem>
                  ))}
                </>
              }
            />
          </div>
        </nav>
      </div>
    </body>
  );
}

export default Header;
