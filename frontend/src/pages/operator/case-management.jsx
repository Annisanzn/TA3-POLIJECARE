import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  FiSearch, FiFilter, FiCalendar, FiClock, FiFileText,
  FiCheckCircle, FiXCircle, FiEye, FiEdit, FiBarChart2,
  FiChevronLeft, FiChevronRight, FiUsers, FiMapPin, FiDownload,
  FiAlertCircle, FiX, FiCheck, FiMoreVertical, FiTrendingUp,
  FiRefreshCw, FiUser, FiMessageSquare
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import axios from '../../api/axios';
import counselingService from '../../services/counselingService';
import { useAuth } from '../../hooks/useAuth';

/* ── Toast Component ───────────────────────────────────────────────────────── */
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-[24px] shadow-2xl animate-in slide-in-from-right-10 duration-300 border backdrop-blur-md ${
      toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-rose-50/90 border-rose-200 text-rose-800'
    }`}>
      {toast.type === 'success' ? <FiCheckCircle className="shrink-0" /> : <FiAlertCircle className="shrink-0" />}
      <span className="text-sm font-black tracking-tight uppercase">{toast.message}</span>
    </div>
  );
};

/* ── Unified Case Management Component ─────────────────────────────────────── */
const CaseManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State: Core Data
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'new';
  
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ 
    total: 0, pending: 0, approved: 0, completed: 0, rejected: 0,
    today: 0, upcoming: 0, archived: 0
  });

  // State: UI Controls
  const [activeTab, setActiveTab] = useState(initialTab); // new, today, upcoming, active, archive
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State: Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  // State: Modals
  const [statusModal, setStatusModal] = useState({ 
    open: false, complaint: null, status: 'pending', rejection_reason: '', isRejectOnly: false 
  });
  const [scheduleModal, setScheduleModal] = useState({ open: false, complaint: null, counselor_id: '', counseling_schedule: '' });
  const [exportModal, setExportModal] = useState({ open: false, date_from: '', date_to: '', status: 'all' });
  const [counselors, setCounselors] = useState([]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // 1. Fetching Data based on activeTab
  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

      let endpoint = '/operator/complaints';
      let params = { page, search: searchQuery, per_page: 8 };

      // Tab Management Logic
      switch (activeTab) {
        case 'new':
          params.status = 'pending';
          break;
        case 'today':
          // We use the Counseling Endpoint for session-centric tabs
          endpoint = '/operator/counseling';
          params.status = 'approved';
          params.date_from = today;
          params.date_to = today;
          break;
        case 'upcoming':
          endpoint = '/operator/counseling';
          params.status = 'approved';
          params.date_from = tomorrow;
          break;
        case 'active':
          params.status = 'approved';
          break;
        case 'archive':
          params.status = statusFilter !== 'all' ? statusFilter : 'completed,rejected,cancelled';
          // In the archive tab, we want to see everything concluded, regardless of date.
          break;
        default:
          break;
      }

      // Apply manual filters
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (urgencyFilter !== 'all') params.urgency_level = urgencyFilter;

      const res = await axios.get(endpoint, { params });
      
      // Handle the different response structures from complaints vs counseling
      if (endpoint === '/operator/complaints') {
        setData(res.data.data || []);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          total: res.data.total
        });
      } else {
        // Counseling response usually has wrap data.data
        setData(res.data.data.data || res.data.data || []);
        setPagination({
          current_page: res.data.data?.current_page || 1,
          last_page: res.data.data?.last_page || 1,
          total: res.data.data?.total || 0
        });
      }

      // Fetch Stats separately or from response if provided
      const statsRes = await axios.get('/counseling/statistics');
      const compStatsRes = await axios.get('/operator/complaints-stats');
      
      setStats({
        ...statsRes.data.data,
        pending: compStatsRes.data.data.pending,
        archived: compStatsRes.data.data.archived, // Proper count for reports
        total: compStatsRes.data.data.total
      });

    } catch (err) {
      console.error('Fetch Error:', err);
      showToast('Gagal memuat data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Update URL tab
    setSearchParams({ tab: activeTab });
    // Fetch counselors for modals
    axios.get('/operator/counseling/counselors').then(res => setCounselors(res.data.data || []));
  }, [activeTab, searchQuery, urgencyFilter]);

  const handleFilterChange = (e) => {
    e.preventDefault();
    fetchData(1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    setUrgencyFilter('all');
    fetchData(1);
  };

  // 2. Status Update Actions
  const submitStatus = async () => {
    if (!statusModal.complaint) return;
    setIsSubmitting(true);
    try {
      await axios.patch(`/operator/complaints/${statusModal.complaint.id}/status`, {
        status: statusModal.status,
        rejection_reason: statusModal.status === 'rejected' ? statusModal.rejection_reason : null
      });
      showToast('Status berhasil diperbarui');
      setStatusModal({ open: false, complaint: null, status: 'pending', rejection_reason: '' });
      fetchData(pagination.current_page);
    } catch (err) {
      showToast('Gagal memperbarui status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSchedule = async () => {
    if (!scheduleModal.complaint) return;
    if (!scheduleModal.counselor_id || !scheduleModal.counseling_schedule) {
      showToast('Mohon pilih konselor dan jadwal', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.patch(`/operator/complaints/${scheduleModal.complaint.id}/schedule`, {
        counselor_id: scheduleModal.counselor_id,
        counseling_schedule: scheduleModal.counseling_schedule
      });
      showToast('Jadwal berhasil di-approve & sinkron');
      setScheduleModal({ open: false, complaint: null, counselor_id: '', counseling_schedule: '' });
      fetchData(pagination.current_page);
    } catch (err) {
      showToast('Gagal memproses jadwal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleQuickApprove = async (report) => {
    // If report already has counselor and schedule, we can quick approve
    if (report.counselor_id && report.counseling_schedule) {
      setIsSubmitting(true);
      try {
        await axios.patch(`/operator/complaints/${report.id}/status`, {
          status: 'approved'
        });
        showToast('Laporan berhasil disetujui');
        fetchData(pagination.current_page);
      } catch (err) {
        showToast('Gagal menyetujui laporan', 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Fallback to plotting if data is missing
      setScheduleModal({ 
        open: true, 
        complaint: report, 
        counselor_id: report.counselor_id || '', 
        counseling_schedule: report.counseling_schedule ? dayjs(report.counseling_schedule).format('YYYY-MM-DDTHH:mm') : '' 
      });
    }
  };

  // 3. Export Logic (Authenticated Download)
  const handleExport = async () => {
    setIsSubmitting(true);
    try {
      const params = {};
      if (exportModal.date_from) params.date_from = exportModal.date_from;
      if (exportModal.date_to) params.date_to = exportModal.date_to;
      if (exportModal.status !== 'all') params.status = exportModal.status;

      const response = await axios.get('/operator/complaints/export', {
        params,
        responseType: 'blob', // Important for binary/file data
      });

      // Create a local URL for the downloaded blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `laporan-pengaduan-${dayjs().format('YYYYMMDD-HHmmss')}.csv`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('Ekspor Excel berhasil diunduh');
      setExportModal({ ...exportModal, open: false });
    } catch (err) {
      console.error('Export Error:', err);
      showToast('Gagal mengekspor data. Pastikan Anda memiliki akses.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI Helpers
  const getUrgencyBadge = (level) => {
    const maps = {
      'critical': 'bg-rose-50 text-rose-700 border-rose-200',
      'high': 'bg-orange-50 text-orange-700 border-orange-200',
      'medium': 'bg-amber-50 text-amber-700 border-amber-200',
      'low': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return maps[level?.toLowerCase()] || 'bg-gray-50 text-gray-500 border-gray-200';
  };

  const getStatusBadge = (status) => {
    const maps = {
      'pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'approved': 'bg-blue-50 text-blue-700 border-blue-100',
      'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'rejected': 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return maps[status?.toLowerCase()] || 'bg-gray-50 text-gray-500 border-gray-100';
  };

  const getStatusLabel = (status) => {
    const labs = {
      'pending': 'MASUK BARU',
      'approved': 'DITANGANI',
      'completed': 'SELESAI',
      'rejected': 'DITOLAK'
    };
    return labs[status?.toLowerCase()] || status?.toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFF]">
      <Sidebar collapsed={false} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Toast toast={toast} onClose={() => setToast(null)} />

        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 px-8 py-6 h-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <FiFileText className="text-blue-600" /> Manajemen Kasus
              </h1>
              <p className="text-gray-500 text-sm mt-1 font-medium italic">
                Pusat Kendali Pengaduan & Jadwal Konseling PolijeCare
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setExportModal({ ...exportModal, open: true })}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all text-sm font-bold"
              >
                <FiDownload size={18} />
                EKSPOR EXCEL
              </button>
              <button 
                onClick={handleReset}
                className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-white hover:text-blue-600 border border-transparent hover:border-gray-200 transition-all shadow-sm"
              >
                <FiX size={20} />
              </button>
              <button 
                onClick={() => fetchData(1)}
                className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all"
              >
                <FiRefreshCw className={`${isLoading ? 'animate-spin' : ''}`} size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-10">
          
          {/* 1. Header Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="bg-[#E6E6FA] px-6 py-3 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-200/50 flex items-center gap-4">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]" />
               <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest border-r border-indigo-300 pr-4">SISTEM AKTIF</span>
               <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-indigo-500 leading-none">TOTAL KASUS</span>
                  <span className="text-lg font-bold text-indigo-900 leading-tight">{stats.total || 0}</span>
               </div>
            </div>

            <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><FiTrendingUp size={16} /></div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase leading-none mb-0.5 tracking-tighter">Butuh Atensi</span>
                    <span className="text-sm font-bold text-gray-900 leading-tight">{stats.pending || 0}</span>
                </div>
            </div>
          </div>

          {/* 2. Unified Filter Section */}
          <div className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 mb-8">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">PARAMETER FILTRASI</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Cari Laporan / ID</label>
                  <div className="relative group">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Ketik kata kunci..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent group-hover:border-gray-100 focus:bg-white focus:border-blue-500 rounded-[28px] text-sm font-medium outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Urgensi</label>
                  <select 
                    value={urgencyFilter}
                    onChange={e => setUrgencyFilter(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50/50 border-2 border-transparent hover:border-gray-100 focus:bg-white focus:border-blue-500 rounded-[28px] text-sm font-medium outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">SEMUA TINGKAT</option>
                    <option value="critical">CRITICAL</option>
                    <option value="high">HIGH</option>
                    <option value="medium">MEDIUM</option>
                    <option value="low">LOW</option>
                  </select>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Opsi Tambahan</label>
                  <div className="flex gap-4">
                    <select 
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="flex-1 px-6 py-4 bg-gray-50/50 border-2 border-transparent hover:border-gray-100 focus:bg-white focus:border-blue-500 rounded-[28px] text-sm font-medium outline-none transition-all"
                    >
                      <option value="all">SEMUA STATUS</option>
                      <option value="pending">PENDING</option>
                      <option value="approved">DITANGANI</option>
                      <option value="completed">SELESAI</option>
                    </select>
                    <button 
                      onClick={handleFilterChange}
                      className="px-10 py-4 bg-blue-600 text-white rounded-[28px] text-xs font-bold tracking-widest hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all shadow-lg"
                    >
                      FILTER
                    </button>
                  </div>
                </div>
             </div>
          </div>

          {/* 3. Unified Navigation Tabs */}
          <div className="flex items-center gap-2 mb-10 bg-gray-100/40 p-2 rounded-[32px] w-full border border-gray-100 overflow-x-auto no-scrollbar">
            {[
              { id: 'new', label: 'Laporan Baru', count: stats.pending, active: 'bg-rose-500 text-white', inactive: 'text-rose-500 hover:bg-rose-50', badge: 'bg-rose-100 text-rose-600' },
              { id: 'today', label: 'Agenda Hari Ini', count: stats.today, active: 'bg-indigo-500 text-white', inactive: 'text-indigo-500 hover:bg-indigo-50', badge: 'bg-indigo-100 text-indigo-600' },
              { id: 'upcoming', label: 'Jadwal Mendatang', count: stats.upcoming, active: 'bg-blue-500 text-white', inactive: 'text-blue-500 hover:bg-blue-50', badge: 'bg-blue-100 text-blue-600' },
              { id: 'active', label: 'Dalam Penanganan', count: stats.approved, active: 'bg-emerald-500 text-white', inactive: 'text-emerald-500 hover:bg-emerald-50', badge: 'bg-emerald-100 text-emerald-600' },
              { id: 'archive', label: 'Arsip & Riwayat', count: stats.archived, active: 'bg-gray-600 text-white', inactive: 'text-gray-500 hover:bg-gray-100', badge: 'bg-gray-200 text-gray-600' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[180px] px-6 py-4 rounded-[28px] text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-3 ${
                  activeTab === tab.id ? `${tab.active} shadow-xl scale-100` : `${tab.inactive}`
                }`}
              >
                {tab.label}
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : `${tab.badge}`
                }`}>
                  {tab.count || 0}
                </span>
              </button>
            ))}
          </div>

          {/* 4. Data Listing */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Menghubungkan ke pusat data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-40 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
               <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 text-gray-200">
                 <FiFileText size={48} />
               </div>
               <h3 className="text-xl font-bold text-gray-900">Belum Ada Kasus</h3>
               <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">Data yang Anda cari tidak ditemukan atau kriteria filter tidak sesuai.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
              {data.map((item) => {
                const isReport = activeTab === 'new' || activeTab === 'active' || activeTab === 'archive';
                const report = isReport ? item : item.complaint;
                const schedule = isReport ? null : item;

                return (
                  <div key={item.id} className="group relative bg-white rounded-[40px] p-8 border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden">
                    {/* Urgency Ribbon */}
                    <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-[20px] text-[10px] font-bold tracking-widest uppercase border-l border-b ${getUrgencyBadge(report?.urgency_level)}`}>
                       {report?.urgency_level}
                    </div>

                    <div className="flex flex-col h-full">
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gray-50 rounded-[18px] text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <FiFileText size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">ID KASUS</p>
                          <p className="text-sm font-bold text-gray-900 tracking-tight">{report?.report_id}</p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-8">
                         <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {report?.title}
                         </h3>
                         <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed italic">
                            "{report?.description}"
                         </p>
                      </div>

                      {/* Schedule Data (Visual specific for Agenda tabs) */}
                      {!isReport && schedule && (
                         <div className="mb-8 p-6 bg-indigo-50/50 rounded-[28px] border border-indigo-100/50">
                           <div className="flex flex-wrap gap-6">
                              <div className="flex items-center gap-3">
                                <FiCalendar className="text-indigo-600" />
                                <span className="text-sm font-black text-indigo-700">{dayjs(schedule.tanggal).format('DD MMMM YYYY')}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <FiClock className="text-indigo-600" />
                                <span className="text-sm font-bold text-indigo-700">{schedule.jam_mulai?.substring(0,5)} WIB</span>
                              </div>
                           </div>
                         </div>
                      )}

                      {/* Footer Info */}
                      <div className="mt-auto grid grid-cols-2 gap-4 border-t border-gray-50 pt-8">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-gray-100 rounded-[14px] flex items-center justify-center text-gray-400"><FiUser size={16} /></div>
                           <div className="min-w-0">
                             <div className="flex items-center gap-2">
                               <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Pelapor</p>
                               {(report?.user_phone || report?.user_phone) && (
                                 <a 
                                   href={`https://wa.me/${(report?.user_phone || '').replace(/^0/, '62')}?text=${encodeURIComponent(
                                     `Halo ${report?.user_name || 'Pelapor'}, kami dari Satgas PPKPT Polije ingin menginformasikan bahwa laporan Anda (${report?.report_id}) sedang dalam penanganan. Mohon kesediaannya untuk tetap aktif berkoordinasi. Terima kasih.`
                                   )}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   title="Chat WhatsApp"
                                   className="text-[10px] text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full"
                                 >
                                   <FiMessageSquare size={10} />
                                   HUBUNGI
                                 </a>
                               )}
                             </div>
                             <p className="text-xs font-bold text-gray-900 truncate">
                               {report?.user_name || report?.guest_name || report?.user?.name || 'Anonim'}
                             </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-gray-100 rounded-[14px] flex items-center justify-center text-gray-400"><FiUsers size={16} /></div>
                           <div className="min-w-0">
                             <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Konselor</p>
                             <p className="text-xs font-bold text-gray-900 truncate">
                               {report?.counselor_name || report?.counselor?.name || 'Belum diplot'}
                             </p>
                           </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-8 flex gap-3">
                        <button 
                           onClick={() => navigate(`/operator/complaint-detail/${report?.id || item?.complaint_id}`)}
                           className="flex-1 py-4 bg-gray-900 text-white rounded-[24px] text-[10px] font-bold tracking-[0.1em] uppercase hover:bg-blue-600 shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                           <FiEye /> DETAIL LENGKAP
                        </button>
                        
                        {activeTab === 'new' ? (
                          <div className="flex gap-2">
                            <button 
                               onClick={() => handleQuickApprove(report)}
                               title="Setujui Laporan"
                               className="p-4 bg-emerald-100 text-emerald-700 rounded-[22px] hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                            >
                               <FiCheck size={18} />
                            </button>
                            <button 
                               onClick={() => setStatusModal({ 
                                 open: true, complaint: report, status: 'rejected', rejection_reason: '', isRejectOnly: true 
                               })}
                               title="Tolak Laporan"
                               className="p-4 bg-rose-100 text-rose-700 rounded-[22px] hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"
                            >
                               <FiX size={18} />
                            </button>
                            <button 
                               onClick={() => setScheduleModal({ 
                                 open: true, 
                                 complaint: report, 
                                 counselor_id: report.counselor_id || '', 
                                 counseling_schedule: report.counseling_schedule ? dayjs(report.counseling_schedule).format('YYYY-MM-DDTHH:mm') : '' 
                               })}
                               title="Konfirmasi/Ubah Plotting"
                               className="p-4 bg-blue-50 text-blue-600 rounded-[22px] hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                            >
                               <FiEdit size={18} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setStatusModal({ open: true, complaint: report, status: report.status })}
                            className="p-4 bg-gray-100 text-gray-600 rounded-[20px] hover:bg-gray-200 transition-all"
                          >
                             <FiMoreVertical size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && pagination.last_page > 1 && (
            <div className="flex justify-center mt-12 pb-10">
              <div className="flex items-center gap-2 bg-white/50 p-2 rounded-[28px] border border-gray-100 shadow-sm">
                <button
                  onClick={() => fetchData(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="p-4 bg-white border border-gray-100 rounded-[22px] text-gray-900 hover:bg-blue-600 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all shadow-sm"
                >
                  <FiChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 px-6">
                  <span className="text-sm font-black text-gray-900">{pagination.current_page}</span>
                  <span className="text-sm font-bold text-gray-300">/</span>
                  <span className="text-sm font-bold text-gray-400">{pagination.last_page}</span>
                </div>
                <button
                  onClick={() => fetchData(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="p-4 bg-white border border-gray-100 rounded-[22px] text-gray-900 hover:bg-blue-600 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all shadow-sm"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* RENDER MODALS (Status and Schedule) - Simplified for brevity but fully functional */}
      {statusModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setStatusModal({ open: false, complaint: null })} />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-200">
             <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center uppercase tracking-tight">
               {statusModal.isRejectOnly ? 'Tolak Laporan' : 'Perbarui Status'}
             </h3>
             <p className="text-gray-400 text-[10px] font-bold text-center mb-8 tracking-widest">{statusModal.complaint?.report_id}</p>
             
             {!statusModal.isRejectOnly && (
               <select 
                 value={statusModal.status} 
                 onChange={e => setStatusModal(p => ({...p, status: e.target.value}))}
                 className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-[28px] outline-none mb-4 font-bold text-sm"
               >
                  <option value="pending">PENDING (MASUK BARU)</option>
                  <option value="approved">APPROVED (DITANGANI)</option>
                  <option value="completed">COMPLETED (SELESAI)</option>
                  <option value="rejected">REJECTED (DITOLAK)</option>
               </select>
             )}

             {(statusModal.status === 'rejected' || statusModal.isRejectOnly) && (
               <div className="space-y-2 mb-8">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Alasan Penolakan</label>
                <textarea 
                   placeholder="Berikan alasan mengapa laporan ini ditolak..."
                   value={statusModal.rejection_reason}
                   onChange={e => setStatusModal(p => ({...p, rejection_reason: e.target.value}))}
                   className="w-full px-6 py-4 bg-gray-50 rounded-[28px] min-h-[120px] outline-none focus:ring-2 ring-rose-100 text-sm font-medium"
                />
               </div>
             )}
             
             <div className="flex gap-3">
                <button 
                  onClick={() => setStatusModal({ open: false })} 
                  className="flex-1 py-4 border-2 border-gray-100 text-gray-400 font-bold rounded-[22px] text-xs"
                >
                  BATAL
                </button>
                <button 
                  onClick={submitStatus} 
                  className={`flex-1 py-4 text-white font-bold rounded-[22px] text-xs shadow-xl transition-all ${
                    statusModal.isRejectOnly ? 'bg-rose-600 shadow-rose-500/20' : 'bg-blue-600 shadow-blue-500/20'
                  }`}
                >
                  {isSubmitting ? '...' : statusModal.isRejectOnly ? 'TOLAK SEKARANG' : 'SIMPAN PERUBAHAN'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Schedule Modal Integration */}
      {scheduleModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setScheduleModal({ open: false, complaint: null })} />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-12 animate-in zoom-in-95 duration-200">
            <h3 className="text-3xl font-black text-gray-900 mb-2 text-center uppercase tracking-tighter">Konfirmasi & Plotting</h3>
            <p className="text-gray-400 text-xs font-bold text-center mb-10 tracking-widest">{scheduleModal.complaint?.report_id}</p>

            <div className="space-y-6 mb-10">
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2 block">Pilih Konselor Ahli</label>
                  <select 
                    value={scheduleModal.counselor_id}
                    onChange={e => setScheduleModal(p => ({...p, counselor_id: e.target.value}))}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-[28px] outline-none text-sm font-bold"
                  >
                    <option value="">-- TANPA KONSELOR --</option>
                    {counselors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>

               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2 block">Jadwal Sesi Pertama</label>
                  <input 
                    type="datetime-local"
                    value={scheduleModal.counseling_schedule}
                    onChange={e => setScheduleModal(p => ({...p, counseling_schedule: e.target.value}))}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-[28px] outline-none text-sm font-bold"
                  />
               </div>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setScheduleModal({ open: false })} className="flex-1 py-5 border-2 border-gray-100 text-gray-400 font-black rounded-[32px] tracking-widest text-xs">ABORT</button>
               <button onClick={submitSchedule} className="flex-[2] py-5 bg-purple-600 text-white font-black rounded-[32px] shadow-2xl shadow-purple-500/20 tracking-widest text-xs hover:bg-purple-700">{isSubmitting ? 'PROCESSING...' : 'APPROVE & PLOT'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setExportModal({ ...exportModal, open: false })} />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
               <FiDownload className="text-emerald-600" size={32} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Ekspor Laporan Excel</h3>
             <p className="text-gray-500 text-sm mb-8 text-center px-4">Pilih parameter untuk mengunduh data dalam format CSV (Kompatibel Excel).</p>

             <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Dari Tanggal</label>
                      <input type="date" value={exportModal.date_from} onChange={e => setExportModal({...exportModal, date_from: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Sampai Tanggal</label>
                      <input type="date" value={exportModal.date_to} onChange={e => setExportModal({...exportModal, date_to: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Filter Status</label>
                   <select value={exportModal.status} onChange={e => setExportModal({...exportModal, status: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold">
                      <option value="all">SEMUA STATUS</option>
                      <option value="pending">PENDING</option>
                      <option value="approved">DITANGANI</option>
                      <option value="completed">SELESAI</option>
                      <option value="rejected">DITOLAK</option>
                   </select>
                </div>
             </div>

             <div className="flex gap-3">
                <button onClick={() => setExportModal({ ...exportModal, open: false })} className="flex-1 py-4 border border-gray-100 text-gray-400 font-bold rounded-2xl text-xs tracking-widest">BATAL</button>
                <button onClick={handleExport} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl text-xs tracking-widest shadow-lg shadow-emerald-500/20">UNDUH EXCEL</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CaseManagementPage;
