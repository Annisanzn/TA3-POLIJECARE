import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, staggerChildren } from '../utils/motionVariants';
import {
  MessageCircle,
  FileText,
  Shield,
  Users,
  HeartHandshake,
  Phone,
  CheckCircle2,
  Search,
  Gavel,
  Smile
} from 'lucide-react';
import { SpotlightCard } from './ui/spotlight-card';
import { FlowButton } from './ui/flow-button';

const Services = () => {
  const reportingMethods = [
    {
      id: 'whatsapp',
      title: 'Via WhatsApp',
      description: 'Layanan cepat tanggap untuk konsultasi awal dan pelaporan darurat. Terhubung langsung dengan tim satgas kami.',
      icon: <MessageCircle className="w-8 h-8" />,
      features: ['Respons 24/7', 'Konsultasi Privat', 'Pendampingan Awal'],
      buttonText: 'Chat WhatsApp Sekarang',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      buttonLink: 'https://wa.me/6281234567890',
      gradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      spotlightColor: 'rgba(34, 197, 94, 0.2)' // Green glow for WhatsApp
    },
    {
      id: 'form',
      title: 'Form Pengaduan',
      description: 'Saluran resmi untuk pelaporan mendetail. Mendukung lampiran bukti dan kronologi lengkap untuk investigasi.',
      icon: <FileText className="w-8 h-8" />,
      features: ['Form Terstruktur', 'Upload Bukti Aman', 'Tracking Status'],
      buttonText: 'Isi Form Laporan',
      buttonColor: 'bg-[#191970] hover:bg-blue-900',
      buttonLink: '/artikel',
      gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      iconColor: 'text-[#191970] dark:text-blue-400',
      spotlightColor: 'rgba(139, 92, 246, 0.2)' // Purple glow for Form
    }
  ];

  const handlingFlow = [
    {
      step: '01',
      title: 'Pelaporan',
      desc: 'Laporan masuk via WA atau Website.',
      icon: <FileText className="w-5 h-5" />
    },
    {
      step: '02',
      title: 'Verifikasi',
      desc: 'Validasi data oleh tim Satgas.',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      step: '03',
      title: 'Tindak Lanjut',
      desc: 'Investigasi atau mediasi kasus.',
      icon: <Search className="w-5 h-5" />
    },
    {
      step: '04',
      title: 'Penyelesaian',
      desc: 'Pemulihan dan penutupan kasus.',
      icon: <Smile className="w-5 h-5" />
    }
  ];

  const importantInfo = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Dijamin Aman',
      description: 'Identitas pelapor dirahasiakan sepenuhnya sesuai kode etik.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Profesional',
      description: 'Ditangani oleh tim ahli yang berpengalaman dan objektif.'
    },
    {
      icon: <HeartHandshake className="w-6 h-6" />,
      title: 'Pendampingan',
      description: 'Dukungan psikologis dan hukum selama proses berjalan.'
    }
  ];

  return (
    <section id="services" className="pt-20 pb-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Cara <span className="text-[#191970] dark:text-blue-400">Melapor</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Kami menyediakan ruang aman bagi Anda untuk bersuara. Pilih metode yang paling nyaman, kami siap mendampingi setiap langkahnya.
          </p>
        </div>

        {/* Reporting Methods Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {reportingMethods.map((method, index) => (
            <motion.div
              key={method.id}
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <SpotlightCard
                className="h-full p-8 rounded-3xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 backdrop-blur-sm shadow-xl transition-all duration-300 group hover:bg-white/15 dark:hover:bg-white/5"
                spotlightColor={method.spotlightColor}
              >
                {/* Gradient Blob Background */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${method.gradient} rounded-full blur-3xl -z-10 opacity-30 group-hover:opacity-60 transition-opacity duration-500`}></div>

                <div className="flex flex-col h-full justify-between relative z-10">
                  <div>
                    <div className={`w-16 h-16 rounded-2xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center mb-6 ${method.iconColor}`}>
                      {method.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {method.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {method.description}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {method.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-gray-700 dark:text-gray-300 text-sm font-medium">
                          <CheckCircle2 className={`w-4 h-4 mr-2 ${method.iconColor}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="w-full flex justify-center mt-auto pt-6">
                    <FlowButton
                      text={method.buttonText}
                      href={method.buttonLink}
                      target={method.buttonLink.startsWith('http') ? "_blank" : undefined}
                      colorStr={method.id === 'whatsapp' ? '#16a34a' : '#2563eb'}
                      hoverColorStr={method.id === 'whatsapp' ? '#16a34a' : '#1e40af'}
                      className="w-full max-w-[280px]"
                    />
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Support & Flow Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Trust Indicators (Left) */}
          <motion.div
            className="xl:col-span-1 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-md h-full"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Kenapa Kami?</h3>
            <div className="space-y-6">
              {importantInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#191970] dark:text-blue-300 flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{info.title}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mt-1">{info.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Process Flow (Right - Timeline) */}
          <SpotlightCard
            className="xl:col-span-2 relative overflow-hidden rounded-3xl p-8 md:p-10 border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 backdrop-blur-sm shadow-xl transition-all duration-300 group hover:bg-white/15 dark:hover:bg-white/5"
            spotlightColor="rgba(25, 25, 112, 0.1)"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <h3 className="text-2xl font-bold mb-12 relative z-10 text-gray-900 dark:text-white">Alur Penanganan</h3>

            <div className="relative z-10 w-full">
              {/* Progress Line Background */}
              <div className="hidden md:block absolute top-[28px] left-0 w-full h-[2px] bg-gray-200/50 dark:bg-gray-700/50 rounded-full"></div>

              {/* Animated Progress Line */}
              <motion.div
                className="hidden md:block absolute top-[28px] left-0 h-[2px] bg-[#191970] dark:bg-blue-500 origin-left z-0 rounded-full overflow-hidden"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
              >
                {/* Continuous Shimmer Animation */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                    repeatDelay: 0.5
                  }}
                />
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {handlingFlow.map((step, index) => (
                  <motion.div
                    key={index}
                    className="relative group/step pt-4 md:pt-0"
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3 }}
                  >
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center mb-4 text-[#191970] dark:text-blue-500 shadow-md group-hover/step:scale-110 group-hover/step:border-[#191970] dark:group-hover/step:border-blue-500 transition-all duration-300 relative bg-opacity-80 backdrop-blur-md">
                        {step.icon}
                      </div>
                      <span className="text-xs font-bold font-mono text-[#191970] dark:text-blue-400 mb-2 opacity-80">{step.step}</span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </SpotlightCard>

        </div>

        {/* Emergency Banner */}
        <motion.div
          className="mt-12 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white">Butuh Bantuan Darurat?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Jangan ragu untuk menghubungi kami jika situasi mendesak.</p>
            </div>
          </div>
          <FlowButton
            text="Hubungi Sekarang"
            href="https://wa.me/6281234567890"
            target="_blank"
            colorStr="#dc2626"
            hoverColorStr="#dc2626"
            className="w-auto px-8"
          />
        </motion.div>

      </div>
    </section>
  );
};

export default Services;
