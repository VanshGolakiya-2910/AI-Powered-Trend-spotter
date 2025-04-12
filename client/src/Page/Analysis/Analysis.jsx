import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; 
import "./Analysis.css";
import Navbar from "../../Components/Navbar/Navbar";
import "@fortawesome/fontawesome-free/css/all.min.css";
import TrendLineChart from "../../Components/Charts/TrendLineChart";
import SentimentPieChart from "../../Components/Charts/SentimentPieChart";
import TrendWordCloud from "../../Components/Charts/TrendWordCloud"; 
function Analysis() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTrends, setAllTrends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("latest");
  const topTrendsRef = useRef(null);
  const sentimentRef = useRef(null);
  const keywordsRef = useRef(null);
  const dashboardRef = useRef(null); // for Dashboard/home

  // --- Parse helper for 'top_keywords' field
  const parseKeywords = (raw) => {
    try {
      if (!raw) return [];

      // If already valid keyword array
      if (
        Array.isArray(raw) &&
        typeof raw[0] === "string" &&
        !raw[0].includes("[")
      ) {
        return raw;
      }

      const str = Array.isArray(raw) ? raw[0] : raw;
      const cleaned = str.replace(/'/g, '"');
      const parsed = JSON.parse(cleaned);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // --- Fetch data once and on interval
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/trends");
        setAllTrends(res.data);
        setTrends(res.data);
      } catch (err) {
        console.error("Error fetching trends", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
    const interval = setInterval(fetchTrends, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- Handle search bar filtering
  const getFilteredTrends = () => {
    let result = [...allTrends];
  
    // Apply time filter
    if (timeFilter === "latest") {
      const latestTimestamp = result.reduce((latest, trend) => {
        const date = new Date(trend.timestamp);
        return !latest || date > latest ? date : latest;
      }, null);
      result = result.filter(
        (trend) =>
          new Date(trend.timestamp).toDateString() ===
          latestTimestamp?.toDateString()
      );
    } else if (timeFilter === "last7days") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter((trend) => new Date(trend.timestamp) >= weekAgo);
    }
  
    // Apply search filter
    if (searchTerm.trim()) {
      result = result.filter((trend) => {
        const name = trend.trend_name?.toLowerCase() || "";
        const keywords = parseKeywords(trend.top_keywords)
          .join(" ")
          .toLowerCase();
        return (
          name.includes(searchTerm.toLowerCase()) ||
          keywords.includes(searchTerm.toLowerCase())
        );
      });
    }
  
    return result;
  };
  
  const filteredTrends = getFilteredTrends();

  // --- Analytics using filtered data
  const totalTrends = filteredTrends.length;
  const totalVolume = filteredTrends.reduce(
    (acc, item) => acc + item.volume,
    0
  );

  const sentiments = { Positive: 0, Neutral: 0, Negative: 0 };
  filteredTrends.forEach((trend) => {
    sentiments[trend.sentiment] = (sentiments[trend.sentiment] || 0) + 1;
  });

  const getPercent = (sentiment) =>
    totalTrends ? ((sentiments[sentiment] / totalTrends) * 100).toFixed(0) : 0;

  // --- Top 5 trends (volume-based)
  const topTrends = [...filteredTrends]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  // --- Unique top keywords across distinct trends
  const usedTrendIds = new Set();
  const sortedTrends = [...trends].sort((a, b) => b.volume - a.volume);

  const keywordMap = new Map();

  sortedTrends.forEach((trend) => {
    if (Array.isArray(trend.top_keywords) && trend.top_keywords.length > 0) {
      const keyword = trend.top_keywords[0].toLowerCase(); // take first keyword
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, {
          volume: trend.volume,
          description: trend.trend_description || "No description available.",
        });
      }
    }
  });

  const topKeywords = Array.from(keywordMap.entries())
    .sort((a, b) => b[1].volume - a[1].volume)
    .slice(0, 6); // limit to 6

  // --- Descriptions for keyword cards
  const trendDescriptions = {};
  filteredTrends.forEach((trend) => {
    const keywords = parseKeywords(trend.top_keywords);
    keywords.forEach((keyword) => {
      const clean = keyword.toLowerCase();
      if (!trendDescriptions[clean]) {
        trendDescriptions[clean] =
          trend.trend_description?.slice(0, 150) || "No description available.";
      }
    });
  });

  //scroll ref
  const scrollToRef = (ref) => {
    ref?.current?.scrollIntoView({ behavior: "smooth" });
  };

  <div className="mb-3">
    <button
      className={`btn ${
        timeFilter === "latest" ? "btn-primary" : "btn-outline-primary"
      } me-2`}
      onClick={() => setTimeFilter("latest")}
    >
      Latest
    </button>
    <button
      className={`btn ${
        timeFilter === "last7days" ? "btn-primary" : "btn-outline-primary"
      }`}
      onClick={() => setTimeFilter("last7days")}
    >
      Last 7 Days
    </button>
  </div>;

  return (
    <div className="trend-spotter">
      <Navbar></Navbar>
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Sidebar */}
          <div className="col-lg-2 sidebar bg-dark text-white py-3 vh-100 position-sticky top-0">
            <div className="d-flex align-items-center justify-content-center mb-4 px-3">
              <i className="fas fa-chart-line text-info me-2 fs-3"></i>
              <h1 className="fs-4 fw-bold mb-0">TrendScope</h1>
            </div>
            <ul className="nav flex-column px-3">
              <li className="nav-item mb-2 rounded active-nav-item">
                <button
                  className="nav-link text-white d-flex align-items-center py-2 px-3"
                  onClick={() => scrollToRef(dashboardRef)}
                >
                  <i className="fas fa-home me-2"></i>
                  <span>Dashboard</span>
                </button>
              </li>
              <li className="nav-item mb-2 rounded">
                <button
                  className="nav-link text-white d-flex align-items-center py-2 px-3"
                  onClick={() => scrollToRef(topTrendsRef)}
                >
                  <i className="fas fa-fire me-2"></i>
                  <span>Trending Now</span>
                </button>
              </li>
              <li className="nav-item mb-2 rounded">
                <button
                  className="nav-link text-white d-flex align-items-center py-2 px-3"
                  onClick={() => scrollToRef(sentimentRef)}
                >
                  <i className="fas fa-chart-bar me-2"></i>
                  <span>Analytics</span>
                </button>
              </li>

              <li className="nav-item mb-2 rounded">
                <button
                  className="nav-link text-white d-flex align-items-center py-2 px-3"
                  onClick={() => scrollToRef(keywordsRef)}
                >
                  <i className="fas fa-key me-2"></i>
                  <span>Keyword Tracking</span>
                </button>
              </li>
            </ul>
            <div className="px-3 position-absolute bottom-0 mb-4 w-100">
              <label htmlFor="platform" className="form-label fw-medium mb-2">
                Data Source
              </label>
              <select
                id="platform"
                className="form-select bg-dark text-white border-secondary"
              >
                <option value="twitter">Twitter</option>
                <option value="reddit">Reddit</option>
                <option value="instagram">Instagram</option>
                <option value="all">All Platforms</option>
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-10 p-4">
            {/* Header */}
            <header className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div
                  className="search-container bg-white rounded back-shadow d-flex align-items-center py-2 px-3"
                  style={{ width: "400px" }}
                >
                  <i className="fas fa-search text-secondary me-2"></i>
                  <input
                    type="text"
                    className="form-control border-0 shadow-none"
                    placeholder="Search for trends, keywords, or hashtags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </header>

            {/* Dashboard Cards */}
            <div className="row mb-4" ref={dashboardRef}>
              <div className="col-xl-3 col-md-6 mb-3">
                <div className="card border-0 back-shadow h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-secondary fw-semibold">
                        Active Trends
                      </span>
                      <div className="icon-circle bg-primary text-white">
                        <i className="fas fa-fire"></i>
                      </div>
                    </div>
                    <div className="fs-3 fw-bold mb-1">
                      {loading ? "Loading..." : totalTrends}
                    </div>
                    <div className="text-success d-flex align-items-center small">
                      <i className="fas fa-arrow-up me-1"></i> Live Count
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 mb-3">
                <div className="card border-0 back-shadow h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-secondary fw-semibold">
                        Positive Sentiment
                      </span>
                      <div className="icon-circle bg-info text-white">
                        <i className="fas fa-smile"></i>
                      </div>
                    </div>
                    <div className="fs-3 fw-bold mb-1">
                      {getPercent("Positive") + "%"}
                    </div>
                    <div className="text-success d-flex align-items-center small">
                      <i className="fas fa-arrow-up me-1"></i> Today
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 mb-3">
                <div className="card border-0 back-shadow h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-secondary fw-semibold">
                        Post Volume
                      </span>
                      <div className="icon-circle bg-danger text-white">
                        <i className="fas fa-comment-alt"></i>
                      </div>
                    </div>
                    <div className="fs-3 fw-bold mb-1">{totalVolume}</div>
                    <div className="text-danger d-flex align-items-center small">
                      <i className="fas fa-arrow-down me-1"></i> Live Stats
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 mb-3">
                <div className="card border-0 back-shadow h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-secondary fw-semibold">
                        Neutral Sentiment
                      </span>
                      <div className="icon-circle bg-dark text-white">
                        <i className="fas fa-meh"></i>
                      </div>
                    </div>
                    <div className="fs-3 fw-bold mb-1">
                      {getPercent("Neutral") + "%"}
                    </div>
                    <div className="text-success d-flex align-items-center small">
                      <i className="fas fa-arrow-up me-1"></i> Live Stats
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Sections */}
            <div className="row mb-4" ref={topTrendsRef}>
              <div className="col-lg-8 mb-4">
                <div className="card border-0 back-shadow h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="card-title fw-semibold">Trend Analysis</h5>
                      <div>
                        <div className="mb-3">
                          <button
                            className={`btn ${
                              timeFilter === "latest"
                                ? "btn-primary"
                                : "btn-outline-primary"
                            } me-2`}
                            onClick={() => setTimeFilter("latest")}
                          >
                            Latest
                          </button>
                          <button
                            className={`btn ${
                              timeFilter === "last7days"
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
                            onClick={() => setTimeFilter("last7days")}
                          >
                            Last 7 Days
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-light rounded p-4 text-center text-secondary mb-4">
                      <TrendLineChart trends={filteredTrends}></TrendLineChart>
                    </div>
                    <di
                      v
                      className="d-flex justify-content-between align-items-center mb-4"
                    >
                      <h5 className="card-title fw-semibold">
                        Top Trending Topics
                      </h5>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => window.location.reload()}
                      >
                        <i className="fas fa-sync-alt me-1"></i> Refresh
                      </button>
                    </di>

                    <ul className="list-group list-group-flush">
                      {topTrends.map((trend, index) => (
                        <li
                          key={trend._id}
                          className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center">
                            <span
                              className="text-primary fw-bold me-3"
                              style={{ width: "20px" }}
                            >
                              {index + 1}
                            </span>
                            <span className="fw-semibold">
                              {trend.trend_name}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <span className="small text-secondary">
                              <i className="fas fa-comment me-1"></i>{" "}
                              {trend.volume}
                            </span>
                            <span className="small text-secondary d-flex align-items-center">
                              <div
                                className={
                                  trend.sentiment === "Positive"
                                    ? "bg-success"
                                    : trend.sentiment === "Neutral"
                                    ? "bg-warning"
                                    : "bg-danger"
                                }
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "50%",
                                  marginRight: "5px",
                                }}
                              ></div>
                              {trend.sentiment}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mb-4" ref={sentimentRef}>
                <div className="card border-0 back-shadow h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="card-title fw-semibold">
                        Sentiment Analysis
                      </h5>
                    </div>
                    <div
                      className="bg-light rounded p-4 text-center text-secondary mb-4"
                      style={{ height: "200px" }}
                    >
                      <SentimentPieChart data={filteredTrends} />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="card-title fw-semibold">
                        Emerging Trends
                      </h5>
                    </div>
                    <div className="bg-light rounded p-4 text-center text-secondary">
                      <TrendWordCloud trends={filteredTrends} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords Section */}
            <div className="row" ref={keywordsRef}>
              <div className="col-12">
                <div className="card border-0 back-shadow">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="card-title fw-semibold">
                        Tracked Keywords & Hashtags
                      </h5>
                      <div>
                      </div>
                    </div>

                    <div className="row">
                      {topKeywords.map(([keyword, data], index) => (
                        <div className="col-lg-4 col-md-6 mb-3" key={index}>
                          <div className="card">
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-semibold">#{keyword}</span>
                                <span className="small text-secondary">
                                  {data.volume.toLocaleString()} mentions
                                </span>
                              </div>
                              <div
                                className="desc-color rounded p-2 mt-2"
                                style={{
                                  height: "80px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {data.description?.slice(0, 150) ||
                                  "No description available."}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
