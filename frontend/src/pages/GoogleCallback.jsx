import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadUserFromToken } = useAuth(); // or we just set token and let context load it
  
  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        navigate(`/login-new?error=${error}`);
        return;
      }

      if (token) {
        // Save token
        localStorage.setItem('token', token);
        
        // Fetch user data directly to determine role immediately
        try {
          const response = await api.get('/user-new', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.success) {
            const user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Redirect based on role
            switch (user.role) {
              case 'admin':
                navigate('/admin/dashboard');
                break;
              case 'konselor':
                navigate('/konselor/dashboard');
                break;
              case 'operator':
                navigate('/operator/dashboard');
                break;
              case 'user':
              default:
                navigate('/dashboard');
                break;
            }
          } else {
            navigate('/login-new?error=auth_failed');
          }
        } catch (err) {
          console.error("Failed to fetch user after SSO", err);
          navigate('/login-new?error=sso_failed');
        }
      } else {
        navigate('/login-new');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20 text-center flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
          Memproses Login Google...
        </h2>
        <p className="text-gray-500 font-medium">
          Mohon tunggu sebentar, Anda akan segera dialihkan ke halaman utama.
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
