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
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-white/10 pt-16 pb-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/20 to-transparent opacity-50"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <img
                src="/logo_polijecare.png"
                alt="PolijeCare Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  PolijeCare
                </h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide">
                  SATGAS PPKS POLITEKNIK NEGERI JEMBER
                </p>
              </div>
            </motion.div>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
              Kami berkomitmen menciptakan lingkungan kampus yang aman, inklusif, dan bebas dari kekerasan seksual melalui pencegahan, penanganan, dan pemulihan yang berpusat pada korban.
            </p>

            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-primary/10 hover:text-primary transition-all duration-300 border border-gray-200 dark:border-white/10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-4">
            {Object.entries(footerLinks).map(([title, links], columnIndex) => (
              <div key={title} className="space-y-6">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h4>
                <ul className="space-y-4">
                  {links.map((link, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (columnIndex * 0.1) + (index * 0.05) }}
                    >
                      <a
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors inline-block relative group"
                      >
                        <span className="relative z-10">{link.name}</span>
                        <span className="absolute left-0 bottom-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
          <p>© {currentYear} PolijeCare. Dikembangkan dengan <Heart className="w-3 h-3 inline text-red-500 mx-1 fill-current animate-pulse" /> untuk kemanusiaan.</p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Jember, Jawa Timur</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>satgasppkpt@polije.ac.id</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
