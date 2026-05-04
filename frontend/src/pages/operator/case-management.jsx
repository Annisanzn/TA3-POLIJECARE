import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiCalendar, FiClock, FiFileText,
  FiCheckCircle, FiXCircle, FiEye, FiEdit, FiBarChart2,
  FiChevronLeft, FiChevronRight, FiUsers, FiMapPin, FiDownload,
  FiAlertCircle, FiX, FiCheck, FiMoreVertical, FiTrendingUp,
  FiRefreshCw, FiUser, FiMessageSquare, FiMenu, FiPlus,
  FiVideo, FiMail, FiSmartphone, FiHash, FiShield, FiSave, FiLoader
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import axios from '../../api/axios';
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
      toast.type === 'success' 
        ? 'bg-emerald-50/90 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-100' 
        : 'bg-rose-50/90 dark:bg-rose-900/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-100'
    }`}>
      {toast.type === 'success' ? <FiCheckCircle className="shrink-0" /> : <FiAlertCircle className="shrink-0" />}
      <span className="text-sm font-bold">{toast.message}</span>
    </div>
  );
};

/* ── Unified Case Management Component ─────────────────────────────────────── */
const CaseManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'new';
  
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ 
    total: 0, pending: 0, approved: 0, completed: 0, rejected: 0,
    today: 0, upcoming: 0, archived: 0
  });

  const [activeTab, setActiveTab] = useState(initialTab);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  
  const [statusModal, setStatusModal] = useState({ 
    open: false, complaint: null, status: 'pending', rejection_reason: '', isRejectOnly: false 
  });
  const [scheduleModal, setScheduleModal] = useState({ 
    open: false, complaint: null, counselor_id: '', counseling_schedule: '' 
  });
  const [exportModal, setExportModal] = useState({ 
    open: false, date_from: '', date_to: '', status: 'all' 
  });
  const [counselors, setCounselors] = useState([]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

      let endpoint = '/operator/complaints';
      let params = { page, search: searchQuery, per_page: 8 };

      switch (activeTab) {
        case 'new': params.status = 'pending'; break;
        case 'today':
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
        case 'active': params.status = 'approved'; break;
        case 'archive': params.status = statusFilter !== 'all' ? statusFilter : 'completed,rejected,cancelled'; break;
        default: break;
      }

      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (urgencyFilter !== 'all') params.urgency_level = urgencyFilter;

      const res = await axios.get(endpoint, { params });
      
      if (endpoint === '/operator/complaints') {
        setData(res.data.data || []);
        setPagination({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total });
      } else {
        setData(res.data.data.data || res.data.data || []);
        setPagination({ 
          current_page: res.data.data?.current_page || 1, 
          last_page: res.data.data?.last_page || 1, 
          total: res.data.data?.total || 0 
        });
      }

      const statsRes = await axios.get('/counseling/statistics');
      const compStatsRes = await axios.get('/operator/complaints-stats');
      
      setStats({
        ...statsRes.data.data,
        pending: compStatsRes.data.data.pending,
        archived: compStatsRes.data.data.archived,
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
    setSearchParams({ tab: activeTab });
    axios.get('/operator/counseling/counselors').then(res => setCounselors(res.data.data || []));
  }, [activeTab, searchQuery, urgencyFilter]);

  const handleFilterChange = (e) => { e.preventDefault(); fetchData(1); };
  const handleReset = () => {
    setSearchQuery(''); setDateFrom(''); setDateTo(''); setStatusFilter('all'); setUrgencyFilter('all');
    fetchData(1);
  };

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
      showToast('Mohon pilih konselor dan jadwal', 'error'); return;
    }
    setIsSubmitting(true);
    try {
      await axios.patch(`/operator/complaints/${scheduleModal.complaint.id}/schedule`, {
        counselor_id: scheduleModal.counselor_id,
        counseling_schedule: scheduleModal.counseling_schedule
      });
      showToast('Jadwal berhasil di-approve');
      setScheduleModal({ open: false, complaint: null, counselor_id: '', counseling_schedule: '' });
      fetchData(pagination.current_page);
    } catch (err) {
      showToast('Gagal memproses jadwal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickApprove = async (report) => {
    if (report.counselor_id && report.counseling_schedule) {
      setIsSubmitting(true);
      try {
        await axios.patch(`/operator/complaints/${report.id}/status`, { status: 'approved' });
        showToast('Laporan disetujui');
        fetchData(pagination.current_page);
      } catch (err) {
        showToast('Gagal menyetujui', 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setScheduleModal({ 
        open: true, 
        complaint: report, 
        counselor_id: report.counselor_id || '', 
        counseling_schedule: report.counseling_schedule ? dayjs(report.counseling_schedule).format('YYYY-MM-DDTHH:mm') : '' 
      });
    }
  };

  const handleExport = async () => {
    setIsSubmitting(true);
    try {
      const params = {};
      if (exportModal.date_from) params.date_from = exportModal.date_from;
      if (exportModal.date_to) params.date_to = exportModal.date_to;
      if (exportModal.status !== 'all') params.status = exportModal.status;
      const response = await axios.get('/operator/complaints/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-${dayjs().format('YYYYMMDD')}.csv`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      showToast('Ekspor berhasil');
      setExportModal({ ...exportModal, open: false });
    } catch (err) {
      showToast('Gagal ekspor', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyBadge = (level) => {
    const maps = {
      'critical': 'bg-rose-500 text-white border-rose-600',
      'high': 'bg-orange-500 text-white border-orange-600',
      'medium': 'bg-amber-500 text-white border-amber-600',
      'low': 'bg-blue-500 text-white border-blue-600'
    };
    return maps[level?.toLowerCase()] || 'bg-slate-500 text-white border-slate-600';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-['Poppins'] overflow-hidden transition-colors duration-500">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
      
      <div className="flex-none h-full overflow-y-auto no-scrollbar border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all">
        <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Toast toast={toast} onClose={() => setToast(null)} />

        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-4 md:px-8 py-4 md:py-6 shrink-0 z-30 transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={toggleSidebar} className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl lg:hidden hover:bg-gray-50 dark:hover:bg-slate-700">
                <FiMenu size={20} className="dark:text-white" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <FiFileText className="text-indigo-600 shrink-0" /> Manajemen Kasus
                </h1>
                <p className="text-slate-500 text-[11px] font-medium tracking-wide">Pusat Kendali Pengaduan PolijeCare</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button onClick={() => navigate('/operator/manual-counseling')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-semibold shadow-xl shadow-indigo-100 active:scale-95 hover:bg-indigo-700 transition-all">
                <FiPlus size={18} /> <span className="hidden sm:inline">Input Manual</span>
              </button>
              <button onClick={() => setExportModal({ ...exportModal, open: true })} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-semibold shadow-xl shadow-emerald-100 active:scale-95 hover:bg-emerald-700 transition-all">
                <FiDownload size={18} /> <span className="hidden sm:inline">Ekspor</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 scroll-smooth custom-scrollbar transition-all">
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="bg-white dark:bg-slate-900 px-8 py-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-8 group hover:shadow-xl transition-all">
               <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-[1.25rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                  <FiBarChart2 size={28} />
               </div>
               <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wide mb-1">Total Kasus</span>
                  <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">{stats.total || 0}</span>
               </div>
               <div className="h-12 w-[1px] bg-slate-100 dark:bg-slate-800" />
               <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wide mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Online</span>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 px-6 py-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 flex items-center gap-5 shadow-sm hover:shadow-lg transition-all">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-600 dark:text-rose-400"><FiTrendingUp size={22} /></div>
                <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Butuh Atensi</span>
                    <span className="text-2xl font-bold text-slate-900 leading-none">{stats.pending || 0}</span>
                </div>
            </div>
          </div>

          {/* POIN 7: Text Field Bagus di Dark Mode */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 dark:border-slate-800 transition-all">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Cari Laporan</label>
                  <div className="relative group">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input type="text" placeholder="Masukkan ID / Judul..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-[1.5rem] text-sm font-bold text-slate-900 dark:text-white outline-none transition-all shadow-inner" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Urgensi</label>
                  <div className="relative">
                    <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-[1.5rem] text-xs font-bold text-slate-800 outline-none transition-all appearance-none cursor-pointer shadow-inner">
                      <option value="all">-- Semua Urgensi --</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><FiFilter size={14} /></div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Kategori Aksi</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-[1.5rem] text-xs font-bold text-slate-800 outline-none appearance-none cursor-pointer shadow-inner">
                        <option value="all">Semua Status</option>
                        <option value="pending">Menunggu</option>
                        <option value="approved">Proses</option>
                        <option value="completed">Selesai</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><FiTrendingUp size={14} /></div>
                    </div>
                    <button onClick={handleReset} className="px-6 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-[1.5rem] hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all shadow-sm flex items-center justify-center">
                      <FiRefreshCw size={20} />
                    </button>
                  </div>
                </div>
             </div>
          </div>

          <div className="w-full overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-2 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
              {[
                { id: 'new', label: 'Laporan Baru', count: stats.pending, active: 'bg-rose-600 text-white shadow-xl shadow-rose-200 dark:shadow-rose-900/20', inactive: 'text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20', badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-100' },
                { id: 'today', label: 'Hari Ini', count: stats.today, active: 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20', inactive: 'text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20', badge: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-100' },
                { id: 'upcoming', label: 'Mendatang', count: stats.upcoming, active: 'bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/20', inactive: 'text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100' },
                { id: 'active', label: 'Penanganan', count: stats.approved, active: 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20', inactive: 'text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-100' },
                { id: 'archive', label: 'Arsip Selesai', count: stats.archived, active: 'bg-slate-800 dark:bg-slate-700 text-white shadow-xl shadow-slate-200 dark:shadow-slate-900/20', inactive: 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800', badge: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-100' }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[150px] px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 whitespace-nowrap ${
                    activeTab === tab.id ? `${tab.active}` : `${tab.inactive}`
                  }`}>
                  {tab.label}
                  <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold ${activeTab === tab.id ? 'bg-white/20 text-white' : tab.badge}`}>
                    {tab.count || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pb-20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="w-16 h-16 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin shadow-lg" />
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-widest animate-pulse">Sinkronisasi Data...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-all">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiFileText size={48} className="text-slate-200 dark:text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Data Kosong</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-widest mt-2">Tidak ada laporan dalam kategori ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {data.map((item) => {
                  const isReport = activeTab === 'new' || activeTab === 'active' || activeTab === 'archive';
                  const report = isReport ? item : item.complaint;
                  const counselorName = isReport 
                    ? (item.counselor?.name || item.counselor_name || report?.counselor?.name || report?.counselor_name) 
                    : (item.counselor?.name || item.counselor_name || item.complaint?.counselor?.name || item.complaint?.counselor_name);

                  return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={item.id} 
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group relative overflow-hidden flex flex-col h-full">
                      
                      <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-[1.5rem] text-[10px] font-bold tracking-widest border-l border-b border-white/10 shadow-sm ${getUrgencyBadge(report?.urgency_level)}`}>
                        {report?.urgency_level}
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner group-hover:shadow-indigo-500/50">
                            <FiFileText size={22} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 tracking-wide">Laporan ID</p>
                            <p className="text-xs font-bold text-slate-900 tracking-tight">{report?.report_id}</p>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">{report?.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-3 italic mb-8 flex-1 leading-relaxed">"{report?.description}"</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-2">Pelapor</p>
                          <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-2">
                             <FiUser size={14} className="text-indigo-500" /> {report?.user_name || report?.guest_name || 'Anonim'}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-2">Konselor</p>
                          <p className={`text-xs font-bold truncate flex items-center gap-2 ${counselorName ? 'text-slate-900' : 'text-rose-500 opacity-80'}`}>
                             <FiShield size={14} className={counselorName ? 'text-emerald-500' : 'text-rose-500'} /> {counselorName || 'Belum Diplot'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button onClick={() => navigate(`/operator/complaint-detail/${report?.id || item?.complaint_id}`)}
                          className="flex-1 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-[1.25rem] text-[10px] font-bold tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 dark:shadow-none active:scale-95">
                          <FiEye size={18} /> Detail Kasus
                        </button>
                        {activeTab === 'new' && (
                          <div className="flex gap-2.5">
                            <button onClick={() => handleQuickApprove(report)} className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-[1.25rem] border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all shadow-sm active:scale-95" title="Terima & Plot">
                                <FiCheck size={20} />
                            </button>
                            <button onClick={() => setStatusModal({ open: true, complaint: report, status: 'rejected', rejection_reason: '', isRejectOnly: true })} className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-[1.25rem] border border-rose-100 dark:border-rose-800 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all shadow-sm active:scale-95" title="Tolak Laporan">
                                <FiX size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {statusModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 dark:bg-slate-950/80 transition-all">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md p-10 overflow-hidden border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center tracking-tight">Update Status</h3>
               {!statusModal.isRejectOnly && (
                 <select value={statusModal.status} onChange={e => setStatusModal(p => ({...p, status: e.target.value}))}
                   className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 focus:border-indigo-500 rounded-2xl outline-none mb-6 font-bold text-xs tracking-widest dark:text-white">
                    <option value="pending">PENDING</option>
                    <option value="approved">APPROVED</option>
                    <option value="completed">COMPLETED</option>
                    <option value="rejected">REJECTED</option>
                 </select>
               )}
               {(statusModal.status === 'rejected' || statusModal.isRejectOnly) && (
                 <textarea placeholder="Berikan alasan penolakan yang jelas..." value={statusModal.rejection_reason} onChange={e => setStatusModal(p => ({...p, rejection_reason: e.target.value}))}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl min-h-[120px] outline-none text-sm font-semibold mb-6 dark:text-white focus:border-rose-500 transition-all" />
               )}
               <div className="flex gap-4">
                  <button onClick={() => setStatusModal({ open: false })} className="flex-1 py-4 text-slate-400 dark:text-slate-500 font-bold tracking-widest text-[10px] hover:text-slate-900 dark:hover:text-white">Batal</button>
                  <button onClick={submitStatus} className={`flex-[2] py-5 text-white font-bold rounded-full text-[10px] tracking-widest shadow-xl transition-all active:scale-95 ${statusModal.isRejectOnly ? 'bg-rose-600 shadow-rose-200 dark:shadow-none' : 'bg-indigo-600 shadow-indigo-200 dark:shadow-none'}`}>Konfirmasi</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scheduleModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 dark:bg-slate-950/80 transition-all">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-sm z-10 rounded-t-[2.5rem]" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center tracking-tight">Plotting Konselor</h3>
              <div className="space-y-6 mb-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Pilih Konselor Bertugas</label>
                    <select value={scheduleModal.counselor_id} onChange={e => setScheduleModal(p => ({...p, counselor_id: e.target.value}))}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 focus:border-indigo-500 rounded-2xl outline-none text-xs font-bold uppercase tracking-widest dark:text-white appearance-none cursor-pointer">
                    <option value="">-- Pilih Konselor --</option>
                    {counselors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Jadwal Sesi</label>
                    <input type="datetime-local" value={scheduleModal.counseling_schedule} onChange={e => setScheduleModal(p => ({...p, counseling_schedule: e.target.value}))}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl outline-none text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest focus:border-indigo-500" />
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setScheduleModal({ open: false })} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Batal</button>
                 <button onClick={submitSchedule} className="flex-[2] py-5 bg-indigo-600 text-white font-bold rounded-full text-[10px] tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all">Setujui & Plot</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exportModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 dark:bg-slate-950/80 transition-all">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-sm p-12 text-center border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
               <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Ekspor Laporan</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10 opacity-70">Pilih Parameter Data</p>
               <div className="space-y-4 mb-10">
                  <input type="date" value={exportModal.date_from} onChange={e => setExportModal({...exportModal, date_from: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-[10px] font-bold uppercase tracking-widest dark:text-white" />
                  <input type="date" value={exportModal.date_to} onChange={e => setExportModal({...exportModal, date_to: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-[10px] font-bold uppercase tracking-widest dark:text-white" />
                  <select value={exportModal.status} onChange={e => setExportModal({...exportModal, status: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-[10px] font-bold uppercase tracking-widest dark:text-white">
                     <option value="all">Semua Status</option>
                     <option value="pending">Pending</option>
                     <option value="approved">Approved</option>
                     <option value="completed">Completed</option>
                  </select>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setExportModal({ ...exportModal, open: false })} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Batal</button>
                  <button onClick={handleExport} className="flex-[2] py-5 bg-emerald-600 text-white font-bold rounded-full text-[10px] tracking-widest shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700">Unduh CSV</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CaseManagementPage;
