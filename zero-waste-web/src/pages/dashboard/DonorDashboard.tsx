import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  History, 
  TrendingUp, 
  Leaf, 
  Gift, 
  Award, 
  ArrowRight,
  Clock,
  CheckCircle2,
  Package,
  MapPin,
  Navigation
} from 'lucide-react';

export const DonorDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('donations')
        .select('*')
        .eq('donor_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (data) setDonations(data);
    };

    fetchDonations();
  }, [profile?.id]);

  const stats = [
    { label: 'Total Donations', value: donations.length, color: '#16A34A', icon: <Package size={20}/>, trend: '+12%' },
    { label: 'Meals Saved', value: donations.length * 5 || 0, color: '#3B82F6', icon: <Gift size={20}/>, trend: '+8%' },
    { label: 'Green Points', value: donations.length * 50 || 0, color: '#F97316', icon: <Award size={20}/>, trend: 'Top 5%' },
    { label: 'CO₂ Saved', value: `${(donations.length * 0.8).toFixed(1)}kg`, color: '#8B5CF6', icon: <Leaf size={20}/>, trend: '+15%' },
  ];

  const activeDonations = donations.filter(d => ['pending', 'matched', 'picked_up', 'in_transit'].includes(d.status));

  return (
    <DashboardLayout
      title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Donor'}`}
      subtitle="Your contribution is making a real difference today.">

      <div className="animate-slide-up" style={{ opacity: 0 }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20, marginBottom: 32
        }}>
          {stats.map((s, i) => (
            <div key={i} className="premium-glass animate-glow" style={{
              borderRadius: 20, padding: '24px', position: 'relative', overflow: 'hidden',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              animationDelay: `${i * 100}ms`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ 
                  background: `${s.color}15`, color: s.color, 
                  padding: 10, borderRadius: 12, display: 'flex' 
                }}>
                  {s.icon}
                </div>
                <div style={{ color: '#16A34A', fontSize: 12, fontWeight: 700, background: '#14532D', padding: '2px 8px', borderRadius: 20 }}>
                  {s.trend}
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>
                {s.label}
              </div>
              {/* Subtle background glow */}
              <div style={{ 
                position: 'absolute', bottom: -20, right: -20, width: 80, height: 80, 
                background: s.color, filter: 'blur(50px)', opacity: 0.1, pointerEvents: 'none' 
              }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
          {/* Main Actions & List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20
            }}>
              {/* Primary Call to Action */}
              <button
                onClick={() => navigate('/donor/upload')}
                className="animate-glow"
                style={{
                  height: 140, borderRadius: 24, padding: 32,
                  background: 'linear-gradient(135deg, #16A34A, #15803D)',
                  border: 'none', color: '#fff', textAlign: 'left',
                  cursor: 'pointer', transition: 'transform 0.2s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Donate Surplus</h3>
                  <p style={{ opacity: 0.9 }}>AI-powered safety check & logistics</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 50 }}>
                  <Plus size={32} />
                </div>
              </button>

              {/* Secondary Action */}
              <button
                onClick={() => navigate('/donor/history')}
                style={{
                  height: 140, borderRadius: 24, padding: 32,
                  background: '#1E293B', border: '1px solid #334155',
                  color: '#F8FAFC', textAlign: 'left', cursor: 'pointer'
                }}>
                <div style={{ color: '#F97316', marginBottom: 12 }}><History size={24} /></div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Full Log</h3>
                <p style={{ color: '#64748B', fontSize: 13 }}>Review all your history</p>
              </button>
            </div>

            {/* Recent Table */}
            <div className="premium-glass" style={{ borderRadius: 24, overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>Recent Activity</h3>
                <button style={{ background: 'none', border: 'none', color: '#16A34A', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View all</button>
              </div>
              <div className="hide-scrollbar" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ color: '#64748B', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '20px 32px' }}>Food Detail</th>
                      <th style={{ padding: '20px' }}>Receiver</th>
                      <th style={{ padding: '20px' }}>Status</th>
                      <th style={{ padding: '20px 32px', textAlign: 'right' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>
                          <Package size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                          <p>No donations yet. Click 'Donate Surplus' to start!</p>
                        </td>
                      </tr>
                    ) : donations.slice(0, 5).map((d, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #0F172A', transition: 'background 0.2s' }}>
                        <td style={{ padding: '20px 32px' }}>
                          <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 14 }}>{d.food_name}</div>
                          <div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{d.quantity} · {new Date(d.created_at).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ color: '#94A3B8', fontSize: 14 }}>{d.receiver_name || 'Searching...'}</div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                            background: d.status === 'delivered' ? '#14532D' : '#1E3A5F',
                            color: d.status === 'delivered' ? '#86EFAC' : '#93C5FD'
                          }}>
                            {d.status === 'delivered' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                            {d.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </td>
                        <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: d.safety_score > 85 ? '#16A34A' : '#F97316' }}>{d.safety_score}%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side Panel: Active Tracking */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="premium-glass" style={{ borderRadius: 24, padding: 32, minHeight: 400 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrendingUp size={20} color="#16A34A" /> Active Tracking
              </h3>
              
              {activeDonations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <MapPin size={24} color="#334155" />
                  </div>
                  <p style={{ color: '#64748B', fontSize: 14 }}>No parcels in transit</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {activeDonations.slice(0, 3).map((d, i) => (
                    <div key={i} style={{ 
                      background: '#0F172A', padding: 20, borderRadius: 16, border: '1px solid #334155' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ color: '#86EFAC', fontWeight: 700, fontSize: 12 }}>{d.food_name}</span>
                        <ArrowRight size={14} color="#64748B" />
                      </div>
                      
                      {/* Mini Stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        {[1, 2, 3, 4].map((step) => {
                          const active = step <= (d.pickup_status === 'picked_up' ? 3 : d.pickup_status === 'volunteer_assigned' ? 2 : 1);
                          return (
                            <div key={step} style={{ 
                              flex: 1, borderRadius: 2, 
                              background: active ? '#16A34A' : '#334155', height: 4 
                            }} />
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: 10, marginBottom: d.pickup_status === 'picked_up' ? 12 : 0 }}>
                        <span>PENDING</span>
                        <span style={{ color: d.pickup_status === 'picked_up' ? '#16A34A' : '#64748B' }}>IN TRANSIT</span>
                        <span>DELIVERED</span>
                      </div>

                      {d.pickup_status === 'picked_up' && (
                        <button
                          onClick={() => navigate(`/tracking/${d.id}`)}
                          style={{
                            width: '100%', padding: '8px',
                            background: '#1E3A5F', border: '1px solid #3B82F6',
                            color: '#60A5FA', borderRadius: 8, fontSize: 11,
                            fontWeight: 700, cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: 6
                          }}
                        >
                          <Navigation size={12} /> TRACK LIVE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: 24, textAlign: 'center' }}>
                 <p style={{ color: '#64748B', fontSize: 12, marginBottom: 16 }}>Need to assign a driver manually?</p>
                 <button style={{ 
                   width: '100%', padding: '12px', background: 'transparent', 
                   border: '1px solid #16A34A', color: '#16A34A', borderRadius: 12, 
                   fontSize: 13, fontWeight: 600, cursor: 'pointer' 
                 }}>Contact Logistics Hub</button>
              </div>
            </div>

            {/* Impact Tip */}
            <div style={{ 
              background: 'linear-gradient(225deg, #1E1B4B 0%, #0F172A 100%)', 
              borderRadius: 24, padding: 24, border: '1px solid #312E81' 
            }}>
              <h4 style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Leaf size={16} color="#16A34A" /> Carbon Neutral Tip
              </h4>
              <p style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.6 }}>
                Using non-plastic packaging for this donation would reduce your CO₂ footprint by another 0.4kg.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Resubmission commit update
