import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiRefreshCw, FiEye, FiLock, FiFilter, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import userComplaintService from '../../services/userComplaintService';
import dayjs from 'dayjs';

const HistoriPengaduan = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchComplaints = async (page = 1) => {
        try {
            setLoading(true);
            const res = await userComplaintService.getHistoriPengaduan({ per_page: 10, page });
            setComplaints(res.data);
            setPagination(res.meta);
        } catch (error) {
            console.error('Gagal mengambil histori laporan', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints(currentPage);
    }, [currentPage]);

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    // Bagian pemformatan UI badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Pending</span>;
            case 'processing':
                return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Diproses</span>;
            case 'resolved':
                return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Selesai</span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Ditolak</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">-</span>;
        }
    };

    const getUrgencyBadge = (urgency) => {
        switch (urgency) {
            case 'low':
                return <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-md">Rendah</span>;
            case 'medium':
                return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-md">Sedang</span>;
            case 'high':
                return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md">Tinggi</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-md">-</span>;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar />

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Histori Pengaduan</h1>
                            <p className="text-gray-500 text-sm mt-1">Daftar laporan tindak kekerasan yang pernah Anda ajukan</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fetchComplaints(currentPage)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                                <span className="text-sm font-medium">Refresh</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                        {/* Header controls */}
                        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="relative w-full sm:w-72">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari referensi atau judul..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6] rounded-xl text-sm transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table wrapper constraints */}
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500 tracking-wider">
                                        <th className="px-6 py-4">Ref ID</th>
                                        <th className="px-6 py-4">Judul Laporan</th>
                                        <th className="px-6 py-4">Kategori / Konselor</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Urgensi</th>
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <AnimatePresence>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                    <FiRefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8B5CF6]" />
                                                    Memuat data laporan...
                                                </td>
                                            </tr>
                                        ) : complaints.length === 0 ? (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <td colSpan="7" className="px-6 py-16 text-center">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <FiFileText className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak Ada Histori Laporan</h3>
                                                    <p className="text-gray-500">Anda belum pernah membuat laporan pengaduan apapun.</p>
                                                </td>
                                            </motion.tr>
                                        ) : (
                                            complaints.filter(c =>
                                                (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
                                                (c.report_reference || '').toLowerCase().includes(search.toLowerCase())
                                            ).map((item, index) => (
                                                <motion.tr
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                                    className="hover:bg-gray-50/50 transition-colors group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                            {item.report_reference}
                                                        </span>
                                                        {item.is_anonymous ? (
                                                            <FiLock className="inline-block ml-2 text-gray-400" title="Dilaporkan Anonim" />
                                                        ) : null}
                                                    </td>
                                                    <td className="px-6 py-4 w-64">
                                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={item.title}>
                                                            {item.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">{item.victim_name || 'Korban Tidak Diketahui'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-800 font-medium">
                                                            {item.violence_category?.name || 'Kategori Umum'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                                            {item.counselor ? item.counselor.name : 'Menunggu Plotting Konselor'}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(item.status)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getUrgencyBadge(item.urgency_level)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {dayjs(item.created_at).locale('id').format('DD MMM YYYY')}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Link
                                                            to={`/user/histori-pengaduan/${item.id}`}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                                            title="Lihat Detail Laporan"
                                                        >
                                                            <FiEye />
                                                        </Link>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination UI */}
                        {!loading && pagination && pagination.last_page > 1 && (
                            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Menampilkan {complaints.length} dari {pagination.total} laporan
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    {[...Array(pagination.last_page)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-3 py-1 border rounded-md text-sm ${currentPage === i + 1 ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'border-gray-200'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        disabled={currentPage === pagination.last_page}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HistoriPengaduan;
