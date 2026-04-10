import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages — lazy loaded for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback').then(m => ({ default: m.AuthCallback })));

// Dashboards — lazy loaded
const DonorDashboard = lazy(() => import('./pages/dashboard/DonorDashboard').then(m => ({ default: m.DonorDashboard })));
const VolunteerDashboard = lazy(() => import('./pages/dashboard/VolunteerDashboard').then(m => ({ default: m.VolunteerDashboard })));
const ReceiverDashboard = lazy(() => import('./pages/dashboard/ReceiverDashboard').then(m => ({ default: m.ReceiverDashboard })));

// Other pages — lazy loaded
const UploadPage = lazy(() => import('./pages/donor/UploadPage'));
const ProfileSetup = lazy(() => import('./pages/profile/ProfileSetup'));
const ImpactPage = lazy(() => import('./pages/ImpactPage'));
const TrackPage = lazy(() => import('./pages/TrackPage'));
const LiveTrackPage = lazy(() => import('./pages/tracking/LiveTrackPage').then(m => ({ default: m.LiveTrackPage })));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-200">
          {/* Suspense boundary required for React.lazy — shows fallback while page chunk loads */}
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          }>
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
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

// Resubmission commit update
