import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function TrendLineChart({ trends = [] }) {
  if (!Array.isArray(trends) || trends.length === 0) {
    return <p className="text-center text-muted">No trend data available.</p>;
  }

  const chartData = trends.map((trend) => ({
    name: trend.trend_name,
    volume: trend.volume,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={false} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="volume"
          stroke="#003f5c"
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default TrendLineChart;
