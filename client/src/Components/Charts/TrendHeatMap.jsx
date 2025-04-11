import React from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const heatColors = {
  low: '#add8e6',
  medium: '#87cefa',
  high: '#4682b4',
};

const getColorByVolume = (volume) => {
  if (volume > 100) return heatColors.high;
  if (volume > 50) return heatColors.medium;
  return heatColors.low;
};

function TrendHeatMap({ trendLocations = [] }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />
      {trendLocations.map((loc, i) => (
        <Circle
          key={i}
          center={[loc.lat, loc.lng]}
          radius={loc.volume * 10000}
          fillColor={getColorByVolume(loc.volume)}
          fillOpacity={0.6}
          stroke={false}
        />
      ))}
    </MapContainer>
  );
}

export default TrendHeatMap;
