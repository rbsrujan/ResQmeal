import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const roleColors = {
  donor:     { primary: '#16A34A', bg: '#14532D' },
  volunteer: { primary: '#3B82F6', bg: '#1E3A5F' },
  receiver:  { primary: '#F97316', bg: '#7C2D12' },
};

export const DashboardLayout = ({
  children, title, subtitle
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const colors = roleColors[profile?.role || 'donor'];

  const signOutAndRedirect = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A' }}>
      {/* Dashboard Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px', height: 64,
        background: '#1E293B',
        borderBottom: '1px solid #334155',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            onClick={() => navigate('/')}
            style={{
              color: '#F8FAFC', fontSize: 18,
              fontWeight: 800, cursor: 'pointer'
            }}>
            ZeroWaste <span style={{ color: '#16A34A' }}>AI</span>
          </span>
          <div style={{
            padding: '4px 12px', borderRadius: 99,
            background: `${colors.primary}22`,
            border: `1px solid ${colors.primary}44`,
            color: colors.primary, fontSize: 12, fontWeight: 700,
            textTransform: 'capitalize'
          }}>
            {profile?.role}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 600 }}>
              {profile?.full_name || 'User'}
            </div>
            <div style={{ color: '#64748B', fontSize: 12 }}>
              {profile?.email}
            </div>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: colors.bg,
            border: `2px solid ${colors.primary}`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary, fontSize: 16, fontWeight: 700
          }}>
            {(profile?.full_name || 'U')[0].toUpperCase()}
          </div>
          <button onClick={signOutAndRedirect}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'transparent',
              border: '1px solid #334155',
              color: '#94A3B8', fontSize: 13,
              cursor: 'pointer'
            }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Page header */}
      <div style={{
        padding: '32px 32px 0',
        borderBottom: '1px solid #1E293B',
        marginBottom: 32
      }}>
        <h1 style={{ color: '#F8FAFC', fontSize: 28, fontWeight: 800 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 4, paddingBottom: 24 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '0 32px 48px' }}>
        {children}
      </div>
    </div>
  );
};

// Resubmission commit update
