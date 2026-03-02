import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiCheckCircle,
  FiCalendar,
  FiEdit,
  FiEye,
  FiMapPin,
  FiUser,
  FiRefreshCw,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { complaintService } from '../../services/complaintService';
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
    <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
      {toast.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
      {toast.msg}
    </div>
  );
};

const ComplaintsManagementPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [perPage] = useState(10);

  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
  });

  const [statusModal, setStatusModal] = useState({ open: false, complaint: null, status: 'pending' });
  const [scheduleModal, setScheduleModal] = useState({ open: false, complaint: null, counseling_schedule: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);

  const getVictimLabel = (c) => {
    if (c.victim_type === 'self') return 'Diri Sendiri';
    return c.victim_name || '-';
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'approved':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-700 border border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const fetchData = async (page = 1) => {
    try {
      setIsLoading(true);

      const [listRes, statsRes] = await Promise.all([
        complaintService.getComplaints({
          page,
          per_page: perPage,
          search: searchQuery,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          urgency: urgencyFilter !== 'all' ? urgencyFilter : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        }),
        complaintService.getComplaintStats(),
      ]);

      const pageData = listRes.data || {};
      setComplaints(pageData.data || []);
      setPagination({
        current_page: pageData.current_page || page,
        last_page: pageData.last_page || 1,
        per_page: pageData.per_page || perPage,
        total: pageData.total || 0,
      });

      if (statsRes?.data?.success) {
        setStats(statsRes.data.data || {});
      }
    } catch (error) {
      setComplaints([]);
      setPagination({ current_page: 1, last_page: 1, per_page: perPage, total: 0 });
      showToast(error?.message || 'Gagal mengambil data pengaduan.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleFilterChange = () => {
    fetchData(1);
  };

  const resetFilter = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setUrgencyFilter('all');
    setDateFrom('');
    setDateTo('');
    setTimeout(() => fetchData(1), 0);
  };

  const openStatus = (complaint) =>
    setStatusModal({ open: true, complaint, status: complaint.status || 'pending' });

  const openSchedule = (complaint) =>
    setScheduleModal({
      open: true,
      complaint,
      counseling_schedule: complaint.counseling_schedule
        ? complaint.counseling_schedule.replace(' ', 'T')
        : '',
    });

  const submitStatus = async () => {
    if (!statusModal.complaint?.id) return;
    try {
      setIsSubmitting(true);
      await complaintService.updateStatus(statusModal.complaint.id, statusModal.status);
      showToast('Status berhasil diubah!');
      setStatusModal({ open: false, complaint: null, status: 'pending' });
      fetchData(pagination.current_page);
    } catch (error) {
      showToast(error?.message || 'Gagal mengubah status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSchedule = async () => {
    if (!scheduleModal.complaint?.id) return;
    if (!scheduleModal.counseling_schedule) {
      showToast('Jadwal konseling wajib diisi.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await complaintService.schedule(scheduleModal.complaint.id, {
        counseling_schedule: scheduleModal.counseling_schedule,
      });
      showToast('Jadwal konseling berhasil ditetapkan!');
      setScheduleModal({ open: false, complaint: null, counseling_schedule: '' });
      fetchData(pagination.current_page);
    } catch (error) {
      showToast(error?.message || 'Gagal menjadwalkan konseling.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-30">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Pengaduan</h1>
              <p className="text-gray-600">Kelola laporan pengaduan dan proses tindak lanjut</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(pagination.current_page)}
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
        </header>

        <main className="flex-1 p-6 lg:p-10">
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
                  onChange={e => setUrgencyFilter(e.target.value)}
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
                  onClick={handleFilterChange}
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
                      onClick={() => navigate(`/operator/complaint-detail/${c.id}`)}
                      className="py-2.5 px-2 bg-white border border-gray-200 text-gray-600 hover:border-gray-500 hover:bg-gray-50 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                    >
                      <FiEye size={14} /> DETAIL
                    </button>
                    <button
                      onClick={() => openStatus(c)}
                      className="py-2.5 px-2 bg-white border border-gray-200 text-blue-600 hover:border-blue-500 hover:bg-blue-50 rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                    >
                      <FiEdit size={14} /> STATUS
                    </button>
                    <button
                      onClick={() => openSchedule(c)}
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
          {!isLoading && pagination.last_page > 1 && (
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-gray-100/80 shadow-sm">
              <p className="text-sm font-medium text-gray-400 italic">
                Showing <span className="font-bold text-gray-900 not-italic">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> to <span className="font-bold text-gray-900 not-italic">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of <span className="font-bold text-gray-900 not-italic">{pagination.total}</span> entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-purple-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <FiChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1.5 px-4">
                  <span className="text-sm font-black text-gray-900">{pagination.current_page}</span>
                  <span className="text-sm font-bold text-gray-300">/</span>
                  <span className="text-sm font-bold text-gray-400">{pagination.last_page}</span>
                </div>
                <button
                  onClick={() => fetchData(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-600 hover:bg-purple-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modern Status Modal */}
      {statusModal.open && statusModal.complaint && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setStatusModal({ open: false, complaint: null, status: 'pending' })} />
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

            <div className="flex gap-4">
              <button disabled={isSubmitting} onClick={() => setStatusModal({ open: false, complaint: null, status: 'pending' })} className="flex-1 py-4 border-2 border-gray-100 text-gray-400 rounded-3xl text-sm font-black hover:bg-gray-50 transition-all">BATAL</button>
              <button disabled={isSubmitting} onClick={submitStatus} className="flex-1 py-4 bg-blue-600 text-white rounded-3xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95">{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN'}</button>
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
  );
};

export default ComplaintsManagementPage;
