import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Instagram, MessageCircle, Globe, Clock, ShieldAlert } from 'lucide-react';
import { fadeIn, slideUp, staggerChildren } from '../utils/motionVariants';
import { SpotlightCard } from './ui/spotlight-card';
import { FlowButton } from './ui/flow-button';

const Contact = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporary disable API calls to prevent 404 errors
    const mockContactInfo = {
      address: 'Jl. Mastrip PO Box 164, Jember 68121, Jawa Timur, Indonesia',
      phone: '+62 331-123456',
      email: 'satgasppkpt@polije.ac.id',
      instagram: '@satgasppkpt_polije',
      whatsapp: '+6281234567890',
      facebook: 'SatgasPPKPTPolije',
      twitter: '@SatgasPPKPTPolije'
    };

    setContactInfo(mockContactInfo);
    setLoading(false);
  }, []);

  const defaultContact = {
    address: 'Jl. Mastrip PO Box 164, Jember 68121, Jawa Timur, Indonesia',
    phone: '+62 331-123456',
    email: 'satgasppkpt@polije.ac.id',
    instagram: '@satgasppkpt_polije',
    whatsapp: '+62 812-3456-7890'
  };

  const contact = contactInfo || defaultContact;

  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      label: 'Telepon Kantor',
      value: contact.phone,
      href: `tel:${contact.phone}`,
      color: 'text-blue-500',
      spotlight: 'rgba(59, 130, 246, 0.2)'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      label: 'Email Resmi',
      value: contact.email,
      href: `mailto:${contact.email}`,
      color: 'text-purple-500',
      spotlight: 'rgba(168, 85, 247, 0.2)'
    },
    {
      icon: <Instagram className="w-6 h-6" />,
      label: 'Instagram',
      value: contact.instagram,
      href: `https://instagram.com/${contact.instagram?.replace('@', '')}`,
      color: 'text-pink-500',
      spotlight: 'rgba(236, 72, 153, 0.2)'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      label: 'WhatsApp Admin',
      value: contact.whatsapp,
      href: `https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}`,
      color: 'text-green-500',
      spotlight: 'rgba(34, 197, 94, 0.2)'
    }
  ];

  return (
    <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            variants={slideUp}
          >
            Hubungi <span className="text-primary">Kami</span>
          </motion.h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Kami siap membantu Anda. Jangan ragu untuk menghubungi kami melalui berbagai saluran komunikasi yang tersedia. Privasi Anda adalah prioritas kami.
          </p>
        </motion.div>

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Contact Info & Emergency */}
            <div className="lg:col-span-5 space-y-8">

              {/* Emergency Card */}
              <SpotlightCard
                className="rounded-3xl p-8 border border-red-200/50 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500/30 backdrop-blur-sm"
                spotlightColor="rgba(239, 68, 68, 0.15)"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-400">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bantuan Darurat 24/7</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                      Jika Anda dalam situasi darurat atau bahaya, segera hubungi tim Satgas PPKS melalui saluran khusus ini.
                    </p>
                    <FlowButton
                      text="Hubungi Darurat Sekarang"
                      href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      colorStr="#ef4444"
                      hoverColorStr="#dc2626"
                      className="w-full"
                    />
                  </div>
                </div>
              </SpotlightCard>

              {/* General Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactMethods.map((method, index) => (
                  <SpotlightCard
                    key={index}
                    className="rounded-2xl p-6 border border-white/20 bg-white/60 dark:bg-black/20 dark:border-white/10 backdrop-blur-md shadow-sm hover:shadow-md transition-all group"
                    spotlightColor={method.spotlight}
                  >
                    <a
                      href={method.href}
                      target={method.href.startsWith('http') ? '_blank' : '_self'}
                      rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex flex-col items-center text-center h-full"
                    >
                      <div className={`w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 ${method.color} group-hover:scale-110 transition-transform duration-300`}>
                        {method.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{method.label}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{method.value}</p>
                    </a>
                  </SpotlightCard>
                ))}
              </div>

              {/* Operating Hours */}
              <div className="bg-white/60 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Jam Operasional Kantor</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex justify-between">
                    <span>Senin - Jumat</span>
                    <span className="font-medium">08.00 - 16.00 WIB</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sabtu - Minggu</span>
                    <span className="font-medium text-red-500">Tutup (Kecuali Darurat)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Map */}
            <div className="lg:col-span-7 h-full min-h-[500px]">
              <SpotlightCard
                className="h-full rounded-3xl p-2 border border-white/20 bg-white/60 dark:bg-black/20 dark:border-white/10 backdrop-blur-md shadow-xl overflow-hidden"
                spotlightColor="rgba(255, 255, 255, 0.1)"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                  <iframe
                    title="Lokasi Politeknik Negeri Jember"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.424564483758!2d113.72093787447761!3d-8.16021369187063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd695b617d8f623%3A0x280e466373737b60!2sPoliteknik%20Negeri%20Jember!5e0!3m2!1sid!2sid!4v1708150000000!5m2!1sid!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '500px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                  ></iframe>

                  {/* Map Overlay Info */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Kampus Politeknik Negeri Jember</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{contact.address}</p>
                        <a
                          href="https://maps.app.goo.gl/politekniknegerijember"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs font-semibold text-primary hover:underline"
                        >
                          Buka di Google Maps →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;
