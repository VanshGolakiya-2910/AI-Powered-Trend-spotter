// components/Charts/SentimentPieChart.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const sentimentColorMap = {
  Positive: "#00C49F",
  Neutral: "#FFBB28",
  Negative: "#FF4444",
};

function SentimentPieChart({ data }) {
  const sentimentCounts = data.reduce((acc, trend) => {
    acc[trend.sentiment] = (acc[trend.sentiment] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(sentimentCounts).map(([sentiment, count]) => ({
    name: sentiment,
    value: count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={60} // 🔹 Reduced for smaller size
          innerRadius={30} // 🔹 Optional: donut shape
          label={({ name }) => name} // 🔹 Less cluttered label
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={sentimentColorMap[entry.name] || "#8884d8"} />
          ))}
        </Pie>
        <Tooltip />
        {/* Remove legend if it's too tight */}
      </PieChart>
    </ResponsiveContainer>
  );
}

export default SentimentPieChart;
