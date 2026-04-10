import { ImpactCounter } from '../components/ImpactCounter';
import { DownloadCloud, Map as MapIcon, Trophy } from 'lucide-react';

export default function ImpactPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto bg-[#0F172A] min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Community Impact</h1>
        <button className="flex items-center gap-2 bg-[#16A34A] hover:bg-[#14532D] text-[#FFFFFF] px-4 py-2 rounded-lg font-semibold transition shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
          <DownloadCloud size={18} /> Download Monthly Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <ImpactCounter target={125430} label="Meals Saved" prefix="🍽️ " />
        <ImpactCounter target={45200} label="People Fed" prefix="👥 " />
        <ImpactCounter target={32000} label="CO₂ Reduced" prefix="🌿 " suffix=" kg" />
        <ImpactCounter target={1840} label="Donors Active" prefix="🏠 " />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#1E293B] p-6 rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#F8FAFC]">
              <MapIcon className="text-[#16A34A]" /> Active Community Points
            </h2>
          </div>
          <div className="w-full h-[400px] bg-[#334155] rounded-xl flex items-center justify-center border-2 border-dashed border-[#475569]">
            {/* Map Placeholder */}
            <p className="text-[#94A3B8] font-medium">Google Maps API integration mapping real-time community points.</p>
          </div>
        </div>

        <div className="bg-[#1E293B] p-6 rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#F8FAFC]">
            <Trophy className="text-[#F97316]" /> Top Donors
          </h2>
          <div className="space-y-4">
            {/* Leaderboard Table */}
            {[ 
              { name: 'Hotel Grand', meals: 1240 },
              { name: 'FreshMart Super', meals: 980 },
              { name: 'University Cafeteria', meals: 750 },
              { name: 'TechPark Canteen', meals: 420 },
              { name: 'Rahul S.', meals: 85 }
            ].map((donor, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#334155] transition border border-transparent hover:border-[#475569]">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${idx === 0 ? 'bg-[#EAB308] text-[#713F12]' : 
                      idx === 1 ? 'bg-[#94A3B8] text-[#1E293B]' : 
                      idx === 2 ? 'bg-[#F97316] text-[#7F1D1D]' : 'bg-[#14532D] text-[#86EFAC]'}`}
                  >
                    #{idx + 1}
                  </div>
                  <span className="font-semibold text-[#F8FAFC]">{donor.name}</span>
                </div>
                <span className="font-bold text-[#16A34A]">{donor.meals} meals</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Resubmission commit update
