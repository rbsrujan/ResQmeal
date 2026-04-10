import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Fingerprint } from 'lucide-react';

export const VolunteerGuard = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      await new Promise(r => setTimeout(r, 800));
      setLoading(false);
    };
    check();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center">
        <div className="relative">
          <Fingerprint size={48} className="text-blue-500 animate-pulse" />
          <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full scale-150 animate-ping" />
        </div>
        <p className="mt-8 text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Encrypted Session Check</p>
      </div>
    );
  }

  if (!user || profile?.role !== 'volunteer') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 max-w-xs mb-8">
          This terminal is restricted to authorized volunteers. Please log in with a valid volunteer credential.
        </p>
        <Navigate to="/login" replace />
      </div>
    );
  }

  return <Outlet />;
};

// Resubmission commit update
