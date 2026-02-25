import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
    FiFileText, FiPlus, FiSearch, FiEdit, FiTrash2,
    FiAlertCircle, FiCheckCircle, FiChevronLeft, FiChevronRight,
    FiToggleLeft, FiToggleRight, FiImage, FiX,
} from 'react-icons/fi';
import { articleService } from '../../services/articleService';

// ─── Toast Notification ──────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast, onClose]);

    if (!toast) return null;
    const isSuccess = toast.type === 'success';
    return (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`}>
            {isSuccess ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
            {toast.message}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><FiX size={14} /></button>
        </div>
    );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ label }) => {
    const colors = {
        'Publish': 'bg-green-100 text-green-800',
        'Terjadwal': 'bg-blue-100 text-blue-800',
        'Draft': 'bg-yellow-100 text-yellow-800',
        'Nonaktif': 'bg-gray-100 text-gray-500',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[label] || 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
};

// ─── Format date ──────────────────────────────────────────────────────────────
const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

// ─── Timezone helpers ─────────────────────────────────────────────────────────
// Konversi ISO UTC → format input datetime-local (pakai waktu LOKAL browser)
const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Konversi datetime-local lokal → ISO UTC string untuk dikirim ke backend
const toUTCIso = (local) => {
    if (!local) return '';
    return new Date(local).toISOString(); // new Date('2026-02-25T20:00') baca sebagai lokal lalu konversi ke UTC
};

// ─── Article Modal Form ───────────────────────────────────────────────────────
const ArticleModal = ({ mode, article, onClose, onSaved }) => {
    const [form, setForm] = useState({
        title: article?.title || '',
        content: article?.content || '',
        // Konversi UTC dari API → waktu lokal browser untuk input
        published_at: article?.published_at ? toLocalInput(article.published_at) : '',
        is_active: article?.is_active ?? true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(article?.image || null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef();

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            setErrors(p => ({ ...p, image: 'Hanya file JPG/PNG yang diizinkan' }));
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setErrors(p => ({ ...p, image: 'Ukuran gambar maksimal 2MB' }));
            return;
        }
        setErrors(p => ({ ...p, image: '' }));
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Judul wajib diisi';
        if (!form.content.trim()) e.content = 'Konten wajib diisi';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title.trim());
            fd.append('content', form.content.trim());
            // Konversi waktu lokal browser → UTC ISO agar backend simpan dengan benar
            fd.append('published_at', toUTCIso(form.published_at));
            fd.append('is_active', form.is_active ? '1' : '0');
            if (imageFile) fd.append('image', imageFile);

            let result;
            if (mode === 'create') {
                result = await articleService.admin.create(fd);
            } else {
                result = await articleService.admin.update(article.id, fd);
            }

            if (result.success) {
                onSaved(result.data, mode === 'create' ? 'Artikel berhasil dibuat!' : 'Artikel berhasil diperbarui!');
                onClose();
            } else {
                setErrors({ general: result.message || 'Gagal menyimpan artikel' });
            }
        } catch (err) {
            const serverErrors = err.response?.data?.errors || {};
            if (Object.keys(serverErrors).length > 0) {
                const mapped = {};
                Object.entries(serverErrors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
                setErrors(mapped);
            } else {
                setErrors({ general: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && onClose()} />
            <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-100 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {mode === 'create' ? 'Tambah Artikel' : 'Edit Artikel'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {mode === 'create' ? 'Isi data artikel baru' : `Edit: ${article?.title}`}
                        </p>
                    </div>
                    <button onClick={() => !submitting && onClose()} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                    {errors.general && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                            <FiAlertCircle /> {errors.general}
                        </div>
                    )}

                    {/* Judul */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Judul <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            className={`w-full rounded-xl border px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Judul artikel..."
                            disabled={submitting}
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* Upload Gambar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gambar (JPG/PNG, maks 2MB)</label>
                        {imagePreview ? (
                            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 mb-2">
                                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setImageFile(null); setImagePreview(null); fileRef.current.value = ''; }}
                                    className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow text-gray-600 hover:text-red-500"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileRef.current.click()}
                                className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
                            >
                                <FiImage size={24} className="text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Klik untuk upload gambar</p>
                            </div>
                        )}
                        <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png" className="hidden" onChange={handleImage} />
                        {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                    </div>

                    {/* Konten */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konten <span className="text-red-500">*</span></label>
                        <textarea
                            value={form.content}
                            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                            rows={6}
                            className={`w-full rounded-xl border px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${errors.content ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Tulis konten artikel di sini..."
                            disabled={submitting}
                        />
                        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
                    </div>

                    {/* Tanggal & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Publish</label>
                            <input
                                type="datetime-local"
                                value={form.published_at}
                                onChange={e => setForm(p => ({ ...p, published_at: e.target.value }))}
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={submitting}
                            />
                            <p className="text-xs text-gray-400 mt-1">Kosongkan = Draft</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Artikel</label>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border w-full justify-between ${form.is_active ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
                                disabled={submitting}
                            >
                                <span className="text-sm font-medium">{form.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                {form.is_active ? <FiToggleRight size={22} /> : <FiToggleLeft size={22} />}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => !submitting && onClose()}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                        disabled={submitting}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="article-form"
                        onClick={handleSubmit}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-60"
                        disabled={submitting}
                    >
                        {submitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ArticleManagementPage = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [articles, setArticles] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState({ open: false, mode: 'create', article: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, article: null });
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const fetchArticles = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const params = {
                page: currentPage,
                per_page: 10,
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            };
            const res = await articleService.admin.getAll(params);
            if (res.success) {
                setArticles(res.data.articles);
                setPagination(res.data.pagination);
            } else {
                setErrorMessage(res.message || 'Gagal mengambil data artikel');
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Gagal mengambil data artikel. Pastikan Anda login sebagai operator.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchArticles(); }, [currentPage, searchQuery, statusFilter]);

    const handleSaved = (updatedArticle, message) => {
        showToast(message);
        fetchArticles();
    };

    const handleToggle = async (article) => {
        setTogglingId(article.id);
        try {
            const res = await articleService.admin.toggle(article.id);
            if (res.success) {
                showToast(res.message);
                setArticles(prev => prev.map(a => a.id === article.id ? { ...a, is_active: res.data.is_active, status_label: res.data.status_label } : a));
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Gagal mengubah status', 'error');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm.article) return;
        setDeletingId(deleteConfirm.article.id);
        setDeleteConfirm({ open: false, article: null });
        try {
            const res = await articleService.admin.delete(deleteConfirm.article.id);
            if (res.success) {
                showToast('Artikel berhasil dihapus');
                fetchArticles();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Gagal menghapus artikel', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const totalPages = pagination.last_page || 1;

    // Stats summary
    const statsData = [
        { title: 'Total Artikel', value: pagination.total, color: 'from-purple-500 to-purple-600' },
        { title: 'Aktif / Publish', value: articles.filter(a => a.status_label === 'Publish').length, color: 'from-green-500 to-green-600' },
        { title: 'Draft', value: articles.filter(a => a.status_label === 'Draft').length, color: 'from-yellow-500 to-yellow-600' },
        { title: 'Nonaktif', value: articles.filter(a => a.status_label === 'Nonaktif').length, color: 'from-gray-500 to-gray-600' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Toast toast={toast} onClose={() => setToast(null)} />
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(v => !v)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Artikel</h1>
                            <p className="text-gray-600 mt-1">Kelola artikel & pengumuman landing page</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative w-full sm:w-72">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari judul artikel..."
                                    value={searchQuery}
                                    onChange={e => { setCurrentPage(1); setSearchQuery(e.target.value); }}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() => setModal({ open: true, mode: 'create', article: null })}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.03] transition-all whitespace-nowrap"
                            >
                                <FiPlus size={18} /> Tambah Artikel
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-x-auto">
                    {/* Error Banner */}
                    {errorMessage && !isLoading && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3 text-red-700">
                            <FiAlertCircle className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-sm">Gagal memuat data</p>
                                <p className="text-sm">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {statsData.map((s, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all">
                                <p className="text-gray-500 text-sm">{s.title}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? '—' : s.value}</p>
                                <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${s.color}`} />
                            </div>
                        ))}
                    </div>

                    {/* Table Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Filter bar */}
                        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Daftar Artikel</h2>
                                <p className="text-gray-500 text-sm mt-0.5">Menampilkan {articles.length} artikel</p>
                            </div>
                            <select
                                value={statusFilter}
                                onChange={e => { setCurrentPage(1); setStatusFilter(e.target.value); }}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">Semua Status</option>
                                <option value="published">Publish</option>
                                <option value="scheduled">Terjadwal</option>
                                <option value="draft">Draft</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 w-20">Gambar</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Judul</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Tgl Publish</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Dibuat</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                {[80, 200, 120, 80, 100, 120].map((w, j) => (
                                                    <td key={j} className="py-4 px-4">
                                                        <div className={`h-4 bg-gray-200 rounded`} style={{ width: w }} />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : articles.length > 0 ? articles.map(article => (
                                        <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Gambar */}
                                            <td className="py-3 px-4">
                                                {article.image ? (
                                                    <img src={article.image} alt={article.title} className="w-14 h-10 object-cover rounded-lg border border-gray-200" />
                                                ) : (
                                                    <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <FiImage size={16} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            {/* Judul */}
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900 text-sm line-clamp-1">{article.title}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{article.excerpt}</p>
                                            </td>
                                            {/* Tgl Publish */}
                                            <td className="py-3 px-4 text-sm text-gray-700">{fmtDate(article.published_at)}</td>
                                            {/* Status */}
                                            <td className="py-3 px-4">
                                                <StatusBadge label={article.status_label} />
                                            </td>
                                            {/* Dibuat */}
                                            <td className="py-3 px-4 text-sm text-gray-500">{fmtDate(article.created_at)}</td>
                                            {/* Aksi */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1">
                                                    {/* Toggle aktif */}
                                                    <button
                                                        onClick={() => handleToggle(article)}
                                                        disabled={togglingId === article.id}
                                                        title={article.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                        className={`p-1.5 rounded-lg transition-colors ${article.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                    >
                                                        {togglingId === article.id
                                                            ? <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
                                                            : article.is_active ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />
                                                        }
                                                    </button>
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => setModal({ open: true, mode: 'edit', article })}
                                                        title="Edit"
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <FiEdit size={16} />
                                                    </button>
                                                    {/* Hapus */}
                                                    <button
                                                        onClick={() => setDeleteConfirm({ open: true, article })}
                                                        disabled={deletingId === article.id}
                                                        title="Hapus"
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        {deletingId === article.id
                                                            ? <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                                                            : <FiTrash2 size={16} />
                                                        }
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-gray-400">
                                                <FiFileText size={40} className="mx-auto mb-3 opacity-40" />
                                                <p className="text-lg font-medium">Belum ada artikel</p>
                                                <p className="text-sm mt-1">Klik "Tambah Artikel" untuk membuat artikel pertama</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {!isLoading && articles.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-sm text-gray-500">
                                    Halaman {pagination.current_page} dari {totalPages} — {pagination.total} artikel
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                                    >
                                        <FiChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let n;
                                        if (totalPages <= 5) n = i + 1;
                                        else if (currentPage <= 3) n = i + 1;
                                        else if (currentPage >= totalPages - 2) n = totalPages - 4 + i;
                                        else n = currentPage - 2 + i;
                                        return (
                                            <button
                                                key={n}
                                                onClick={() => setCurrentPage(n)}
                                                className={`w-9 h-9 rounded-lg font-medium text-sm ${currentPage === n ? 'bg-purple-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {n}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                                    >
                                        <FiChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal Tambah/Edit */}
            {modal.open && (
                <ArticleModal
                    mode={modal.mode}
                    article={modal.article}
                    onClose={() => setModal({ open: false, mode: 'create', article: null })}
                    onSaved={handleSaved}
                />
            )}

            {/* Modal Konfirmasi Hapus */}
            {deleteConfirm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm({ open: false, article: null })} />
                    <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl p-6">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiTrash2 size={22} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center">Hapus Artikel?</h3>
                        <p className="text-sm text-gray-500 text-center mt-2">
                            Artikel <strong>"{deleteConfirm.article?.title}"</strong> akan dihapus permanen beserta gambarnya. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setDeleteConfirm({ open: false, article: null })}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleManagementPage;
