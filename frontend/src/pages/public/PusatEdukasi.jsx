import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFileText, FiLink, FiDownload, FiExternalLink, FiFilter, FiBookOpen, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const PusatEdukasi = () => {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [kategoriFilter, setKategoriFilter] = useState('all');
    const [tipeFilter, setTipeFilter] = useState('all');
    const [kategoriOptions, setKategoriOptions] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setIsLoading(true);
        try {
            // Kita bisa mengambil semua data, biarkan API yang handle atau kita ambil params default
            const response = await axiosInstance.get('/public-materials', {
                params: {
                    per_page: 100 // Ambil banyak sekaligus untuk public view
                }
            });
            
            if (response.data && response.data.materials) {
                setMaterials(response.data.materials);
                // Extract unique categories from materials for filter options
                const uniqueCategories = [...new Set(response.data.materials.map(m => m.kategori))].filter(Boolean);
                setKategoriOptions(uniqueCategories);
            }
        } catch (error) {
            console.error("Gagal mengambil data materi edukasi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const viewMaterial = (material) => {
        if (material.tipe === 'file') {
            window.open(material.file_path, '_blank');
        } else {
            window.open(material.link, '_blank');
        }
    };

    const downloadMaterial = (material) => {
        if (material.tipe === 'file') {
            const link = document.createElement('a');
            link.href = material.file_path;
            link.target = '_blank';
            link.download = material.judul;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Filter logic
    const filteredMaterials = materials.filter(m => {
        const matchSearch = m.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.deskripsi && m.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchKategori = kategoriFilter === 'all' || m.kategori === kategoriFilter;
        const matchTipe = tipeFilter === 'all' || m.tipe === tipeFilter;
        return matchSearch && matchKategori && matchTipe;
    });

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans">
            <Navbar />
            
            {/* Hero Section */}
            <div className="pt-32 pb-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                
                <div className="container mx-auto px-6 relative z-10">
                    {/* Back Button */}
                    <div className="flex justify-start mb-8">
                        <Link 
                            to="/" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-all border border-white/20"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline font-medium">Kembali ke Beranda</span>
                        </Link>
                    </div>

                    <div className="text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-xl border border-white/20">
                            <FiBookOpen className="w-8 h-8 text-purple-300" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                            Pusat <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Edukasi</span>
                        </h1>
                        <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
                            Akses modul edukasi, SOP pelaporan, dan buku saku pencegahan kekerasan seksual. Informasi resmi untuk panduan sivitas akademika Polije.
                        </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-6 py-12 -mt-10 relative z-20">
                {/* Search & Filter Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-indigo-100/50 dark:shadow-none p-4 md:p-6 mb-10 border border-indigo-50 dark:border-slate-700"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-400 w-5 h-5" />
                            <input 
                                type="text" 
                                placeholder="Cari judul materi edukasi atau topik..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-400 w-4 h-4" />
                                <select 
                                    value={kategoriFilter} 
                                    onChange={e => setKategoriFilter(e.target.value)} 
                                    className="w-full sm:w-48 pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer text-slate-800 dark:text-slate-100"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <select 
                                value={tipeFilter} 
                                onChange={e => setTipeFilter(e.target.value)} 
                                className="w-full sm:w-40 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-800 dark:text-slate-100"
                            >
                                <option value="all">Semua Format</option>
                                <option value="file">Dokumen (PDF)</option>
                                <option value="link">Tautan Luar</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Materials Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse h-48">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-xl"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-full mt-4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiBookOpen className="w-10 h-10 text-indigo-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Belum ada materi edukasi</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Kami tidak dapat menemukan materi yang sesuai dengan pencarian Anda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredMaterials.map((material, index) => (
                                <motion.div 
                                    key={material.unique_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                                >
                                    {/* Decorative subtle background icon */}
                                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                                        {material.tipe === 'file' ? <FiFileText size={160} /> : <FiLink size={160} />}
                                    </div>

                                    <div className="flex items-start gap-4 mb-4 relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${material.tipe === 'file' ? 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/40 dark:to-red-900/40 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-800' : 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'}`}>
                                            {material.tipe === 'file' ? <FiFileText size={24} /> : <FiLink size={24} />}
                                        </div>
                                        <div>
                                            <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg mb-2">
                                                {material.kategori}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors line-clamp-2 leading-tight">
                                                {material.judul}
                                            </h3>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow relative z-10">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                                            {material.deskripsi || "Tidak ada deskripsi tersedia untuk dokumen ini."}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between mt-auto relative z-10">
                                        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                                {material.uploader?.name?.charAt(0) || 'A'}
                                            </div>
                                            <span>{material.uploader?.name || 'Admin'}</span>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => viewMaterial(material)}
                                                className={`p-2.5 rounded-xl transition-colors ${material.tipe === 'file' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'}`}
                                                title={material.tipe === 'file' ? "Lihat Dokumen" : "Buka Tautan"}
                                            >
                                                {material.tipe === 'file' ? <FiBookOpen size={18} /> : <FiExternalLink size={18} />}
                                            </button>
                                            {material.tipe === 'file' && (
                                                <button 
                                                    onClick={() => downloadMaterial(material)}
                                                    className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-colors"
                                                    title="Unduh PDF"
                                                >
                                                    <FiDownload size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default PusatEdukasi;
