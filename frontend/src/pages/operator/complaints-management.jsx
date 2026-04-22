import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import axios from '../../api/axios';
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
  FiX,
  FiDownload
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
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'ongoing', 'archive'

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

  const [statusModal, setStatusModal] = useState({ open: false, complaint: null, status: 'pending', rejection_reason: '' });
  const [scheduleModal, setScheduleModal] = useState({ open: false, complaint: null, counseling_schedule: '', counselor_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [counselors, setCounselors] = useState([]);

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
          status: activeTab === 'new' 
            ? 'pending'
            : activeTab === 'ongoing'
              ? 'approved'
              : 'completed,rejected',
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
  }, [activeTab]);

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
    setStatusModal({ open: true, complaint, status: complaint.status || 'pending', rejection_reason: complaint.rejection_reason || '' });

  const openSchedule = async (complaint) => {
    setScheduleModal({
      open: true,
      complaint,
      counselor_id: complaint.counselor_id || '',
      counseling_schedule: complaint.counseling_schedule
        ? complaint.counseling_schedule.replace(' ', 'T')
        : '',
    });
    // Fetch counselors list if not yet loaded
    if (counselors.length === 0) {
      try {
        const res = await axios.get('/operator/counseling/counselors');
        setCounselors(res.data?.data || []);
      } catch (e) {
        // silently fail; operator can type manually
      }
    }
  };

  const submitStatus = async () => {
    if (!statusModal.complaint?.id) return;
    try {
      setIsSubmitting(true);
      const payload = { status: statusModal.status };
      if (statusModal.status === 'rejected') {
        payload.rejection_reason = statusModal.rejection_reason;
      }
      await complaintService.updateStatus(statusModal.complaint.id, payload);
      showToast('Status berhasil diubah!');
      setStatusModal({ open: false, complaint: null, status: 'pending', rejection_reason: '' });
      fetchData(pagination.current_page);
    } catch (error) {
      showToast(error?.message || 'Gagal mengubah status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSchedule = async () => {
    if (!scheduleModal.complaint?.id) return;
    if (!scheduleModal.counselor_id) {
      showToast('Pilih konselor terlebih dahulu.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await complaintService.schedule(scheduleModal.complaint.id, {
        counselor_id: scheduleModal.counselor_id,
        counseling_schedule: scheduleModal.counseling_schedule,
      });
      showToast('Jadwal konseling berhasil ditetapkan!');
      setScheduleModal({ open: false, complaint: null, counseling_schedule: '', counselor_id: '' });
      fetchData(pagination.current_page);
    } catch (error) {
      showToast(error?.message || 'Gagal menjadwalkan konseling.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleExport = async (period) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/operator/complaints/export?type=${period}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-pengaduan-${period}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast('Laporan berhasil diekspor!');
    } catch (error) {
      showToast('Gagal mengekspor laporan.', 'error');
    } finally {
      setIsLoading(false);
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
              
              {activeTab === 'archive' && (
                <div className="relative group/export">
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200"
                  >
                    <FiDownload size={16} /> Ekspor Laporan
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-[60] overflow-hidden">
                    <button onClick={() => handleExport('daily')} className="w-full text-left px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium border-b border-gray-50">Hari Ini</button>
                    <button onClick={() => handleExport('monthly')} className="w-full text-left px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium border-b border-gray-50">Bulan Ini</button>
                    <button onClick={() => handleExport('yearly')} className="w-full text-left px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">Tahun Ini</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10">
          {/* Stats Summary - Compact & Modern */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="bg-purple-600 px-5 py-2.5 rounded-2xl shadow-lg shadow-purple-200 flex items-center gap-3">
              <FiFileText className="text-white/80" size={16} />
              <span className="text-sm font-bold text-white">Total Laporan: {stats.total || 0}</span>
            </div>
            <div className="bg-white border border-gray-100 px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pusat Bantuan Satgas - Aktif</span>
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

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-[24px] w-full border border-gray-200/50">
            <button
              onClick={() => { setActiveTab('new'); setStatusFilter('all'); }}
              className={`flex-1 px-8 py-3 rounded-[20px] text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'new' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Laporan Baru
              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'new' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                {stats.pending || 0}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('ongoing'); setStatusFilter('all'); }}
              className={`flex-1 px-8 py-3 rounded-[20px] text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'ongoing' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sedang Ditangani
              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'ongoing' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                {stats.approved || 0}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('archive'); setStatusFilter('all'); }}
              className={`flex-1 px-8 py-3 rounded-[20px] text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'archive' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Arsip & Ekspor
              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === 'archive' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                {(stats.completed || 0) + (stats.rejected || 0)}
              </span>
            </button>
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
                            className="flex items-center gap-2.5 p-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl border border-[#25D366]/30 transition-colors"
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
                          {c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\./g, ':') + ' WIB' : '-'}
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
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Alasan Penolakan</label>
                <textarea
                  value={statusModal.rejection_reason}
                  onChange={(e) => setStatusModal((p) => ({ ...p, rejection_reason: e.target.value }))}
                  placeholder="Masukkan alasan pengaduan ditolak..."
                  className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-medium min-h-[100px]"
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="flex gap-4">
              <button disabled={isSubmitting} onClick={() => setStatusModal({ open: false, complaint: null, status: 'pending', rejection_reason: '' })} className="flex-1 py-4 border-2 border-gray-100 text-gray-400 rounded-3xl text-sm font-black hover:bg-gray-50 transition-all">BATAL</button>
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

            <div className="space-y-4 mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase px-1">Konselor Penanganan</label>
              <select
                value={scheduleModal.counselor_id}
                onChange={(e) => setScheduleModal((p) => ({ ...p, counselor_id: e.target.value }))}
                className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all cursor-pointer font-medium"
                disabled={isSubmitting}
              >
                <option value="">-- Pilih Konselor --</option>
                {counselors.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

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
              <button disabled={isSubmitting} onClick={() => setScheduleModal({ open: false, complaint: null, counseling_schedule: '', counselor_id: '' })} className="flex-1 py-4 border-2 border-gray-100 text-gray-400 rounded-3xl text-sm font-black hover:bg-gray-50 transition-all">BATAL</button>
              <button disabled={isSubmitting} onClick={submitSchedule} className="flex-1 py-4 bg-purple-600 text-white rounded-3xl text-sm font-black hover:bg-purple-700 shadow-xl shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-95">{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagementPage;
