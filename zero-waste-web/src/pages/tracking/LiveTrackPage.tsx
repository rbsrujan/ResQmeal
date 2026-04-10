import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Polyline,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ArrowLeft, 
  Clock, 
  Phone, 
  Package
} from 'lucide-react';

// Custom icons using emojis
const createEmojiIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));">${emoji}</div>`,
    className: 'custom-emoji-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const donorIcon = createEmojiIcon('🍱');
const receiverIcon = createEmojiIcon('🏠');

const MovingMarker = ({ pos, heading }: { pos: [number, number], heading: number }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(pos, { animate: true });
  }, [pos, map]);

  return (
    <Marker 
      position={pos} 
      icon={L.divIcon({
        html: `
          <div style="transform: rotate(${heading}deg); transition: transform 0.5s;">
            <div style="font-size: 32px;">🚴</div>
          </div>
        `,
        className: 'volunteer-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      })}
    />
  );
};

export const LiveTrackPage = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<any>(null);
  const [volunteerLocation, setVolunteerLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [stats, setStats] = useState({ distance: 0, duration: 0 });

  useEffect(() => {
    if (!donationId) return;

    const fetchData = async () => {
      // 1. Fetch donation and associated positions
      const { data: donationData, error: donationErr } = await supabase
        .from('donations')
        .select(`
          *,
          donor:profiles!donor_id(full_name, phone, lat, lng),
          receiver:profiles!accepted_by(full_name, phone, receiver_lat, receiver_lng, receiver_address, receiver_landmark)
        `)
        .eq('id', donationId)
        .single();

      if (donationErr) {
        console.error(donationErr);
        return;
      }
      setDonation(donationData);

      // 2. Fetch initial volunteer location
      const { data: locData } = await supabase
        .from('live_locations')
        .select('*')
        .eq('donation_id', donationId)
        .maybeSingle();

      if (locData) {
        setVolunteerLocation(locData);
      }
      setLoading(false);
    };

    fetchData();

    // 3. Real-time subscription
    const channel = supabase
      .channel(`track-${donationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_locations',
        filter: `donation_id=eq.${donationId}`
      }, (payload) => {
        setVolunteerLocation(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_locations',
        filter: `donation_id=eq.${donationId}`
      }, (payload) => {
        setVolunteerLocation(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [donationId]);

  // Fetch OSRM route when volunteer moves
  useEffect(() => {
    if (!volunteerLocation || !donation) return;

    const fetchRoute = async () => {
      const drone = [volunteerLocation.volunteer_lat, volunteerLocation.volunteer_lng];
      const target = donation.pickup_status === 'picked_up' 
        ? [donation.receiver.receiver_lat, donation.receiver.receiver_lng]
        : [donation.donor_lat, donation.donor_lng];

      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${drone[1]},${drone[0]};${target[1]},${target[0]}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          setRouteCoords(coords);
          setStats({
            distance: data.routes[0].distance / 1000,
            duration: data.routes[0].duration / 60
          });
        }
      } catch (e) {
        console.error('OSRM fail', e);
      }
    };

    fetchRoute();
  }, [volunteerLocation, donation]);

  if (loading) return (
    <div style={{ height: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <Clock className="animate-spin" /> Tracking Parcel...
    </div>
  );

  return (
    <div style={{ height: '100vh', background: '#0F172A', position: 'relative', overflow: 'hidden' }}>
      {/* Header Overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '20px', background: 'linear-gradient(180deg, rgba(15,23,42,0.95), transparent)',
        display: 'flex', alignItems: 'center', gap: '20px'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
        >
          <ArrowLeft color="#0F172A" />
        </button>
        <div>
          <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '2px' }}>Live Tracking</h1>
          <p style={{ color: '#94A3B8', fontSize: '13px' }}>ID: {donationId?.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Map View */}
      <div style={{ height: '100%', width: '100%' }}>
        <MapContainer 
          center={[donation.donor_lat, donation.donor_lng]} 
          zoom={15} 
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Volunteer */}
          {volunteerLocation && (
            <MovingMarker 
              pos={[volunteerLocation.volunteer_lat, volunteerLocation.volunteer_lng]} 
              heading={volunteerLocation.heading || 0} 
            />
          )}

          {/* Donor */}
          <Marker position={[donation.donor_lat, donation.donor_lng]} icon={donorIcon}>
            <MarkerPopup title="Pickup point" subtitle={donation.location} />
          </Marker>

          {/* Receiver */}
          <Marker position={[donation.receiver.receiver_lat, donation.receiver.receiver_lng]} icon={receiverIcon}>
            <MarkerPopup title="Delivery point" subtitle={donation.receiver.receiver_address} />
          </Marker>

          {/* Route Line */}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} pathOptions={{ color: '#3B82F6', weight: 6, opacity: 0.8, lineCap: 'round' }} />
          )}
        </MapContainer>
      </div>

      {/* Bottom Status Card */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '20px', right: '20px', zIndex: 1000,
        background: '#1E293B', borderRadius: '24px', padding: '24px', border: '1px solid #334155',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Package size={18} color="#60A5FA" />
              <span style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '16px' }}>{donation.food_name}</span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '13px' }}>
              Status: <span style={{ color: '#F97316', fontWeight: 700 }}>{donation.pickup_status?.replace('_', ' ').toUpperCase()}</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontWeight: 800, fontSize: '20px' }}>
              <Clock size={20} /> ~{Math.round(stats.duration)} min
            </div>
            <p style={{ color: '#94A3B8', fontSize: '13px' }}>{stats.distance.toFixed(1)} km away</p>
          </div>
        </div>

        <div style={{ height: '1px', background: '#334155', margin: '0 0 20px 0' }} />

        {/* Volunteer Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '16px', 
              background: '#3B82F622', border: '1px solid #3B82F644',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
            }}>
              🚴
            </div>
            <div>
              <p style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>ASSIGNED VOLUNTEER</p>
              <p style={{ color: '#F8FAFC', fontWeight: 600 }}>Active Rider</p>
            </div>
          </div>
          <a 
            href={`tel:${donation.donor.phone}`} 
            style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              background: '#16A34A22', color: '#16A34A', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #16A34A44', textDecoration: 'none'
            }}
          >
            <Phone size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

const MarkerPopup = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div style={{ padding: '4px' }}>
    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{title}</h4>
    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>{subtitle}</p>
  </div>
);

// Resubmission commit update
