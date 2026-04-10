import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  allowedRoles?: ('donor' | 'volunteer' | 'receiver')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  // Not logged in at all
  if (!user) return <Navigate to="/login" replace />;

  // Still fetching profile — wait
  if (!profile) return <LoadingSpinner />;

  // Wrong role for this route
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'volunteer') {
      return <Navigate to="/dashboard/volunteer" replace />;
    } else if (profile.role === 'receiver') {
      return <Navigate to="/dashboard/receiver" replace />;
    } else {
      return <Navigate to="/dashboard/donor" replace />;
    }
  }

  // Incomplete profile – redirect to setup
  if (!profile.profile_completed) {
    return <Navigate to="/profile/setup" replace />;
  }

  return <>{children}</>;
};

// Loading spinner component (add inside same file):
const LoadingSpinner = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0F172A',
    gap: 16
  }}>
    <div style={{
      width: 44, height: 44,
      border: '3px solid #1E293B',
      borderTop: '3px solid #16A34A',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <p style={{ color: '#64748B', fontSize: 14 }}>Loading...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Resubmission commit update
