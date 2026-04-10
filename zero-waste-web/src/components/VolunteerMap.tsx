import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const VolunteerMap = ({ points }: { points: [number, number][] }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  if (!mapLoaded) return <div className="h-64 bg-slate-900 animate-pulse rounded-2xl" />;

  return (
    <div className="h-96 rounded-2xl overflow-hidden border border-white/10 premium-glass relative">
      <MapContainer 
        center={points[0] || [12.9716, 77.5946]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(0.7) contrast(1.2)' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {points.map((p, i) => (
          <Marker key={i} position={p}>
            <Popup>
              {i === 0 ? "Pickup Location" : "Destination"}
            </Popup>
          </Marker>
        ))}
        {points.length > 1 && (
          <Polyline positions={points} color="#3B82F6" weight={3} opacity={0.6} dashArray="10, 10" />
        )}
      </MapContainer>
      <div className="absolute top-4 left-4 z-[1000] p-3 premium-glass rounded-xl border border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase">Live Telemetry</span>
        </div>
      </div>
    </div>
  );
};

// Resubmission commit update
