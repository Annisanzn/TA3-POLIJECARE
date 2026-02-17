import React, { useState, useEffect } from 'react';
import { Home, Info, FileText, BookOpen, Phone } from 'lucide-react';
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { fadeIn, slideDown } from '../utils/motionVariants';
import Switch from './sky-toggle';
import LoginModal from './LoginModal';


const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('#hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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

  const tabs = [
    { title: "Beranda", icon: Home },
    { title: "Tentang Kami", icon: Info },
    { title: "Cara Melapor", icon: FileText },
    { title: "Artikel", icon: BookOpen },
    { title: "Kontak", icon: Phone },
  ];

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };



  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Logic for switching navbar type (Standard vs Expandable)
          const aboutSection = document.getElementById('about');
          const threshold = aboutSection ? aboutSection.offsetTop - 400 : window.innerHeight - 200;
          setIsScrolled(window.scrollY > threshold);

          // ScrollSpy Logic
          const sections = navLinks.map(link => link.href.substring(1));
          let currentSection = "";

          for (const section of sections) {
            const element = document.getElementById(section);
            if (element) {
              const rect = element.getBoundingClientRect();
              if (rect.top <= 150 && rect.bottom >= 150) {
                currentSection = "#" + section;
              }
            }
          }

          if (currentSection && currentSection !== activeLink) {
            setActiveLink(currentSection);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks, activeLink]);

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

  return (
    <>
      <AnimatePresence mode="wait">
        {isScrolled ? (
          <motion.div
            key="expandable-tabs"
            initial={{ opacity: 0, y: -10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%", transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-4 left-1/2 z-50 transform -translate-x-1/2 will-change-transform"
          >
            <ExpandableTabs
              tabs={tabs}
              activeTab={navLinks.findIndex(link => link.href === activeLink)}
              onChange={(index) => {
                if (index !== null) {
                  const href = navLinks[index].href;
                  setActiveLink(href);
                  handleNavClick(href);
                }
              }}
              trailingElement={
                <div className="flex items-center gap-2">
                  <Switch />
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={handleDashboardRedirect}
                        className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-full hover:bg-primary-dark transition-all duration-300 hover:shadow-lg"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-5 py-2.5 text-sm font-medium border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-all duration-300"
                      >
                        Keluar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="px-6 py-2.5 text-sm font-medium bg-[#191970] text-white rounded-full hover:bg-blue-900 transition-all duration-300 hover:shadow-lg"
                    >
                      Masuk
                    </button>
                  )}
                </div>
              }
            />
          </motion.div>
        ) : (
          <motion.nav
            key="navbar"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-white/50 backdrop-blur-md border-b border-white/20 shadow-sm will-change-transform"
          >
            <div className="w-full px-8 lg:px-12">
              <div className="flex items-center justify-between h-20">
                {/* Logo Section - Left */}
                <Link to="/" className="flex items-center space-x-2 cursor-default">
                  <img
                    src="/logo_polije.png"
                    alt="Logo Polije"
                    className="h-12 w-auto object-contain"
                  />
                  <img
                    src="/logo_polijecare.png"
                    alt="Polijecare Logo"
                    className="h-12 w-auto object-contain"
                  />
                </Link>

                {/* Centered Navigation Links */}
                <div className="hidden md:flex items-center space-x-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => {
                        setActiveLink(link.href);
                        handleNavClick(link.href);
                      }}
                      className={`px-5 py-2.5 text-base font-medium rounded-full transition-all duration-200 ${activeLink === link.href
                        ? 'bg-[#191970] text-white shadow-[0_4px_15px_rgba(25,25,112,0.4)]'
                        : 'text-gray-600 hover:text-[#191970] hover:bg-gray-100'
                        }`}
                    >
                      {link.name}
                    </button>
                  ))}
                </div>

                {/* Right Section - Auth & Theme */}
                <div className="hidden md:flex items-center space-x-4">
                  <Switch />

                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={handleDashboardRedirect}
                        className="px-5 py-2.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-all duration-300 hover:shadow-lg font-medium text-sm"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-5 py-2.5 border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-all duration-300 font-medium text-sm"
                      >
                        Keluar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="px-6 py-2.5 bg-[#191970] text-white rounded-full hover:bg-blue-900 transition-all duration-300 hover:shadow-lg font-medium text-sm"
                    >
                      Masuk
                    </button>
                  )}
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
                        <button
                          onClick={() => {
                            setIsLoginModalOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 font-medium"
                        >
                          Masuk
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
