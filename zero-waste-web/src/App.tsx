import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import { AuthCallback } from './pages/auth/AuthCallback';

// Dashboards
import { DonorDashboard } from './pages/dashboard/DonorDashboard';
import { VolunteerDashboard } from './pages/dashboard/VolunteerDashboard';
import { ReceiverDashboard } from './pages/dashboard/ReceiverDashboard';

// Other existing pages
import UploadPage from './pages/donor/UploadPage';
import ProfileSetup from './pages/profile/ProfileSetup';
import ImpactPage from './pages/ImpactPage';
import TrackPage from './pages/TrackPage';
import { LiveTrackPage } from './pages/tracking/LiveTrackPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-200">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/profile/setup" element={<ProfileSetup />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/impact" element={<ImpactPage />} />

            {/* Protected donor routes */}
            <Route path="/donor/upload" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <UploadPage />
              </ProtectedRoute>
            } />

            {/* Role dashboards */}
            <Route path="/dashboard/donor" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/volunteer" element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/receiver" element={
              <ProtectedRoute allowedRoles={['receiver']}>
                <ReceiverDashboard />
              </ProtectedRoute>
            } />

            {/* Track page */}
            <Route path="/track/:foodId" element={<TrackPage />} />
            <Route path="/tracking/:donationId" element={<LiveTrackPage />} />

            {/* Catch all — redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

// Resubmission commit update
