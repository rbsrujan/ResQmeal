import React, { useState } from 'react';
import LocationPicker from '../../components/LocationPicker';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';

/**
 * Simple profile completion page. In a real app you'd collect more details.
 */
const ProfileSetup: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const role = profile?.role || '';
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [orgName, setOrgName] = useState(''); // facility name for receiver
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [landmark, setLandmark] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [addressStatus, setAddressStatus] = useState<'missing'|'incomplete'|'ready'>('missing');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);


  if (loading) return <div className="flex h-screen items-center justify-center text-[#94A3B8]">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.profile_completed) return <Navigate to="/" replace />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guard missing user id
    if (!user?.id) {
      alert('User not logged in.');
      return;
    }
    // Validate address length for receiver
    if (role === 'receiver' && (!address || address.length < 10)) {
      alert('Please provide a valid address (minimum 10 characters).');
      return;
    }
    // Open confirmation modal for receiver, otherwise save directly
    if (role === 'receiver') {
      setShowConfirm(true);
      return;
    }
    // For donor or volunteer, proceed with existing flow
    setSaving(true);
    const updates: any = {
      full_name: fullName,
      phone,
      city,
      profile_completed: true,
    };
    if (role === 'volunteer') {
      if (!lat || !lng) {
        alert('Please pin your starting location on the map.');
        setSaving(false);
        return;
      }
      updates.lat = lat;
      updates.lng = lng;
      updates.address = address;
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    try {
      if (error) {
        console.error('Profile update error:', error);
        alert(`Error saving profile: ${error.message}`);
        return;
      }
      // Navigate after successful save
      if (role === 'volunteer') {
        window.location.href = '/dashboard/volunteer';
      } else {
        window.location.href = '/dashboard/donor';
      }
    } finally {
      setSaving(false);
    }
  };

  // Save receiver location after confirmation
  const saveReceiverLocation = async () => {
    if (!user?.id) {
      alert('User not logged in.');
      return;
    }
    if (!lat || !lng) {
      alert('Please pin your facility location on the map.');
      return;
    }
    setSaving(true);
    const updates: any = {
      full_name: orgName || fullName,
      phone,
      city,
      receiver_lat: lat,
      receiver_lng: lng,
      receiver_address: address,
      receiver_landmark: landmark,
      lat,
      lng,
      address,
      profile_completed: true,
      receiver_last_updated: new Date().toISOString(),
    };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    try {
      if (error) {
        console.error('Profile update error:', error);
        alert(`Error saving profile: ${error.message}`);
        return;
      }

      window.location.href = '/dashboard/receiver';
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <form onSubmit={handleSave} className="bg-[#1E293B] rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6 text-center">Complete Your Profile</h2>
        {/* Address status badge */}
        {role === 'receiver' && (
          <div style={{ marginBottom: 8, fontSize: 12, color: '#94A3B8' }}>
            Status: 
            <span style={{
              background: addressStatus === 'ready' ? '#14532D22' : addressStatus === 'incomplete' ? '#7F1D1D22' : '#7F1D1D22',
              color: addressStatus === 'ready' ? '#86EFAC' : '#FCA5A5',
              padding: '2px 6px',
              borderRadius: 4,
              marginLeft: 4,
            }}>{addressStatus.charAt(0).toUpperCase() + addressStatus.slice(1)}</span>
          </div>
        )}
        {step === 1 && (
          <>
            <div className="mb-4">
              <label className="block text-[#94A3B8] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-[#0F172A] text-[#F8FAFC] border-[#334155] rounded-2xl h-12 px-4 focus:border-[#16A34A]"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[#94A3B8] mb-1">Phone (optional)</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#0F172A] text-[#F8FAFC] border-[#334155] rounded-2xl h-12 px-4 focus:border-[#16A34A]"
              />
            </div>
            <div className="mb-6">
              <label className="block text-[#94A3B8] mb-1">City (optional)</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-[#0F172A] text-[#F8FAFC] border-[#334155] rounded-2xl h-12 px-4 focus:border-[#16A34A]"
              />
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-[#16A34A] text-white font-bold py-3 rounded-2xl hover:bg-[#15803D] transition"
            >
              Continue to Location
            </button>
          </>
        )}
        {(step === 2 && (role === 'receiver' || role === 'volunteer')) && (
          <>
            <LocationPicker
              onLocationSelect={(latSel, lngSel, addr) => {
                setLat(latSel);
                setLng(lngSel);
                setAddress(addr);
                // Update status based on address length
                if (addr && addr.length >= 10) {
                  setAddressStatus('ready');
                } else if (addr) {
                  setAddressStatus('incomplete');
                } else {
                  setAddressStatus('missing');
                }
                setLastUpdated(new Date());
              }}
            />

            {role === 'receiver' && (
              <>
                {/* Landmark input */}
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="Landmark (e.g. Near Ganesh Temple, Opp. SBI Bank)"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    marginTop: 10,
                    background: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    color: '#F8FAFC',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {/* Address confirmation card */}
                {lat && (
                  <div style={{
                    marginTop: 12,
                    padding: '12px 16px',
                    background: '#14532D22',
                    border: '1px solid #16A34A44',
                    borderRadius: 10,
                  }}>
                    <div style={{ color: '#86EFAC', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      ✅ Delivery address confirmed
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: 12 }}>{address}</div>
                    {landmark && (
                      <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>Near: {landmark}</div>
                    )}
                    <div style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>
                      Coordinates: {lat.toFixed(5)}, {lng?.toFixed(5)}
                    </div>
                    {lastUpdated && (
                      <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>
                        Last updated: {lastUpdated.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full mt-4 bg-[#16A34A] text-white font-bold py-3 rounded-2xl hover:bg-[#15803D] transition"
                >
                  Continue
                </button>
              </>
            )}
            {role === 'volunteer' && (
              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 bg-[#16A34A] text-white font-bold py-3 rounded-2xl hover:bg-[#15803D] transition"
              >
                {saving ? 'Saving…' : 'Save & Continue'}
              </button>
            )}
          </>
        )}
        {step === 3 && role === 'receiver' && (
          <div className="text-center text-[#86EFAC] mt-4">Profile saved! Redirecting…</div>
        )}
        {step === 3 && role === 'receiver' && (
          <>
            <div className="mb-4 mt-4">
              <label className="block text-[#94A3B8] mb-1">Facility Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full bg-[#0F172A] text-[#F8FAFC] border-[#334155] rounded-2xl h-12 px-4 focus:border-[#16A34A]"
              />
            </div>
            {/* Debug view before final save */}
            <div style={{
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 16,
              fontSize: 12
            }}>
              <div style={{
                color: '#64748B', marginBottom: 6,
                fontWeight: 700, fontSize: 11,
                textTransform: 'uppercase'
              }}>Will be saved:</div>
              <div style={{ color: '#94A3B8' }}>Name: {fullName || '—'}</div>
              <div style={{ color: '#94A3B8' }}>Phone: {phone || '—'}</div>
              <div style={{ color: lat ? '#86EFAC' : '#EF4444' }}>
                Location: {lat ? `${lat.toFixed(5)}, ${lng?.toFixed(5)}` : '❌ Not set — please go back and pin location'}
              </div>
              <div style={{ color: '#94A3B8' }}>Facility: {orgName || '—'}</div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#16A34A] text-white font-bold py-3 rounded-2xl hover:bg-[#15803D] transition"
            >
              {saving ? 'Saving…' : 'Save & Continue'}
            </button>
          </>
        )}
      </form>
{showConfirm && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/60">
    <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md">
      <h3 className="text-xl font-bold text-[#F8FAFC] mb-4">Confirm Delivery Address</h3>
      <div className="mb-4">
        <p className="text-[#94A3B8]">Address: {address}</p>
        {landmark && <p className="text-[#94A3B8]">Landmark: {landmark}</p>}
        <p className="text-[#94A3B8]">Coordinates: {lat?.toFixed(5)}, {lng?.toFixed(5)}</p>
      </div>
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
        <button type="button" onClick={saveReceiverLocation} disabled={saving} className="px-4 py-2 bg-[#16A34A] text-white rounded">{saving ? 'Saving…' : 'Confirm'}</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ProfileSetup;

// Resubmission commit update
