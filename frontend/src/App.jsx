import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import KonselorDashboard from './pages/KonselorDashboard';
import OperatorDashboard from './pages/OperatorDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<LandingPage />} />
            <Route path="/services" element={<LandingPage />} />
            <Route path="/articles" element={<LandingPage />} />
            <Route path="/contact" element={<LandingPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
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
            />
            
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
