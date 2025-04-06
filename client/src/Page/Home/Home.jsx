import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import "./Home.css"; // Make sure to import the CSS

function Home() {
  return (
    <div>
      <Navbar />
      <div className="hero-section d-flex flex-column align-items-center justify-content-center text-center fade-in">
        <h1 className="fw-bold mb-3" style={{ fontSize: "3rem" }}>
          Welcome to TrendScope
        </h1>
        <p className="lead mb-4">
          Explore and analyze what's trending around the world
        </p>
      </div>
    </div>
  );
}

export default Home;
