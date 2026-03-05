import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUser, FiVideo, FiMapPin,
  FiCheck, FiX, FiLoader, FiAlertCircle, FiSearch,
  FiFilter, FiChevronLeft, FiChevronRight, FiEdit,
  FiEye, FiMail, FiCheckCircle, FiXCircle, FiRefreshCw,
  FiBarChart2, FiUsers, FiFileText, FiExternalLink
} from 'react-icons/fi';
import counselingService from '../../services/counselingService';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import axios from '../../api/axios';

const CounselorCounselingDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Data state
  const [schedules, setSchedules] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal state
  const [detailModal, setDetailModal] = useState({ open: false, schedule: null, loading: false });
  const [stats, setStats] = useState({
    total: 0, pending: 0, approved: 0, completed: 0, cancelled: 0, today: 0, upcoming: 0,
  });

  // Open detail modal with full data from API
  const openDetailModal = async (schedule) => {
    setDetailModal({ open: true, schedule, loading: true });
    try {
      const res = await axios.get(`/konselor/jadwal/${schedule.id}`);
      if (res.data.success) {
        setDetailModal({ open: true, schedule: res.data.data, loading: false });
      } else {
        setDetailModal({ open: true, schedule, loading: false });
      }
    } catch {
      setDetailModal({ open: true, schedule, loading: false });
    }
  };

  // Navigate to complaint detail page (full view like Manajemen Pengaduan)
  const goToComplaintDetail = async (schedule) => {
    if (schedule.complaint_id) {
      navigate(`/konselor/complaint-detail/${schedule.complaint_id}`);
      return;
    }
    // Fetch to get complaint id if not directly available
    try {
      const res = await axios.get(`/konselor/jadwal/${schedule.id}`);
      if (res.data.success && res.data.data.complaint?.id) {
        navigate(`/konselor/complaint-detail/${res.data.data.complaint.id}`);
      }
    } catch {
      console.error('Gagal membuka detail aduan');
    }
  };


  // Load data on component mount
  useEffect(() => {
    fetchSchedules();
    fetchStatistics();
  }, []);

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await counselingService.getStatistics();
      if (response.success) {
        setStats(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Fetch schedules with filters
  const fetchSchedules = async (page = 1) => {
    try {
      setIsLoading(true);
      setError('');

      const params = {
        page,
        per_page: pagination.per_page,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        metode: methodFilter !== 'all' ? methodFilter : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };

      const response = await counselingService.getCounselorSchedules(params);

      if (response.success) {
        setSchedules(response.data.data || []);
        setPagination(response.data.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        });
        setStats(response.data.stats || {
          total: 0,
          pending: 0,
          approved: 0,
          completed: 0,
          cancelled: 0,
          today: 0,
          upcoming: 0,
        });
      } else {
        setError(response.message || 'Gagal memuat data jadwal');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data jadwal');
      console.error('Error fetching schedules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    fetchSchedules(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMethodFilter('all');
    setDateFrom('');
    setDateTo('');
    fetchSchedules(1);
  };

  // Handle status update
  const handleStatusUpdate = async (scheduleId, status) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await counselingService.updateStatus(scheduleId, { status });

      if (response.success) {
        setSuccess(`Status jadwal berhasil diubah menjadi ${status === 'completed' ? 'selesai' : 'dibatalkan'}!`);
        fetchSchedules(pagination.current_page);
      } else {
        setError(response.message || 'Gagal mengubah status jadwal');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengubah status');
      console.error('Error updating status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  // Get method label
  const getMethodLabel = (method) => {
    return method === 'online' ? 'Online' : 'Offline';
  };

  // Check if schedule is today
  const isToday = (dateString) => {
    const today = new Date().toDateString();
    const scheduleDate = new Date(dateString).toDateString();
    return today === scheduleDate;
  };

  // Check if schedule is upcoming (future)
  const isUpcoming = (dateString) => {
    const today = new Date();
    const scheduleDate = new Date(dateString);
    return scheduleDate > today;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar dengan gradient ungu */}
      <div
        className="fixed inset-y-0 left-0 z-30"
        style={{
          background: 'linear-gradient(180deg, #4C1D95 0%, #6D28D9 100%)'
        }}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          toggleCollapse={toggleSidebar}
        />
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Jadwal</h1>
                  <p className="text-gray-600">
                    Selamat datang, {user?.name || 'Konselor'}! Kelola jadwal konseling Anda
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.name || 'Konselor'}</p>
                    <p className="text-sm text-gray-500">Konselor</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                  <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                    <FiX className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
                >
                  <FiCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-green-700 font-medium">{success}</p>
                  </div>
                  <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
                    <FiX className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-6">
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

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Hari Ini</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.today}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiCalendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">Sesi konseling hari ini</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Akan Datang</p>
                    <p className="text-3xl font-bold text-green-600">{stats.upcoming}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FiClock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">Sesi mendatang</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-4">
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

              <div className="bg-white rounded-xl shadow p-4">
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

              <div className="bg-white rounded-xl shadow p-4">
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

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Jadwal Konseling Saya</h2>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Reset Filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cari Mahasiswa
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama mahasiswa..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                {/* Method Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode
                  </label>
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Metode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Apply Filter Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleFilterChange}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FiFilter className="w-4 h-4" />
                  Terapkan Filter
                </button>
              </div>
            </div>

            {/* Schedules Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Jadwal Konseling</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Menampilkan {schedules.length} dari {pagination?.total || 0} jadwal
                    </span>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <FiLoader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600">Memuat data jadwal...</p>
                </div>
              ) : schedules.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <FiCalendar className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Tidak ada jadwal konseling</p>
                  <p className="text-gray-400">Tidak ada jadwal yang sesuai dengan filter yang dipilih</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {schedules.map((schedule) => (
                      <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        className="bg-white border border-gray-100 rounded-[26px] p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden"
                      >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Header: User & Status */}
                        <div className="flex justify-between items-start mb-5 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[18px] bg-blue-50/80 flex items-center justify-center text-blue-600 shrink-0">
                              <FiUser size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {schedule.user?.name || 'Mahasiswa'}
                              </h4>
                              <p className="text-xs font-semibold text-gray-400 mt-0.5 tracking-wide">
                                {schedule.user?.nim || 'NIM Tidak Ada'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${getStatusBadge(schedule.status)}`}>
                            {getStatusLabel(schedule.status)}
                          </span>
                        </div>

                        {/* Details grid */}
                        <div className="bg-gray-50/50 rounded-2xl p-4 space-y-3 mb-5 flex-1 border border-gray-100">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                              <FiCalendar className="text-blue-500" size={14} />
                            </div>
                            <span className="font-medium text-gray-700">{formatDate(schedule.tanggal)}</span>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                              <FiClock className="text-amber-500" size={14} />
                            </div>
                            <span className="font-medium text-gray-700">
                              {formatTime(schedule.jam_mulai)} - {formatTime(schedule.jam_selesai)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                              {schedule.metode === 'online' ? (
                                <FiVideo className="text-purple-500" size={14} />
                              ) : (
                                <FiMapPin className="text-emerald-500" size={14} />
                              )}
                            </div>
                            <span className="font-medium text-gray-700 capitalize">{getMethodLabel(schedule.metode)}</span>
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="grid grid-cols-2 gap-2 mt-auto">
                          <button
                            onClick={() => openDetailModal(schedule)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50/50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-colors font-semibold text-sm"
                          >
                            <FiEye size={16} />
                            Detail
                          </button>

                          {schedule.complaint_id ? (
                            <button
                              onClick={() => goToComplaintDetail(schedule)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-50/50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl transition-colors font-semibold text-sm"
                            >
                              <FiFileText size={16} />
                              Aduan
                            </button>
                          ) : (
                            <div className="w-full py-2.5 bg-gray-50 text-gray-400 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-1.5 cursor-not-allowed">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                              Reguler
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Halaman {pagination.current_page} dari {pagination.last_page}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchSchedules(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className={`px-3 py-1 rounded-lg flex items-center gap-1 ${pagination.current_page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        <FiChevronLeft className="w-4 h-4" />
                        Sebelumnya
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                          let pageNum;
                          if (pagination.last_page <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.current_page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.current_page >= pagination.last_page - 2) {
                            pageNum = pagination.last_page - 4 + i;
                          } else {
                            pageNum = pagination.current_page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => fetchSchedules(pageNum)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${pagination.current_page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => fetchSchedules(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className={`px-3 py-1 rounded-lg flex items-center gap-1 ${pagination.current_page === pagination.last_page
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Selanjutnya
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Detail Modal (identik dengan Operator) ─────────────────── */}
            {detailModal.open && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setDetailModal({ open: false, schedule: null, loading: false })} />
                <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                  <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Detail Konseling</h3>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 block">ID: #{detailModal.schedule?.id}</span>
                    </div>
                    <button onClick={() => setDetailModal({ open: false, schedule: null, loading: false })}
                      className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all active:scale-95">
                      <FiX size={24} />
                    </button>
                  </div>
                  <div className="p-10 overflow-y-auto space-y-8">
                    {detailModal.loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2"><FiUser size={12} /> Mahasiswa</p>
                              <p className="text-lg font-black text-gray-900">{detailModal.schedule?.user?.name || 'N/A'}</p>
                              {detailModal.schedule?.user?.nim && <p className="text-xs text-gray-500 mt-1">NIM: {detailModal.schedule.user.nim}</p>}
                              <p className="text-xs font-medium text-blue-600 mt-2 flex items-center gap-2"><FiMail size={14} /> {detailModal.schedule?.user?.email || '-'}</p>
                            </div>
                            <div className="p-6 bg-slate-50/50 rounded-3xl border border-gray-100">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FiUser size={12} /> Konselor Bertugas</p>
                              <p className="text-base font-bold text-gray-900">{detailModal.schedule?.counselor?.name || 'Saya'}</p>
                              <p className="text-xs font-medium text-gray-500 mt-1 italic">{detailModal.schedule?.counselor?.email || ''}</p>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Waktu Terjadwal</p>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-indigo-500"><FiCalendar size={14} /></div>
                                  {detailModal.schedule?.tanggal ? formatDate(detailModal.schedule.tanggal) : '-'}
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-amber-500"><FiClock size={14} /></div>
                                  {formatTime(detailModal.schedule?.jam_mulai)} - {formatTime(detailModal.schedule?.jam_selesai)} WIB
                                </div>
                              </div>
                            </div>
                            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Status</p>
                                <span className={`inline-flex px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${getStatusBadge(detailModal.schedule?.status)}`}>
                                  {getStatusLabel(detailModal.schedule?.status)}
                                </span>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Metode</p>
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black ${detailModal.schedule?.metode === 'online' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                  {detailModal.schedule?.metode === 'online' ? <FiVideo size={14} /> : <FiMapPin size={14} />}
                                  {detailModal.schedule?.metode === 'online' ? 'Online' : 'Offline / Tatap Muka'}
                                </span>
                              </div>
                              {detailModal.schedule?.metode === 'offline' && detailModal.schedule?.lokasi && (
                                <div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Lokasi</p>
                                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><FiMapPin size={14} className="text-emerald-500" />{detailModal.schedule.lokasi}</p>
                                </div>
                              )}
                              {detailModal.schedule?.metode === 'online' && detailModal.schedule?.meeting_link && (
                                <div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Link Meeting</p>
                                  <a href={detailModal.schedule.meeting_link} target="_blank" rel="noopener noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-2">
                                    <FiExternalLink size={14} /> Buka Link
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {detailModal.schedule?.alasan_penolakan && (
                          <div className="p-6 bg-rose-50 rounded-[32px] border border-rose-100">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-2"><FiXCircle size={14} /> Catatan Penolakan</p>
                            <p className="text-sm font-medium text-rose-900 leading-relaxed italic">"{detailModal.schedule.alasan_penolakan}"</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="p-10 bg-gray-50/50 border-t border-gray-100">
                    <button onClick={() => setDetailModal({ open: false, schedule: null, loading: false })}
                      className="w-full py-4 bg-white border border-gray-200 text-gray-900 rounded-[24px] text-sm font-black hover:bg-gray-50 transition-all shadow-sm active:scale-95">TUTUP</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CounselorCounselingDashboard;
