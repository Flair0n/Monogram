import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SpaceProvider } from './contexts/SpaceContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HeroPage } from './components/HeroPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { SpaceOverview } from './components/SpaceOverview';
import { SpaceDashboard } from './components/SpaceDashboard';
import { SettingsPage } from './components/SettingsPage';
import { SpaceSettingsPage } from './components/SpaceSettingsPage';

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

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
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
                path="/spaces/:spaceId" 
                element={
                  <ProtectedRoute>
                    <SpaceOverview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/spaces/:spaceId/dashboard" 
                element={
                  <ProtectedRoute>
                    <SpaceDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/spaces/:spaceId/settings" 
                element={
                  <ProtectedRoute>
                    <SpaceSettingsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SpaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
