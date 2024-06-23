
function Header(){

    return(
        <body>
            <div className="bgimg w3-display-container w3-animate-opacity">
            {/*<!-- Navbar -->*/}
            <nav className="navbar fixed-top navbar-expand-md navbar-light bg-transparent">
                <div className="container">
                    <a href="index.html">
                        <img className="navbar-brand d-line-block align-top" 
                            src="images/fitness_tracker_logo5.png" alt="Fitness Tracker" width={150} height={150} />
                    </a>
                    {/*<!-- Collapsing Navbar if page too small -->*/}
                    <button 
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    className="navbar-toggler"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div 
                        className="collapse navbar-collapse"
                        id="navbarNav">
                        <ul className="navbar-nav">
                        <li className="nav-item">
                            <a href="index.html" className="nav-link">
                            Home
                            </a>
                        </li>
                        <li className="nav-item dropdown">
                            <a 
                            className="nav-link dropdown-toggle" 
                            id="navbarDropdown"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">
                            Food Options
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a href="#" className="dropdown-item">Healthy Options</a></li>
                            <li><a href="#" className="dropdown-item">Food Database</a></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a 
                            className="nav-link dropdown-toggle" 
                            id="navbarDropdown"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">
                            Calculator
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a href="#" className="dropdown-item">Weight Loss Calculator</a></li>
                            <li><a href="#" className="dropdown-item">Body Fat Calculator</a></li>
                            <li><a href="#" className="dropdown-item">BMI Calculator</a></li>
                            <li><a href="#" className="dropdown-item">Average Calories</a></li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">
                            <a 
                            className="nav-link dropdown-toggle" 
                            id="navbarDropdown"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">
                            About Us
                            </a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a href="#" className="dropdown-item">About Fitness Tracker</a></li>
                            <li><a href="#" className="dropdown-item">Contact Fitness Tracker</a></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            {/*<!-- Currently disabled -->*/}
                            <a href="index.html" className="nav-link disabled">
                            Login
                            </a>
                        </li>
                        </ul>
                    </div>
                    <form className="d-flex">
                        <input type="text" className="form-control me-2"/>
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                </div>
            </nav>
            </div>
        </body>
    );
}

export default Header;