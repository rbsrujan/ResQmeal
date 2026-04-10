import { useState, useEffect } from 'react';

export function ImpactCounter({ target, label, prefix = '', suffix = '' }: any) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        clearInterval(timer);
        setCount(target);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="text-center p-6 bg-[#1E293B] rounded-[12px] shadow-[0_4px_6px_rgba(0,0,0,0.3)] border border-[#334155]">
      <div className="text-4xl font-extrabold text-[#F8FAFC] mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-[#64748B] font-bold uppercase tracking-wide text-sm">
        {label}
      </div>
    </div>
  );
}

// Resubmission commit update
