import React from "react";
import Navbar from "../../Components/Navbar/Navbar";

function Home() {
  return (
    <div>
      <Navbar />
      <div
        className="d-flex flex-column align-items-center justify-content-center text-center"
        style={{
          height: "90vh",
          background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
          color: "#333",
        }}
      >
        <h1 className="fw-bold mb-3" style={{ fontSize: "3rem" }}>
          Welcome to TrendScope
        </h1>
        <p className="lead mb-4">Explore and analyze what's trending around the world</p>
      </div>
    </div>
  );
}

export default Home;
