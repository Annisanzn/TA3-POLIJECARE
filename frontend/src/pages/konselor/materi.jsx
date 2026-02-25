import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiTrash2, FiSearch, FiX, FiFile,
    FiLink, FiEye, FiExternalLink, FiAlertCircle,
    FiCheck, FiFilter, FiUpload, FiRefreshCw, FiDownload
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
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Materi', value: pagination.total, icon: <FiFile className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-100' },
                            { label: 'File Upload', value: materials.filter(m => m.tipe === 'file').length, icon: <FiUpload className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-100' },
                            { label: 'Link', value: materials.filter(m => m.tipe === 'link').length, icon: <FiLink className="w-6 h-6 text-green-600" />, bg: 'bg-green-100' },
                            { label: 'Kategori', value: [...new Set(materials.map(m => m.kategori))].length, icon: <FiFilter className="w-6 h-6 text-orange-600" />, bg: 'bg-orange-100' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : s.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Controls */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input type="text" placeholder="Cari judul atau kategori..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <select value={kategoriFilter} onChange={e => setKategoriFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                                    <option value="all">Semua Kategori</option>
                                    {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                                <select value={tipeFilter} onChange={e => setTipeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                                    <option value="all">Semua Tipe</option>
                                    <option value="file">File</option>
                                    <option value="link">Link</option>
                                </select>
                                <button onClick={() => setShowAddModal(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm flex items-center gap-2">
                                    <FiPlus className="w-4 h-4" /> Tambah Materi
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Table */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {isLoading ? (
                            <div className="p-8 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse"><div className="h-4 bg-gray-200 rounded w-full mb-2" /><div className="h-4 bg-gray-200 rounded w-3/4" /></div>
                                ))}
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiFile className="w-8 h-8 text-gray-400" /></div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada materi</h3>
                                <p className="text-gray-500 mb-4">Mulai dengan menambahkan materi pertama</p>
                                <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Tambah Materi</button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            {['ID', 'Judul Materi', 'Kategori', 'Tipe', 'File/Link', 'Tanggal', 'Aksi'].map(h => (
                                                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <AnimatePresence>
                                            {materials.map((m, i) => (
                                                <motion.tr key={m.unique_id || m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-700">{m.unique_id || m.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.judul}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{m.kategori}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${m.tipe === 'file' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                            {m.tipe === 'file' ? 'File' : 'Link'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => viewMaterial(m)} className="flex items-center gap-1.5 text-green-700 hover:text-green-900 transition-colors bg-green-50 px-3 py-1.5 text-sm font-medium rounded-lg">
                                                                {m.tipe === 'file' ? <>{getFileIcon(m.file_path)}<span>Buka</span></> : <><FiExternalLink className="w-4 h-4" /><span>Buka Link</span></>}
                                                            </button>
                                                            {m.tipe === 'file' && (
                                                                <button onClick={() => downloadMaterial(m)} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 text-sm font-medium rounded-lg" title="Download File">
                                                                    <FiDownload className="w-4 h-4" /><span>Unduh</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {m.created_at ? new Date(m.created_at).toLocaleDateString('id-ID') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => { setSelectedMaterial(m); setShowDeleteModal(true); }} className="p-1 px-3 py-1.5 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center" title="Hapus"><FiTrash2 className="w-4 h-4 mr-1" /> Hapus</button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>

                    {/* Pagination */}
                    {(pagination.total_pages || 0) > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-500">Menampilkan {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, pagination.total)} dari {pagination.total} materi</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                                <span className="text-sm px-3">{currentPage} / {pagination.total_pages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(pagination.total_pages, p + 1))} disabled={currentPage === pagination.total_pages} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAddModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Tambah Materi</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><FiX className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleAddMaterial} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Materi</label>
                                    <input type="text" required value={formData.judul} onChange={e => setFormData({ ...formData, judul: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea rows="3" value={formData.deskripsi} onChange={e => setFormData({ ...formData, deskripsi: e.target.value })} placeholder="Opsional" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select required value={formData.kategori} onChange={e => setFormData({ ...formData, kategori: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                                        <option value="">Pilih Kategori</option>
                                        {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                                    <select value={formData.tipe} onChange={e => setFormData({ ...formData, tipe: e.target.value, file: null, link: '' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500">
                                        <option value="file">File Upload</option>
                                        <option value="link">Link</option>
                                    </select>
                                </div>
                                {formData.tipe === 'file' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF, DOC, DOCX — Max 5MB)</label>
                                        <input type="file" required accept=".pdf,.doc,.docx" onChange={e => setFormData({ ...formData, file: e.target.files[0] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                                        <input type="url" required value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Batal</button>
                                    <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">{isLoading ? 'Menyimpan...' : 'Simpan'}</button>
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
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeleteModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiTrash2 className="w-6 h-6 text-red-600" /></div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Hapus Materi</h2>
                                <p className="text-gray-500 text-sm mb-6">Yakin ingin menghapus <strong>"{selectedMaterial.judul}"</strong>?</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Batal</button>
                                    <button onClick={handleDeleteMaterial} disabled={isLoading} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">{isLoading ? 'Menghapus...' : 'Hapus'}</button>
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
