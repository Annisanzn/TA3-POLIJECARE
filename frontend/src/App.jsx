import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import { ScrollParticles } from './components/ui/scroll-particles';

// Pages
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/user/dashboard';
import KonselorDashboard from './pages/konselor/dashboard';
import OperatorDashboard from './pages/operator/dashboard';
import NewLoginPage from './pages/NewLoginPage';
import NewRedirectDashboard from './components/NewRedirectDashboard';
import NewUserDashboard from './pages/NewUserDashboard';
import NewProtectedRoute from './components/NewProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <ScrollParticles />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<LandingPage />} />
            <Route path="/services" element={<LandingPage />} />
            <Route path="/articles" element={<LandingPage />} />
            <Route path="/contact" element={<LandingPage />} />
            
            {/* New Login System Routes */}
            <Route path="/login-new" element={<NewLoginPage />} />
            <Route path="/redirect-new" element={<NewRedirectDashboard />} />
            
            {/* New Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <NewProtectedRoute>
                  <UserDashboard />
                </NewProtectedRoute>
              }
            />
            
            <Route
              path="/admin/dashboard"
              element={
                <NewProtectedRoute requiredRole="admin">
                  <UserDashboard />
                </NewProtectedRoute>
              }
            />
            
            <Route
              path="/konselor/dashboard"
              element={
                <NewProtectedRoute requiredRole="konselor">
                  <KonselorDashboard />
                </NewProtectedRoute>
              }
            />
            
            <Route
              path="/operator/dashboard"
              element={
                <NewProtectedRoute requiredRole="operator">
                  <OperatorDashboard />
                </NewProtectedRoute>
              }
            />

            {/* Protected Dashboard Routes */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            {/* Routes di bawah ini sudah digantikan oleh NewProtectedRoute di atas */}
            {/* <Route
              path="/konselor/dashboard"
              element={
                <ProtectedRoute requiredRole="konselor">
                  <KonselorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operator/dashboard"
              element={
                <ProtectedRoute requiredRole="operator">
                  <OperatorDashboard />
                </ProtectedRoute>
              }
            /> */}

            {/* Redirect */}
            <Route path="/redirect" element={<RedirectDashboard />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Redirect component for role-based navigation
const RedirectDashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  switch (user.role) {
    case 'user':
      return <Navigate to="/user/dashboard" replace />;
    case 'konselor':
      return <Navigate to="/konselor/dashboard" replace />;
    case 'operator':
      return <Navigate to="/operator/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default App;
