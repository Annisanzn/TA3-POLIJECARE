import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import {
    FiFileText, FiSearch, FiFilter,
    FiChevronLeft, FiChevronRight,
    FiCalendar, FiEdit, FiEye, FiRefreshCw,
    FiUser, FiMapPin, FiClock, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { konselorComplaintService } from '../../services/konselorComplaintService';
import { useNavigate } from 'react-router-dom';

const KonselorPengaduan = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
    const navigate = useNavigate();

    const navigateToDetail = (id) => {
        navigate(`/konselor/complaint-detail/${id}`);
    };
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

    const [statusModal, setStatusModal] = useState({ open: false, complaint: null, status: 'pending', rejection_reason: '' });
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
            const payload = { status: statusModal.status };
            if (statusModal.status === 'rejected') {
                payload.rejection_reason = statusModal.rejection_reason;
            }
            await konselorComplaintService.updateStatus(statusModal.complaint.id, payload);
            setStatusModal({ open: false, complaint: null, status: 'pending', rejection_reason: '' });
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
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(v => !v)} />

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar onMenuClick={() => setSidebarCollapsed(v => !v)} title="Manajemen Pengaduan" />

                <main className="flex-1 p-6 lg:p-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Pengaduan</h2>
                            <p className="text-gray-600">Kelola laporan pengaduan mahasiswa yang ditangani Anda</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchData}
                                disabled={isLoading}
                                className="p-2.5 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                                title="Refresh Data"
                            >
                                <FiRefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={resetFilter}
                                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    {errorMessage && !isLoading && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                            <div className="flex items-center gap-3 text-red-700">
                                <FiAlertCircle /><p className="text-sm">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow p-6 border border-gray-100/50 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Laporan</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <FiFileText className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600">Keseluruhan laporan</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6 border border-gray-100/50 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Menunggu</p>
                                    <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <FiAlertCircle className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600">Perlu tindak lanjut</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6 border border-gray-100/50 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Diproses</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.approved || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FiEdit className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600">Sedang ditindaklanjuti</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow p-6 border border-gray-100/50 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Selesai</p>
                                    <p className="text-3xl font-bold text-emerald-600">{stats.completed || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <FiCheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600">Penanganan tuntas</p>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filter Component */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100/80 p-8 mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase px-1">Pencarian</label>
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Cari ID laporan / lokasi..."
                                        className="w-full pl-11 pr-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase px-1">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Diproses / Disetujui</option>
                                    <option value="completed">Selesai</option>
                                    <option value="rejected">Ditolak / Jadwalkan Ulang</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase px-1">Urgensi</label>
                                <select
                                    value={urgencyFilter}
                                    onChange={e => setUrgency(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="all">Semua Urgensi</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            <div className="lg:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase px-1">Rentang Tanggal</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                        className="flex-1 bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-inner"
                                    />
                                    <span className="text-gray-300 font-bold">—</span>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={e => setDateTo(e.target.value)}
                                        className="flex-1 bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-2 flex items-end">
                                <button
                                    onClick={() => fetchData()}
                                    className="w-full py-3.5 bg-purple-600 text-white rounded-2xl text-sm font-bold hover:bg-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                                >
                                    <FiFilter size={16} /> Terapkan Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-purple-50 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <p className="mt-6 text-gray-500 font-bold tracking-tight animate-pulse">Menyiapkan data pengaduan...</p>
                        </div>
                    ) : complaints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                                <FiFileText size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada data</h3>
                            <p className="text-gray-500 max-w-xs text-center font-medium">Tidak dapat menemukan pengaduan yang sesuai dengan filter pencarian Anda</p>
                            <button onClick={resetFilter} className="mt-8 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">Lihat Semua Data</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {complaints.map(c => (
                                <div key={c.id} className="group bg-white rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-2 border border-gray-100/80 transition-all duration-300 overflow-hidden flex flex-col h-full">
                                    <div className="p-7 flex-1">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center shadow-inner">
                                                    <FiFileText className="text-purple-600" size={20} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="text-base font-bold text-gray-900 leading-tight truncate" title={c.report_id}>{c.report_id}</h3>
                                                    <p className="text-xs text-gray-400 font-medium truncate italic">{c.user_name || 'Tanpa Nama'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                    <FiUser size={14} className="text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Korban</p>
                                                    <p className="text-xs font-bold text-gray-700">{getVictimLabel(c)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                    <FiMapPin size={14} className="text-rose-500" />
                                                </div>
                                                <div className="overflow-hidden pr-2">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Lokasi</p>
                                                    <p className="text-xs font-bold text-gray-700 truncate" title={c.location}>{c.location}</p>
                                                </div>
                                            </div>

                                            {/* WA Button — shows for any complaint with a phone on record */}
                                            {(() => {
                                                const phone = c.user_id ? c.user_phone : c.guest_phone;
                                                if (!phone) return null;
                                                const isGuest = !c.user_id;
                                                const greeting = isGuest ? (c.guest_name || 'Bapak/Ibu') : c.user_name;
                                                const template = isGuest
                                                    ? `Halo ${greeting},\n\nPerkenalkan kami dari Satuan Tugas Pencegahan dan Penanganan Kekerasan di Kampus (Satgas PPKPT) Politeknik Negeri Jember.\n\nKami telah menerima laporan pengaduan Anda dengan nomor registrasi *${c.report_id}* dan saat ini sedang dalam proses penanganan.\n\nUntuk langkah selanjutnya, kami akan menjadwalkan sesi konsultasi/konseling bersama. Mohon informasikan kepada kami, pada *hari dan waktu* apa Anda bisa ditemui atau dihubungi untuk konsultasi lanjutan?\n\nTerima kasih atas kepercayaan Anda kepada kami. 🙏`
                                                    : `Halo ${greeting},\n\nPerkenalkan kami dari Satgas PPKPT Politeknik Negeri Jember.\n\nTerkait laporan Anda dengan nomor *${c.report_id}*, kami ingin menginformasikan bahwa laporan Anda sedang dalam proses penanganan.\n\nUntuk langkah selanjutnya, mohon informasikan kepada kami pada *hari dan waktu* yang nyaman bagi Anda untuk sesi konsultasi/konseling.\n\nTerima kasih. 🙏`;
                                                const label = isGuest ? 'WA Pelapor Umum' : 'WA Pelapor';
                                                return (
                                                    <a
                                                        href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(template)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2.5 p-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl border border-[#25D366]/30 transition-colors mt-3"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <svg viewBox="0 0 32 32" className="w-5 h-5 shrink-0 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.52.693 4.881 1.9 6.912L2 30l7.302-1.876A13.934 13.934 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.824-1.594l-.417-.248-4.337 1.114 1.138-4.228-.272-.435A11.453 11.453 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.474c-.344-.172-2.034-1.003-2.349-1.118-.315-.115-.545-.172-.774.172-.23.344-.888 1.118-1.09 1.347-.2.229-.4.258-.745.086-.344-.172-1.452-.535-2.767-1.707-1.022-.913-1.712-2.04-1.913-2.384-.2-.344-.021-.53.15-.701.155-.154.344-.4.516-.6.172-.2.229-.344.344-.573.115-.23.057-.43-.029-.602-.086-.172-.774-1.866-1.06-2.556-.279-.671-.563-.58-.774-.59l-.66-.012c-.23 0-.602.086-.917.43s-1.204 1.176-1.204 2.87 1.233 3.33 1.405 3.56c.172.23 2.428 3.71 5.882 5.205.823.355 1.465.567 1.966.725.826.263 1.578.226 2.172.137.663-.099 2.034-.831 2.32-1.634.287-.803.287-1.491.2-1.634-.086-.143-.315-.229-.66-.4z"/>
                                                        </svg>
                                                        <div>
                                                            <p className="text-[9px] font-black text-[#128C7E] uppercase leading-none mb-0.5">{label}</p>
                                                            <p className="text-xs font-bold text-[#075E54]">{phone}</p>
                                                        </div>
                                                    </a>
                                                );
                                            })()}

                                            <div className="flex items-center justify-between mt-6">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusBadge(c.status)}`}>
                                                    {c.status}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-7 py-5 bg-gray-50/50 border-t border-gray-100 flex grid grid-cols-3 gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigateToDetail(c.id)}
                                            className="py-2.5 px-2 bg-white border border-gray-200 text-gray-600 hover:border-gray-500 hover:bg-gray-50 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                                        >
                                            <FiEye size={14} /> DETAIL
                                        </button>
                                        <button
                                            onClick={() => setStatusModal({ open: true, complaint: c, status: c.status || 'pending', rejection_reason: c.rejection_reason || '' })}
                                            className="py-2.5 px-2 bg-white border border-gray-200 text-blue-600 hover:border-blue-500 hover:bg-blue-50 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                                        >
                                            <FiEdit size={14} /> STATUS
                                        </button>
                                        <button
                                            onClick={() => setScheduleModal({ open: true, complaint: c, counseling_schedule: c.counseling_schedule ? c.counseling_schedule.replace(' ', 'T') : '' })}
                                            className="py-2.5 px-2 bg-white border border-gray-200 text-purple-600 hover:border-purple-500 hover:bg-purple-50 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                                        >
                                            <FiCalendar size={14} /> JADWAL
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!isLoading && totalPages > 1 && (
                        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-gray-100/80 shadow-sm">
                            <p className="text-sm font-medium text-gray-400 italic">
                                Showing <span className="font-bold text-gray-900 not-italic">{((currentPage - 1) * perPage) + 1}</span> to <span className="font-bold text-gray-900 not-italic">{Math.min(currentPage * perPage, pagination.total || complaints.length)}</span> of <span className="font-bold text-gray-900 not-italic">{pagination.total || complaints.length}</span> entries
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-purple-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <FiChevronLeft size={20} />
                                </button>
                                <div className="flex items-center gap-1.5 px-4">
                                    <span className="text-sm font-black text-gray-900">{currentPage}</span>
                                    <span className="text-sm font-bold text-gray-300">/</span>
                                    <span className="text-sm font-bold text-gray-400">{totalPages}</span>
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-purple-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <FiChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                {/* Modern Status Modal */}
                {statusModal.open && statusModal.complaint && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setStatusModal({ open: false, complaint: null, status: 'pending', rejection_reason: '' })} />
                        <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-200">
                            <div className="w-20 h-20 bg-blue-100 rounded-[30px] flex items-center justify-center mb-8 rotate-3 shadow-sm mx-auto">
                                <FiEdit className="text-blue-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight text-center">Ubah Status</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium text-center">{statusModal.complaint?.report_id}</p>

                            <div className="space-y-4 mb-8">
                                <label className="text-xs font-bold text-gray-500 uppercase px-1">Pilih Status Baru</label>
                                <select
                                    value={statusModal.status}
                                    onChange={(e) => setStatusModal((p) => ({ ...p, status: e.target.value }))}
                                    className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer font-medium"
                                    disabled={isSubmitting}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Diproses / Disetujui</option>
                                    <option value="completed">Selesai</option>
                                    <option value="rejected">Ditolak / Jadwalkan Ulang</option>
                                </select>
                            </div>

                            {statusModal.status === 'rejected' && (
                                <div className="space-y-4 mb-8">
                                    <label className="text-xs font-bold text-gray-500 uppercase px-1">Alasan Penolakan <span className="text-rose-500">*</span></label>
                                    <textarea
                                        value={statusModal.rejection_reason}
                                        onChange={(e) => setStatusModal((p) => ({ ...p, rejection_reason: e.target.value }))}
                                        placeholder="Berikan alasan mengapa laporan ditolak (akan dikirimkan ke pelapor)..."
                                        rows={4}
                                        className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all resize-none font-medium"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button disabled={isSubmitting} onClick={() => setStatusModal({ open: false, complaint: null, status: 'pending', rejection_reason: '' })} className="flex-1 py-4 border-2 border-gray-100 text-gray-400 rounded-3xl text-sm font-black hover:bg-gray-50 transition-all">BATAL</button>
                                <button disabled={isSubmitting || (statusModal.status === 'rejected' && !statusModal.rejection_reason.trim())} onClick={submitStatus} className="flex-1 py-4 bg-blue-600 text-white rounded-3xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95">{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN'}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modern Schedule Modal */}
                {scheduleModal.open && scheduleModal.complaint && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setScheduleModal({ open: false, complaint: null, counseling_schedule: '' })} />
                        <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-200">
                            <div className="w-20 h-20 bg-purple-100 rounded-[30px] flex items-center justify-center mb-8 rotate-3 shadow-sm mx-auto">
                                <FiCalendar className="text-purple-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight text-center">Jadwalkan Konseling</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium text-center">{scheduleModal.complaint?.report_id}</p>

                            <div className="space-y-4 mb-8">
                                <label className="text-xs font-bold text-gray-500 uppercase px-1">Tanggal & Waktu</label>
                                <input
                                    type="datetime-local"
                                    value={scheduleModal.counseling_schedule}
                                    onChange={(e) => setScheduleModal((p) => ({ ...p, counseling_schedule: e.target.value }))}
                                    className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button disabled={isSubmitting} onClick={() => setScheduleModal({ open: false, complaint: null, counseling_schedule: '' })} className="flex-1 py-4 border-2 border-gray-100 text-gray-400 rounded-3xl text-sm font-black hover:bg-gray-50 transition-all">BATAL</button>
                                <button disabled={isSubmitting} onClick={submitSchedule} className="flex-1 py-4 bg-purple-600 text-white rounded-3xl text-sm font-black hover:bg-purple-700 shadow-xl shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-95">{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KonselorPengaduan;
