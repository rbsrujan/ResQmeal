import { useState } from 'react';
import { MapPin, Clock, Check, X, Bell } from 'lucide-react';
import MapContainer from '../../components/MapContainer';

export default function ReceiverDashboardPage() {
  const [capacity, setCapacity] = useState(50);
  const [requests, setRequests] = useState([
    { id: 'req_1', name: 'Fresh Vegetables (10kg)', score: 98, eta: 15, donor: 'John Doe', status: 'pending' },
    { id: 'req_2', name: 'Veg Biryani (20 portions)', score: 85, eta: 22, donor: 'Hotel Grand', status: 'pending' },
  ]);

  const handleAction = (id: string, action: 'accept' | 'reject') => {
    setRequests(requests.filter(req => req.id !== id));
    if (action === 'accept') alert(`Donation accepted! ETA updated.`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC] flex items-center gap-3">
            Receiver Dashboard
            <span className="bg-[#14532D] text-[#86EFAC] px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-[#16A34A]">
              <span className="w-2 h-2 rounded-full bg-[#86EFAC] animate-pulse"/> Active
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-1">Manage incoming donations and your current capacity.</p>
        </div>
        
        <div className="bg-[#1E293B] p-4 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155] flex items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wide">Current Capacity Update</label>
            <div className="flex items-center gap-3 mt-1">
              <input 
                type="range" 
                min="0" max="200" 
                value={capacity} 
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                className="w-32 accent-[#F97316]"
              />
              <span className="font-bold text-lg w-12 text-[#F97316]">{capacity}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#F8FAFC]">
            <Bell className="text-[#F97316]" /> Incoming Requests ({requests.length})
          </h2>
          
          {requests.length === 0 ? (
            <div className="bg-[#0F172A] rounded-[12px] border-2 border-dashed border-[#334155] p-12 text-center flex flex-col items-center">
              <img src="https://ui-avatars.com/api/?name=Wait&background=0F172A&color=64748B&rounded=true" alt="Empty" className="w-16 h-16 mb-4 opacity-50 grayscale" />
              <h3 className="text-lg font-bold text-[#94A3B8] mb-1">No pending requests</h3>
              <p className="text-[#64748B]">We'll notify you as soon as a donor matches your profile.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="bg-[#1E293B] p-6 rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-lg hover:border-[#475569] transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-[#F8FAFC]">{req.name}</h3>
                      <span className="bg-[#14532D] text-[#86EFAC] px-2 py-0.5 rounded text-xs font-bold border border-[#16A34A]">Safety: {req.score}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-[#94A3B8] font-medium">
                      <span className="flex items-center gap-1"><Clock size={16} className="text-[#64748B]" /> ETA: {req.eta} mins</span>
                      <span className="flex items-center gap-1 text-[#16A34A]"><MapPin size={16} /> 2.4 km away</span>
                      <span className="text-[#64748B]">Donated by: {req.donor}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                    <button 
                      onClick={() => handleAction(req.id, 'reject')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-[#334155] text-[#94A3B8] hover:bg-[#7F1D1D] hover:text-[#FCA5A5] font-semibold rounded-lg transition"
                    >
                      <X size={18}/> Reject
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'accept')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-6 py-2 bg-[#16A34A] text-[#FFFFFF] hover:bg-[#14532D] font-bold rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.3)] transition active:scale-95"
                    >
                      <Check size={18}/> Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <h2 className="text-xl font-bold text-[#F8FAFC] mt-12 mb-4">Past Received Donations</h2>
          <div className="bg-[#1E293B] rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#334155] border-b border-[#334155]">
                  <th className="p-4 text-xs font-bold uppercase text-[#94A3B8]">Food Item</th>
                  <th className="p-4 text-xs font-bold uppercase text-[#94A3B8]">Date</th>
                  <th className="p-4 text-xs font-bold uppercase text-[#94A3B8] text-center">AI Score</th>
                  <th className="p-4 text-xs font-bold uppercase text-[#94A3B8]">Donor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {[1, 2, 3].map(i => (
                  <tr key={i} className="hover:bg-[#334155] text-[#F8FAFC]">
                    <td className="p-4 font-semibold text-[#F8FAFC]">Wedding Surplus (mixed)</td>
                    <td className="p-4 text-sm text-[#94A3B8] font-medium">Oct {14-i}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 rounded font-bold text-xs bg-[#14532D] text-[#86EFAC] border border-[#16A34A]">89</span>
                    </td>
                    <td className="p-4 text-sm text-[#94A3B8]">TechPark XYZ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-[#1E293B] p-6 rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155] sticky top-6">
            <h3 className="font-bold text-[#F8FAFC] mb-4 flex items-center gap-2"><MapPin className="text-[#16A34A]"/> Live Map View</h3>
            <div className="w-full h-80 rounded-xl overflow-hidden relative border border-[#334155] shadow-inner">
              <MapContainer 
                zoom={13}
                center={{ lat: 12.9279, lng: 77.6271 }} // Centered on NGO
                markers={[
                  { id: 'ngo', position: { lat: 12.9279, lng: 77.6271 }, type: 'receiver', title: 'Your Location' },
                  { id: 'donor-1', position: { lat: 12.9350, lng: 77.6400 }, type: 'donor', title: 'Hotel Grand surplus' },
                  { id: 'agent-1', position: { lat: 12.9400, lng: 77.6300 }, type: 'agent', title: 'Active Courier' }
                ]}
              />
            </div>
            <p className="text-xs text-[#64748B] mt-3 font-medium text-center italic">Shows incoming delivery agents in real-time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Resubmission commit update
