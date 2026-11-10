import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

// Fix for Leaflet marker icons
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const statusColors = {
  UNSAFE: '#ef4444',
  MARGINAL: '#f59e0b',
  SAFE: '#10b981',
};

export default function MapView() {
  const [geojson, setGeojson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(4);

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/stations/geo');
        setGeojson(response.data);
      } catch (err) {
        console.error("Error fetching geo data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGeoData();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const handleMarkerClick = (station) => {
    setSelectedStation(station);
  };

  const renderMarkers = () => {
    if (!geojson?.features) return null;
    return geojson.features.map((feature) => (
      <CircleMarker
        key={feature.properties.station_code}
        center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
        radius={8}
        color={statusColors[feature.properties.status] || '#64748b'}
        fillColor={statusColors[feature.properties.status] || '#64748b'}
        fillOpacity={0.8}
        weight={2}
        onClick={() => handleMarkerClick(feature.properties)}
      />
    ));
  };

  const renderPopup = () => {
    if (!selectedStation) return null;
    return (
      <Popup
        position={[selectedStation.lat || mapCenter[0], selectedStation.lon || mapCenter[1]]}
        onClose={() => setSelectedStation(null)}
      >
        <div className="p-2 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-slate-800">Station {selectedStation.station_code}</h3>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedStation.status === 'UNSAFE' ? 'bg-red-100 text-red-700' :
                selectedStation.status === 'MARGINAL' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}
            >
              {selectedStation.status === 'UNSAFE' && <ShieldAlert size={10} />}
              {selectedStation.status === 'MARGINAL' && <AlertTriangle size={10} />}
              {selectedStation.status === 'SAFE' && <CheckCircle size={10} />}
              {selectedStation.status}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-1">{selectedStation.station_name}</p>
          <p className="text-sm text-slate-500 mb-2">{selectedStation.state}</p>
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div>
              <span className="text-slate-400">WQI:</span>
              <span className="font-bold text-slate-800 ml-1">{selectedStation.wqi}</span>
            </div>
            <div>
              <span className="text-slate-400">Confidence:</span>
              <span className="font-bold text-slate-800 ml-1">{selectedStation.confidence}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">Top Pollutant: {selectedStation.top_pollutant}</p>
        </div>
      </Popup>
    );
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        onMoveend={(e) => {
          const center = e.target.getCenter();
          const zoom = e.target.getZoom();
          setMapCenter([center.lat, center.lng]);
          setMapZoom(zoom);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {renderMarkers()}
        {renderPopup()}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-10">
        <h4 className="font-bold text-slate-800 mb-3 text-sm">Station Status</h4>
        <div className="space-y-2">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs font-medium text-slate-600 capitalize">{status.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom controls info */}
      <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-10 text-xs text-slate-500">
        <p>Click stations for details</p>
        <p className="mt-1">Zoom: {mapZoom}x</p>
      </div>
    </div>
  );
}