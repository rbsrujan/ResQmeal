import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { VolunteerMap } from '../../components/VolunteerMap';
import { Navigation, Package, Phone, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const TaskPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error) setDonation(data);
      setLoading(false);
    };
    fetchTask();
  }, [id]);

  if (loading) return <div>Loading Task...</div>;

  return (
    <DashboardLayout title="Active Mission" subtitle="Navigation and delivery details">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <VolunteerMap points={[[donation.latitude, donation.longitude], [12.9345, 77.6234]]} />
           
           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="premium-glass p-6 rounded-2xl border-l-4 border-l-blue-500">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-3">Pickup Point</p>
                <h4 className="text-white font-bold mb-1">Indiranagar Social</h4>
                <p className="text-slate-400 text-sm mb-4">1204, 100 Feet Rd, HAL 2nd Stage, Bengaluru</p>
                <button className="w-full py-2 bg-blue-500/10 text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-blue-500/20 hover:bg-blue-500/20 transition">
                  <Phone size={14} /> Contact Donor
                </button>
              </div>

              <div className="premium-glass p-6 rounded-2xl border-l-4 border-l-emerald-500">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-3">Drop-off NGO</p>
                <h4 className="text-white font-bold mb-1">Little Hearts Shelter</h4>
                <p className="text-slate-400 text-sm mb-4">Koramangala 4th Block, Bengaluru</p>
                <button className="w-full py-2 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-500/20 hover:bg-emerald-500/20 transition">
                  <Phone size={14} /> Contact NGO
                </button>
              </div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="premium-glass p-6 rounded-2xl border border-white/10">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <Package className="text-primary" size={20} />
              Cargo Details
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 italic">Item</span>
                <span className="text-white font-bold">{donation.food_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 italic">Quantity</span>
                <span className="text-white font-bold">{donation.quantity}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 italic">Safety Score</span>
                <span className="text-emerald-400 font-bold">{donation.safety_score}% Verified</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
               <button 
                 onClick={() => navigate(`/volunteer/inspect/${donation.id}`)}
                 className="w-full py-4 bg-primary hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
               >
                 <CheckCircle size={20} /> Complete Inspection
               </button>
               <button className="w-full py-4 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-bold hover:bg-white/10 transition">
                 Report Issue
               </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20">
             <div className="flex items-center gap-3 text-blue-400 mb-3">
               <Navigation size={20} />
               <span className="font-bold">Estimated Arrival</span>
             </div>
             <p className="text-3xl font-black text-white">14 <span className="text-sm text-slate-500">MIN</span></p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Resubmission commit update
