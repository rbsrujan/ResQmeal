import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { PHClassifier } from '../../components/PHClassifier';
import { FoodSizeEstimator } from '../../components/FoodSizeEstimator';
import { ClassificationResult } from '../../components/ClassificationResult';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const InspectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [sizeEstimate, setSizeEstimate] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!safetyScore) return;
    
    // Update donation with official safety score
    const { error } = await supabase
      .from('donations')
      .update({ 
        safety_score: safetyScore,
        status: 'in-transit' 
      })
      .eq('id', id);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      navigate('/dashboard/volunteer');
    }
  };

  return (
    <DashboardLayout 
      title="Safety Inspection Lab" 
      subtitle="Run AI diagnostics to verify food quality and volume.">
      
      <div className="max-w-4xl mx-auto">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-12 relative px-10">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
          {[1, 2, 3].map((s) => (
            <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step >= s ? 'bg-primary text-white scale-110 shadow-[0_0_20px_rgba(22,163,74,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
              {s}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {step === 1 && (
            <div className="md:col-span-2 animate-slide-up">
               <PHClassifier onComplete={(score) => {
                 setSafetyScore(score);
                 setTimeout(() => setStep(2), 1500);
               }} />
            </div>
          )}

          {step === 2 && (
            <div className="md:col-span-2 animate-slide-up">
              <FoodSizeEstimator onComplete={(size) => {
                setSizeEstimate(size);
                setTimeout(() => setStep(3), 1500);
              }} />
            </div>
          )}

          {step === 3 && (
            <div className="md:col-span-2 animate-slide-up">
              <ClassificationResult score={safetyScore!} size={sizeEstimate!} />
              
              <div className="mt-8 flex justify-end gap-4">
                 <button 
                   onClick={() => setStep(1)}
                   className="px-8 py-3 bg-white/5 text-slate-400 rounded-xl font-bold border border-white/10 hover:bg-white/10 transition"
                 >
                   Reset Scan
                 </button>
                 <button 
                   onClick={handleComplete}
                   className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                 >
                   Verify & Start Delivery <ChevronRight size={18} />
                 </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-4">
          <ShieldCheck className="text-blue-500 shrink-0" size={24} />
          <div>
            <h4 className="text-white font-bold mb-1">Why do this?</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Our AI Lab ensures that all food redistribution meets high safety standards. By performing this scan, you're protecting the community from foodborne illnesses and optimizing logistics.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Resubmission commit update
