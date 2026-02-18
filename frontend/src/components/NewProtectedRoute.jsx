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
    console.log('🔐 NewProtectedRoute: Checking authentication...');
    
    // Check authentication using NewAuthService
    const authData = NewAuthService.getAuthData();
    const { token, user: userData } = authData;
    
    console.log('📋 Auth data:', { 
      hasToken: !!token, 
      hasUser: !!userData,
      userRole: userData?.role 
    });
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
      console.log('✅ User authenticated via new login system');
    } else {
      console.log('❌ User not authenticated via new login system');
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
          <p className="text-gray-600 text-sm mt-2">Menggunakan sistem login baru</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🔄 Redirecting to /login-new (not authenticated)');
    return <Navigate to="/login-new" replace />;
  }

  // Check role if specified
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`🚫 Role mismatch: User role = ${user?.role}, Required role = ${requiredRole}`);
    
    // Get appropriate dashboard based on user's actual role
    const getDashboardPath = () => {
      switch (user?.role) {
        case 'admin': return '/admin/dashboard';
        case 'konselor': return '/konselor/dashboard';
        case 'operator': return '/operator/dashboard';
        case 'user': return '/dashboard';
        default: return '/dashboard';
      }
    };
    
    const dashboardPath = getDashboardPath();
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl text-red-500 mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-4">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Role Anda:</span> {user?.role || 'Tidak diketahui'}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Role yang diperlukan:</span> {requiredRole}
            </p>
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-medium">Email:</span> {user?.email}
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Kembali
            </button>
            
            <button
              onClick={() => window.location.href = dashboardPath}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ke Dashboard {user?.role || 'Anda'}
            </button>
            
            <button
              onClick={() => {
                NewAuthService.clearAuthData();
                window.location.href = '/login-new';
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout & Login Ulang
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Menggunakan sistem login baru • Token: {NewAuthService.getAuthData().token ? 'Valid' : 'Tidak valid'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render children if authenticated and authorized
  console.log(`✅ Access granted: User ${user?.email} with role ${user?.role}`);
  return children;
};

export default NewProtectedRoute;