import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewAuthService from '../services/newAuthService';

/**
 * NewRedirectDashboard Component
 * Automatically redirects users based on their role after login
 * Uses the new authentication service
 */
const NewRedirectDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 NewRedirectDashboard: Starting role-based redirect...');
    
    // Check authentication
    if (!NewAuthService.isAuthenticated()) {
      console.warn('⚠️ NewRedirectDashboard: User not authenticated, redirecting to login');
      navigate('/login-new');
      return;
    }

    // Get user role and redirect
    const role = NewAuthService.getUserRole();
    console.log(`👤 NewRedirectDashboard: User role detected: ${role}`);

    switch (role) {
      case 'admin':
        console.log('🔄 Redirecting to admin dashboard');
        navigate('/admin/dashboard');
        break;
      case 'konselor':
        console.log('🔄 Redirecting to konselor dashboard');
        navigate('/konselor/dashboard');
        break;
      case 'operator':
        console.log('🔄 Redirecting to operator dashboard');
        navigate('/operator/dashboard');
        break;
      case 'user':
        console.log('🔄 Redirecting to user dashboard');
        navigate('/dashboard');
        break;
      default:
        console.warn(`⚠️ NewRedirectDashboard: Unknown role "${role}", redirecting to default dashboard`);
        navigate('/dashboard');
        break;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mengarahkan...</h2>
        <p className="text-gray-600">
          Sedang mengarahkan ke dashboard berdasarkan role Anda
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Menggunakan sistem login baru</p>
          <p className="text-xs mt-1">Role-based redirect dengan token validation</p>
        </div>
      </div>
    </div>
  );
};

export default NewRedirectDashboard;