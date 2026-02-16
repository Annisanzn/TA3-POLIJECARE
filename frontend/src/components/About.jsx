import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, slideLeft, staggerChildren } from '../utils/motionVariants';

const About = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      ),
      title: 'Perlindungan',
      description: 'Melindungi korban dan saksi dari segala bentuk ancaman atau intimidasi'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      title: 'Pendampingan',
      description: 'Memberikan dukungan psikologis dan hukum yang dibutuhkan'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
        </svg>
      ),
      title: 'Kerahasiaan',
      description: 'Menjaga identitas dan informasi pelapor dengan ketat'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      title: 'Keadilan',
      description: 'Memastikan proses yang adil dan transparan untuk semua pihak'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-slate-50 via-indigo-50/60 to-purple-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-[#191970] mb-6"
            variants={slideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Tentang <span className="text-indigo-500">Satgas PPKPT</span>
          </motion.h2>
          <motion.p
            className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Satuan Tugas Pencegahan dan Penanganan Kekerasan Seksual Politeknik Negeri Jember
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Content - Logo and Description */}
          <motion.div
            className="space-y-8"
            variants={slideLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >


            <motion.div
              className="space-y-6"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-[#191970]">
                Layanan Pengaduan dan Pendampingan Terpercaya
              </h3>
              <p className="text-lg text-slate-500 leading-relaxed">
                PolijeCare merupakan kanal resmi pengaduan Satgas PPKPT Politeknik Negeri Jember yang menangani laporan kekerasan seksual secara empati, profesional, dan menjaga kerahasiaan.
              </p>
              <p className="text-lg text-slate-500 leading-relaxed">
                Kami berkomitmen untuk menciptakan lingkungan kampus yang <span className="text-[#191970] font-semibold">aman</span>, <span className="text-[#191970] font-semibold">mendukung</span>, dan <span className="text-[#191970] font-semibold">bebas dari kekerasan seksual</span> bagi seluruh sivitas akademika.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 gap-6 pt-6"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50">
                <div className="text-3xl font-bold text-[#191970] mb-2">24/7</div>
                <div className="text-sm text-slate-500 font-medium">Layanan Darurat</div>
              </div>
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50">
                <div className="text-3xl font-bold text-indigo-500 mb-2">100%</div>
                <div className="text-sm text-slate-500 font-medium">Rahasia Terjamin</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Features Grid */}
          <motion.div
            className="space-y-6"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 group"
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-[#191970] group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-[#191970] mb-2 group-hover:text-indigo-600 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Quote */}
            <motion.blockquote
              className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-6 border-l-4 border-[#191970]"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-lg text-slate-600 italic font-medium leading-relaxed">
                "Setiap individu berhak mendapatkan perlindungan dan rasa aman dalam menempuh pendidikan. Mari bersama-sama menjaga kampus kita sebagai tempat yang aman dan mendukung bagi semua."
              </p>
              <footer className="mt-4 text-sm text-[#191970] font-semibold">
                — Satgas PPKPT Polije
              </footer>
            </motion.blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
