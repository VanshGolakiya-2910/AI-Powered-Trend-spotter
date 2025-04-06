import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";
import "./Dashboard.css";

function Dashboard() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [error, setError] = useState(null);
  const [expandedTrendId, setExpandedTrendId] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);

  const BASE_URL = "http://localhost:5000/api/trends";

  const fetchAllTrends = async () => {
    try {
      setLoading(true);
      setAnimateItems(false);
      const response = await axios.get(BASE_URL);
      setTrends(response.data);
      setTimeout(() => {
        setAnimateItems(true);
      }, 100);
      setError(null);
    } catch (error) {
      setError("Failed to fetch trends.");
    } finally {
      setLoading(false);
    }
  };

  const searchTrends = async () => {
    if (!searchKeyword) return;
    try {
      setLoading(true);
      setAnimateItems(false);
      const response = await axios.get(`${BASE_URL}/search?keyword=${searchKeyword}`);
      setTrends(response.data);
      setTimeout(() => {
        setAnimateItems(true);
      }, 100);
    } catch (error) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterBySentiment = async (sentiment) => {
    try {
      setLoading(true);
      setAnimateItems(false);
      const response = await axios.get(`${BASE_URL}/sentiment/${sentiment}`);
      setTrends(response.data);
      setTimeout(() => {
        setAnimateItems(true);
      }, 100);
    } catch (error) {
      setError("Filtering failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopTrends = async (count = 5) => {
    try {
      setLoading(true);
      setAnimateItems(false);
      const response = await axios.get(`${BASE_URL}/top/${count}`);
      setTrends(response.data);
      setTimeout(() => {
        setAnimateItems(true);
      }, 100);
    } catch (error) {
      setError("Top trends loading failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedTrendId((prevId) => (prevId === id ? null : id));
  };

  useEffect(() => {
    setFadeIn(true);
    fetchAllTrends();
  }, []);

  return (
    <div className={`dashboard-container ${fadeIn ? 'fade-in' : ''}`}>
      <Navbar />
      <div className="container py-4">
        <h1 className="text-center mb-4 text-dark fw-bold title-animation">
          Trending Topics Dashboard
        </h1>

        {/* Controls */}
        <div className="d-flex flex-wrap gap-3 justify-content-center mb-4 controls-animation">
          <input
            type="text"
            placeholder="Search keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="form-control w-auto input-animation"
          />
          <button className="btn btn-primary button-animation" onClick={searchTrends}>
            Search
          </button>

          <select
            className="form-select w-auto select-animation"
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

          <button className="btn btn-success button-animation" onClick={() => fetchTopTrends(5)}>
            Top 5 by Volume
          </button>
          <button className="btn btn-secondary button-animation" onClick={fetchAllTrends}>
            Show All Trends
          </button>
        </div>

        {error && <p className="text-danger text-center error-animation">{error}</p>}
        {loading ? (
          <p className="text-center loading-animation">Loading trends...</p>
        ) : trends.length === 0 ? (
          <p className="text-center no-trends-animation">No trends available.</p>
        ) : (
          <div className="list-group list-animation">
            <div className="list-group-item bg-dark text-white fw-bold d-flex justify-content-between text-uppercase header-animation">
              <span style={{ flex: 2 }}>Trend Name</span>
              <span style={{ flex: 1 }}>Sentiment</span>
              <span style={{ flex: 1 }}>Volume</span>
              <span style={{ flex: 3 }}>Top Keywords</span>
            </div>

            {trends.map((trend, index) => (
              <div 
                key={trend._id} 
                className={`list-item-animation ${animateItems ? 'show' : ''}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div
                  className="list-group-item d-flex justify-content-between bg-white item-row-animation"
                  onClick={() => toggleExpand(trend._id)}
                >
                  <span style={{ flex: 2 }}>{trend.trend_name}</span>
                  <span style={{ flex: 1 }}>{trend.sentiment}</span>
                  <span style={{ flex: 1 }}>{trend.volume}</span>
                  <span style={{ flex: 3 }}>{trend.top_keywords?.join(", ")}</span>
                </div>

                <div
                  className={`expandable-section ${
                    expandedTrendId === trend._id ? "expanded" : ""
                  }`}
                >
                  <p>
                    <strong>Description:</strong>{" "}
                    {trend.description || "No description available."}
                  </p>
                  <p>
                    <strong>All Keywords:</strong>{" "}
                    {trend.top_keywords?.join(", ") || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;