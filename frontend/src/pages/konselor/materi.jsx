import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiTrash2, FiSearch, FiX, FiFile,
    FiLink, FiEye, FiExternalLink, FiAlertCircle,
    FiCheck, FiFilter, FiUpload, FiRefreshCw, FiDownload,
    FiChevronLeft, FiChevronRight, FiFileText
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
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
        if (filePath.startsWith('http')) return filePath;
        const encodedPath = encodeURIComponent(filePath);
        const baseUrl = axios.defaults.baseURL.replace(/\/api$/, '');
        return `${baseUrl}/storage/${encodedPath}`;
    },
};

const KonselorMateri = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [materials, setMaterials] = useState([]);
    const [violenceCategories, setViolenceCategories] = useState([]);
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

    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);

    useEffect(() => { 
        fetchMaterials(); 
        fetchCategories();
    }, [currentPage, searchQuery, kategoriFilter, tipeFilter]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/public-categories');
            if (response.data?.success) {
                setViolenceCategories(response.data.data || []);
            } else if (response.data?.categories) {
                setViolenceCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

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

    const kategoriOptions = violenceCategories.map(cat => cat.name);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(v => !v)} />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Topbar onMenuClick={() => setSidebarCollapsed(v => !v)} title="Pusat Edukasi" />

                <main className="flex-1 p-6 overflow-x-auto no-scrollbar">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Pusat Edukasi</h2>
                            <p className="text-gray-500 text-sm mt-1 font-medium">Akses buku saku, SOP, dan materi edukasi PolijeCare</p>
                        </div>
                        <button onClick={fetchMaterials} disabled={isLoading} className="p-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 self-start lg:self-auto shadow-sm transition-all">
                            <FiRefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold shadow-sm">
                                <FiAlertCircle size={20} className="flex-shrink-0" />
                                <span className="tracking-tight">{errorMessage}</span>
                                <button onClick={() => setErrorMessage('')} className="ml-auto p-1 hover:bg-rose-100 rounded-lg"><FiX size={16} /></button>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-bold shadow-sm">
                                <FiCheck size={20} className="flex-shrink-0" />
                                <span className="tracking-tight">{successMessage}</span>
                                <button onClick={() => setSuccessMessage('')} className="ml-auto p-1 hover:bg-emerald-100 rounded-lg"><FiX size={16} /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Materi', value: pagination.total, icon: <FiFileText className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-100' },
                            { label: 'File Upload', value: materials.filter(m => m.tipe === 'file').length, icon: <FiUpload className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50 border-blue-100' },
                            { label: 'Tautan Link', value: materials.filter(m => m.tipe === 'link').length, icon: <FiLink className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100' },
                            { label: 'Kategori Aktif', value: [...new Set(materials.map(m => m.kategori))].length, icon: <FiFilter className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50 border-amber-100' },
                        ].map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className={`bg-white rounded-[2rem] p-8 shadow-sm border ${s.bg} transition-all hover:shadow-md`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
                                        <p className="text-3xl font-bold text-gray-900 tracking-tight">{isLoading ? '—' : s.value}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">{s.icon}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Search & Filter */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-10 flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 relative group">
                            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input type="text" placeholder="Cari judul materi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-8 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-[1.5rem] text-sm font-bold outline-none transition-all" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <select value={kategoriFilter} onChange={e => setKategoriFilter(e.target.value)} 
                                className="px-8 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer transition-all">
                                <option value="all">Semua Kategori</option>
                                {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                            <button onClick={() => setShowAddModal(true)}
                                className="px-10 py-4 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-4">
                                <FiPlus size={20} /> Tambah Materi
                            </button>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden relative mb-12">
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="py-6 px-10 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Judul & Deskripsi</th>
                                        <th className="py-6 px-10 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Info Materi</th>
                                        <th className="py-6 px-10 text-[10px] font-bold tracking-widest text-gray-400 uppercase text-right">Kelola</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {isLoading ? (
                                        <tr><td colSpan="3" className="p-20 text-center"><div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" /></td></tr>
                                    ) : materials.length === 0 ? (
                                        <tr><td colSpan="3" className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Materi tidak ditemukan</td></tr>
                                    ) : (
                                        materials.map((m, i) => (
                                            <motion.tr key={m.unique_id || m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-indigo-50/30 transition-all">
                                                <td className="py-8 px-10">
                                                    <div className="flex items-start gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${m.tipe === 'file' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                            {m.tipe === 'file' ? <FiFileText size={24} /> : <FiLink size={24} />}
                                                        </div>
                                                        <div className="min-w-0 max-w-md">
                                                            <div className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{m.judul}</div>
                                                            <p className="text-[11px] text-gray-400 mt-2 font-medium line-clamp-2 leading-relaxed">{m.deskripsi || 'Tidak ada deskripsi.'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-8 px-10">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        <span className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 rounded-full">{m.kategori}</span>
                                                        <span className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full ${m.tipe === 'file' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'}`}>
                                                            {m.tipe === 'file' ? 'File Upload' : 'Tautan Link'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-8 px-10">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {m.tipe === 'file' && (
                                                            <button onClick={() => downloadMaterial(m)} className="p-3 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"><FiDownload size={18} /></button>
                                                        )}
                                                        <button onClick={() => viewMaterial(m)} className="p-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"><FiEye size={18} /></button>
                                                        <button onClick={() => { setSelectedMaterial(m); setShowDeleteModal(true); }} className="p-3 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"><FiTrash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={() => setShowAddModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[3rem] p-12 w-full max-w-xl shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Tambah Materi</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 text-gray-400 transition-all"><FiX size={24} /></button>
                            </div>
                            <form onSubmit={handleAddMaterial} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Judul Materi</label>
                                    <input type="text" required value={formData.judul} onChange={e => setFormData({ ...formData, judul: e.target.value })}
                                        className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-3xl text-sm font-bold outline-none transition-all" placeholder="Masukkan judul..." />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Kategori</label>
                                        <select required value={formData.kategori} onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                                            className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-3xl text-sm font-bold outline-none appearance-none cursor-pointer transition-all">
                                            <option value="">Pilih...</option>
                                            {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Tipe Konten</label>
                                        <select value={formData.tipe} onChange={e => setFormData({ ...formData, tipe: e.target.value, file: null, link: '' })}
                                            className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-3xl text-sm font-bold outline-none appearance-none cursor-pointer transition-all">
                                            <option value="file">File Upload</option>
                                            <option value="link">Tautan Link</option>
                                        </select>
                                    </div>
                                </div>
                                {formData.tipe === 'file' ? (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Pilih File (PDF/DOCX)</label>
                                        <div className="relative group">
                                            <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
                                                className="w-full px-8 py-5 bg-gray-50 border border-dashed border-gray-300 rounded-3xl text-sm font-bold outline-none transition-all cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">URL Tautan</label>
                                        <input type="url" required value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })}
                                            className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-3xl text-sm font-bold outline-none transition-all" placeholder="https://..." />
                                    </div>
                                )}
                                <div className="pt-6 flex gap-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600">Batal</button>
                                    <button type="submit" disabled={isLoading} className="flex-[2] py-6 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-4">
                                        {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiCheck size={18} />} Simpan Materi
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeleteModal && selectedMaterial && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4" onClick={() => setShowDeleteModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[3rem] p-12 w-full max-w-sm text-center shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
                            <div className="absolute top-0 left-0 w-full h-2 bg-rose-600"></div>
                            <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-rose-100"><FiTrash2 size={40} /></div>
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Hapus Materi?</h3>
                            <p className="text-gray-400 text-sm mb-10 font-medium leading-relaxed tracking-tight">Tindakan ini akan menghapus materi <span className="text-gray-900 font-bold">"{selectedMaterial.judul}"</span> secara permanen.</p>
                            <div className="flex gap-4">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 text-gray-400 font-bold text-xs tracking-widest uppercase">Batal</button>
                                <button onClick={handleDeleteMaterial} disabled={isLoading} className="flex-[2] py-5 bg-rose-600 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all">Ya, Hapus</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KonselorMateri;
