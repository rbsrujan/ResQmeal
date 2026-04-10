import { CheckCircle2, Clock, Truck, PackageCheck } from 'lucide-react';

interface FoodTimelineProps {
  status: 'pending' | 'verified' | 'in_transit' | 'delivered';
}

export function FoodTimeline({ status }: FoodTimelineProps) {
  const steps = [
    { id: 'pending', label: 'Food Listed', icon: Clock, time: '10:00 AM' },
    { id: 'verified', label: 'Safety Verified', icon: CheckCircle2, time: '10:15 AM' },
    { id: 'in_transit', label: 'Out for Delivery', icon: Truck, time: '10:30 AM' },
    { id: 'delivered', label: 'Delivered', icon: PackageCheck, time: '11:00 AM' },
  ];

  const getCurrentIndex = () => steps.findIndex(s => s.id === status);
  const currentIndex = getCurrentIndex();

  return (
    <div className="w-full">
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 rounded-full transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          
          return (
            <div className="relative flex flex-col items-center">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_6px_rgba(0,0,0,0.3)] z-10 transition-colors duration-500
                ${isCompleted || isCurrent ? 'bg-[#16A34A] text-[#FFFFFF]' : 'bg-[#334155] text-[#64748B]'}
                ${isCurrent ? 'ring-4 ring-[#16A34A]/30 animate-pulse' : ''}
              `}
            >
              <Icon size={24} />
            </div>
            
            <div className="mt-4 text-center absolute top-12 w-28">
              <p className={`font-bold text-sm ${isCurrent ? 'text-[#16A34A]' : (isCompleted ? 'text-[#F8FAFC]' : 'text-[#64748B]')}`}>
                {step.label}
              </p>
              {isCompleted && (
                <p className="text-xs text-[#94A3B8] font-medium mt-1">{step.time}</p>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

// Resubmission commit update
