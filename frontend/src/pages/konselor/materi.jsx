import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiTrash2, FiSearch, FiX, FiFile,
    FiLink, FiEye, FiExternalLink, FiAlertCircle,
    FiCheck, FiFilter, FiUpload, FiRefreshCw, FiDownload,
    FiChevronLeft, FiChevronRight, FiFileText
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';

const KATEGORI_OPTIONS = [
    'Modul Pelatihan', 'Panduan Konseling', 'Artikel',
    'Video Tutorial', 'Template', 'Lainnya',
];

import axios from '../../api/axios';
const konselorMaterialService = {
    async getMaterials(params = {}) {
        const response = await axios.get('/konselor/materials', { params });
        return response.data;
    },
    async createMaterial(formData) {
        const response = await axios.post('/konselor/materials', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    async deleteMaterial(id) {
        const response = await axios.delete(`/konselor/materials/${id}`);
        return response.data;
    },
    getFileUrl(filePath) {
        if (!filePath) return '#';
        const encodedPath = encodeURIComponent(filePath);
        const baseUrl = axios.defaults.baseURL.replace(/\/api$/, '');
        return `${baseUrl}/storage/${encodedPath}`;
    },
};

const KonselorMateri = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, per_page: 10, current_page: 1, total_pages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [kategoriFilter, setKategoriFilter] = useState('all');
    const [tipeFilter, setTipeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const [formData, setFormData] = useState({ judul: '', deskripsi: '', tipe: 'file', kategori: '', file: null, link: '' });

    // Kategori hardcoded — tidak perlu akses /operator/categories
    const kategoriOptions = KATEGORI_OPTIONS;

    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);

    useEffect(() => { fetchMaterials(); }, [currentPage, searchQuery, kategoriFilter, tipeFilter]);

    const fetchMaterials = async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            const params = {
                page: currentPage, per_page: itemsPerPage, search: searchQuery,
                ...(kategoriFilter !== 'all' && { kategori: kategoriFilter }),
                ...(tipeFilter !== 'all' && { tipe: tipeFilter }),
            };
            const response = await konselorMaterialService.getMaterials(params);
            if (response && response.materials) {
                setMaterials(response.materials);
                setPagination(response.pagination);
            } else if (response && Array.isArray(response.data)) {
                // Fallback if server returns {success, data:[...]}
                setMaterials(response.data);
                setPagination({ total: response.data.length, per_page: itemsPerPage, current_page: 1, total_pages: 1 });
            } else {
                setMaterials([]);
            }
        } catch (error) {
            setMaterials([]);
            setErrorMessage(error?.response?.data?.message || 'Gagal mengambil data materi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const fd = new FormData();
            fd.append('judul', formData.judul);
            fd.append('deskripsi', formData.deskripsi);
            fd.append('tipe', formData.tipe);
            fd.append('kategori', formData.kategori);
            if (formData.tipe === 'file' && formData.file) fd.append('file', formData.file);
            else if (formData.tipe === 'link') fd.append('link', formData.link);

            const response = await konselorMaterialService.createMaterial(fd);
            if (response?.success) {
                setSuccessMessage('Materi berhasil ditambahkan!');
                setShowAddModal(false);
                resetForm();
                fetchMaterials();
            } else {
                setErrorMessage(response?.message || 'Gagal menambahkan materi.');
            }
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Gagal menambahkan materi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMaterial = async () => {
        if (!selectedMaterial) return;
        try {
            setIsLoading(true);
            const response = await konselorMaterialService.deleteMaterial(selectedMaterial.unique_id || selectedMaterial.id);
            if (response?.success) {
                setSuccessMessage('Materi berhasil dihapus!');
                setShowDeleteModal(false);
                setSelectedMaterial(null);
                fetchMaterials();
            } else {
                setErrorMessage(response?.message || 'Gagal menghapus materi.');
            }
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Gagal menghapus materi.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => setFormData({ judul: '', deskripsi: '', tipe: 'file', kategori: '', file: null, link: '' });

    const getFileIcon = (fileName) => {
        if (!fileName) return <FiFile className="w-4 h-4" />;
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FiFile className="w-4 h-4 text-red-500" />;
        if (['doc', 'docx'].includes(ext)) return <FiFile className="w-4 h-4 text-blue-500" />;
        return <FiFile className="w-4 h-4" />;
    };

    const viewMaterial = (material) => {
        if (material.tipe === 'file') {
            const fileUrl = konselorMaterialService.getFileUrl(material.file_path);
            window.open(fileUrl, '_blank');
        } else {
            window.open(material.link, '_blank');
        }
    };

    const downloadMaterial = (material) => {
        if (material.tipe === 'file') {
            const fileUrl = konselorMaterialService.getFileUrl(material.file_path);
            const link = document.createElement('a');
            link.href = fileUrl; link.target = '_blank'; link.download = material.judul;
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(v => !v)} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Materi</h1>
                            <p className="text-gray-600 mt-1">Kelola materi pelatihan dan panduan konseling milik Anda</p>
                        </div>
                        <button onClick={fetchMaterials} disabled={isLoading} className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 self-start lg:self-auto">
                            <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-x-auto">
                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                                <FiAlertCircle className="flex-shrink-0" />
                                <span>{errorMessage}</span>
                                <button onClick={() => setErrorMessage('')} className="ml-auto"><FiX size={16} /></button>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm">
                                <FiCheck className="flex-shrink-0" />
                                <span>{successMessage}</span>
                                <button onClick={() => setSuccessMessage('')} className="ml-auto"><FiX size={16} /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Stats */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Materi', value: pagination.total, icon: <FiFile className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-100' },
                            { label: 'File Upload', value: materials.filter(m => m.tipe === 'file').length, icon: <FiUpload className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-100' },
                            { label: 'Link', value: materials.filter(m => m.tipe === 'link').length, icon: <FiLink className="w-6 h-6 text-green-600" />, bg: 'bg-green-100' },
                            { label: 'Kategori', value: [...new Set(materials.map(m => m.kategori))].length, icon: <FiFilter className="w-6 h-6 text-orange-600" />, bg: 'bg-orange-100' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">{s.label}</p>
                                        <p className="text-2xl font-bold text-gray-800">{isLoading ? '—' : s.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Controls */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="text" placeholder="Cari judul atau kategori..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <select value={kategoriFilter} onChange={e => setKategoriFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option value="all">Semua Kategori</option>
                                    {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                                <select value={tipeFilter} onChange={e => setTipeFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option value="all">Semua Tipe</option>
                                    <option value="file">File</option>
                                    <option value="link">Link</option>
                                </select>
                                <button onClick={() => setShowAddModal(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2">
                                    <FiPlus className="w-4 h-4" />
                                    Tambah Materi
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Table */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden relative">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        {isLoading ? (
                            <div className="p-8 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex gap-4">
                                        <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                                    <FiFile className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada materi</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Mulai dengan menambahkan materi pertama untuk bahan edukasi atau panduan.</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-2 mx-auto"
                                >
                                    <FiPlus className="w-5 h-5" />
                                    Tambah Materi
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">ID</th>
                                            <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Judul Materi</th>
                                            <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Kategori & Tipe</th>
                                            <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Uploader</th>
                                            <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase hidden md:table-cell">Tanggal</th>
                                            <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        <AnimatePresence>
                                            {materials.map((m, i) => (
                                                <motion.tr key={m.unique_id || m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.05 }} className="group bg-white hover:bg-slate-50/80 transition-all duration-300">
                                                    <td className="py-4 px-6">
                                                        <div className="text-xs font-mono font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md inline-block">
                                                            {m.unique_id || m.id}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.tipe === 'file' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                                {m.tipe === 'file' ? <FiFileText size={20} /> : <FiLink size={20} />}
                                                            </div>
                                                            <div className="min-w-0 pr-4">
                                                                <div className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">{m.judul}</div>
                                                                {m.deskripsi && (
                                                                    <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">{m.deskripsi}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col gap-1.5 items-start">
                                                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 rounded-md truncate max-w-[150px]" title={m.kategori}>
                                                                {m.kategori}
                                                            </span>
                                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${m.tipe === 'file'
                                                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                                : 'bg-green-50 text-green-700 border border-green-100'
                                                                }`}>
                                                                {m.tipe === 'file' ? 'File Upload' : 'Tautan/Link'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                                {m.uploader?.name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900">{m.uploader?.name || '-'}</div>
                                                                <div className="text-[11px] text-gray-500 capitalize">{m.uploader?.role || ''}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 hidden md:table-cell">
                                                        <div className="text-sm font-medium text-gray-800">
                                                            {m.created_at ? new Date(m.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {m.tipe === 'file' && (
                                                                <button onClick={() => downloadMaterial(m)} className="p-2 sm:p-2.5 text-emerald-500 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 group-hover:duration-300" title="Download File">
                                                                    <FiDownload size={16} />
                                                                </button>
                                                            )}
                                                            <button onClick={() => viewMaterial(m)} className="p-2 sm:p-2.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 group-hover:duration-300 delay-75" title={m.tipe === 'file' ? "Buka Materi" : "Buka Link"}>
                                                                {m.tipe === 'file' ? <FiEye size={16} /> : <FiExternalLink size={16} />}
                                                            </button>
                                                            <button onClick={() => { setSelectedMaterial(m); setShowDeleteModal(true); }} className="p-2 sm:p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 group-hover:duration-300 delay-100" title="Hapus Materi">
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination (Premium) */}
                        {!isLoading && pagination.total > 0 && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="text-sm font-medium text-gray-500">
                                    Menampilkan <span className="text-gray-900 font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> hingga <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, pagination.total)}</span> dari <span className="text-gray-900 font-bold">{pagination.total}</span> materi
                                </div>
                                {(pagination.total_pages || 0) > 1 && (
                                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                        >
                                            <FiChevronLeft size={16} />
                                        </button>

                                        <div className="flex items-center">
                                            {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                                let n;
                                                if (pagination.total_pages <= 5) n = i + 1;
                                                else if (currentPage <= 3) n = i + 1;
                                                else if (currentPage >= pagination.total_pages - 2) n = pagination.total_pages - 4 + i;
                                                else n = currentPage - 2 + i;
                                                return (
                                                    <button
                                                        key={n}
                                                        onClick={() => setCurrentPage(n)}
                                                        className={`min-w-[32px] h-8 px-2 mx-0.5 rounded-lg text-sm font-bold transition-all ${currentPage === n
                                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200'
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {n}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
                                            disabled={currentPage === pagination.total_pages}
                                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                        >
                                            <FiChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
                        onClick={() => setShowAddModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Tambah Materi</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><FiX className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleAddMaterial} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Materi</label>
                                    <input type="text" required value={formData.judul} onChange={e => setFormData({ ...formData, judul: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea rows="3" value={formData.deskripsi} onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Tambahkan deskripsi materi (opsional)" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select required value={formData.kategori} onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                        <option value="">Pilih Kategori</option>
                                        {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                                    <select value={formData.tipe} onChange={e => setFormData({ ...formData, tipe: e.target.value, file: null, link: '' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                        <option value="file">File</option>
                                        <option value="link">Link</option>
                                    </select>
                                </div>
                                {formData.tipe === 'file' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (PDF, DOCX) - Opsional</label>
                                        <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                                        <input type="url" required value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="https://..." />
                                    </div>
                                )}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
                                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all">
                                        {isLoading ? 'Menyimpan...' : 'Simpan Materi'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && selectedMaterial && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                        onClick={() => setShowDeleteModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-600"></div>
                            <div className="flex flex-col items-center text-center mt-4">
                                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-rose-50">
                                    <FiAlertCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Materi?</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Apakah Anda yakin ingin menghapus materi <br />
                                    <span className="font-bold text-gray-800">"{selectedMaterial.judul}"</span>?
                                    <br /><span className="text-rose-500 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
                                </p>
                                <div className="flex justify-center gap-3 w-full">
                                    <button onClick={() => setShowDeleteModal(false)} disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50">
                                        Batal
                                    </button>
                                    <button onClick={handleDeleteMaterial} disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium hover:from-rose-600 hover:to-red-700 focus:ring-4 focus:ring-rose-100 hover:shadow-lg hover:shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                                        {isLoading ? (
                                            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className="ml-2">Menghapus...</span></>
                                        ) : (
                                            <><FiTrash2 size={18} /><span>Ya, Hapus</span></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KonselorMateri;
