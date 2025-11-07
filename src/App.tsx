import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SpaceProvider } from './contexts/SpaceContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { HeroPage } from './pages/HeroPage';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { SpaceOverview } from './pages/SpaceOverview';
import { SpaceDashboard } from './pages/SpaceDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { SpaceSettingsPage } from './pages/SpaceSettingsPage';
import { SpotifyCallback } from './pages/SpotifyCallback';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SpaceProvider>
          <div className="min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HeroPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Profile Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Global Settings */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Space Routes */}
              <Route 
                path="/spaces/:spaceName" 
                element={
                  <ProtectedRoute>
                    <SpaceOverview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/spaces/:spaceName/dashboard" 
                element={
                  <ProtectedRoute>
                    <SpaceDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/spaces/:spaceName/settings" 
                element={
                  <ProtectedRoute>
                    <SpaceSettingsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Spotify OAuth Callback */}
              <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SpaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
