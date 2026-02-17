import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Linkedin, Heart, Shield, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Menu Utama': [
      { name: 'Beranda', href: '#hero' },
      { name: 'Tentang Kami', href: '#about' },
      { name: 'Layanan', href: '#services' },
      { name: 'Artikel', href: '/artikel' },
    ],
    'Layanan': [
      { name: 'Pelaporan Online', href: '#services' },
      { name: 'Konsultasi Psikologi', href: '#contact' },
      { name: 'Pendampingan Hukum', href: '#contact' },
      { name: 'Edukasi & Sosialisasi', href: '/artikel' },
    ],
    'Bantuan': [
      { name: 'Kontak Darurat', href: '#contact' },
      { name: 'Prosedur Lapor', href: '#services' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Kebijakan Privasi', href: '#' },
    ]
  };

  const socialLinks = [
    { icon: <Instagram className="w-5 h-5" />, href: 'https://instagram.com/satgasppkpt_polije', label: 'Instagram' },
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-200/50 dark:border-white/5 pt-20 pb-10 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-70"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-70"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              <img
                src="/logo_polijecare.png"
                alt="PolijeCare Logo"
                className="w-14 h-14 object-contain filter drop-shadow-sm"
              />
              <div className="space-y-0.5">
                <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  PolijeCare
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary">
                  Satgas PPKS Polije
                </p>
              </div>
            </motion.div>

            <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm text-sm">
              Mewujudkan lingkungan kampus yang aman, inklusif, dan bebas kekerasan seksual. Kami hadir untuk melayani, melindungi, dan mendampingi sivitas akademika Polije.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {React.cloneElement(social.icon, { className: "w-4 h-4" })}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {Object.entries(footerLinks).map(([title, links], columnIndex) => (
              <div key={title} className="space-y-6">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + (index * 0.05) }}
                    >
                      <a
                        href={link.href}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors inline-flex items-center group"
                      >
                        <span className="relative overflow-hidden">
                          {link.name}
                          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500 dark:text-gray-500">
          <p>© {currentYear} PolijeCare. All rights reserved.</p>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>Jember, East Java</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span>satgasppkpt@polije.ac.id</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
