import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
    FiFileText, FiSearch, FiFilter,
    FiChevronLeft, FiChevronRight,
    FiAlertCircle, FiCheckCircle,
    FiCalendar, FiEdit, FiEye, FiRefreshCw,
} from 'react-icons/fi';
import { konselorComplaintService } from '../../services/konselorComplaintService';

const KonselorPengaduan = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [urgencyFilter, setUrgency] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    const [complaints, setComplaints] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0 });

    const [detailModal, setDetailModal] = useState({ open: false, complaint: null });
    const [statusModal, setStatusModal] = useState({ open: false, complaint: null, status: 'pending' });
    const [scheduleModal, setScheduleModal] = useState({ open: false, complaint: null, counseling_schedule: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalPages = pagination.last_page || 1;

    const statsData = useMemo(() => [
        { title: 'Total Pengaduan', value: String(stats.total ?? 0), icon: <FiFileText size={20} />, color: 'from-purple-500 to-purple-600' },
        { title: 'Pending', value: String(stats.pending ?? 0), icon: <FiAlertCircle size={20} />, color: 'from-yellow-500 to-yellow-600' },
        { title: 'Sedang Diproses', value: String(stats.approved ?? 0), icon: <FiEdit size={20} />, color: 'from-blue-500 to-blue-600' },
        { title: 'Selesai', value: String(stats.completed ?? 0), icon: <FiCheckCircle size={20} />, color: 'from-green-500 to-green-600' },
    ], [stats]);

    const getVictimLabel = (c) => c.victim_type === 'self' ? 'Diri Sendiri' : (c.victim_name || '-');

    const getStatusBadge = (status) => {
        const s = String(status || '').toLowerCase();
        const map = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
        return map[s] || 'bg-gray-100 text-gray-800';
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            // Konselor only sees their own complaints (backend filters by counselor_id)
            const res = await konselorComplaintService.getComplaints({
                page: currentPage, per_page: perPage,
                search: searchQuery, status: statusFilter,
                urgency: urgencyFilter, date_from: dateFrom, date_to: dateTo,
            });
            const data = res.data?.data || res.data || [];
            setComplaints(Array.isArray(data) ? data : (data.data || []));
            // Compute stats from current data (API doesn't return stats for konselor)
            const arr = Array.isArray(data) ? data : (data.data || []);
            setStats({
                total: arr.length,
                pending: arr.filter(c => c.status === 'pending').length,
                approved: arr.filter(c => c.status === 'approved').length,
                completed: arr.filter(c => c.status === 'completed').length,
            });
            if (data.current_page) {
                setPagination({ current_page: data.current_page, last_page: data.last_page, total: data.total });
            }
        } catch (error) {
            setComplaints([]);
            setErrorMessage(error?.message || 'Gagal mengambil data pengaduan.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [currentPage, searchQuery, statusFilter, urgencyFilter, dateFrom, dateTo]);

    const resetFilter = () => { setCurrentPage(1); setSearchQuery(''); setStatusFilter('all'); setUrgency('all'); setDateFrom(''); setDateTo(''); };

    const submitStatus = async () => {
        if (!statusModal.complaint?.id) return;
        try {
            setIsSubmitting(true);
            await konselorComplaintService.updateStatus(statusModal.complaint.id, statusModal.status);
            setStatusModal({ open: false, complaint: null, status: 'pending' });
            fetchData();
        } catch {
            setErrorMessage('Gagal mengubah status.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitSchedule = async () => {
        if (!scheduleModal.complaint?.id || !scheduleModal.counseling_schedule) {
            setErrorMessage('Jadwal konseling wajib diisi.');
            return;
        }
        try {
            setIsSubmitting(true);
            await konselorComplaintService.schedule(scheduleModal.complaint.id, { counseling_schedule: scheduleModal.counseling_schedule });
            setScheduleModal({ open: false, complaint: null, counseling_schedule: '' });
            fetchData();
        } catch {
            setErrorMessage('Gagal menjadwalkan konseling.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(v => !v)} />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Pengaduan</h1>
                            <p className="text-gray-600 mt-1">Kelola laporan pengaduan mahasiswa yang ditangani Anda</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-80">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text" placeholder="Cari ID laporan / lokasi..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    value={searchQuery}
                                    onChange={e => { setCurrentPage(1); setSearchQuery(e.target.value); }}
                                />
                            </div>
                            <button onClick={fetchData} disabled={isLoading} className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                                <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-x-auto">
                    {errorMessage && !isLoading && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <div className="flex items-center gap-3 text-red-700">
                                <FiAlertCircle /><p className="text-sm">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {statsData.map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? '—' : stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Filters bar */}
                        <div className="px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Data Pengaduan</h2>
                                <p className="text-gray-500 text-xs mt-0.5">Menampilkan {complaints.length} laporan</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <FiFilter className="text-gray-400 hidden sm:block" size={16} />
                                <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500" value={statusFilter} onChange={e => { setCurrentPage(1); setStatusFilter(e.target.value); }}>
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Diproses / Disetujui</option>
                                    <option value="completed">Selesai</option>
                                    <option value="rejected">Ditolak / Jadwalkan Ulang</option>
                                </select>
                                <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500" value={urgencyFilter} onChange={e => { setCurrentPage(1); setUrgency(e.target.value); }}>
                                    <option value="all">Semua Urgensi</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                                <input type="date" value={dateFrom} onChange={e => { setCurrentPage(1); setDateFrom(e.target.value); }} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500" />
                                <input type="date" value={dateTo} onChange={e => { setCurrentPage(1); setDateTo(e.target.value); }} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500" />
                                <button onClick={resetFilter} className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Reset</button>
                            </div>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="bg-gray-50">
                                        {['ID Laporan', 'Nama Pelapor', 'Korban', 'Tempat Kejadian', 'Tanggal', 'Deskripsi', 'Status', 'Jadwal Konseling', 'Aksi'].map(h => (
                                            <th key={h} className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {Array(9).fill(0).map((__, j) => <td key={j} className="py-4 px-5"><div className="h-4 bg-gray-200 rounded w-24" /></td>)}
                                        </tr>
                                    )) : complaints.length > 0 ? complaints.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-5 text-sm font-semibold text-gray-900">{c.report_id}</td>
                                            <td className="py-3 px-5 text-sm text-gray-700">{c.user_name || '-'}</td>
                                            <td className="py-3 px-5 text-sm text-gray-700">{getVictimLabel(c)}</td>
                                            <td className="py-3 px-5 text-sm text-gray-700">{c.location}</td>
                                            <td className="py-3 px-5 text-sm text-gray-500 whitespace-nowrap">
                                                {c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="py-3 px-5 text-sm text-gray-700 max-w-xs truncate" title={c.deskripsi}>
                                                {c.deskripsi || '-'}
                                            </td>
                                            <td className="py-3 px-5"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(c.status)}`}>{c.status}</span></td>
                                            <td className="py-3 px-5 text-sm text-gray-500">
                                                {c.counseling_schedule ? new Date(c.counseling_schedule).toLocaleString('id-ID') : '-'}
                                            </td>
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setDetailModal({ open: true, complaint: c })} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Detail"><FiEye size={15} /></button>
                                                    <button onClick={() => setStatusModal({ open: true, complaint: c, status: c.status || 'pending' })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ubah Status"><FiEdit size={15} /></button>
                                                    <button onClick={() => setScheduleModal({ open: true, complaint: c, counseling_schedule: c.counseling_schedule ? c.counseling_schedule.replace(' ', 'T') : '' })} className="p-2 text-green-700 hover:bg-green-50 rounded-lg" title="Jadwalkan"><FiCalendar size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={8} className="py-16 text-center text-gray-500">
                                            <FiFileText size={40} className="mx-auto mb-3 opacity-40" />
                                            <p>Belum ada laporan pengaduan yang ditangani.</p>
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden p-4 space-y-3">
                            {!isLoading && complaints.map(c => (
                                <div key={c.id} className="border border-gray-100 rounded-xl p-4 bg-white">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{c.report_id}</p>
                                            <p className="text-xs text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(c.status)}`}>{c.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-1"><span className="text-gray-400 text-xs">Pelapor</span> · {c.user_name || '-'}</p>
                                    <p className="text-sm text-gray-700 mb-3"><span className="text-gray-400 text-xs">Lokasi</span> · {c.location}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setDetailModal({ open: true, complaint: c })} className="flex-1 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm">Detail</button>
                                        <button onClick={() => setStatusModal({ open: true, complaint: c, status: c.status || 'pending' })} className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Status</button>
                                        <button onClick={() => setScheduleModal({ open: true, complaint: c, counseling_schedule: c.counseling_schedule ? c.counseling_schedule.replace(' ', 'T') : '' })} className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-sm">Jadwal</button>
                                    </div>
                                </div>
                            ))}
                            {!isLoading && complaints.length === 0 && (
                                <div className="py-10 text-center text-gray-500">
                                    <FiFileText size={36} className="mx-auto mb-3 opacity-40" />
                                    <p>Belum ada laporan.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {!isLoading && complaints.length > 0 && totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-sm text-gray-500">Halaman {currentPage} dari {totalPages} — total {pagination.total}</p>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                                        <FiChevronLeft size={14} />
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let n = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                                        return (
                                            <button key={n} onClick={() => setCurrentPage(n)} className={`w-9 h-9 rounded-lg text-sm font-medium ${currentPage === n ? 'bg-green-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{n}</button>
                                        );
                                    })}
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                                        <FiChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detail Modal */}
                    {detailModal.open && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/40" onClick={() => setDetailModal({ open: false, complaint: null })} />
                            <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900">Detail Pengaduan</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{detailModal.complaint?.report_id}</p>
                                </div>
                                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div><p className="text-xs text-gray-400">Nama Pelapor</p><p className="font-medium text-gray-900 mt-1">{detailModal.complaint?.user_name || '-'}</p></div>
                                    <div><p className="text-xs text-gray-400">Korban</p><p className="font-medium text-gray-900 mt-1">{getVictimLabel(detailModal.complaint || {})}</p></div>
                                    <div className="sm:col-span-2"><p className="text-xs text-gray-400">Tempat Kejadian</p><p className="font-medium text-gray-900 mt-1">{detailModal.complaint?.location}</p></div>
                                    <div><p className="text-xs text-gray-400">Status</p><span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(detailModal.complaint?.status)}`}>{detailModal.complaint?.status}</span></div>
                                    <div><p className="text-xs text-gray-400">Urgensi</p><p className="font-medium text-gray-900 mt-1">{detailModal.complaint?.urgency_level || '-'}</p></div>
                                    <div className="sm:col-span-2"><p className="text-xs text-gray-400">Jadwal Konseling</p><p className="font-medium text-gray-900 mt-1">{detailModal.complaint?.counseling_schedule ? new Date(detailModal.complaint.counseling_schedule).toLocaleString('id-ID') : '-'}</p></div>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                                    <button onClick={() => setDetailModal({ open: false, complaint: null })} className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 text-sm">Tutup</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Modal */}
                    {statusModal.open && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/40" onClick={() => !isSubmitting && setStatusModal({ open: false, complaint: null, status: 'pending' })} />
                            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900">Ubah Status</h3>
                                    <p className="text-sm text-gray-500">{statusModal.complaint?.report_id}</p>
                                </div>
                                <div className="px-6 py-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={statusModal.status} onChange={e => setStatusModal(p => ({ ...p, status: e.target.value }))} disabled={isSubmitting} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-green-500 text-sm">
                                        <option value="pending">Pending</option><option value="approved">Diproses / Disetujui</option><option value="completed">Selesai</option><option value="rejected">Ditolak / Jadwalkan Ulang</option>
                                    </select>
                                    <div className="flex gap-3 mt-5">
                                        <button onClick={() => setStatusModal({ open: false, complaint: null, status: 'pending' })} disabled={isSubmitting} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 text-sm hover:bg-gray-50">Batal</button>
                                        <button onClick={submitStatus} disabled={isSubmitting} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Schedule Modal */}
                    {scheduleModal.open && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/40" onClick={() => !isSubmitting && setScheduleModal({ open: false, complaint: null, counseling_schedule: '' })} />
                            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900">Jadwalkan Konseling</h3>
                                    <p className="text-sm text-gray-500">{scheduleModal.complaint?.report_id}</p>
                                </div>
                                <div className="px-6 py-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal &amp; Waktu</label>
                                    <input type="datetime-local" value={scheduleModal.counseling_schedule} onChange={e => setScheduleModal(p => ({ ...p, counseling_schedule: e.target.value }))} disabled={isSubmitting} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-green-500 text-sm" />
                                    <div className="flex gap-3 mt-5">
                                        <button onClick={() => setScheduleModal({ open: false, complaint: null, counseling_schedule: '' })} disabled={isSubmitting} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 text-sm hover:bg-gray-50">Batal</button>
                                        <button onClick={submitSchedule} disabled={isSubmitting} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default KonselorPengaduan;
