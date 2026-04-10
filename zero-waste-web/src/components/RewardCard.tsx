export function RewardCard({ icon, title, cost, onRedeem, disabled }: any) {
  return (
    <div className={`p-4 rounded-[12px] border flex flex-col items-center justify-center text-center transition-all shadow-[0_4px_6px_rgba(0,0,0,0.3)]
      ${disabled ? 'border-[#334155] bg-[#0F172A] opacity-60' : 'border-[#334155] bg-[#1E293B] hover:border-[#16A34A] cursor-pointer'}`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="font-bold text-[#F8FAFC] mb-1">{title}</h4>
      <span className="text-[#F97316] font-semibold bg-[#0F172A] border border-[#F97316] px-3 py-1 rounded-full text-sm mb-4">
        {cost} pts
      </span>
      <button 
        onClick={onRedeem}
        disabled={disabled}
        className={`w-full py-2 rounded-lg font-medium transition-colors
          ${disabled ? 'bg-[#334155] text-[#64748B]' : 'bg-[#16A34A] text-[#FFFFFF] hover:bg-[#14532D] active:scale-95'}`}
      >
        Redeem
      </button>
    </div>
  );
}

// Resubmission commit update
