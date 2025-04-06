import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import WordCloud from "react-d3-cloud";

const sentimentColorMap = {
  Positive: "#00C49F",
  Neutral: "#FFBB28",
  Negative: "#FF4444",
};

function Explore() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/trends");
        setTrends(res.data);
      } catch (err) {
        console.error("Error fetching trends", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div style={gradientStyle}>
        <Navbar />
        <h2 className="text-center mt-5">Loading trends...</h2>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div style={gradientStyle}>
        <Navbar />
        <h2 className="text-center mt-5">No trends available.</h2>
      </div>
    );
  }

  // Bar Chart Data
  const volumeData = trends.map((trend) => ({
    name: trend.trend_name,
    volume: trend.volume,
  }));

  // Pie Chart Data
  const sentimentCounts = trends.reduce((acc, trend) => {
    acc[trend.sentiment] = (acc[trend.sentiment] || 0) + 1;
    return acc;
  }, {});

  const sentimentData = Object.entries(sentimentCounts).map(
    ([sentiment, count]) => ({
      name: sentiment,
      value: count,
    })
  );

  // Word Cloud Data
  const maxVolume = Math.max(...trends.map((trend) => trend.volume));
  const wordCloudData = trends.map((trend) => ({
    text: trend.trend_name,
    value: (trend.volume / maxVolume) * 100,
  }));

  const fontSizeMapper = (word) => {
    const size = Math.log2(word.value) * 5;
    return Math.max(10, Math.min(size, 60));
  };

  const rotate = () => (Math.random() > 0.5 ? 0 : 90);

  return (
    <div style={gradientStyle}>
      <Navbar />
      <div className="container py-5">
        <h2 className="text-center mb-5 fw-bold">Explore Trend Data</h2>

        {/* Bar Chart */}
        <h5 className="text-center mt-4 mb-3 fw-semibold">Trend Volume Comparison</h5>
        <div className="mx-auto" style={{ width: "85%", height: "500px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={volumeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="volume" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <h5 className="text-center mt-5 mb-3 fw-semibold">Sentiment Distribution</h5>
        <div className="mx-auto" style={{ width: "85%", height: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {sentimentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={sentimentColorMap[entry.name] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Word Cloud */}
        <h5 className="text-center mt-5 mb-3 fw-semibold">Explore Trends</h5>
        <div className="mx-auto" style={{ width: "90%", height: "400px", overflow: "hidden" }}>
          <WordCloud
            data={wordCloudData}
            fontSizeMapper={fontSizeMapper}
            rotate={rotate}
            width={window.innerWidth * 0.9}
            height={400}
          />
        </div>
      </div>
    </div>
  );
}

const gradientStyle = {
  background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  minHeight: "100vh",
};

export default Explore;
