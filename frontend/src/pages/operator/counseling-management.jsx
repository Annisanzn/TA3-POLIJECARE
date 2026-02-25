import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUser, FiVideo, FiMapPin,
  FiCheck, FiX, FiLoader, FiAlertCircle, FiSearch,
  FiFilter, FiChevronLeft, FiChevronRight, FiEdit,
  FiEye, FiMail, FiCheckCircle, FiXCircle, FiRefreshCw
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import counselingService from '../../services/counselingService';
import { useAuth } from '../../hooks/useAuth';

const CounselingManagementPage = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [counselorFilter, setCounselorFilter] = useState('all');
  const [counselors, setCounselors] = useState([]);

  // Modal state
  const [detailModal, setDetailModal] = useState({ open: false, schedule: null });
  const [approvalModal, setApprovalModal] = useState({ open: false, schedule: null });
  const [rejectionModal, setRejectionModal] = useState({ open: false, schedule: null, reason: '' });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    cancelled: 0,
  });

  // Load data on component mount
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        await fetchSchedules();
        if (mounted) {
          await fetchCounselors();
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    // Debug log untuk modal state
    console.log('Modal states on mount:', {
      detailModal,
      approvalModal,
      rejectionModal
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch schedules with filters
  const fetchSchedules = async (page = 1) => {
    try {
      setIsLoading(true);
      setError('');

      // Real API call
      const params = {
        page,
        per_page: pagination.per_page,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        metode: methodFilter !== 'all' ? methodFilter : undefined,
        counselor_id: counselorFilter !== 'all' ? counselorFilter : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };

      console.log('Fetching schedules with params:', params);
      const response = await counselingService.getSchedules(params);
      console.log('API Response:', response);

      if (response.success) {
        setSchedules(response.data.data || []);
        setPagination(response.data.meta || {
          current_page: page,
          last_page: 1,
          per_page: pagination.per_page,
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
        setError(response.message || 'Gagal memuat data jadwal');
        // Fallback to empty data
        setSchedules([]);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data jadwal. Periksa koneksi atau login Anda.');
      console.error('Error fetching schedules:', err);
      console.error('Error details:', err.response?.data || err.message);

      // Fallback to empty data
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available counselors for filter
  const fetchCounselors = async () => {
    try {
      const response = await counselingService.getCounselors();
      if (response.success) {
        setCounselors(response.data || []);
      } else {
        console.warn('Failed to fetch counselors:', response.message);
        // Fallback to empty array
        setCounselors([]);
      }
    } catch (err) {
      console.error('Error fetching counselors:', err);

      // Fallback to empty array
      setCounselors([]);
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
    setCounselorFilter('all');
    setDateFrom('');
    setDateTo('');
    fetchSchedules(1);
  };

  // Handle schedule approval
  const handleApprove = async (scheduleId) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await counselingService.approveSchedule(scheduleId);

      if (response.success) {
        setSuccess('Jadwal berhasil disetujui!');
        fetchSchedules(pagination.current_page);
        setApprovalModal({ open: false, schedule: null });
      } else {
        setError(response.message || 'Gagal menyetujui jadwal');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyetujui jadwal');
      console.error('Error approving schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle schedule rejection
  const handleReject = async () => {
    if (!rejectionModal.reason.trim()) {
      setError('Harap isi alasan penolakan');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await counselingService.rejectSchedule(
        rejectionModal.schedule.id,
        rejectionModal.reason
      );

      if (response.success) {
        setSuccess('Jadwal berhasil ditolak!');
        fetchSchedules(pagination.current_page);
        setRejectionModal({ open: false, schedule: null, reason: '' });
      } else {
        setError(response.message || 'Gagal menolak jadwal');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menolak jadwal');
      console.error('Error rejecting schedule:', err);
    } finally {
      setIsLoading(false);
    }
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Jadwal Konseling</h1>
              <p className="text-gray-600 mt-1">Kelola semua permintaan jadwal konseling dari mahasiswa</p>
            </div>

            {/* Debug button for development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    console.log('Debug: Current state', { isLoading, schedules: schedules.length, counselors: counselors.length });
                    if (isLoading) {
                      console.log('Debug: Force stopping loading');
                      setIsLoading(false);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  Debug Loading
                </button>
                <button
                  onClick={() => {
                    console.log('Debug: Refreshing data');
                    fetchSchedules();
                    fetchCounselors();
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-auto">
          <div className="max-w-7xl mx-auto">

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Menunggu</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Disetujui</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ditolak</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <FiXCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Selesai</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiCheck className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Dibatalkan</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiX className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Filter & Pencarian</h2>
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
                    Cari
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama mahasiswa/konselor..."
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
                    <option value="rejected">Ditolak</option>
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

                {/* Counselor Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konselor
                  </label>
                  <select
                    value={counselorFilter}
                    onChange={(e) => setCounselorFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Konselor</option>
                    {counselors.map((counselor) => (
                      <option key={counselor.id} value={counselor.id}>
                        {counselor.name}
                      </option>
                    ))}
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

                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
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
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Daftar Jadwal Konseling</h2>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">
                  <FiLoader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Memuat data jadwal...</p>
                </div>
              ) : schedules.length === 0 ? (
                <div className="p-8 text-center">
                  <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Tidak ada data jadwal ditemukan</p>
                  <p className="text-gray-500 text-sm mt-1">Coba ubah filter pencarian Anda</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mahasiswa
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Konselor
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
                          <tr key={schedule.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{schedule.user?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{schedule.user?.email || ''}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{schedule.counselor?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{schedule.counselor?.email || ''}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{formatDate(schedule.tanggal)}</p>
                                <p className="text-sm text-gray-500">
                                  {formatTime(schedule.jam_mulai)} - {formatTime(schedule.jam_selesai)}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${schedule.metode === 'online'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                                }`}>
                                {getMethodLabel(schedule.metode)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(schedule.status)}`}>
                                {getStatusLabel(schedule.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setDetailModal({ open: true, schedule })}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Detail"
                                >
                                  <FiEye className="w-5 h-5" />
                                </button>

                                {schedule.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => setApprovalModal({ open: true, schedule })}
                                      className="text-green-600 hover:text-green-900"
                                      title="Setujui"
                                    >
                                      <FiCheckCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => setRejectionModal({ open: true, schedule, reason: '' })}
                                      className="text-red-600 hover:text-red-900"
                                      title="Tolak"
                                    >
                                      <FiXCircle className="w-5 h-5" />
                                    </button>
                                  </>
                                )}

                                {schedule.status === 'approved' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(schedule.id, 'completed')}
                                      className="text-blue-600 hover:text-blue-900"
                                      title="Tandai Selesai"
                                    >
                                      <FiCheck className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(schedule.id, 'cancelled')}
                                      className="text-gray-600 hover:text-gray-900"
                                      title="Batalkan"
                                    >
                                      <FiX className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Menampilkan <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> -{' '}
                          <span className="font-medium">
                            {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                          </span>{' '}
                          dari <span className="font-medium">{pagination.total}</span> hasil
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fetchSchedules(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 text-sm text-gray-700">
                            Halaman {pagination.current_page} dari {pagination.last_page}
                          </span>
                          <button
                            onClick={() => fetchSchedules(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* Detail Modal */}
        {detailModal.open && detailModal.schedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Detail Jadwal Konseling</h3>
                    <p className="text-sm text-gray-600 mt-1">ID: #{detailModal.schedule.id}</p>
                  </div>
                  <button
                    onClick={() => setDetailModal({ open: false, schedule: null })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Mahasiswa</p>
                    <p className="font-medium text-gray-900 mt-1">{detailModal.schedule.user?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{detailModal.schedule.user?.email || ''}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Konselor</p>
                    <p className="font-medium text-gray-900 mt-1">{detailModal.schedule.counselor?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{detailModal.schedule.counselor?.email || ''}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Tanggal</p>
                    <p className="font-medium text-gray-900 mt-1">{formatDate(detailModal.schedule.tanggal)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Waktu</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {formatTime(detailModal.schedule.jam_mulai)} - {formatTime(detailModal.schedule.jam_selesai)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Metode</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${detailModal.schedule.metode === 'online'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {getMethodLabel(detailModal.schedule.metode)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(detailModal.schedule.status)}`}>
                      {getStatusLabel(detailModal.schedule.status)}
                    </span>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Topik</p>
                    <p className="font-medium text-gray-900 mt-1">{detailModal.schedule.topik || 'Tidak ada topik spesifik'}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Dibuat Pada</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {new Date(detailModal.schedule.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setDetailModal({ open: false, schedule: null })}
                    className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {approvalModal.open && approvalModal.schedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Setujui Jadwal</h3>
                  <button
                    onClick={() => setApprovalModal({ open: false, schedule: null })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menyetujui jadwal konseling untuk{' '}
                  <span className="font-semibold">{approvalModal.schedule.user?.name}</span> dengan{' '}
                  <span className="font-semibold">{approvalModal.schedule.counselor?.name}</span>?
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-700">
                        Setelah disetujui, mahasiswa dan konselor akan menerima notifikasi email.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setApprovalModal({ open: false, schedule: null })}
                    className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleApprove(approvalModal.schedule.id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FiCheck className="w-5 h-5" />
                    Setujui
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectionModal.open && rejectionModal.schedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Tolak Jadwal</h3>
                  <button
                    onClick={() => setRejectionModal({ open: false, schedule: null, reason: '' })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-gray-600 mb-4">
                  Anda akan menolak jadwal konseling untuk{' '}
                  <span className="font-semibold">{rejectionModal.schedule.user?.name}</span>.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionModal.reason}
                    onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                    placeholder="Masukkan alasan penolakan..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Alasan ini akan dikirimkan ke mahasiswa melalui email.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-700">
                        Penolakan tidak dapat dibatalkan. Pastikan alasan penolakan jelas dan sopan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setRejectionModal({ open: false, schedule: null, reason: '' })}
                    className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionModal.reason.trim()}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FiX className="w-5 h-5" />
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselingManagementPage;
