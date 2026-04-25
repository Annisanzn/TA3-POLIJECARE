import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import api from '../api/axios';

const NewLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromFormLaporan = searchParams.get('from') === 'form-laporan';

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear login error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };

  // Handle SSO Error from redirect
  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'domain_not_allowed') {
        setLoginError('Akses ditolak. Gunakan email @polije.ac.id atau @student.polije.ac.id');
      } else {
        setLoginError('Terjadi kesalahan saat login dengan Google. Silakan coba lagi.');
      }
      
      // Clean up url
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Redirect to backend auth route which will redirect to Google Identity Services
    const apiUrl = API_BASE_URL;
    window.location.href = `${apiUrl}/auth/google`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🔍 Starting new login process...');

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsLoading(true);
    setLoginError('');
    setDebugInfo(null);

    try {
      console.log('📤 Sending login request to /login-new');
      console.log('Request data:', { email: formData.email, password: '***' });

      // Make API call to new login endpoint
      const response = await api.post('/login-new', {
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Login response received:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      setDebugInfo({
        type: 'success',
        data: response
      });

      // Access the actual data from axios response
      const responseData = response.data;

      if (responseData.success) {
        console.log('✅ Login successful!');
        console.log('User data:', responseData.user);
        console.log('Token:', responseData.token ? 'Received' : 'Missing');

        // Save token and user data to localStorage
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('user', JSON.stringify(responseData.user));

        console.log('💾 Token saved to localStorage');

        // Redirect based on role
        const role = responseData.user?.role || 'user';
        console.log(`🔄 Redirecting based on role: ${role}`);

        switch (role) {
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
        console.error('❌ Login failed (success: false):', responseData);
        setLoginError(responseData.message || 'Login gagal. Silakan coba lagi.');
        setDebugInfo({
          type: 'error',
          data: responseData
        });
      }
    } catch (error) {
      console.error('❌ Login error caught:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);

      let errorMessage = 'Login gagal. Silakan coba lagi.';

      if (error.response) {
        // Server merespon dengan status di luar 2xx
        console.error('Server responded with error:', error.response.status);
        errorMessage = error.response?.data?.message || `Server error: ${error.response.status}`;

        setDebugInfo({
          type: 'error',
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        // Request terkirim tapi tidak ada response (network error / server mati)
        console.error('No response received - server mungkin tidak berjalan');
        errorMessage = 'Server tidak merespon. Pastikan backend (php artisan serve) sedang berjalan.';

        setDebugInfo({
          type: 'network',
          message: 'No response from server'
        });
      } else {
        // Error dalam setup request
        console.error('Request setup error:', error.message);
        errorMessage = error.message || 'Gagal membuat permintaan login.';
      }

      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.2 } }
  };

  const floatAnimation = {
    hidden: { y: 0 },
    show: {
      y: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20"
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20"
        animate={{
          x: [0, -15, 0],
          y: [0, 20, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      <motion.div
        className="w-full max-w-md z-10"
        initial="hidden"
        animate="show"
        variants={fadeIn}
      >
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20"
          variants={slideUp}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            variants={scaleIn}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg"
              variants={floatAnimation}
            >
              <FiLogIn className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
              PolijeCare Login
            </h1>
            <p className="text-gray-600 mb-3">
              Masuk ke sistem PolijeCare untuk akses layanan pengaduan dan konseling
            </p>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium text-sm">
                Terhubung dengan database Polije
              </span>
            </div>
          </motion.div>

          {/* Info Banner for Form Laporan redirect */}
          {fromFormLaporan && (
            <motion.div
              className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-blue-800">
                    Silakan login terlebih dahulu
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Gunakan <span className="font-semibold">email Polije</span> Anda (contoh: <span className="font-mono text-xs bg-blue-100 px-1.5 py-0.5 rounded">nama@polije.ac.id</span>) untuk mengakses Form Pengaduan.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Login Form Section */}
          <motion.div variants={scaleIn}>
            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-[#e3342f] hover:bg-[#cc1f1a] text-white py-3.5 px-4 rounded-xl font-medium shadow-md transition-all active:scale-95 disabled:opacity-70 mb-6"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Masuk dengan Google (@polije.ac.id / @student.polije.ac.id)</span>
            </button>

            <p className="text-center text-xs text-gray-500 mb-6">
              Pastikan Anda menggunakan email resmi kampus.
            </p>

            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                ATAU MASUK DENGAN EMAIL & KATA SANDI
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <motion.div
              className="mb-6"
              whileFocus={{ scale: 1.01 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FiMail className="mr-2" /> Email Polije
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 rounded-xl border-2 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  placeholder="contoh@polije.ac.id"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <motion.p
                  className="mt-2 text-sm text-red-600 flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <FiAlertCircle className="mr-2" /> {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password Input */}
            <motion.div
              className="mb-6"
              whileFocus={{ scale: 1.01 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <FiLock className="mr-2" /> Password
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 w-full px-4 py-3 rounded-xl border-2 ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Masukkan password"
                  disabled={isLoading}
                />
                <motion.button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-blue-500 hover:text-blue-700 transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-blue-500 hover:text-blue-700 transition-colors" />
                  )}
                </motion.button>
              </div>
              {errors.password && (
                <motion.p
                  className="mt-2 text-sm text-red-600 flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <FiAlertCircle className="mr-2" /> {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Login Error */}
            {loginError && (
              <motion.div
                className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center">
                  <FiAlertCircle className="h-6 w-6 text-red-600 mr-3 animate-pulse" />
                  <div>
                    <p className="text-red-700 font-medium">{loginError}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-4 rounded-xl font-semibold text-white shadow-lg ${isLoading
                ? 'bg-gradient-to-r from-blue-400 to-indigo-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                } focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300`}
              whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              animate={!isLoading ? {
                boxShadow: ["0px 4px 15px rgba(59, 130, 246, 0.3)", "0px 6px 20px rgba(59, 130, 246, 0.4)", "0px 4px 15px rgba(59, 130, 246, 0.3)"]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses Login...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FiLogIn className="mr-3 text-white" />
                  Masuk ke PolijeCare
                </span>
              )}
            </motion.button>
            </form>
          </motion.div>

          {/* Debug Info (for development) */}
          {debugInfo && (
            <motion.div
              className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h3>
              <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
              <p className="text-xs text-gray-500 mt-2">
                Info ini hanya untuk debugging dan akan hilang di production
              </p>
            </motion.div>
          )}

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">


              {/* Button Kembali ke Landing Page */}
              <div className="mb-4">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Kembali ke Landing Page
                </button>
              </div>

            </div>
          </div>
        </motion.div>


      </motion.div>
    </div>
  );
};

export default NewLoginPage;