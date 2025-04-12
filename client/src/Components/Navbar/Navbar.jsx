import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import the CSS file

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">TrendScope</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/trends">All Trends</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/Dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/explore">Predicted Trends</Link>
            </li> 
            

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;