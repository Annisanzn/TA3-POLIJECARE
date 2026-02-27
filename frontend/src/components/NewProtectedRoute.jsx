import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import NewAuthService from '../services/newAuthService';

/**
 * NewProtectedRoute Component
 * Protected route for the new login system
 * Uses NewAuthService instead of the old AuthContext
 */
const NewProtectedRoute = ({ children, requiredRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication using NewAuthService
    const authData = NewAuthService.getAuthData();
    const { token, user: userData } = authData;

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
    }

    setIsLoading(false);
  }, []);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Memeriksa autentikasi...</h2>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login-new" replace />;
  }

  // Check role if specified
  // Support both single role string or array of roles
  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = requiredRoles.includes(user?.role);

    if (!hasRequiredRole) {
      console.log(`Role mismatch: User role = ${user?.role}, Required = ${requiredRoles.join(', ')}`);

      // Get appropriate dashboard based on user's actual role and redirect there immediately
      // Using replace=true removes the unauthorized URL from browser history
      const getDashboardPath = () => {
        switch (user?.role) {
          case 'admin': return '/admin/dashboard';
          case 'konselor': return '/konselor/dashboard';
          case 'operator': return '/operator/dashboard';
          case 'user': return '/user/dashboard';
          default: return '/login-new';
        }
      };

      return <Navigate to={getDashboardPath()} replace />;
    }
  }

  // Render children if authenticated and authorized
  return children;
};

export default NewProtectedRoute;