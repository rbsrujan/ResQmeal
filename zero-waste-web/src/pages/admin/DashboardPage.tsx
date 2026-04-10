import { Users, Truck, AlertOctagon, TrendingUp, Download } from 'lucide-react';

export default function AdminDashboardPage() {
  const kpis = [
    { label: 'Total Donations Today', value: '45', icon: TrendingUp, color: 'text-[#86EFAC]', bg: 'bg-[#14532D]' },
    { label: 'Total Meals Saved', value: '12,543', icon: Users, color: 'text-[#93C5FD]', bg: 'bg-[#1E3A8A]' },
    { label: 'Active Deliveries', value: '8', icon: Truck, color: 'text-[#FDBA74]', bg: 'bg-[#7C2D12]' },
    { label: 'Unsafe Flagged', value: '2', icon: AlertOctagon, color: 'text-[#FCA5A5]', bg: 'bg-[#7F1D1D]' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 py-8 bg-[#0F172A] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Admin Overview Panel</h1>
          <p className="text-[#94A3B8]">Monitor system health and food safety flags.</p>
        </div>
        <button className="bg-[#1E293B] border border-[#334155] shadow-[0_4px_6px_rgba(0,0,0,0.3)] px-4 py-2 rounded-lg font-bold text-[#F8FAFC] flex items-center gap-2 hover:bg-[#334155] transition">
          <Download size={18}/> Export Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="bg-[#1E293B] p-6 rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155] flex items-center justify-between hover:border-[#475569] transition">
              <div>
                <p className="text-[#94A3B8] text-sm font-bold uppercase mb-1">{k.label}</p>
                <h3 className="text-3xl font-black text-[#F8FAFC]">{k.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-full ${k.bg} flex items-center justify-center ${k.color} border border-[#334155]`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Chart Placeholder Area (using simple divs for demo structural purpose) */}
        <div className="lg:col-span-2 bg-[#1E293B] p-6 rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155]">
          <h3 className="font-bold text-[#F8FAFC] mb-6">Donations Over Last 30 Days (Chart.js)</h3>
          <div className="w-full h-64 bg-[#334155] rounded-xl flex items-end justify-between p-4 px-8 border-b-4 border-[#475569] gap-2">
             {/* Mock visual bars */}
             {Array.from({length: 30}).map((_, i) => (
                <div key={i} className="w-full bg-[#16A34A] opacity-50 rounded-t-sm hover:opacity-100 transition-all duration-300" 
                     style={{height: `${Math.max(10, Math.random() * 100)}%`}}></div>
             ))}
          </div>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155]">
          <h3 className="font-bold text-[#F8FAFC] mb-6">Classification Breakdown</h3>
          <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
            <div className="w-40 h-40 rounded-full border-[16px] border-[#16A34A] border-r-[#F97316] border-t-[#EF4444] relative transform -rotate-45"></div>
            <div className="w-full grid grid-cols-2 gap-2 text-sm font-bold text-[#F8FAFC]">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#16A34A] rounded-full"/>Human Safe</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#F97316] rounded-full"/>Animal Safe</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#EF4444] rounded-full"/>Unsafe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Items Log */}
      {/* Flagged Items Log */}
      <div className="bg-[#1E293B] rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155] overflow-hidden">
        <div className="p-6 border-b border-[#334155] flex justify-between items-center bg-[#7F1D1D]/20">
          <h3 className="font-bold text-[#FCA5A5] flex items-center gap-2">
            <AlertOctagon size={20} /> Action Required: Unsafe / Flagged Items
          </h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#334155] border-b border-[#334155]">
              <th className="p-4 text-xs font-bold uppercase text-[#94A3B8]">ID</th>
              <th className="p-4 text-xs font-bold uppercase text-[#94A3B8]">Reported By AI</th>
              <th className="p-4 text-xs font-bold uppercase text-[#94A3B8]">Threshold Reason</th>
              <th className="p-4 text-xs font-bold uppercase text-[#94A3B8] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            <tr className="hover:bg-[#334155] text-[#F8FAFC]">
              <td className="p-4 font-mono text-sm text-[#94A3B8]">f_9921</td>
              <td className="p-4"><span className="px-2 py-1 bg-[#7F1D1D] text-[#FCA5A5] font-bold rounded text-xs border border-[#EF4444]">Score: 32</span></td>
              <td className="p-4 text-sm text-[#94A3B8]">High probability of mold observed on bakery item.</td>
              <td className="p-4 text-right">
                <button className="text-[#FCA5A5] font-bold text-sm bg-[#7F1D1D] px-3 py-1 rounded hover:bg-[#991B1B] transition shadow-[0_4px_6px_rgba(0,0,0,0.3)]">Delete Listing</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Resubmission commit update
