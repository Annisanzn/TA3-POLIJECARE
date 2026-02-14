import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, staggerChildren } from '../utils/motionVariants';

const Services = () => {
  const reportingMethods = [
    {
      id: 'whatsapp',
      title: 'Via WhatsApp',
      description: 'Laporkan secara langsung melalui WhatsApp untuk respons cepat dan konsultasi awal dengan tim kami.',
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
        </svg>
      ),
      features: ['Respons 24/7', 'Konsultasi awal', 'Bimbingan langkah selanjutnya'],
      buttonText: 'Butuh Bantuan Darurat',
      buttonColor: 'bg-accent hover:bg-accent-dark',
      buttonLink: 'https://wa.me/6281234567890'
    },
    {
      id: 'form',
      title: 'Form Pengaduan Online',
      description: 'Isi form pengaduan secara online dengan detail lengkap dan upload bukti pendukung untuk proses yang lebih terstruktur.',
      icon: (
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
          <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h5v2H8z"/>
        </svg>
      ),
      features: ['Form terstruktur', 'Upload bukti', 'Tracking status laporan'],
      buttonText: 'Laporkan Sekarang',
      buttonColor: 'bg-primary hover:bg-primary-dark',
      buttonLink: '/artikel'
    }
  ];

  const importantInfo = [
    {
      icon: '🛡️',
      title: 'Aman',
      description: 'Identitas Anda akan dirahasiakan sepenuhnya'
    },
    {
      icon: '👥',
      title: 'Profesional',
      description: 'Ditangani oleh tim yang berpengalaman'
    },
    {
      icon: '💚',
      title: 'Support',
      description: 'Dapatkan pendampingan penuh dari kami'
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
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
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            variants={slideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Cara <span className="text-primary">Melapor</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Pilih metode pelaporan yang paling nyaman untuk Anda. Kami siap membantu dengan profesionalisme dan kerahasiaan terjamin.
          </motion.p>
        </motion.div>

        {/* Reporting Methods Cards */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {reportingMethods.map((method, index) => (
            <motion.div
              key={method.id}
              className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-2 group"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 * index }}
            >
              {/* Icon */}
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {method.icon}
              </motion.div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {method.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {method.description}
                </p>

                {/* Features */}
                <div className="space-y-3">
                  {method.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <div className="pt-6">
                  {method.buttonLink.startsWith('http') ? (
                    <a
                      href={method.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center px-8 py-4 ${method.buttonColor} text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 font-semibold w-full sm:w-auto shadow-soft`}
                    >
                      {method.buttonText}
                    </a>
                  ) : (
                    <Link
                      to={method.buttonLink}
                      className={`inline-flex items-center justify-center px-8 py-4 ${method.buttonColor} text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 font-semibold w-full sm:w-auto shadow-soft`}
                    >
                      {method.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Important Information */}
        <motion.div 
          className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-3xl p-8 md:p-12"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Penting Untuk Diketahui
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Kami memastikan setiap proses pelaporan berjalan dengan aman, profesional, dan mendukung.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {importantInfo.map((info, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-soft hover:shadow-card transition-all duration-300"
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl mb-4">{info.icon}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{info.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Emergency Notice */}
        <motion.div 
          className="mt-12 bg-gradient-to-r from-danger/10 to-danger/5 border border-danger/20 rounded-2xl p-6"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-danger/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-danger" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Darurat? Hubungi Kami Sekarang</h4>
              <p className="text-gray-600 text-sm">
                Jika Anda atau orang lain berada dalam situasi darurat, segera hubungi WhatsApp kami untuk respons cepat 24/7.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-danger text-white rounded-xl hover:bg-danger-dark transition-all duration-300 font-semibold shadow-soft hover:shadow-lg"
              >
                Hubungi Darurat
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
