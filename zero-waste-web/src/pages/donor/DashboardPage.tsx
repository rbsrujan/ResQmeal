import { useState } from 'react';
import { RewardCard } from '../../components/RewardCard';
import { Leaf, Award, Flame, Navigation, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DonorDashboardPage() {
  const [activeTab, setActiveTab] = useState('donations');
  const points = 345;
  
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Meals Donated',
      data: [12, 19, 15, 25, 22, 30],
      backgroundColor: '#16A34A',
      borderRadius: 4,
    }]
  };

  const donations = [
    { id: 'f_4829', name: 'Veg Biryani (5kg)', date: 'Today, 2:30 PM', score: 92, status: 'in_transit', receiver: 'Hope Shelter' },
    { id: 'f_4831', name: 'Bakery Surplus (20 items)', date: 'Yesterday', score: 85, status: 'delivered', receiver: 'City Rescue' },
    { id: 'f_4833', name: 'Fresh Vegetables (10kg)', date: 'Oct 12', score: 98, status: 'delivered', receiver: 'Community Comm.' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      {/* Header Profile / Stats Summary */}
      <div className="bg-[#1E293B] rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155] p-6 flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#16A34A] rounded-full flex items-center justify-center text-2xl font-bold text-[#FFFFFF] shadow-inner border border-[#14532D]">
            JD
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F8FAFC]">Welcome, John Doe</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#713F12] text-[#FDE047] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-[#EAB308]">
                <Award size={12}/> Food Hero Level
              </span>
              <span className="text-[#94A3B8] text-sm font-medium flex items-center gap-1">
                <Flame size={14} className="text-[#F97316]"/> 3-day streak
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link to="/donor/upload" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#16A34A] text-[#FFFFFF] px-6 py-3 rounded-xl font-bold hover:bg-[#14532D] transition shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
            <PlusCircle size={18}/> Donate Now
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#334155] mb-8 overflow-x-auto">
        {[
          { id: 'donations', label: 'My Donations' },
          { id: 'rewards', label: 'Rewards & Points' },
          { id: 'impact', label: 'Impact Report' },
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-6 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors duration-200
              ${activeTab === t.id ? 'border-[#16A34A] text-[#16A34A]' : 'border-transparent text-[#64748B] bg-transparent hover:text-[#94A3B8]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300 min-h-[400px]">
        
        {activeTab === 'donations' && (
          <div className="bg-[#1E293B] rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#334155] font-semibold text-[#94A3B8]">
                    <th className="p-4 text-xs font-bold uppercase">Food Item</th>
                    <th className="p-4 text-xs font-bold uppercase">Date</th>
                    <th className="p-4 text-xs font-bold uppercase text-center">AI Score</th>
                    <th className="p-4 text-xs font-bold uppercase">Receiver</th>
                    <th className="p-4 text-xs font-bold uppercase">Status</th>
                    <th className="p-4 text-xs font-bold uppercase">Track</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {donations.map((d, i) => (
                    <tr key={i} className="hover:bg-[#334155] transition-colors text-[#F8FAFC]">
                      <td className="p-4">
                        <span className="font-bold block">{d.name}</span>
                        <span className="text-xs text-[#64748B] font-mono">{d.id}</span>
                      </td>
                      <td className="p-4 text-sm font-medium">{d.date}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded font-bold text-xs border ${d.score > 90 ? 'bg-[#14532D] text-[#86EFAC] border-[#16A34A]' : 'bg-[#713F12] text-[#FDE047] border-[#EAB308]'}`}>
                          {d.score}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-semibold">{d.receiver}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                          ${d.status === 'delivered' ? 'bg-[#1E3A8A] text-[#BFDBFE] border-[#3B82F6]' : 'bg-[#7F1D1D] text-[#FCA5A5] border-[#EF4444]'}
                        `}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link to={`/track/${d.id}`} className="text-[#16A34A] hover:text-[#86EFAC] font-bold text-sm flex items-center gap-1 active:scale-95 transition">
                          Track <Navigation size={14}/>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-1 border border-[#334155] bg-gradient-to-br from-[#14532D] to-[#1E293B] text-[#F8FAFC] p-6 rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] relative overflow-hidden">
                <Leaf className="absolute right-[-20px] bottom-[-20px] text-[#16A34A] opacity-20" size={120} />
                <h3 className="font-medium text-[#86EFAC] mb-2">Available Points</h3>
                <div className="text-5xl font-extrabold tracking-tight mb-4">{points}</div>
                <div className="w-full bg-[#334155] rounded-full h-2 mb-2">
                  <div className="bg-[#16A34A] h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-sm text-[#94A3B8] font-medium">155 pts away from Champion Level</p>
              </div>

              <div className="md:col-span-2 bg-[#1E293B] rounded-[12px] border border-[#334155] p-6 shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
                <h3 className="font-bold text-lg mb-4 text-[#F8FAFC] flex items-center gap-2">
                  <Flame className="text-[#F97316]" /> Current City Leaderboard
                </h3>
                <div className="space-y-3">
                  {['Sarah M. - 1200 pts', 'John Doe (You) - 345 pts', 'Alex Q. - 290 pts'].map((user, idx) => (
                    <div key={idx} className={`p-3 rounded-lg flex items-center justify-between border ${idx===1 ? 'bg-[#14532D] border-[#16A34A] text-[#86EFAC]' : 'bg-[#334155] border-[#475569] text-[#F8FAFC]'}`}>
                      <span className="font-semibold"><span className={`${idx===1 ? 'text-[#16A34A]' : 'text-[#64748B]'} w-6 inline-block`}>#{idx+1}</span> {user.split('-')[0]}</span>
                      <span className={`font-bold ${idx===1 ? 'text-[#86EFAC]' : 'text-[#16A34A]'}`}>{user.split('-')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <h3 className="font-bold text-2xl text-[#F8FAFC] mb-6">Redeem Points</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <RewardCard title="Fuel Voucher" icon="⛽" cost={200} onRedeem={() => alert("Redeemed!")} />
              <RewardCard title="UPI Cashback ₹50" icon="💳" cost={150} onRedeem={() => alert("Redeemed!")} />
              <RewardCard title="Coupon Bundle" icon="🎟️" cost={100} onRedeem={() => alert("Redeemed!")} />
              <RewardCard title="Mobile Recharge ₹20" icon="📶" cost={80} onRedeem={() => alert("Redeemed!")} />
              <RewardCard title="Exclusive Merch" icon="👕" cost={500} disabled={true} onRedeem={() => {}} />
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-[#1E293B] p-6 rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155]">
              <h3 className="font-bold text-lg text-[#F8FAFC] mb-6">Monthly Highlights</h3>
              <div className="h-64">
                <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />
              </div>
            </div>
            <div className="bg-[#1E293B] rounded-[12px] p-6 border border-[#16A34A] text-center flex flex-col justify-center shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
              <Leaf className="text-[#16A34A] mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">You're making a difference!</h3>
              <p className="text-[#94A3B8] mb-6">You have saved <strong className="text-[#16A34A]">123 meals</strong>, fed <strong className="text-[#16A34A]">184 people</strong>, and reduced <strong className="text-[#3B82F6]">85 kg of CO₂</strong> this year.</p>
              <button className="bg-[#16A34A] hover:bg-[#14532D] text-[#FFFFFF] py-3 rounded-lg font-bold shadow-md w-full transition active:scale-95">
                Share on WhatsApp
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Resubmission commit update
