import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useNearbyPickups } from '../../hooks/useNearbyPickups';
import { RouteMap } from '../../components/RouteMap';
import { DeliveryProof } from '../../components/DeliveryProof';
import { MapPin, Navigation, Phone, X } from 'lucide-react';

export const VolunteerDashboard = () => {
  const { profile, user } = useAuth();
  const [volunteerLat, setVolunteerLat] = useState<number | null>(null);
  const [volunteerLng, setVolunteerLng] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'detecting' | 'granted' | 'denied' | 'idle'
  >('idle');
  const [accepting, setAccepting] = useState<string | null>(null);
  const [myActivePickup, setMyActivePickup] = useState<any | null>(null);
  const [radiusKm, setRadiusKm] = useState(15);
  const [isAvailable, setIsAvailable] = useState(true);
  const [receiverProfile, setReceiverProfile] = useState<any | null>(null);
  const [showDeliveryProof, setShowDeliveryProof] = useState(false);

  const { pickups, loading, newPickupAlert, isRadiusRelaxed, refetch } =
    useNearbyPickups(volunteerLat, volunteerLng, radiusKm);

  // Get volunteer's GPS location on mount
  useEffect(() => {
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setVolunteerLat(lat);
        setVolunteerLng(lng);
        setLocationStatus('granted');

        // Save location to profile
        if (user) {
          await supabase
            .from('profiles')
            .update({ lat, lng, is_available: true })
            .eq('id', user.id);
        }
      },
      () => {
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Fetch any active pickup this volunteer already accepted
    fetchMyActivePickup();
  }, [user]);

  const fetchMyActivePickup = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('donations')
      .select('*')
      .eq('volunteer_id', user.id)
      .in('pickup_status', ['volunteer_assigned', 'picked_up'])
      .maybeSingle();
    
    if (data) {
      setMyActivePickup(data);
      fetchReceiverProfile(data.accepted_by);
    } else {
      setMyActivePickup(null);
      setReceiverProfile(null);
    }
  };

  const fetchReceiverProfile = async (receiverId: string) => {
    if (!receiverId) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, receiver_lat, receiver_lng, receiver_address, receiver_landmark')
      .eq('id', receiverId)
      .single();
    if (data) setReceiverProfile(data);
  };

  // BROADCAST LOCATION EFFECT
  useEffect(() => {
    if (!myActivePickup || !volunteerLat || !volunteerLng) return;
    
    // Only broadcast if in progress
    const allowedStatuses = ['volunteer_assigned', 'picked_up'];
    if (!allowedStatuses.includes(myActivePickup.pickup_status)) return;

    const interval = setInterval(async () => {
      // Upsert into live_locations
      await supabase
        .from('live_locations')
        .upsert({
          donation_id: myActivePickup.id,
          volunteer_lat: volunteerLat,
          volunteer_lng: volunteerLng,
          updated_at: new Date().toISOString()
        }, { onConflict: 'donation_id' });
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [myActivePickup?.id, volunteerLat, volunteerLng, myActivePickup?.pickup_status]);

  const toggleAvailability = async () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    if (user) {
      await supabase
        .from('profiles')
        .update({ is_available: newStatus })
        .eq('id', user.id);
    }
  };

  const acceptPickup = async (donationId: string) => {
    if (!user) return;
    setAccepting(donationId);

    const { data, error } = await supabase
      .from('donations')
      .update({
        volunteer_id: user.id,
        volunteer_accepted_at: new Date().toISOString(),
        pickup_status: 'volunteer_assigned'
      })
      .eq('id', donationId)
      .eq('pickup_status', 'awaiting_volunteer')
      .select()
      .single();

    if (error) {
      if (error.message.includes('row-level security') ||
          error.message.includes('violates')) {
        alert('Permission error: Ask admin to run updated RLS SQL.');
      } else if (error.code === 'PGRST116') {
        alert('This pickup was just taken by another volunteer.');
      } else {
        alert(`Error: ${error.message}`);
      }
      setAccepting(null);
      return;
    }

    setMyActivePickup(data);
    refetch();
    setAccepting(null);
  };

  const markPickedUp = async (donationId: string) => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({ pickup_status: 'picked_up' })
        .eq('id', donationId)
        .eq('volunteer_id', user?.id);

      if (error) throw error;
      fetchMyActivePickup();
    } catch (err: any) {
      alert(`Error picking up: ${err.message}`);
    }
  };

  const markDelivered = async (donationId: string) => {
    try {
      // Generate a simple 4-digit OTP if not exists
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { error } = await supabase
        .from('donations')
        .update({ delivery_otp: otp })
        .eq('id', donationId);

      if (error) throw error;
      setShowDeliveryProof(true);
    } catch (err: any) {
      alert(`Error generating OTP: ${err.message}`);
    }
  };

  const getExpiryColor = (expiry: string) => {
    const mins = (new Date(expiry).getTime() - Date.now()) / 60000;
    if (mins > 120) return '#16A34A';
    if (mins > 30) return '#F97316';
    return '#EF4444';
  };

  const getExpiryLabel = (expiry: string) => {
    const mins = Math.round(
      (new Date(expiry).getTime() - Date.now()) / 60000
    );
    if (mins <= 0) return 'Expired';
    if (mins < 60) return `${mins}m left`;
    return `${Math.round(mins / 60)}h left`;
  };

  const stats = [
    { label: 'Available Pickups', value: pickups.length,
      color: '#3B82F6', icon: '📦' },
    { label: 'My Deliveries',     value: 47,
      color: '#16A34A', icon: '🚴' },
    { label: 'Meals Delivered',   value: 320,
      color: '#F97316', icon: '🍽️' },
    { label: 'Avg Rating',        value: '4.9★',
      color: '#EAB308', icon: '⭐' },
  ];

  return (
    <DashboardLayout
      title={`Hello, ${profile?.full_name?.split(' ')[0] || 'Volunteer'} 🚴`}
      subtitle="Nearby food pickups waiting for you">

      {/* NEW PICKUP ALERT TOAST */}
      {newPickupAlert && (
        <div style={{
          position: 'fixed', top: 80, right: 24,
          zIndex: 9999,
          background: '#14532D',
          border: '1px solid #16A34A',
          borderRadius: 14, padding: '16px 20px',
          maxWidth: 320,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'slideIn 0.3s ease'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 8, marginBottom: 6
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#16A34A',
              boxShadow: '0 0 8px #16A34A'
            }} />
            <span style={{
              color: '#86EFAC', fontSize: 12,
              fontWeight: 700, letterSpacing: '0.08em'
            }}>
              NEW PICKUP AVAILABLE
            </span>
          </div>
          <div style={{
            color: '#F8FAFC', fontSize: 15, fontWeight: 700
          }}>
            {newPickupAlert.food_name}
          </div>
          <div style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
            {newPickupAlert.distance_km !== 999
              ? `${newPickupAlert.distance_km} km away · ETA ${newPickupAlert.eta_minutes} min`
              : newPickupAlert.location}
          </div>
        </div>
      )}

      {/* DEBUG PANEL — remove after testing */}
      <div style={{
        background: '#0F172A', border: '1px solid #334155',
        borderRadius: 10, padding: '12px 16px',
        marginBottom: 16, fontSize: 12
      }}>
        <div style={{ color: '#64748B', marginBottom: 4 }}>
          Debug Info:
        </div>
        <div style={{ color: '#94A3B8' }}>
          Location: {volunteerLat 
            ? `${volunteerLat.toFixed(4)}, ${volunteerLng?.toFixed(4)}` 
            : locationStatus}
        </div>
        <div style={{ color: '#94A3B8' }}>
          Pickups fetched: {pickups.length} 
          (radius: {radiusKm}km)
        </div>
        <div style={{ color: '#94A3B8' }}>
          Available: {isAvailable ? 'Yes' : 'No'}
        </div>
      </div>

      {/* LOCATION STATUS BAR */}
      {locationStatus !== 'granted' && (
        <div style={{
          background: locationStatus === 'denied' ? '#7F1D1D22' : '#1E3A5F22',
          border: `1px solid ${locationStatus === 'denied' ? '#EF4444' : '#3B82F6'}44`,
          borderRadius: 12, padding: '12px 16px',
          marginBottom: 20,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>
              {locationStatus === 'denied' ? '📍' : '🔍'}
            </span>
            <div>
              <div style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 600 }}>
                {locationStatus === 'detecting'
                  ? 'Detecting your location...'
                  : locationStatus === 'denied'
                  ? 'Location access denied'
                  : 'Enable location for nearby pickups'}
              </div>
              {locationStatus === 'denied' && (
                <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
                  Showing all pickups without distance sorting
                </div>
              )}
            </div>
          </div>
          {locationStatus === 'denied' && (
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '6px 14px', borderRadius: 8,
                background: '#3B82F6', border: 'none',
                color: '#fff', fontSize: 12,
                fontWeight: 600, cursor: 'pointer'
              }}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* AVAILABILITY TOGGLE + RADIUS FILTER */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 16, marginBottom: 24, flexWrap: 'wrap'
      }}>
        {/* Availability toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#1E293B', border: '1px solid #334155',
          borderRadius: 10, padding: '10px 16px'
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: isAvailable ? '#16A34A' : '#64748B',
            boxShadow: isAvailable ? '0 0 8px #16A34A' : 'none'
          }} />
          <span style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600 }}>
            {isAvailable ? 'Available for Pickup' : 'Unavailable'}
          </span>
          <button
            onClick={toggleAvailability}
            style={{
              padding: '4px 12px', borderRadius: 99,
              background: isAvailable ? '#7F1D1D' : '#14532D',
              border: 'none',
              color: isAvailable ? '#FCA5A5' : '#86EFAC',
              fontSize: 11, fontWeight: 700, cursor: 'pointer'
            }}>
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Radius selector */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#1E293B', border: '1px solid #334155',
          borderRadius: 10, padding: '10px 16px'
        }}>
          <span style={{ color: '#94A3B8', fontSize: 13 }}>
            Search radius:
          </span>
          {[5, 10, 15, 25].map(r => (
            <button key={r}
              onClick={() => setRadiusKm(r)}
              style={{
                padding: '4px 12px', borderRadius: 99,
                border: `1px solid ${radiusKm === r ? '#3B82F6' : '#334155'}`,
                background: radiusKm === r ? '#3B82F622' : 'transparent',
                color: radiusKm === r ? '#60A5FA' : '#64748B',
                fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}>
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 28
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#1E293B',
            border: '1px solid #334155',
            borderRadius: 14, padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{
              fontSize: 26, fontWeight: 800, color: s.color
            }}>
              {s.value}
            </div>
            <div style={{
              color: '#64748B', fontSize: 11,
              marginTop: 4, textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE PICKUP CARD */}
      {myActivePickup && (
        <div style={{
          background: '#1E293B',
          border: '2px solid #3B82F6',
          borderRadius: 16, padding: '20px',
          marginBottom: 24
        }}>
          {/* MISSION ROUTE MAP */}
          {(volunteerLat && volunteerLng && receiverProfile) && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Navigation size={18} color="#3B82F6" />
                <span style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>MISSION TRACKER</span>
              </div>
              <RouteMap 
                volunteerPos={[volunteerLat, volunteerLng]}
                donorPos={[myActivePickup.donor_lat, myActivePickup.donor_lng]}
                receiverPos={[receiverProfile.receiver_lat, receiverProfile.receiver_lng]}
                isPickedUp={myActivePickup.pickup_status === 'picked_up'}
              />
            </div>
          )}

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#F8FAFC', fontSize: 18,
                fontWeight: 700, marginBottom: 4
              }}>
                {myActivePickup.food_name}
              </div>
              <div style={{ color: '#94A3B8', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} /> Pickup: {myActivePickup.location}
                </span>
                {receiverProfile && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60A5FA', fontWeight: 600 }}>
                    <MapPin size={14} /> Drop-off: {receiverProfile.receiver_address}
                  </span>
                )}
                {receiverProfile?.receiver_landmark && (
                  <span style={{ fontSize: 11, marginLeft: 20 }}>
                    🏛 Landmark: {receiverProfile.receiver_landmark}
                  </span>
                )}
              </div>
              <div style={{
                marginTop: 8,
                color: getExpiryColor(myActivePickup.expiry_estimate),
                fontSize: 12, fontWeight: 600
              }}>
                ⏱ {getExpiryLabel(myActivePickup.expiry_estimate)}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {receiverProfile && (
                <a 
                  href={`tel:${receiverProfile.phone}`}
                  style={{
                    padding: '10px', borderRadius: 10,
                    background: '#1E293B', border: '1px solid #334155',
                    color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={18} />
                </a>
              )}
              {myActivePickup.pickup_status === 'volunteer_assigned' && (
                <button
                  onClick={() => markPickedUp(myActivePickup.id)}
                  style={{
                    padding: '10px 20px', borderRadius: 10,
                    background: '#1E3A5F',
                    border: '1px solid #3B82F6',
                    color: '#60A5FA', fontSize: 13,
                    fontWeight: 700, cursor: 'pointer'
                  }}>
                  ✅ Mark Picked Up
                </button>
              )}
              {myActivePickup.pickup_status === 'picked_up' && (
                <button
                  onClick={() => markDelivered(myActivePickup.id)}
                  style={{
                    padding: '10px 20px', borderRadius: 10,
                    background: '#14532D',
                    border: '1px solid #16A34A',
                    color: '#86EFAC', fontSize: 13,
                    fontWeight: 700, cursor: 'pointer'
                  }}>
                  📦 Complete Delivery
                </button>
              )}
            </div>
          </div>

          {showDeliveryProof && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
                <button 
                  onClick={() => setShowDeliveryProof(false)}
                  style={{
                    position: 'absolute', top: -40, right: 0,
                    background: 'none', border: 'none', color: '#94A3B8',
                    cursor: 'pointer'
                  }}
                >
                  <X size={24} /> Close
                </button>
                <DeliveryProof 
                  donationId={myActivePickup.id}
                  onSuccess={() => {
                    setShowDeliveryProof(false);
                    setMyActivePickup(null);
                    fetchMyActivePickup();
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* AVAILABLE PICKUPS LIST */}
      <div style={{
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: 16, overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            color: '#F8FAFC', fontWeight: 700, fontSize: 15
          }}>
            Available Pickups Nearby
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isRadiusRelaxed && (
              <span style={{
                background: '#1E3A5F', color: '#60A5FA',
                padding: '3px 10px', borderRadius: 6,
                fontSize: 11, fontWeight: 700, border: '1px solid #3B82F644'
              }}>
                🔍 RADIUS EXPANDED
              </span>
            )}
            {volunteerLat && (
              <span style={{ color: '#64748B', fontSize: 12 }}>
                📍 Within {isRadiusRelaxed ? '100+' : radiusKm} km
              </span>
            )}
            <span style={{
              background: '#3B82F622', color: '#60A5FA',
              padding: '3px 10px', borderRadius: 99,
              fontSize: 12, fontWeight: 700
            }}>
              {loading ? '...' : `${pickups.length} available`}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{
            padding: '40px', textAlign: 'center'
          }}>
            <div style={{
              width: 32, height: 32,
              border: '3px solid #334155',
              borderTop: '3px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px'
            }} />
            <p style={{ color: '#64748B', fontSize: 13 }}>
              Finding pickups near you...
            </p>
          </div>
        ) : pickups.length === 0 ? (
          <div style={{
            padding: '48px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{
              color: '#F8FAFC', fontSize: 15, fontWeight: 600
            }}>
              No pickups available right now
            </p>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 6 }}>
              {volunteerLat
                ? `No accepted donations within ${radiusKm} km. Try increasing radius.`
                : 'Enable location or check back soon.'}
            </p>
            <button
              onClick={() => setRadiusKm(r => Math.min(r + 10, 50))}
              style={{
                marginTop: 16, padding: '8px 20px',
                borderRadius: 8, background: 'transparent',
                border: '1px solid #334155',
                color: '#94A3B8', fontSize: 13, cursor: 'pointer'
              }}>
              Expand to {radiusKm + 10} km
            </button>
          </div>
        ) : (
          pickups.map((job, i) => (
            <div key={job.id} style={{
              padding: '16px 20px',
              borderBottom: i < pickups.length - 1
                ? '1px solid #0F172A' : 'none',
              borderLeft: `3px solid ${
                job.safety_score >= 80 ? '#16A34A' :
                job.safety_score >= 50 ? '#F97316' : '#EF4444'
              }`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap'
            }}>
              {/* Image Thumbnail */}
              <div style={{
                width: 50, height: 50,
                borderRadius: 8, overflow: 'hidden',
                background: '#334155', flexShrink: 0
              }}>
                {job.image_url ? (
                  <img 
                    src={job.image_url} 
                    alt={job.food_name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '🍱';
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍱</div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                {/* Food name + badges */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8, marginBottom: 6,
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    color: '#F8FAFC', fontSize: 15, fontWeight: 700
                  }}>
                    {job.food_name}
                  </span>
                  <span style={{
                    background: '#16A34A22', color: '#86EFAC',
                    padding: '2px 8px', borderRadius: 99,
                    fontSize: 11, fontWeight: 700
                  }}>
                    Score: {job.safety_score}%
                  </span>
                  {job.expiry_estimate && (
                    <span style={{
                      background: `${getExpiryColor(job.expiry_estimate)}22`,
                      color: getExpiryColor(job.expiry_estimate),
                      padding: '2px 8px', borderRadius: 99,
                      fontSize: 11, fontWeight: 700
                    }}>
                      ⏱ {getExpiryLabel(job.expiry_estimate)}
                    </span>
                  )}
                </div>

                {/* Details row */}
                <div style={{
                  color: '#94A3B8', fontSize: 13,
                  display: 'flex', gap: 16, flexWrap: 'wrap'
                }}>
                  <span>📍 {job.location || 'Location not set'}</span>
                  <span>📦 {job.quantity} {job.unit}</span>
                  {job.distance_km !== undefined &&
                   job.distance_km !== 999 && (
                    <span style={{
                      color: '#60A5FA', fontWeight: 600
                    }}>
                      🗺 {job.distance_km} km · ~{job.eta_minutes} min away
                    </span>
                  )}
                </div>
              </div>

              {/* Accept button */}
              {!myActivePickup && isAvailable && (
                <button
                  onClick={() => acceptPickup(job.id)}
                  disabled={accepting === job.id}
                  style={{
                    padding: '10px 22px', borderRadius: 10,
                    background: accepting === job.id
                      ? '#334155' : '#3B82F6',
                    border: 'none', color: '#fff',
                    fontSize: 13, fontWeight: 700,
                    cursor: accepting === job.id
                      ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.2s'
                  }}>
                  {accepting === job.id
                    ? 'Accepting...' : '🚴 Accept Pickup'}
                </button>
              )}

              {myActivePickup && (
                <span style={{
                  color: '#64748B', fontSize: 12
                }}>
                  Finish current pickup first
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

// Resubmission commit update
