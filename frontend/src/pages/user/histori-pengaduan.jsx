import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiFileText, FiRefreshCw, FiEye, FiLock, FiFilter, FiSearch,
    FiCalendar, FiCheckCircle, FiXCircle, FiClock,
    FiChevronLeft, FiChevronRight, FiShield, FiUser, FiAlertCircle
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import userComplaintService from '../../services/userComplaintService';
import dayjs from 'dayjs';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const getStatusConfig = (status) => {
    switch (status) {
        case 'pending': return { label: 'Menunggu', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' };
        case 'approved': return { label: 'Diproses', cls: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' };
        case 'completed': return { label: 'Selesai', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
        case 'rejected': return { label: 'Jadwalkan Ulang', cls: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' };
        default: return { label: status || '-', cls: 'bg-gray-50 text-gray-600', dot: 'bg-gray-400' };
    }
};

const getUrgencyConfig = (urgency) => {
    switch (urgency) {
        case 'Tinggi': case 'high': return { label: 'Tinggi', cls: 'bg-red-50 text-red-700' };
        case 'Sedang': case 'medium': return { label: 'Sedang', cls: 'bg-orange-50 text-orange-700' };
        case 'Rendah': case 'low': return { label: 'Rendah', cls: 'bg-blue-50 text-blue-700' };
        default: return { label: urgency || '-', cls: 'bg-gray-50 text-gray-600' };
    }
};

/* ── Stat Card ───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
    <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm flex items-center gap-5">
        <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
        </div>
    </div>
);

/* ── Main Component ──────────────────────────────────────────────────────── */
const HistoriPengaduan = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const location = useLocation();

    const [statusFilter, setStatusFilter] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('status') || '';
    });

    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchComplaints = async (page, q, status) => {
        try {
            setLoading(true);
            const res = await userComplaintService.getHistoriPengaduan({
                per_page: 10,
                page,
                search: q ?? '',
                status: status ?? '',
            });
            setComplaints(res.data ?? []);
            setPagination(res.meta ?? null);
        } catch (error) {
            console.error('Gagal mengambil histori laporan', error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    // Single effect — runs whenever page / search / status changes
    useEffect(() => {
        fetchComplaints(currentPage, search.trim(), statusFilter);
    }, [currentPage, search, statusFilter]);

    const handleSearchChange = (val) => {
        setSearch(val);
        setCurrentPage(1); // reset to page 1 on new search
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        setCurrentPage(1); // reset to page 1 on new status
    };

    /* Derived stats — from ALL complaints on current page */
    const total = pagination?.total ?? complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const approved = complaints.filter(c => c.status === 'approved').length;
    const completed = complaints.filter(c => c.status === 'completed').length;

    // Server already filters — display directly
    const filtered = complaints;

    return (
        <div className="flex min-h-screen bg-[#F8F9FF]">
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">

                    {/* ── Page Header ─────────────────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <p className="text-[11px] font-bold text-violet-500 uppercase tracking-[0.2em] mb-2">Riwayat Saya</p>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Histori Pengaduan</h1>
                            <p className="text-gray-500 text-sm mt-1 font-medium">
                                Daftar laporan tindak kekerasan yang pernah Anda ajukan
                            </p>
                        </div>
                        <button
                            onClick={() => fetchComplaints(currentPage)}
                            className="inline-flex items-center gap-2.5 px-5 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all shadow-sm font-semibold text-sm active:scale-95"
                        >
                            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
                            Refresh
                        </button>
                    </div>

                    {/* ── Stat Cards ──────────────────────────────────────────────── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Laporan" value={total} icon={FiFileText} color="bg-violet-600" sub="semua laporan Anda" />
                        <StatCard label="Menunggu" value={pending} icon={FiClock} color="bg-amber-500" sub="menunggu tindakan" />
                        <StatCard label="Diproses" value={approved} icon={FiShield} color="bg-blue-600" sub="sedang ditangani" />
                        <StatCard label="Selesai" value={completed} icon={FiCheckCircle} color="bg-emerald-600" sub="konseling selesai" />
                    </div>

                    {/* ── Filter Bar ──────────────────────────────────────────────── */}
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm px-8 py-5 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    placeholder="Cari referensi atau judul..."
                                    className="pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-2xl text-sm transition-all w-64 font-medium"
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <select
                                    className="pl-4 pr-10 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-violet-400 rounded-2xl text-sm text-gray-700 appearance-none font-medium transition-all"
                                    value={statusFilter}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                >
                                    <option value="">Semua Status</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="approved">Diproses</option>
                                    <option value="completed">Selesai</option>
                                    <option value="rejected">Jadwalkan Ulang</option>
                                </select>
                                <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                            {filtered.length} dari {total} laporan
                        </p>
                    </div>

                    {/* ── Card Grid ───────────────────────────────────────────────── */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-violet-50 rounded-full" />
                                <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin" />
                            </div>
                            <p className="mt-6 text-gray-500 font-bold tracking-tight animate-pulse">Memuat data laporan...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mb-6">
                                <FiFileText className="text-violet-400" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Tidak Ada Laporan</h3>
                            <p className="text-gray-400 text-sm font-medium text-center max-w-xs">
                                {search || statusFilter
                                    ? 'Tidak ada laporan yang cocok dengan filter.'
                                    : 'Anda belum pernah mengajukan laporan pengaduan.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {filtered.map((item, index) => {
                                    const statusCfg = getStatusConfig(item.status);
                                    const urgencyCfg = getUrgencyConfig(item.urgency_level);
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25, delay: index * 0.04 }}
                                            className="group bg-white rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-2 border border-gray-100/80 transition-all duration-300 overflow-hidden flex flex-col"
                                        >
                                            {/* Card Body */}
                                            <div className="p-7 flex-1">
                                                {/* Header: Ref ID */}
                                                <div className="flex items-start justify-between mb-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-xl tracking-wide">
                                                            {item.report_reference || `#${item.id}`}
                                                        </span>
                                                    </div>
                                                    {/* Urgency badge */}
                                                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest ${urgencyCfg.cls}`}>
                                                        {urgencyCfg.label}
                                                    </span>
                                                </div>

                                                {/* Judul */}
                                                <h3 className="text-base font-bold text-gray-900 leading-snug mb-1 truncate" title={item.title}>
                                                    {item.title || '-'}
                                                </h3>
                                                <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mb-5">
                                                    <FiUser size={11} className="shrink-0" />
                                                    {item.victim_name || 'Korban tidak disebutkan'}
                                                </p>

                                                {/* Info Rows */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50/60 rounded-2xl">
                                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                            <FiShield size={13} className="text-violet-500" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Kategori</p>
                                                            <p className="text-xs font-semibold text-gray-800 truncate">
                                                                {item.violence_category?.name || item.violence_category?.kategori || 'Kategori Umum'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 bg-gray-50/60 rounded-2xl">
                                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                            <FiUser size={13} className="text-blue-500" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Konselor</p>
                                                            <p className="text-xs font-semibold text-gray-800 truncate">
                                                                {item.counselor?.name || 'Belum ditugaskan'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2">
                                                        {/* Status badge */}
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${statusCfg.cls}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                                                            {statusCfg.label}
                                                        </span>
                                                        {/* Tanggal */}
                                                        <div className="flex items-center gap-1.5 text-gray-400">
                                                            <FiCalendar size={12} className="shrink-0" />
                                                            <span className="text-[10px] font-semibold text-gray-500">
                                                                {dayjs(item.created_at).format('DD MMM YYYY')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="px-7 py-5 bg-gray-50/50 border-t border-gray-100 opacity-90 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/user/histori-pengaduan/${item.id}`}
                                                    className="w-full py-2.5 px-4 bg-white border border-gray-200 text-violet-600 hover:border-violet-500 hover:bg-violet-50 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                                                >
                                                    <FiEye size={14} /> LIHAT DETAIL
                                                </Link>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* ── Pagination ──────────────────────────────────────────────── */}
                    {!loading && pagination && pagination.last_page > 1 && (
                        <div className="mt-10 flex items-center justify-between bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                            <p className="text-sm font-medium text-gray-400 italic">
                                Halaman{' '}
                                <span className="font-black text-gray-900 not-italic">{currentPage}</span>{' '}
                                dari{' '}
                                <span className="font-black text-gray-900 not-italic">{pagination.last_page}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-violet-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <FiChevronLeft size={18} />
                                </button>
                                {[...Array(pagination.last_page)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-2xl text-sm font-black transition-all ${currentPage === i + 1
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === pagination.last_page}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-violet-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <FiChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default HistoriPengaduan;
