import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: React.ReactNode
  allowedRoles?: ('donor' | 'volunteer' | 'receiver')[]
}

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
      width: 44,
      height: 44,
      border: '3px solid #1E293B',
      borderTop: '3px solid #16A34A',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <p style={{ color: '#64748B', fontSize: 14 }}>
      Loading...
    </p>
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

export const ProtectedRoute = ({
  children,
  allowedRoles
}: Props) => {
  const { user, profile, loading } = useAuth()

  // CRITICAL: Wait for auth to initialize
  // Without this check it redirects before
  // session is restored from storage
  if (loading) {
    return <LoadingSpinner />
  }

  // Not logged in — go to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but profile still loading
  // Wait instead of redirecting
  if (!profile) {
    return <LoadingSpinner />
  }

  // Wrong role for this route
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'volunteer') {
      return <Navigate to="/dashboard/volunteer" replace />
    } else if (profile.role === 'receiver') {
      return <Navigate to="/dashboard/receiver" replace />
    } else {
      return <Navigate to="/dashboard/donor" replace />
    }
  }

  return <>{children}</>
}
