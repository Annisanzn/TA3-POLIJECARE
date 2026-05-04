import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiFileText, FiLink, FiDownload, FiExternalLink, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import materialService from '../services/materialService';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await materialService.getPublicMaterials();
        if (res && res.materials) {
          // Take only the first 3 or 4 materials for the landing page
          setMaterials((res.materials || []).slice(0, 3));
        } else {
          setError('Gagal memuat materi edukasi');
        }
      } catch (err) {
        console.error('Materials fetch error:', err);
        setError('Gagal memuat materi edukasi');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const viewMaterial = (material) => {
    if (material.tipe === 'file') {
      window.open(materialService.getFileUrl(material.file_path), '_blank');
    } else {
      window.open(material.link, '_blank');
    }
  };

  const downloadMaterial = (material) => {
    if (material.tipe === 'file') {
      const link = document.createElement('a');
      link.href = materialService.getFileUrl(material.file_path);
      link.target = '_blank';
      link.download = material.judul;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div id="materials" className="bg-slate-50 dark:bg-slate-900 py-24 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400">
            <FiBookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
            Pusat <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Unduhan & Edukasi</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-white">
            Akses cepat ke berbagai modul edukasi, Standar Operasional Prosedur (SOP), dan buku saku penanganan kasus.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-10 text-rose-500 bg-rose-50 rounded-2xl max-w-lg mx-auto px-4">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && materials.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBookOpen className="w-8 h-8 text-indigo-300 dark:text-indigo-500" />
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">Belum ada materi edukasi</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kami sedang menyiapkan materi berkualitas untuk Anda.</p>
          </div>
        )}

        {!loading && !error && materials.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {materials.map((material, index) => (
                <motion.div 
                  key={material.unique_id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                >
                  {/* Decorative background icon */}
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                    {material.tipe === 'file' ? <FiFileText size={160} /> : <FiLink size={160} />}
                  </div>

                  <div className="flex items-start gap-4 mb-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${material.tipe === 'file' ? 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/40 dark:to-red-900/40 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-800' : 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'}`}>
                      {material.tipe === 'file' ? <FiFileText size={24} /> : <FiLink size={24} />}
                    </div>
                    <div>
                      <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md mb-2">
                        {material.kategori}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors line-clamp-2 leading-tight">
                        {material.judul}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex-grow relative z-10">
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">
                      {material.deskripsi || "Tidak ada deskripsi tersedia untuk dokumen ini."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between mt-auto relative z-10">
                    <button 
                      onClick={() => viewMaterial(material)}
                      className={`text-sm font-semibold flex items-center gap-2 transition-colors ${material.tipe === 'file' ? 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:text-emerald-300'}`}
                    >
                      {material.tipe === 'file' ? 'Baca Dokumen' : 'Buka Tautan'}
                      <FiExternalLink />
                    </button>
                    
                    {material.tipe === 'file' && (
                      <button 
                        onClick={() => downloadMaterial(material)}
                        className="p-2 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                        title="Unduh PDF"
                      >
                        <FiDownload size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link 
                to="/edukasi" 
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
              >
                Lihat Semua Materi Edukasi
                <FiArrowRight />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Materials;
