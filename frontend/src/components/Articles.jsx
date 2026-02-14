import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeIn, slideUp, staggerChildren } from '../utils/motionVariants';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Temporary disable API calls to prevent CORS errors
    const mockArticles = [
      {
        id: 1,
        title: 'Pentingnya Menjaga Lingkungan Kampus Aman dari Kekerasan Seksual',
        slug: 'pentingnya-menjaga-lingkungan-kampus-aman-dari-kekerasan-seksual',
        image: 'articles/safe-campus.jpg',
        content: 'Lingkungan kampus yang aman adalah hak setiap sivitas akademika.',
        is_published: true,
        published_at: '2024-01-07T00:00:00.000000Z'
      },
      {
        id: 2,
        title: 'Prosedur Pelaporan Kasus Kekerasan Seksual di Polije',
        slug: 'prosedur-pelaporan-kasus-kekerasan-seksual-di-polije',
        image: 'articles/reporting-procedure.jpg',
        content: 'Prosedur pelaporan kasus kekerasan seksual di Politeknik Negeri Jember.',
        is_published: true,
        published_at: '2024-01-05T00:00:00.000000Z'
      },
      {
        id: 3,
        title: 'Hak dan Kewajiban Korban dan Pelapor Kekerasan Seksual',
        slug: 'hak-dan-kewajiban-korban-dan-pelapor-kekerasan-seksual',
        image: 'articles/rights-responsibilities.jpg',
        content: 'Sebagai korban atau pelapor kekerasan seksual, Anda memiliki hak-hak.',
        is_published: true,
        published_at: '2024-01-03T00:00:00.000000Z'
      }
    ];
    
    setArticles(mockArticles);
    setLoading(false);
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <section id="articles" className="py-20 bg-white relative overflow-hidden">
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
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            variants={slideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Artikel & <span className="text-primary">Pengumuman</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Dapatkan informasi terbaru seputar layanan, edukasi, dan pengumuman penting dari Satgas PPKPT Polije.
          </motion.p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div 
            className="flex justify-center items-center py-20"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Memuat artikel...</p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            className="text-center py-20"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <div className="bg-danger/10 border border-danger/20 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-danger" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Artikel</h3>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <button 
                onClick={fetchArticles}
                className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 font-medium"
              >
                Coba Lagi
              </button>
            </div>
          </motion.div>
        )}

        {/* Articles Grid */}
        {!loading && !error && (
          <>
            {articles.length === 0 ? (
              <motion.div 
                className="text-center py-20"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
              >
                <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Artikel</h3>
                  <p className="text-gray-600 text-sm">Belum ada artikel atau pengumuman yang tersedia saat ini.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerChildren}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {articles.map((article, index) => (
                  <motion.article
                    key={article.id || index}
                    className="bg-white rounded-2xl shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-2 overflow-hidden group"
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                  >
                    {/* Article Image */}
                    <div className="relative h-48 overflow-hidden">
                      {article.image ? (
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <svg className="w-16 h-16 text-primary/30" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Article Content */}
                    <div className="p-6 space-y-4">
                      {/* Date */}
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                        {formatDate(article.published_at)}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>

                      {/* Read More Link */}
                      <div className="pt-4">
                        <Link 
                          to={`/artikel/${article.slug}`}
                          className="inline-flex items-center text-primary font-semibold text-sm hover:text-primary-dark transition-colors group"
                        >
                          Baca Selengkapnya
                          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </>
        )}

        {/* View All Button */}
        {!loading && !error && articles.length > 0 && (
          <motion.div 
            className="text-center mt-12"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              to="/artikel"
              className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 hover:shadow-lg hover:-translate-y-1 font-semibold shadow-soft"
            >
              Lihat Semua Artikel
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Articles;
