import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons using emojis for better visualization
const createEmojiIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="font-size: 24px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">${emoji}</div>`,
    className: 'custom-emoji-icon',
    iconSize: [30, 30],
    iconAnchor: [0, 0]
  });
};

const volunteerIcon = createEmojiIcon('🚴');
const donorIcon = createEmojiIcon('🍱');
const receiverIcon = createEmojiIcon('🏠');

interface RouteMapProps {
  volunteerPos: [number, number] | null;
  donorPos: [number, number];
  receiverPos: [number, number];
  isPickedUp: boolean;
}

// Helper to auto-fit bounds when markers change
const ChangeView = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
  }, [bounds, map]);
  return null;
};

export const RouteMap = ({ 
  volunteerPos, 
  donorPos, 
  receiverPos, 
  isPickedUp 
}: RouteMapProps) => {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!volunteerPos) return;

      // Leg 1: Volunteer to Donor
      // Leg 2: Donor to Receiver
      // If already picked up, we just care about Volunteer to Receiver
      
      let waypoints = '';
      if (!isPickedUp) {
        waypoints = `${volunteerPos[1]},${volunteerPos[0]};${donorPos[1]},${donorPos[0]};${receiverPos[1]},${receiverPos[0]}`;
      } else {
        waypoints = `${volunteerPos[1]},${volunteerPos[0]};${receiverPos[1]},${receiverPos[0]}`;
      }

      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
        );
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
          );
          setRouteCoords(coords);
          setDistance(data.routes[0].distance / 1000); // meters to km
          setDuration(data.routes[0].duration / 60);    // seconds to minutes
        }
      } catch (err) {
        console.error('Routing failed:', err);
      }
    };

    fetchRoute();
  }, [volunteerPos, donorPos, receiverPos, isPickedUp]);

  // Determine center and bounds
  const markers = [donorPos, receiverPos];
  if (volunteerPos) markers.push(volunteerPos);
  
  const bounds = L.latLngBounds(markers.map(m => [m[0], m[1]]));

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155', position: 'relative' }}>
      <MapContainer 
        center={volunteerPos || donorPos} 
        zoom={13} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView bounds={bounds} />

        {volunteerPos && (
          <Marker position={volunteerPos} icon={volunteerIcon}>
            <Popup>You are here 🚴</Popup>
          </Marker>
        )}

        <Marker position={donorPos} icon={donorIcon}>
          <Popup>Pickup Point 🍱</Popup>
        </Marker>

        <Marker position={receiverPos} icon={receiverIcon}>
          <Popup>Delivery Point 🏠</Popup>
        </Marker>

        {routeCoords.length > 0 && (
          <Polyline 
            positions={routeCoords} 
            pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.7 }} 
          />
        )}
      </MapContainer>

      {/* Stats Overlay */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid #334155',
        borderRadius: '12px', padding: '12px 16px',
        color: '#F8FAFC', backdropFilter: 'blur(8px)'
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#60A5FA', marginBottom: 4, letterSpacing: '0.05em' }}>
          ROUTING INFO
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <div style={{ color: '#94A3B8', fontSize: 11 }}>Distance</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{distance.toFixed(1)} km</div>
          </div>
          <div>
            <div style={{ color: '#94A3B8', fontSize: 11 }}>Est. Time</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{Math.round(duration)} min</div>
          </div>
        </div>
      </div>
    </div>
  );
};
