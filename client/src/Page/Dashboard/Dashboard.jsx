import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from '../../Components/Navbar/Navbar'
function Dashboard() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [error, setError] = useState(null);

  const BASE_URL = "http://localhost:5000/api/trends";

  const fetchAllTrends = async () => {
    try {
      setLoading(true);
      const response = await axios.get(BASE_URL);
      setTrends(response.data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch trends.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const searchTrends = async () => {
    if (!searchKeyword) return;
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/search?keyword=${searchKeyword}`);
      setTrends(response.data);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterBySentiment = async (sentiment) => {
    try {
      setLoading(true);
      console.log("Filtering by sentiment:", sentiment);
      const response = await axios.get(`${BASE_URL}/sentiment/${sentiment}`);
      setTrends(response.data);
    } catch (error) {
      console.error("Sentiment filter failed:", error);
      setError("Filtering failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopTrends = async (count = 5) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/top/${count}`);
      setTrends(response.data);
    } catch (error) {
      console.error("Failed to fetch top trends:", error);
      setError("Top trends loading failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTrends();
  }, []);

  return (
    
    <div className="">
      <Navbar></Navbar>
      <h1 className="text-center mb-4 mt-4">Trending Topics Dashboard</h1>

      {/* Controls */}
      <div className="d-flex flex-wrap gap-3 justify-content-center mb-4">
        <input
          type="text"
          placeholder="Search keyword..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="form-control w-auto"
        />
        <button className="btn btn-primary" onClick={searchTrends}>
          Search
        </button>

        <select
          className="form-select w-auto"
          onChange={(e) => {
            const value = e.target.value;
            setSentimentFilter(value);
            if (value) filterBySentiment(value);
          }}
          value={sentimentFilter}
        >
          <option value="">Filter by Sentiment</option>
          <option value="Positive">Positive</option>
          <option value="Neutral">Neutral</option>
          <option value="Negative">Negative</option>
        </select>

        <button className="btn btn-success" onClick={() => fetchTopTrends(5)}>
          Top 5 by Volume
        </button>
        <button className="btn btn-secondary" onClick={fetchAllTrends}>
          Show All Trends
        </button>
      </div>

      {/* Error or Loading */}
      {error && <p className="text-danger text-center">{error}</p>}
      {loading ? (
        <p className="text-center">Loading trends...</p>
      ) : trends.length === 0 ? (
        <p className="text-center">No trends available.</p>
      ) : (
        // Trend List
        <div className="list-group">
          <div className="list-group-item bg-light fw-bold d-flex justify-content-between text-uppercase">
            <span style={{ flex: 2 }}>Trend Name</span>
            <span style={{ flex: 1 }}>Sentiment</span>
            <span style={{ flex: 1 }}>Volume</span>
            <span style={{ flex: 3 }}>Top Keywords</span>
          </div>
          {trends.map((trend) => (
            <div key={trend._id} className="list-group-item d-flex justify-content-between">
              <span style={{ flex: 2 }}>{trend.trend_name}</span>
              <span style={{ flex: 1 }}>{trend.sentiment}</span>
              <span style={{ flex: 1 }}>{trend.volume}</span>
              <span style={{ flex: 3 }}>{trend.top_keywords.join(", ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
