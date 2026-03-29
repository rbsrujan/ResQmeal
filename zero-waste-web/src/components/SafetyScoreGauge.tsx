export function SafetyScoreGauge({ score = 0, classification = 'UNKNOWN', reason = 'Quality analysis pending', confidence = 'Low' }: any) {
  const getColors = () => {
    if (score >= 70) return { stroke: '#16A34A', text: '#86EFAC', bg: '#14532D', border: '#16A34A' };
    if (score >= 40) return { stroke: '#EAB308', text: '#FDE047', bg: '#713F12', border: '#EAB308' };
    return { stroke: '#EF4444', text: '#FCA5A5', bg: '#7F1D1D', border: '#EF4444' };
  };

  const colors = getColors();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = Math.max(0, circumference - (score / 100) * circumference);

  return (
    <div className="flex flex-col items-center p-6 bg-[#1E293B] rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155]">
      <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">AI Safety Verification</h3>
      
      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-[#334155]"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={colors.stroke}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{color: colors.text}}>{score}</span>
          <span className="text-xs font-medium" style={{color: '#94A3B8'}}>/ 100</span>
        </div>
      </div>

      <div className="px-4 py-2 rounded-full font-bold mb-3 border" style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}>
        {classification?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
      </div>
      
      <p className="text-[#94A3B8] text-center text-sm italic mb-2">"{reason}"</p>
      <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
        Confidence: {confidence}
      </span>
    </div>
  );
}
