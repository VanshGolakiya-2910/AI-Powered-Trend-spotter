// components/Charts/TrendWordCloud.jsx
import React from "react";
import WordCloud from "react-d3-cloud";

function TrendWordCloud({ trends }) {
  if (!trends || trends.length === 0) return <p>No data available</p>;

  const maxVolume = Math.max(...trends.map((trend) => trend.volume || 1));
  const wordCloudData = trends.map((trend) => ({
    text: trend.trend_name,
    value: (trend.volume / maxVolume) * 100,
  }));

  const fontSizeMapper = (word) => {
    const size = Math.log2(word.value + 1) * 8;
    return Math.max(20, Math.min(size, 80)); // Balanced for card size
  };

  const rotate = () => (Math.random() > 0.5 ? 0 : 90);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <WordCloud
        data={wordCloudData}
        fontSizeMapper={fontSizeMapper}
        rotate={rotate}
        width={300}
        height={undefined}
      />
    </div>
  );
}

export default TrendWordCloud;
