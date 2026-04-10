import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const resolveRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate('/login', { replace: true });
        return;
      }

      let userRole: string | null = null;
      let attempts = 0;

      while (!userRole && attempts < 5) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role) {
          userRole = profile.role;
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      if (!userRole) {
        navigate('/login', { replace: true });
        return;
      }

      // Explicit navigation — NO fallback
      if (userRole === 'volunteer') {
        navigate('/dashboard/volunteer', { replace: true });
      } else if (userRole === 'receiver') {
        navigate('/dashboard/receiver', { replace: true });
      } else {
        navigate('/dashboard/donor', { replace: true });
      }
    };

    resolveRole();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0F172A', gap: 16
    }}>
      <div style={{
        width: 48, height: 48, border: '3px solid #334155',
        borderTop: '3px solid #16A34A', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#64748B', fontSize: 14 }}>
        Verifying your login...
      </p>
    </div>
  );
};

// Resubmission commit update
