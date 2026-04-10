import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, Clock, ShieldCheck, MapPin, TrendingUp, Filter, Navigation, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReceiverDashboard = () => {
  const { profile } = useAuth();
  const [pendingDonations, setPendingDonations] = useState<any[]>([]);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDonations, setActiveDonations] = useState<any[]>([]);
  const navigate = useNavigate();

  // Stats (some mock for UI)
  const stats = [
    { label: 'Food Received', value: '312 kg', icon: Package, color: '#F97316' },
    { label: 'Total Served', value: '1,840', icon: TrendingUp, color: '#16A34A' },
    { label: 'Pending Feeds', value: pendingDonations.length, icon: Clock, color: '#3B82F6' },
    { label: 'Safety Rating', value: '4.9/5', icon: ShieldCheck, color: '#EAB308' },
  ];

  const fetchDonations = async () => {
    setLoading(true);
    // Fetch pending
    const { data: pending } = await supabase
      .from('donations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pending) setPendingDonations(pending);

    // Fetch accepted by me but not delivered yet
    if (profile?.id) {
      const { data: active } = await supabase
        .from('donations')
        .select('*')
        .eq('accepted_by', profile.id)
        .in('status', ['accepted', 'in_transit'])
        .neq('status', 'delivered')
        .order('accepted_at', { ascending: false });
      
      if (active) setActiveDonations(active);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();

    const channel = supabase
      .channel('receiver-dashboard-updates')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public', 
        table: 'donations' 
      }, () => {
        fetchDonations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const acceptDonation = async (donationId: string) => {
    setAccepting(donationId);

    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        alert('You must be logged in to accept donations.');
        setAccepting(null);
        return;
      }

      // Update only the fields RLS allows
      // Use .eq status=pending to prevent race conditions
      const { data, error } = await supabase
        .from('donations')
        .update({
          status: 'accepted',
          accepted_by: currentUser.id,
          accepted_at: new Date().toISOString(),
          assigned_receiver_id: currentUser.id,
          pickup_status: 'awaiting_volunteer'
        })
        .eq('id', donationId)
        .eq('status', 'pending')  // only accept if still pending
        .select()
        .single();

      if (error) {
        console.error('Accept error details:', error);

        // If RLS error — show helpful message
        if (error.code === '42501' || 
            error.message.includes('row-level security') ||
            error.message.includes('violates')) {
          alert(
            'Permission error: The database security policy is ' +
            'blocking this action. Please ask your admin to run ' +
            'the updated RLS policy SQL in Supabase dashboard.'
          );
        } else if (error.code === 'PGRST116') {
          // No rows returned — already accepted by someone else
          alert('This donation was just accepted by another receiver.');
          fetchDonations();
        } else {
          alert(`Error accepting donation: ${error.message}`);
        }
        setAccepting(null);
        return;
      }

      if (!data) {
        alert('This donation is no longer available.');
        fetchDonations();
        setAccepting(null);
        return;
      }

      // Success — refresh the list
      console.log('Donation accepted successfully:', data);
      fetchDonations();

    } catch (err: any) {
      console.error('Unexpected error:', err);
      alert(`Unexpected error: ${err.message}`);
    }

    setAccepting(null);
  };

  const rejectDonation = async (donationId: string) => {
    try {
      const { error } = await supabase
        .from('donations')
        .update({ status: 'rejected' })
        .eq('id', donationId)
        .eq('status', 'pending');

      if (error) {
        console.error('Reject error:', error);
        if (error.message.includes('row-level security') ||
            error.message.includes('violates')) {
          alert(
            'Permission error: Please run the updated ' +
            'RLS policy SQL in your Supabase dashboard.'
          );
        } else {
          alert(`Error rejecting: ${error.message}`);
        }
        return;
      }

      fetchDonations();

    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <DashboardLayout
      title={`Hi, ${profile?.full_name?.split(' ')[0] || 'Receiver'} 🏠`}
      subtitle="Accept surplus food from local donors and manage your feeds.">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
        {stats.map((stat, i) => (
          <div key={i} className="premium-glass p-6 rounded-2xl group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">{stat.label}</p>
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 group-hover:scale-110 transition-transform">
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="text-blue-400" size={20} />
              Incoming Food Feed
            </h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition border border-white/5">
              <Filter size={14} /> Filter
            </button>
          </div>

          <div className="premium-glass rounded-3xl border border-white/5 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={32} />
                <p className="text-slate-400">Scanning for new donations...</p>
              </div>
            ) : pendingDonations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4 text-slate-600">🥘</div>
                <p className="text-white font-bold text-lg mb-2">No pending food available.</p>
                <p className="text-slate-400">We'll notify you as soon as a donor posts new surplus in your area.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {pendingDonations.map((donation: any) => (
                  <div key={donation.id} className="p-6 transition hover:bg-white/5 group relative overflow-hidden">
                     {/* Safety accent border */}
                     <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ 
                       background: donation.safety_score >= 80 ? '#16A34A' : 
                                  donation.safety_score >= 50 ? '#F97316' : '#EF4444' 
                     }} />

                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-4">
                           <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl overflow-hidden relative border border-white/10">
                              {donation.image_url ? (
                                <img 
                                  src={donation.image_url} 
                                  alt={donation.food_name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '🍱';
                                  }}
                                />
                              ) : (
                                <span>{donation.food_type === 'veg' ? '🥬' : '🍗'}</span>
                              )}
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold text-white">{donation.food_name}</h4>
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-black text-slate-400 border border-white/10 uppercase tracking-tighter">
                                  {donation.food_type}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1"><MapPin size={14}/> {donation.location}</span>
                                <span className="flex items-center gap-1">· {donation.quantity} {donation.unit}</span>
                                <span className="flex items-center gap-1 font-bold text-emerald-400">Score: {donation.safety_score}%</span>
                              </div>
                              <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                Prepared: {new Date(donation.prepared_at).toLocaleString()}
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <button
                             onClick={() => acceptDonation(donation.id)}
                             disabled={accepting === donation.id}
                             className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                           >
                             {accepting === donation.id ? 'Accepting...' : 'Accept'}
                           </button>
                           <button
                             onClick={() => rejectDonation(donation.id)}
                             className="px-4 py-2.5 bg-transparent border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-bold transition-all"
                           >
                             Reject
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Cards & Active Tracking */}
        <div className="space-y-6">
           {activeDonations.length > 0 && (
             <div className="premium-glass p-6 rounded-3xl border border-blue-500/30 bg-blue-500/5">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Navigation size={18} className="text-blue-400" />
                  Active Deliveries
                </h4>
                <div className="space-y-4">
                  {activeDonations.map((d) => (
                    <div key={d.id} className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white font-bold text-sm">{d.food_name}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          {d.pickup_status?.replace('_', ' ').toUpperCase() || 'ACCEPTED'}
                        </span>
                      </div>
                      
                      {d.pickup_status === 'picked_up' && (
                        <button
                          onClick={() => navigate(`/tracking/${d.id}`)}
                          className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Navigation size={14} /> Track Volunteer
                        </button>
                      )}

                      {d.delivery_otp && !d.otp_verified && (
                        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-white/5 text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Delivery OTP</p>
                          <p className="text-2xl font-black text-white tracking-[0.2em]">{d.delivery_otp}</p>
                          <p className="text-[10px] text-emerald-400 mt-1 flex items-center justify-center gap-1">
                            <ShieldCheck size={10} /> REQUIRED FOR VERIFICATION
                          </p>
                        </div>
                      )}

                      {d.otp_verified && (
                        <div className="mt-3 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 size={14} /> PICKUP VERIFIED
                        </div>
                      )}
                    </div>
                  ))}
                </div>
             </div>
           )}

           <div className="premium-glass p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-transparent">
              <h4 className="text-white font-bold mb-4">Urgent Feeds</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Below are donations nearing their expiration. High priority items suggested based on your capacity. 
              </p>
              <button className="w-full py-2 bg-white/5 text-slate-300 rounded-xl font-bold text-xs border border-white/10 hover:bg-white/10 transition">
                 View Expiry Warnings
              </button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} height={size || 24} 
    viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// Resubmission commit update
