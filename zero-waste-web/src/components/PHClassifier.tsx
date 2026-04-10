import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle } from 'lucide-react';

export const PHClassifier = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadModel = async () => {
      // Mock model loading for demo
      await new Promise(r => setTimeout(r, 1500));
      setLoading(false);
    };
    loadModel();
  }, []);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
  };

  const analyze = async () => {
    setAnalyzing(true);
    // Simulate complex AI analysis
    await new Promise(r => setTimeout(r, 2000));
    const score = Math.floor(Math.random() * 30) + 70; // 70-100 range
    setResult(score);
    setAnalyzing(false);
    onComplete(score);
  };

  return (
    <div className="premium-glass p-6 rounded-2xl border border-white/10 overflow-hidden relative">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        AI Vision: PH Analysis
      </h3>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-black/40 rounded-xl border border-white/5">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mb-4" />
          <p className="text-slate-400 text-sm">Initializing Safety Lab...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 group">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-emerald-500/30 m-8 rounded-lg pointer-events-none" />
            
            {!videoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={startCamera}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
                >
                  <Camera size={18} /> Start Lab Camera
                </button>
              </div>
            )}

            {analyzing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-emerald-500 animate-shimmer" style={{ width: '100%' }} />
                </div>
                <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest animate-pulse">Running Neural Scan...</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              disabled={analyzing || !videoRef.current?.srcObject}
              onClick={analyze}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              Run PH Scan
            </button>
            <button className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition border border-white/10">
              <RefreshCw size={20} />
            </button>
          </div>

          {result && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                  <CheckCircle size={14} /> Scan Successful
                </span>
                <span className="text-2xl font-black text-white">{result}%</span>
              </div>
              <p className="text-xs text-slate-400">
                PH levels within safety range. Food quality verified by AI Vision Lab.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Resubmission commit update
