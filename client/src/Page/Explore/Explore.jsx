import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";
// import "./Explore.css";
// 
function Explore() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState(null);
  const [expandedTrendId, setExpandedTrendId] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);

  const BASE_URL = "http://localhost:5000/api/futuretrends";

  const fetchAllTrends = async () => {
    try {
      setLoading(true);
      setAnimateItems(false);
      const response = await axios.get(BASE_URL);
      setTrends(response.data);
      setTimeout(() => setAnimateItems(true), 100);
      setError(null);
    } catch (error) {
      setError("Failed to fetch future trends.");
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
      setTimeout(() => setAnimateItems(true), 100);
    } catch (error) {
      setError("Search failed. Please try again.");
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

  // Group trends by date and sort each group by alphabetical order of trend name
  const groupedByDate = trends.reduce((acc, trend) => {
    const dateStr = new Date(trend.timestamp).toLocaleDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(trend);
    return acc;
  }, {});

  const sortedDateKeys = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className={`dashboard-container ${fadeIn ? "fade-in" : ""}`}>
      <Navbar />
      <div className="container py-4">
        <h1 className="text-center mb-4 text-dark fw-bold title-animation">
          Future Trend Predictions
        </h1>

        {/* Controls */}
        <div className="d-flex flex-wrap gap-3 justify-content-center mb-4 controls-animation">
          <input
            type="text"
            placeholder="Search by trend name..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="form-control w-auto input-animation"
          />
          <button className="btn btn-primary button-animation" onClick={searchTrends}>
            Search
          </button>
          <button className="btn btn-secondary button-animation" onClick={fetchAllTrends}>
            Show All
          </button>
        </div>

        {error && <p className="text-danger text-center error-animation">{error}</p>}
        {loading ? (
          <p className="text-center loading-animation">Loading future trends...</p>
        ) : trends.length === 0 ? (
          <p className="text-center no-trends-animation">No future trends available.</p>
        ) : (
          <div className="list-group list-animation">
            {sortedDateKeys.map((date, idx) => {
              const trendsForDate = groupedByDate[date].sort((a, b) =>
                a.trend_name.localeCompare(b.trend_name)
              );
              return (
                <div key={idx}>
                  <h5 className="bg-light p-2 mb-2 mt-4 border fw-semibold rounded shadow-sm">
                    {date}
                  </h5>
                  <div className="list-group-item bg-dark text-white fw-bold d-flex justify-content-between text-uppercase header-animation">
                    <span style={{ flex: 3 }}>Trend Name</span>
                    <span style={{ flex: 7 }}>Description</span>
                  </div>

                  {trendsForDate.map((trend, index) => (
                    <div
                      key={trend._id}
                      className={`list-item-animation ${animateItems ? "show" : ""}`}
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <div
                        className="list-group-item d-flex justify-content-between bg-white item-row-animation"
                        onClick={() => toggleExpand(trend._id)}
                      >
                        <span style={{ flex: 3 }}>{trend.trend_name}</span>
                        <span
                          style={{
                            flex: 7,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {trend.description?.slice(0, 100)}...
                        </span>
                      </div>

                      <div
                        className={`expandable-section ${
                          expandedTrendId === trend._id ? "expanded" : ""
                        }`}
                      >
                        <p>
                          <strong>Full Description:</strong> {trend.description}
                        </p>
                        <p>
                          <strong>Predicted For:</strong>{" "}
                          {new Date(trend.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;
