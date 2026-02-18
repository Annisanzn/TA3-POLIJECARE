import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Component as ReportButton } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, slideLeft, slideRight } from '../utils/motionVariants';

const Hero = ({ heroData }) => {
  const navigate = useNavigate();
  const defaultHero = {
    title: 'Aman Bicara, Aman Melapor',
    subtitle: 'Satgas PPKPT Politeknik Negeri Jember',
    description: 'Kami siap mendengar dan membantu Anda dengan profesionalisme dan kerahasiaan terjamin.'
  };

  const hero = heroData || defaultHero;

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center bg-soft-white relative overflow-hidden pt-16 transition-colors duration-300"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-light/30 rounded-full blur-[100px]"
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
          className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"
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

      <div className="max-w-[1440px] mx-auto px-8 sm:px-12 lg:px-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-6"
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
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
              >
                {hero.title}
              </motion.h1>

              <motion.h2
                className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#191970] dark:text-blue-300"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                {hero.subtitle}
              </motion.h2>
            </motion.div>

            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              {hero.description ? (
                hero.description
              ) : (
                <>
                  Kami siap mendengar dan membantu Anda dengan{' '}
                  <span className="highlight-marker" style={{ '--delay': '1' }}>profesionalisme</span> dan{' '}
                  <span className="highlight-marker" style={{ '--delay': '1.6' }}>kerahasiaan terjamin</span>.{' '}
                  Setiap laporan akan ditangani dengan{' '}
                  <span className="highlight-marker" style={{ '--delay': '2.2' }}>empati</span> dan{' '}
                  <span className="highlight-marker" style={{ '--delay': '2.6' }}>seksama</span>.
                </>
              )}
            </motion.p>

            <motion.div
              className="flex flex-row gap-4 pt-4 items-start"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
            >
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ReportButton
                  icon={<Icon icon="solar:phone-calling-bold-duotone" />}
                  title="Butuh Bantuan Darurat"
                  size="sm"
                  className="rounded-full bg-red-600 hover:bg-red-700 border-0"
                  gradientLight={{ from: "from-red-600", via: "via-red-600", to: "to-red-600" }}
                  gradientDark={{ from: "from-red-600", via: "via-red-600", to: "to-red-600" }}
                  onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
                />
              </motion.div>

              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ReportButton
                  icon={<Icon icon="solar:document-add-bold-duotone" />}
                  title="Buat Laporan"
                  size="sm"
                  className="rounded-full bg-[#191970] hover:bg-blue-900 border-0"
                  gradientLight={{ from: "from-[#191970]", via: "via-[#191970]", to: "to-[#191970]" }}
                  gradientDark={{ from: "from-[#191970]", via: "via-[#191970]", to: "to-[#191970]" }}
                  onClick={() => navigate('/artikel')}
                />
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}

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
              className="relative z-10 flex justify-end lg:pr-4"
            >
              <img
                src="/gambar_header.png"
                alt="header gambar"
                className="w-full max-w-[550px] h-auto object-cover"
              />
            </motion.div>

            {/* Background Shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 dark:from-purple-900/20 to-accent/10 dark:to-accent/20 rounded-3xl blur-2xl -z-10"></div>
          </motion.div>
        </div>

        {/* Brand Stats Banner - Glassmorphic Light Design */}

      </div>


    </section>
  );
};

export default Hero;
