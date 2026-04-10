import { useParams } from 'react-router-dom';
import { FoodTimeline } from '../components/FoodTimeline';
import { MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import MapContainer from '../components/MapContainer';

export default function TrackPage() {
  const { foodId } = useParams();
  
  // Real layout structure according to prompt constraints:
  // Full-page map with side panel
  
  const donorPos = { lat: 12.9716, lng: 77.5946 };
  const receiverPos = { lat: 12.9279, lng: 77.6271 };
  const agentPos = { lat: 12.9450, lng: 77.6100 };

  const markers = [
    { id: 'donor-1', position: donorPos, type: 'donor' as const, title: 'Grand Royal Hotel', details: 'Fresh salads (20 portions)', status: 'Pickup Complete' },
    { id: 'receiver-1', position: receiverPos, type: 'receiver' as const, title: 'Hope Shelter NGO', details: 'Capacity: 50 meals', status: 'Waiting' },
    { id: 'agent-1', position: agentPos, type: 'agent' as const, title: 'John (Delivery)', details: 'On the way', status: 'In Transit' }
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Map Area */}
      <div className="flex-1 relative border-r border-[#334155]">
        <MapContainer 
          center={agentPos} 
          zoom={13} 
          markers={markers} 
          showRoute={{ origin: donorPos, destination: receiverPos }}
          className="rounded-none h-full"
        />
        
        {/* Overlay Info */}
        <div className="absolute bottom-6 left-6 z-10 bg-[#334155]/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-[#475569] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center animate-pulse">
            <MapPin size={24} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-[#F8FAFC]">Estimated arrival in 23 minutes</span>
            <p className="text-xs text-[#94A3B8]">Route optimized based on traffic</p>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full max-w-md bg-[#0F172A] z-10 flex flex-col h-full overflow-y-auto">
        <div className="p-6 border-b border-[#334155] bg-[#1E293B]">
          <h2 className="text-lg font-bold text-[#F8FAFC]">Tracking Delivery</h2>
          <span className="text-sm font-mono text-[#64748B] block mb-4">ID: {foodId || 'unknown-uuid'}</span>
          
          <div className="flex items-center gap-4 bg-[#334155] p-4 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#475569]">
            <div className="w-16 h-16 bg-[#1E293B] rounded-lg overflow-hidden shrink-0 border border-[#475569]">
              <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop" alt="Food" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-[#F8FAFC] leading-tight mb-1">Fresh Salads (20 portions)</h3>
              <span className="bg-[#14532D] text-[#86EFAC] px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1 border border-[#16A34A]">
                <ShieldCheck size={12}/> Score: 95
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 px-10 flex-1 bg-[#0F172A]">
          <h3 className="font-bold text-[#64748B] uppercase tracking-widest text-xs mb-8 text-center">Live Status Tracker</h3>
          
          <div className="mb-12 rotate-90 transform origin-left translate-x-12 translate-y-8 h-20">
             {/* Using the horizontal timeline rotated */}
             <FoodTimeline status="in_transit" />
          </div>

          <div className="mt-64 border-t border-[#334155] pt-6 space-y-4">
            <div className="bg-[#713F12] border border-[#EAB308] p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-[#FDE047] shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-[#FDE047] text-sm">Storage Alert</h4>
                <p className="text-xs text-[#FEF08A] mt-1 opacity-90">Currently in-transit — Safe for next 40 minutes before temperature limit triggers.</p>
              </div>
            </div>

            <div className="bg-[#1E293B] border border-[#3B82F6] p-4 rounded-xl">
              <h4 className="font-bold text-[#60A5FA] text-sm mb-2">Anti-Fraud Verification</h4>
              <ul className="text-xs text-[#93C5FD] space-y-1 font-medium">
                <li className="flex items-center gap-2"><Check size={14}/> Live GPS active & synced</li>
                <li className="flex items-center gap-2"><Check size={14}/> Timestamp securely verified</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
// Helper missing from lucide
const Check = ({size}:any) => <svg width={size} height={size} viewBox={`0 0 24 24`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>

// Resubmission commit update
