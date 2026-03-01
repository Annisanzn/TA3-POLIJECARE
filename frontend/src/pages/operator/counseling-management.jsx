import React, { useState, useEffect } from 'react';
import {
  FiSearch, FiFilter, FiCalendar, FiClock, FiVideo,
  FiMapPin, FiCheckCircle, FiXCircle, FiEye, FiFileText,
  FiRefreshCw, FiChevronLeft, FiChevronRight, FiUser,
  FiAlertCircle, FiX, FiCheck, FiMail, FiBarChart2, FiUsers
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import counselingService from '../../services/counselingService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/* ── Toast Component ───────────────────────────────────────────────────────── */
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {toast.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
      {toast.msg}
    </div>
  );
};

const CounselingManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // Data state
  const [schedules, setSchedules] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    upcoming: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    cancelled: 0
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [counselorFilter, setCounselorFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  // Modal states
  const [detailModal, setDetailModal] = useState({ open: false, schedule: null });
  const [approvalModal, setApprovalModal] = useState({ open: false, schedule: null });
  const [rejectionModal, setRejectionModal] = useState({ open: false, schedule: null, reason: '' });

  useEffect(() => {
    fetchSchedules();
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      const response = await counselingService.getCounselors();
      if (response.success) {
        setCounselors(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching counselors:', err);
    }
  };

  const fetchSchedules = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = {
        page,
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        metode: methodFilter !== 'all' ? methodFilter : undefined,
        counselor_id: counselorFilter !== 'all' ? counselorFilter : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined
      };

      const response = await counselingService.getSchedules(params);

      if (response.success) {
        setSchedules(response.data.data || []);
        setPagination(response.data.meta || {
          current_page: page,
          last_page: 1,
          per_page: 10,
          total: response.data.data?.length || 0
        });
        setStats(response.data.stats || {
          total: response.data.data?.length || 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          completed: 0,
          cancelled: 0
        });
      } else {
        showToast(response.message || 'Gagal memuat data jadwal', 'error');
        setSchedules([]);
      }
    } catch (err) {
      showToast('Terjadi kesalahan saat memuat data jadwal', 'error');
      console.error('Error fetching schedules:', err);
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    fetchSchedules(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMethodFilter('all');
    setCounselorFilter('all');
    setDateFrom('');
    setDateTo('');
    // Trigger fetch after reset in next tick
    setTimeout(() => fetchSchedules(1), 0);
  };

  const handleApprove = async (scheduleId) => {
    setIsLoading(true);
    try {
      const response = await counselingService.approveSchedule(scheduleId);
      if (response.success) {
        showToast('Jadwal berhasil disetujui!');
        fetchSchedules(pagination.current_page);
        setApprovalModal({ open: false, schedule: null });
      } else {
        showToast(response.message || 'Gagal menyetujui jadwal', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan saat menyetujui jadwal', 'error');
      console.error('Error approving schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionModal.reason.trim()) {
      showToast('Alasan penolakan harus diisi', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await counselingService.rejectSchedule(
        rejectionModal.schedule.id,
        rejectionModal.reason
      );

      if (response.success) {
        showToast('Jadwal berhasil ditolak!');
        fetchSchedules(pagination.current_page);
        setRejectionModal({ open: false, schedule: null, reason: '' });
      } else {
        showToast(response.message || 'Gagal menolak jadwal', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan saat menolak jadwal', 'error');
      console.error('Error rejecting schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (scheduleId, status) => {
    setIsLoading(true);
    try {
      const response = await counselingService.updateScheduleStatus(scheduleId, status);
      if (response.success) {
        showToast(`Status jadwal berhasil diubah menjadi ${status === 'completed' ? 'selesai' : 'dibatalkan'}!`);
        fetchSchedules(pagination.current_page);
      } else {
        showToast(response.message || 'Gagal mengubah status jadwal', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan saat mengubah status', 'error');
      console.error('Error updating status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDetail = (complaintId) => {
    navigate(`/operator/complaint-detail/${complaintId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-700 border border-rose-200';
      case 'completed':
        return 'bg-sky-100 text-sky-700 border border-sky-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-30">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Jadwal</h1>
              <p className="text-gray-600">
                Selamat datang, {user?.name || 'Operator'}! Kelola jadwal konseling Anda
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchSchedules(pagination.current_page)}
                disabled={isLoading}
                className="p-2.5 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                title="Refresh Data"
              >
                <FiRefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Konseling</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiBarChart2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">Semua waktu</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Hari Ini</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.today || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">Sesi konseling hari ini</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Akan Datang</p>
                  <p className="text-3xl font-bold text-green-600">{stats.upcoming || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">Sesi mendatang</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Menunggu</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">Menunggu persetujuan</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-4 border border-gray-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Disetujui</p>
                  <p className="text-xl font-bold text-green-600">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 border border-gray-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Selesai</p>
                  <p className="text-xl font-bold text-blue-600">{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 border border-gray-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FiXCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ditolak</p>
                  <p className="text-xl font-bold text-red-600">{stats.rejected || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 border border-gray-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiX className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dibatalkan</p>
                  <p className="text-xl font-bold text-gray-600">{stats.cancelled}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filter Component */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100/80 p-8 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Pencarian</label>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Nama mahasiswa/konselor..."
                    className="w-full pl-11 pr-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Metode</label>
                <select
                  value={methodFilter}
                  onChange={e => setMethodFilter(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Semua Metode</option>
                  <option value="online">Online session</option>
                  <option value="offline">Offline visit</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Konselor</label>
                <select
                  value={counselorFilter}
                  onChange={e => setCounselorFilter(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Semua Konselor</option>
                  {counselors.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Rentang Tanggal</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="flex-1 bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner"
                  />
                  <span className="text-gray-300 font-bold">—</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="flex-1 bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 flex items-end">
                <button
                  onClick={handleFilterChange}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
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
                <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-gray-500 font-bold tracking-tight animate-pulse">Menyiapkan data jadwal...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                <FiCalendar size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada data</h3>
              <p className="text-gray-500 max-w-xs text-center font-medium">Tidak dapat menemukan jadwal yang sesuai dengan filter pencarian Anda</p>
              <button onClick={resetFilters} className="mt-8 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">Lihat Semua Data</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {schedules.map(s => (
                <div key={s.id} className="group bg-white rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-2 border border-gray-100/80 transition-all duration-300 overflow-hidden flex flex-col h-full">
                  <div className="p-7 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center shadow-inner">
                          <FiUser className="text-blue-600" size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-base font-bold text-gray-900 leading-tight truncate" title={s.user?.name}>{s.user?.name || 'Mahasiswa'}</h3>
                          <p className="text-xs text-gray-400 font-medium truncate italic">{s.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <FiCalendar size={14} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Tanggal</p>
                          <p className="text-xs font-bold text-gray-700">{formatDate(s.tanggal)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <FiClock size={14} className="text-amber-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Waktu Sesi</p>
                          <p className="text-xs font-bold text-gray-700">{formatTime(s.jam_mulai)} – {formatTime(s.jam_selesai)} WIB</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusBadge(s.status)}`}>
                          {getStatusLabel(s.status)}
                        </span>
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl ${s.metode === 'online' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {s.metode === 'online' ? <FiVideo size={12} /> : <FiMapPin size={12} />}
                          {s.metode === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-7 py-5 bg-gray-50/50 border-t border-gray-100 grid grid-cols-2 gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setDetailModal({ open: true, schedule: s })}
                      className="py-2.5 px-4 bg-white border border-gray-200 text-blue-600 hover:border-blue-500 hover:bg-blue-50 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FiEye size={14} /> DETAIL
                    </button>
                    {s.complaint_id && (
                      <button
                        onClick={() => navigateToDetail(s.complaint_id)}
                        className="py-2.5 px-4 bg-white border border-gray-200 text-purple-600 hover:border-purple-500 hover:bg-purple-50 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <FiFileText size={14} /> ADUAN
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && pagination.last_page > 1 && (
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-gray-100/80 shadow-sm">
              <p className="text-sm font-medium text-gray-400 italic">
                Showing <span className="font-bold text-gray-900 not-italic">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> to <span className="font-bold text-gray-900 not-italic">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of <span className="font-bold text-gray-900 not-italic">{pagination.total}</span> entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchSchedules(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <FiChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1.5 px-4">
                  <span className="text-sm font-black text-gray-900">{pagination.current_page}</span>
                  <span className="text-sm font-bold text-gray-300">/</span>
                  <span className="text-sm font-bold text-gray-400">{pagination.last_page}</span>
                </div>
                <button
                  onClick={() => fetchSchedules(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Full Screen Detail Modal */}
      {detailModal.open && detailModal.schedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setDetailModal({ open: false, schedule: null })} />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Detail Konseling</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: #{detailModal.schedule.id}</span>
                </div>
              </div>
              <button onClick={() => setDetailModal({ open: false, schedule: null })} className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all active:scale-95">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-10 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FiUser size={12} /> Mahasiswa
                    </p>
                    <p className="text-lg font-black text-gray-900 leading-tight">{detailModal.schedule.user?.name || 'N/A'}</p>
                    <p className="text-xs font-medium text-blue-600 mt-2 flex items-center gap-2"><FiMail size={14} /> {detailModal.schedule.user?.email || 'No email data'}</p>
                  </div>

                  <div className="p-6 bg-slate-50/50 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FiCalendar size={12} /> Penugasan Konselor
                    </p>
                    <p className="text-base font-bold text-gray-900 truncate">{detailModal.schedule.counselor?.name || 'Belum ditugaskan'}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1 truncate italic">{detailModal.schedule.counselor?.email || ''}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Waktu Terjadwal</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-indigo-500"><FiCalendar size={14} /></div>
                        {formatDate(detailModal.schedule.tanggal)}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-amber-500"><FiClock size={14} /></div>
                        {formatTime(detailModal.schedule.jam_mulai)} - {formatTime(detailModal.schedule.jam_selesai)} WIB
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Status Permintaan</p>
                    <span className={`inline-flex px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${getStatusBadge(detailModal.schedule.status)}`}>
                      {getStatusLabel(detailModal.schedule.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Pending requests */}
              {detailModal.schedule.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => { setApprovalModal({ open: true, schedule: detailModal.schedule }); setDetailModal({ open: false, schedule: null }); }}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-[24px] text-sm font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FiCheckCircle size={20} /> SETUJUI
                  </button>
                  <button
                    onClick={() => { setRejectionModal({ open: true, schedule: detailModal.schedule, reason: '' }); setDetailModal({ open: false, schedule: null }); }}
                    className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-[24px] text-sm font-black hover:bg-rose-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FiXCircle size={20} /> TOLAK
                  </button>
                </div>
              )}

              {detailModal.schedule.status === 'approved' && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => handleStatusUpdate(detailModal.schedule.id, 'completed')}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-[24px] text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle size={20} /> KONSELING SELESAI
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(detailModal.schedule.id, 'cancelled')}
                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[24px] text-sm font-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <FiXCircle size={20} /> BATALKAN
                  </button>
                </div>
              )}

              {detailModal.schedule.alasan_penolakan && (
                <div className="p-6 bg-rose-50 rounded-[32px] border border-rose-100">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-2"><FiXCircle size={14} /> Catatan Penolakan</p>
                  <p className="text-sm font-medium text-rose-900 leading-relaxed italic">"{detailModal.schedule.alasan_penolakan}"</p>
                </div>
              )}
            </div>

            <div className="p-10 bg-gray-50/50 border-t border-gray-100 flex gap-4">
              <button
                onClick={() => setDetailModal({ open: false, schedule: null })}
                className="w-full py-4 bg-white border border-gray-200 text-gray-900 rounded-[24px] text-sm font-black hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Approval Modal */}
      {approvalModal.open && approvalModal.schedule && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setApprovalModal({ open: false, schedule: null })} />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 rounded-[30px] flex items-center justify-center mx-auto mb-8 rotate-6 shadow-sm">
              <FiCheck className="text-emerald-600" size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Kirim Persetujuan?</h3>
            <p className="text-gray-500 text-sm mb-10 font-medium leading-relaxed">
              Anda akan menyetujui sesi konseling untuk <strong>{approvalModal.schedule.user?.name}</strong>. Notifikasi konfirmasi akan segera dikirimkan.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setApprovalModal({ open: false, schedule: null })} className="flex-1 py-4 border-2 border-gray-100 text-gray-400 rounded-3xl text-sm font-black hover:bg-gray-50 transition-all">BATAL</button>
              <button onClick={() => handleApprove(approvalModal.schedule.id)} className="flex-1 py-4 bg-emerald-600 text-white rounded-3xl text-sm font-black hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">YA, SETUJU</button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Rejection Modal */}
      {rejectionModal.open && rejectionModal.schedule && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setRejectionModal({ open: false, schedule: null, reason: '' })} />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-rose-100 rounded-[30px] flex items-center justify-center mb-8 -rotate-6 shadow-sm">
              <FiX className="text-rose-600" size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Tolak Permintaan</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium">Berikan alasan logis agar mahasiswa dapat menjadwalkan ulang di lain waktu.</p>

            <textarea
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              placeholder="Contoh: Mohon maaf, konselor sudah memiliki agenda lain di jam tersebut..."
              rows={4}
              className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[32px] text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all mb-8 resize-none font-medium"
            />

            <div className="flex gap-4">
              <button onClick={() => setRejectionModal({ open: false, schedule: null, reason: '' })} className="flex-1 py-4 border-2 border-gray-100 text-gray-400 rounded-3xl text-sm font-black hover:bg-gray-50 transition-all">BATAL</button>
              <button onClick={handleReject} disabled={!rejectionModal.reason.trim()} className="flex-1 py-4 bg-rose-600 text-white rounded-3xl text-sm font-black hover:bg-rose-700 shadow-xl shadow-rose-500/20 disabled:opacity-50 transition-all active:scale-95">KIRIM PENOLAKAN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselingManagementPage;
