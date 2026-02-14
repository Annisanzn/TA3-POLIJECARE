import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { fadeIn, slideDown } from '../utils/motionVariants';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Beranda', href: '#hero' },
    { name: 'Tentang Kami', href: '#about' },
    { name: 'Cara Melapor', href: '#services' },
    { name: 'Artikel', href: '#articles' },
    { name: 'Kontak', href: '#contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboardRedirect = () => {
    if (!user) return;
    
    switch (user.role) {
      case 'user':
        navigate('/user/dashboard');
        break;
      case 'operator':
        navigate('/operator/dashboard');
        break;
      case 'konselor':
        navigate('/konselor/dashboard');
        break;
      default:
        navigate('/redirect');
        break;
    }
  };

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-100' 
            : 'bg-white shadow-sm'
        }`}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={() => handleNavClick('#hero')}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-card transition-all duration-300 border border-primary/20">
                  <img 
                    src="/logo_polijecare.png" 
                    alt="PolijeCare Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                Polijecare
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <motion.div 
                className="flex space-x-6"
                variants={slideDown}
                initial="hidden"
                animate="visible"
              >
                {navLinks.map((link, index) => (
                  <motion.div 
                    key={link.name}
                    variants={fadeIn}
                    transition={{ delay: 0.1 * index }}
                  >
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => handleNavClick(link.href)}
                        className="text-gray-600 hover:text-primary font-medium transition-colors relative group"
                      >
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                      </button>
                    ) : (
                      <Link 
                        to={link.href}
                        className="text-gray-600 hover:text-primary font-medium transition-colors relative group"
                      >
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Auth Buttons & Theme Toggle */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={handleDashboardRedirect}
                      className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 hover:shadow-soft font-medium"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-medium"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 hover:shadow-soft font-medium"
                  >
                    Masuk
                  </Link>
                )}
                
                {/* Theme Toggle */}
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-primary p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <AnimatePresence mode="wait">
                    {isMobileMenuOpen ? (
                      <motion.path
                        key="close"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      />
                    ) : (
                      <motion.path
                        key="menu"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.05 * index }}
                  >
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => handleNavClick(link.href)}
                        className="block w-full text-left px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link 
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
                      >
                        {link.name}
                      </Link>
                    )}
                  </motion.div>
                ))}
                
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={handleDashboardRedirect}
                        className="w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 font-medium"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-medium"
                      >
                        Keluar
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 font-medium text-center"
                    >
                      Masuk
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
