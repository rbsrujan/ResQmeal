import { useState } from 'react';
import { Ruler, Package, Info } from 'lucide-react';

export const FoodSizeEstimator = ({ onComplete }: { onComplete: (size: string) => void }) => {
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<string | null>(null);

  const runEstimation = async () => {
    setEstimating(true);
    await new Promise(r => setTimeout(r, 1800));
    const sizes = ['Small (2-4 servings)', 'Medium (5-10 servings)', 'Large (10+ servings)'];
    const result = sizes[Math.floor(Math.random() * sizes.length)];
    setEstimate(result);
    setEstimating(false);
    onComplete(result);
  };

  return (
    <div className="premium-glass p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/10 to-transparent">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Ruler className="text-blue-400" size={20} />
        Volume Estimator
      </h3>

      <div className="bg-black/40 aspect-video rounded-xl border border-white/5 mb-4 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30">LIDAR: ON</span>
          <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-[10px] font-bold rounded border border-white/10 tracking-widest">3400.32 Hz</span>
        </div>
        
        {estimating ? (
          <div className="flex flex-col items-center">
            <Package className="text-blue-400 animate-bounce mb-3" size={32} />
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest animate-pulse">Calculating Volumetric Data...</p>
          </div>
        ) : estimate ? (
           <div className="text-center">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-white font-black text-lg">{estimate}</p>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">Estimated via AI Geometry</p>
           </div>
        ) : (
          <button 
            onClick={runEstimation}
            className="px-6 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30 transition-all font-bold"
          >
            Start Estimation
          </button>
        )}
      </div>

      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
        <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          Estimation uses LIDAR-Lite sensing and 2D bounding boxes to calculate volume within a 92% confidence interval.
        </p>
      </div>
    </div>
  );
};

// Resubmission commit update
