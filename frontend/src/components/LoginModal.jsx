import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Motion variants for animations
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.2,
      type: "spring",
      stiffness: 300,
      damping: 30
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const LoginModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@(polije\.ac\.id|student\.polije\.ac\.id)$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email harus menggunakan domain @polije.ac.id';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      console.log('🔍 Login result:', result);

      if (result && result.success) {
        console.log('✅ Login successful');
        
        // Get user role from response
        const userRole = result.data?.user?.role || 'user';
        console.log('🔍 User role:', userRole);
        
        // Close modal
        onClose();
        
        // Redirect based on role - use the existing RedirectDashboard component
        // Instead of navigating directly, we'll use the /redirect route
        // which will automatically redirect based on user role
        navigate('/redirect');
      } else {
        console.error('❌ Login failed:', result);
        const errorMessage = result?.message || 'Login gagal. Silakan coba lagi.';
        setLoginError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', error);
      const errorMessage = error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setLoginError(errorMessage);
    }
    
    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Reset form
      setFormData({ email: '', password: '' });
      setErrors({});
      setLoginError('');
      setShowPassword(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          
          {/* Modal */}
          <motion.div 
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {/* Header with Protection Icon */}
              <motion.div 
                className="text-center mb-6"
                variants={slideUp}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <img 
                    src="/logo_polijecare.png" 
                    alt="Polijecare Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  PolijeCare
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Portal Layanan Perlindungan & Kesejahteraan
                </p>
              </motion.div>

              {/* Login Form */}
              <motion.form 
                onSubmit={handleSubmit}
                variants={slideUp}
              >
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                    Masuk menggunakan akun resmi Polije<br />
                    untuk menjaga keamanan dan kerahasiaan data Anda.
                  </p>
                </div>

                {/* Login Error Alert */}
                {loginError && (
                  <motion.div 
                    className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{loginError}</span>
                  </motion.div>
                )}

                {/* Email Field */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Polije
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300'
                      }`}
                      placeholder="nama@polije.ac.id"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan password"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg shadow-lg hover:bg-primary-dark hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Masuk...</span>
                    </div>
                  ) : (
                    'Masuk'
                  )}
                </motion.button>
              </motion.form>

              {/* Footer */}
              <motion.div 
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                variants={slideUp}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  Dilindungi dengan enkripsi end-to-end<br />
                  © 2026 PolijeCare - Politeknik Negeri Jember
                </p>
              </motion.div>
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/5 rounded-full blur-xl"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
