import React, { useState } from "react";
import axios from "axios";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRunPipeline = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/run");
      console.log(response.data.message);
      alert("Pipeline executed successfully!");
    } catch (error) {
      console.error("Pipeline execution failed:", error);
      alert("Failed to execute pipeline.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/data");
      setData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Twitter Topic Dashboard</h1>

      <div className="d-flex justify-content-center gap-3 mb-4">
        <button
          className="btn btn-primary"
          onClick={handleRunPipeline}
          disabled={loading}
        >
          {loading ? "Running..." : "Run Scraper + Model"}
        </button>

        <button className="btn btn-success" onClick={handleFetchData}>
          Fetch Data from Redis
        </button>
      </div>

      <div className="row">
        {data.length === 0 && (
          <p className="text-center">No data to display. Click fetch to load data.</p>
        )}
        {data.map((item, index) => (
          <div className="col-md-6 col-lg-4 mb-4" key={index}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Tweet</h5>
                <p className="card-text">{item.Tweets}</p>

                <p className="mb-1"><strong>Date:</strong> {item.Date}</p>
                <p className="mb-1"><strong>Likes:</strong> {item.Likes}</p>
                <p className="mb-1"><strong>Views:</strong> {item.Views}</p>
                <p className="mb-1"><strong>Hashtags:</strong> {item.Hastags || "None"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
