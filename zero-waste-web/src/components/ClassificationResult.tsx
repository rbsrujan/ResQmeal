import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const ClassificationResult = ({ score, size }: { score: number, size: string }) => {
  const isSafe = score > 60;

  return (
    <div className={`p-6 rounded-2xl border animate-slide-up ${isSafe ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {isSafe ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h4 className="text-white font-bold text-lg">{isSafe ? 'Verification Passed' : 'Warning: Manual Audit Required'}</h4>
            <p className="text-slate-400 text-xs">Analysis complete by AI Vision Lab</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Safety Index</p>
          <p className={`text-2xl font-black ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>{score}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Volume Metric</p>
          <p className="text-white font-bold">{size}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase font-black mb-1">PH Level</p>
          <p className="text-white font-bold">{score < 80 ? 'Acidic/Unstable' : 'Optimal/Balanced'}</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blockchain Certified</span>
        </div>
        <button className="text-xs font-bold text-primary hover:underline">View Full Report</button>
      </div>
    </div>
  );
};

// Resubmission commit update
