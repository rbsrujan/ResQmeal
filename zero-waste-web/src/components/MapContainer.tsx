import React, { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

// Fix for default marker icons not showing in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for different types
const getDivIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #1E293B; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const icons = {
  donor: getDivIcon('#16A34A'), // Green
  receiver: getDivIcon('#3B82F6'), // Blue
  point: getDivIcon('#EAB308'), // Yellow
  agent: getDivIcon('#F97316'), // Orange
};

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  type: 'donor' | 'receiver' | 'point' | 'agent';
  title: string;
  details?: string;
  status?: string;
}

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  showRoute?: { origin: { lat: number; lng: number }; destination: { lat: number; lng: number } };
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

const RoutingComponent = ({ showRoute }: { showRoute: { origin: { lat: number; lng: number }; destination: { lat: number; lng: number } } }) => {
  const map = useMap();

  useEffect(() => {
    if (!showRoute || !map) return;
    
    // Type assertions needed because leaflet-routing-machine isn't perfectly typed
    const LRM = (L as any).Routing;
    
    if (!LRM) {
      console.warn("Leaflet Routing Machine not loaded");
      return;
    }

    const routingControl = LRM.control({
      waypoints: [
        L.latLng(showRoute.origin.lat, showRoute.origin.lng),
        L.latLng(showRoute.destination.lat, showRoute.destination.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#16A34A', weight: 6, opacity: 0.8 }]
      },
      createMarker: () => null, // Don't create default routing markers
    }).addTo(map);

    // Hide the routing instructions panel via DOM manipulation for cleaner UI
    const container = routingControl.getContainer();
    if (container) {
      container.style.display = 'none';
    }

    return () => {
      try {
        if (map && routingControl) {
          map.removeControl(routingControl);
        }
      } catch (e) {
        // ignore unmount errors from routing machine
      }
    };
  }, [map, showRoute]);

  return null;
};

const CenterUpdater = ({ center }: { center: { lat: number; lng: number } }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapContainer: React.FC<MapProps> = ({ 
  center = { lat: 12.9716, lng: 77.5946 }, 
  zoom = 12, 
  markers = [], 
  showRoute,
  onMarkerClick,
  className 
}) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>(center);

  // Use geolocation to center the map if no center is provided
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.warn("Geolocation permission denied. Using default center.");
        }
      );
    }
  }, []); // Only run once

  return (
    <div className={`w-full h-full min-h-[400px] z-[0] relative ${className || ''}`}>
      <LeafletMap 
        center={[currentLocation.lat, currentLocation.lng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: '1.5rem', zIndex: 0 }}
        zoomControl={false} // We can add it back manually if we want it placed elsewhere
      >
        <CenterUpdater center={currentLocation} />
        
        {/* CartoDB Dark Matter Base Map */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={icons[marker.type]}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) onMarkerClick(marker);
              },
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 text-[#0F172A] min-w-[120px]">
                <h4 className="font-bold border-b border-[#E2E8F0] pb-1 mb-1">{marker.title}</h4>
                <p className="text-xs font-semibold capitalize text-[#64748B] mb-1">{marker.type}</p>
                {marker.details && <p className="text-xs mb-1">{marker.details}</p>}
                {marker.status && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#16A34A] text-white font-bold inline-block mt-1">
                    {marker.status}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {showRoute && <RoutingComponent showRoute={showRoute} />}
      </LeafletMap>
    </div>
  );
};

export default React.memo(MapContainer);

// Resubmission commit update
