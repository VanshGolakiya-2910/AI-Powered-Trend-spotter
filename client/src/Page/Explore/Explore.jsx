import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from '../../Components/Navbar/Navbar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF4444"]; // Positive, Neutral, Negative

function Explore() {
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/trends");
        setTrends(res.data);
      } catch (err) {
        console.error("Error fetching trends", err);
      }
    };

    fetchTrends();
  }, []);

  const volumeData = trends.map(trend => ({
    name: trend.trend_name,
    volume: trend.volume,
  }));

  const sentimentCounts = trends.reduce((acc, trend) => {
    acc[trend.sentiment] = (acc[trend.sentiment] || 0) + 1;
    return acc;
  }, {});

  const sentimentData = Object.entries(sentimentCounts).map(([sentiment, count]) => ({
    name: sentiment,
    value: count,
  }));

  return (
    <div className="">
        <Navbar></Navbar>
      <h2 className="text-center mb-4">Explore Trend Data</h2>

      {/* Bar Chart: Volume by Trend */}
      <h5 className="text-center">Trend Volume Comparison</h5>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={volumeData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="volume" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      {/* Pie Chart: Sentiment Distribution */}
      <h5 className="text-center mt-5">Sentiment Distribution</h5>
      <ResponsiveContainer width="100%" height={300}>
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
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Explore;
