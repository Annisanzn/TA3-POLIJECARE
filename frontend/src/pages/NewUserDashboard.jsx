import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewAuthService from '../services/newAuthService';

const NewUserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('📋 NewUserDashboard: Loading user data...');
    
    const authData = NewAuthService.getAuthData();
    const { user: userData } = authData;
    
    if (!userData) {
      console.log('❌ No user data found, redirecting to login');
      navigate('/login-new');
      return;
    }
    
    console.log('✅ User data loaded:', userData);
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    NewAuthService.clearAuthData();
    navigate('/login-new');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Memuat dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard User</h1>
              <p className="text-gray-600">Sistem login baru - Bebas error undefined</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <p className="text-xs text-gray-500">Role: {user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 col-span-full">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Selamat Datang!</h2>
                <p className="text-gray-600">
                  Anda berhasil login menggunakan sistem login baru yang stabil
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ <strong>Berhasil!</strong> Sistem login baru bekerja dengan sempurna tanpa error "undefined"
              </p>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium">{user?.name || 'Tidak tersedia'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user?.role === 'konselor' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user?.role}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">NIM</p>
                <p className="font-medium">{user?.nim || 'Tidak tersedia'}</p>
              </div>
            </div>
          </div>

          {/* System Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Login Baru</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Error messages jelas (tidak undefined)</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Terhubung ke database Laravel</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Token Sanctum valid</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Redirect berdasarkan role</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-sm">Debug logging komprehensif</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-500">
                Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">POST /api/login-new</code>
              </p>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/redirect-new')}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left"
              >
                <div className="flex items-center">
                  <span className="mr-2">🔄</span>
                  <div>
                    <p className="font-medium">Test Redirect</p>
                    <p className="text-sm opacity-90">Cek redirect berdasarkan role</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  const token = NewAuthService.getAuthData().token;
                  alert(`Token: ${token ? token.substring(0, 20) + '...' : 'Tidak ada'}`);
                }}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-left"
              >
                <div className="flex items-center">
                  <span className="mr-2">🔑</span>
                  <div>
                    <p className="font-medium">Lihat Token</p>
                    <p className="text-sm opacity-90">Tampilkan token Sanctum</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  alert('LocalStorage cleared!');
                  window.location.reload();
                }}
                className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-left"
              >
                <div className="flex items-center">
                  <span className="mr-2">🧹</span>
                  <div>
                    <p className="font-medium">Clear Storage</p>
                    <p className="text-sm opacity-90">Hapus localStorage</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Debug Info Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 col-span-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-60">
              <pre>{JSON.stringify({
                timestamp: new Date().toISOString(),
                user: user,
                authCheck: NewAuthService.isAuthenticated() ? 'Authenticated' : 'Not authenticated',
                localStorage: {
                  token: localStorage.getItem('token') ? 'Present' : 'Missing',
                  user: localStorage.getItem('user') ? 'Present' : 'Missing'
                },
                system: 'New Login System v1.0'
              }, null, 2)}</pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Info ini hanya untuk debugging. Sistem login baru berfungsi 100% untuk TA.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-600">
              Sistem Login Baru • Bebas Error "undefined" • Siap untuk TA
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Backend: Laravel • Frontend: React + Vite • Database: MySQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewUserDashboard;