import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUser, FiVideo, FiMapPin,
  FiCheck, FiX, FiLoader, FiAlertCircle, FiSearch,
  FiFilter, FiChevronLeft, FiChevronRight, FiEdit,
  FiEye, FiMail, FiCheckCircle, FiXCircle, FiRefreshCw,
  FiBarChart2, FiUsers
} from 'react-icons/fi';
import counselingService from '../../services/counselingService';
import { useAuth } from '../../hooks/useAuth';

const CounselorCounselingDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
  const [detailModal, setDetailModal] = useState({ open: false, schedule: null });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    upcoming: 0,
  });

  // Load data on component mount
  useEffect(() => {
    fetchSchedules();
  }, []);

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
        setSchedules(response.data.data);
        setPagination(response.data.meta);
        setStats(response.data.stats || stats);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Konseling</h1>
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
                  Menampilkan {schedules.length} dari {pagination.total} jadwal
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mahasiswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal & Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.map((schedule) => (
                    <motion.tr
                      key={schedule.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <FiUser className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{schedule.user?.name || 'Mahasiswa'}</p>
                            <p className="text-sm text-gray-500">{schedule.user?.nim || 'NIM tidak tersedia'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(schedule.tanggal)}</p>
                          <p className="text-sm text-gray-500">
                            {formatTime(schedule.waktu_mulai)} - {formatTime(schedule.waktu_selesai)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {schedule.metode === 'online' ? (
                            <FiVideo className="w-5 h-5 text-blue-500" />
                          ) : (
                            <FiMapPin className="w-5 h-5 text-green-500" />
                          )}
                          <span className="font-medium">{getMethodLabel(schedule.metode)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(schedule.status)}`}>
                          {getStatusLabel(schedule.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDetailModal({ open: true, schedule })}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                          >
                            <FiEye className="w-4 h-4" />
                            Detail
                          </button>
                          
                          {schedule.status === 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(schedule.id, 'completed')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
                            >
                              <FiCheck className="w-4 h-4" />
                              Selesai
                            </button>
                          )}
                          
                          {(schedule.status === 'pending' || schedule.status === 'approved') && (
                            <button
                              onClick={() => handleStatusUpdate(schedule.id, 'cancelled')}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                            >
                              <FiX className="w-4 h-4" />
                              Batalkan
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
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
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
                      pagination.current_page === 1
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
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            pagination.current_page === pageNum
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
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
                      pagination.current_page === pagination.last_page
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

        {/* Detail Modal */}
        <AnimatePresence>
          {detailModal.open && detailModal.schedule && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setDetailModal({ open: false, schedule: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Detail Konseling</h3>
                    <button
                      onClick={() => setDetailModal({ open: false, schedule: null })}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{detailModal.schedule.user?.name || 'Mahasiswa'}</p>
                        <p className="text-sm text-gray-500">{detailModal.schedule.user?.nim || 'NIM tidak tersedia'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Tanggal</p>
                        <p className="font-medium">{formatDate(detailModal.schedule.tanggal)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Waktu</p>
                        <p className="font-medium">
                          {formatTime(detailModal.schedule.waktu_mulai)} - {formatTime(detailModal.schedule.waktu_selesai)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Metode</p>
                        <div className="flex items-center gap-2">
                          {detailModal.schedule.metode === 'online' ? (
                            <FiVideo className="w-5 h-5 text-blue-500" />
                          ) : (
                            <FiMapPin className="w-5 h-5 text-green-500" />
                          )}
                          <span className="font-medium">{getMethodLabel(detailModal.schedule.metode)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(detailModal.schedule.status)}`}>
                          {getStatusLabel(detailModal.schedule.status)}
                        </span>
                      </div>
                    </div>
                    
                    {detailModal.schedule.keluhan && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Keluhan</p>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {detailModal.schedule.keluhan}
                        </p>
                      </div>
                    )}
                    
                    {detailModal.schedule.catatan && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Catatan</p>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {detailModal.schedule.catatan}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => setDetailModal({ open: false, schedule: null })}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CounselorCounselingDashboard;
