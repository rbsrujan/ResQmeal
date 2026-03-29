import { useState, useEffect } from 'react';

interface ImpactCounterProps {
  target: number
  label: string
  prefix?: string
  suffix?: string
}

export function ImpactCounter({
  target,
  label,
  prefix = '',
  suffix = ''
}: ImpactCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = target / 80;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 20);
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
