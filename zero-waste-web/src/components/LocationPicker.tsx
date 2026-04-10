import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// Fix default marker icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  /**
   * Called with latitude, longitude, and a formatted address when the user selects a location.
   */
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  /** Optional initial coordinates */
  initialLat?: number;
  initialLng?: number;
}

/** Simple reverse‑geocode using Nominatim */
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data.display_name as string;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

/** Forward geocode (search) using Nominatim */
const forwardGeocode = async (query: string) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      query
    )}`
  );
  const results = await res.json();
  return results[0];
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLat,
  initialLng,
}) => {
  const [position, setPosition] = useState<L.LatLngExpression>(
    initialLat && initialLng ? [initialLat, initialLng] : [0, 0]
  );
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState('');
  const [search, setSearch] = useState('');

  // Update address when marker moves
  useEffect(() => {
    if (position && typeof position !== 'string') {
      const [lat, lng] = position as [number, number];
      reverseGeocode(lat, lng).then(setAddress);
    }
  }, [position]);

  // Map click handler
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSelect(e.latlng.lat, e.latlng.lng, address);
      },
    });
    return null;
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError('GPS not supported in this browser.');
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 17);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        const addr = await reverseGeocode(lat, lng);
        setAddress(addr);
        onLocationSelect(lat, lng, addr);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocError('Location access denied. Please allow location in browser settings and try again.');
        } else if (err.code === 2) {
          setLocError('Could not detect location. Make sure GPS is on.');
        } else {
          setLocError('Location request timed out. Try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    const result = await forwardGeocode(search);
    if (result) {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      setPosition([lat, lng]);
      setAddress(result.display_name);
      onLocationSelect(lat, lng, result.display_name);
    }
  };

  return (
    <div className="space-y-4">
        {/* Live location button */}
        <button
          type="button"
          onClick={detectCurrentLocation}
          style={{
            width: '100%',
            padding: '11px 14px',
            background: 'linear-gradient(135deg, #1E3A5F, #1E4A8F)',
            border: '1px solid #3B82F6',
            borderRadius: 8,
            color: '#60A5FA',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 8,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#1E4A8F';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(59,130,246,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #1E3A5F, #1E4A8F)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: 16 }}>📡</span>
          Use My Live Location (GPS)
        </button>

        {/* Loading state */}
        {locating && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px',
            background: '#1E3A5F22',
            border: '1px solid #3B82F644',
            borderRadius: 8, marginBottom: 8
          }}>
            <div style={{
              width: 14, height: 14,
              border: '2px solid #334155',
              borderTop: '2px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0
            }} />
            <span style={{ color: '#60A5FA', fontSize: 12 }}>
              Detecting your GPS location...
            </span>
          </div>
        )}

        {/* Error state */}
        {locError && (
          <div style={{
            padding: '8px 12px',
            background: '#7F1D1D22',
            border: '1px solid #EF444444',
            borderRadius: 8, marginBottom: 8
          }}>
            <span style={{ color: '#FCA5A5', fontSize: 12 }}>
              ⚠️ {locError}
            </span>
            <div style={{ color: '#64748B', fontSize: 11, marginTop: 4 }}>
              You can still drag the pin manually on the map.
            </div>
          </div>
        )}

        {/* OR divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#334155' }} />
          <span style={{ color: '#475569', fontSize: 11 }}>OR SEARCH MANUALLY</span>
          <div style={{ flex: 1, height: 1, background: '#334155' }} />
        </div>

        {/* Search box */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#0F172A] text-[#F8FAFC] border-[#334155] rounded-2xl h-12 px-4 focus:border-[#16A34A]"
          />

        </form>

      {/* Map */}
      <MapContainer
          center={position as [number, number]}
          zoom={13}
          style={{ height: 300, width: '100%', borderRadius: 12, border: '2px solid #334155' }}
          ref={mapRef}
        >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position as [number, number]} draggable={true}
            ref={markerRef}
            eventHandlers={{
              dragend: (e) => {
                const latLng = e.target.getLatLng();
                setPosition([latLng.lat, latLng.lng]);
                reverseGeocode(latLng.lat, latLng.lng).then((addr) => {
                  setAddress(addr);
                  onLocationSelect(latLng.lat, latLng.lng, addr);
                });
              },
            }}
          >
          <Popup>{address || 'Selected location'}</Popup>
        </Marker>
        <MapClickHandler />
      </MapContainer>

      {/* Display selected address */}
      <div className="text-sm text-[#94A3B8]">
        <strong>Selected:</strong> {address || 'Click on the map or search'}
      </div>
    </div>
  );
};

export default LocationPicker;

// Resubmission commit update
