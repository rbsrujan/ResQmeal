import { Clock, Navigation, Star, Loader2, Heart } from 'lucide-react';

export function ReceiverMatchCard({ receiver, onAssign, isSubmitting }: any) {
  return (
    <div className="premium-glass p-6 rounded-3xl flex flex-col sm:flex-row shadow-xl hover:border-[#16A34A]/50 transition-all items-start sm:items-center justify-between gap-6 group">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-12 h-12 bg-[#334155] rounded-2xl flex items-center justify-center text-[#16A34A] group-hover:bg-[#16A34A] group-hover:text-white transition-all">
             <Heart size={24} fill={receiver.rating > 4.8 ? "currentColor" : "none"} />
           </div>
           <div>
              <h4 className="font-black text-xl text-[#F8FAFC] flex items-center gap-2">
                {receiver.name}
              </h4>
              <div className="flex items-center gap-4 text-[#64748B] text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Navigation size={14} className="text-[#16A34A]"/> {receiver.distance} km</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#3B82F6]"/> {receiver.eta} mins</span>
                <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500 fill-yellow-500"/> {receiver.rating}</span>
              </div>
           </div>
        </div>
      </div>
      
      <button 
        disabled={isSubmitting}
        onClick={() => onAssign(receiver)}
        className="w-full sm:w-auto bg-[#16A34A] text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-[#15803D] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 min-w-[180px]"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>Assign Order <Plus size={18} /></>
        )}
      </button>
    </div>
  );
}

const Plus = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// Resubmission commit update
