import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, slideLeft, slideRight } from '../utils/motionVariants';

const Hero = ({ heroData }) => {
  const defaultHero = {
    title: 'Aman Bicara, Aman Melapor',
    subtitle: 'Satgas PPKPT Politeknik Negeri Jember',
    description: 'Kami siap mendengar dan membantu Anda dengan profesionalisme dan kerahasiaan terjamin.'
  };

  const hero = heroData || defaultHero;

  return (
    <section 
      id="hero" 
      className="min-h-screen flex items-center bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 relative overflow-hidden pt-16 transition-colors duration-300"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3] 
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div 
            className="space-y-8"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="space-y-4"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
              >
                {hero.title}
              </motion.h1>
              
              <motion.h2 
                className="text-xl md:text-2xl lg:text-3xl font-semibold text-primary dark:text-primary-light"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                {hero.subtitle}
              </motion.h2>
            </motion.div>

            <motion.p 
              className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              {hero.description}
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
            >
              <motion.a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-danger text-white rounded-xl hover:bg-danger-dark transition-all duration-300 hover:shadow-lg hover:-translate-y-1 font-semibold text-center shadow-soft"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Butuh Bantuan Darurat
              </motion.a>
              
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/artikel"
                  className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 hover:shadow-lg hover:-translate-y-1 font-semibold text-center shadow-soft inline-block w-full sm:w-auto"
                >
                  Buat Laporan
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="flex flex-wrap gap-6 pt-8"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">100% Rahasia</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Profesional</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Logo & Branding */}
          <motion.div 
            className="relative lg:pl-12"
            variants={slideRight}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Main Logo Container */}
            <motion.div 
              className="relative z-10"
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-3xl p-12 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 shadow-soft">
                <div className="aspect-square max-w-md mx-auto flex flex-col items-center justify-center space-y-6">
                  {/* Logo Image */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="relative"
                  >
                    <div className="w-48 h-48 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center p-6">
                      <img 
                        src="/logo_polijecare.png" 
                        alt="Polijecare Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl -z-10"></div>
                  </motion.div>
                  
                  {/* Brand Text */}
                  <motion.div 
                    className="text-center space-y-2"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Polijecare</h3>
                    <p className="text-primary dark:text-primary-light font-medium">Satgas PPKPT Polije</p>
                    <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"></div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

          {/* Background Shape */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 dark:from-purple-900/20 to-accent/10 dark:to-accent/20 rounded-3xl blur-2xl -z-10"></div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center space-y-2"
        >
          <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">Scroll ke bawah</span>
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-500 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-600 dark:bg-gray-400 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
