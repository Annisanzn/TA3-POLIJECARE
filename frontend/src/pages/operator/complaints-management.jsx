import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-icons/fi';
import { complaintService } from '../../services/complaintService';

const ComplaintsManagementPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
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

  const [detailModal, setDetailModal] = useState({ open: false, complaint: null });
  const [statusModal, setStatusModal] = useState({ open: false, complaint: null, status: 'pending' });
  const [scheduleModal, setScheduleModal] = useState({ open: false, complaint: null, counseling_schedule: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);

  const totalPages = pagination.last_page || 1;

  const statsData = useMemo(() => {
    return [
      {
        title: 'Total Laporan',
        value: String(stats.total ?? 0),
        icon: <FiFileText size={20} />,
        color: 'from-purple-500 to-purple-600',
      },
      {
        title: 'Pending',
        value: String(stats.pending ?? 0),
        icon: <FiAlertCircle size={20} />,
        color: 'from-yellow-500 to-yellow-600',
      },
      {
        title: 'Sedang Diproses',
        value: String(stats.approved ?? 0),
        icon: <FiEdit size={20} />,
        color: 'from-blue-500 to-blue-600',
      },
      {
        title: 'Selesai',
        value: String(stats.completed ?? 0),
        icon: <FiCheckCircle size={20} />,
        color: 'from-green-500 to-green-600',
      },
    ];
  }, [stats]);

  const getVictimLabel = (c) => {
    if (c.victim_type === 'self') return 'Diri Sendiri';
    return c.victim_name || '-';
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const [listRes, statsRes] = await Promise.all([
        complaintService.getComplaints({
          page: currentPage,
          per_page: perPage,
          search: searchQuery,
          status: statusFilter,
          urgency: urgencyFilter,
          date_from: dateFrom,
          date_to: dateTo,
        }),
        complaintService.getComplaintStats(),
      ]);

      const pageData = listRes.data || {};
      setComplaints(pageData.data || []);
      setPagination({
        current_page: pageData.current_page || currentPage,
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
      setErrorMessage(error?.message || 'Gagal mengambil data pengaduan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery, statusFilter, urgencyFilter, dateFrom, dateTo]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const resetFilter = () => {
    setCurrentPage(1);
    setSearchQuery('');
    setStatusFilter('all');
    setUrgencyFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const openDetail = (complaint) => setDetailModal({ open: true, complaint });

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
      setStatusModal({ open: false, complaint: null, status: 'pending' });
      fetchData();
    } catch (error) {
      setErrorMessage(error?.message || 'Gagal mengubah status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSchedule = async () => {
    if (!scheduleModal.complaint?.id) return;
    if (!scheduleModal.counseling_schedule) {
      setErrorMessage('Jadwal konseling wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await complaintService.schedule(scheduleModal.complaint.id, {
        counseling_schedule: scheduleModal.counseling_schedule,
      });
      setScheduleModal({ open: false, complaint: null, counseling_schedule: '' });
      fetchData();
    } catch (error) {
      setErrorMessage(error?.message || 'Gagal menjadwalkan konseling.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Pengaduan</h1>
              <p className="text-gray-600 mt-1">Kelola laporan pengaduan dan proses konseling</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari ID laporan / lokasi..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-auto">
          {errorMessage && !isLoading && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-start gap-3 text-red-700">
                <FiAlertCircle className="mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Gagal memuat data</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-opacity duration-500">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Data Pengaduan</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">Menampilkan {complaints.length} laporan</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <FiFilter className="text-gray-400 hidden sm:block" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto"
                    value={statusFilter}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setStatusFilter(e.target.value);
                    }}
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Diproses / Disetujui</option>
                    <option value="completed">Selesai</option>
                    <option value="rejected">Ditolak / Jadwalkan Ulang</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto"
                    value={urgencyFilter}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setUrgencyFilter(e.target.value);
                    }}
                  >
                    <option value="all">Semua Urgensi</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setDateFrom(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setDateTo(e.target.value);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={resetFilter}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID Laporan</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Nama Pelapor</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Korban</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tempat Kejadian</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tanggal</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Deskripsi</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Jadwal Konseling</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Konselor</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                        <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                      </tr>
                    ))
                  ) : complaints.length > 0 ? (
                    complaints.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6 text-sm text-gray-900 font-semibold">{c.report_id}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{c.user_name || '-'}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{getVictimLabel(c)}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{c.location}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700 max-w-xs truncate" title={c.description}>
                          {c.description || '-'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(c.status)} transition-transform duration-200`}>{c.status}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {c.counseling_schedule
                            ? new Date(c.counseling_schedule).toLocaleString('id-ID')
                            : '-'}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">{c.counselor_name || '-'}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetail(c)}
                              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Detail"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => openStatus(c)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ubah Status"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => openSchedule(c)}
                              className="p-2 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Jadwalkan"
                            >
                              <FiCalendar size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center">
                        <div className="text-gray-500 transition-opacity duration-500">
                          <FiFileText className="mx-auto text-4xl mb-3 opacity-50" />
                          <p className="text-lg">Belum ada laporan pengaduan.</p>
                          <p className="text-sm mt-1">Coba ubah filter pencarian Anda</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <div className="h-4 bg-gray-200 rounded w-40" />
                    <div className="mt-3 h-3 bg-gray-200 rounded w-28" />
                    <div className="mt-2 h-3 bg-gray-200 rounded w-56" />
                  </div>
                ))
              ) : complaints.length > 0 ? (
                complaints.map((c) => (
                  <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{c.report_id}</p>
                        <p className="text-xs text-gray-600 mt-1">{c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(c.status)}`}>{c.status}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Nama Pelapor</p>
                        <p className="text-gray-800 font-medium">{c.user_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Korban</p>
                        <p className="text-gray-800 font-medium">{getVictimLabel(c)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tempat Kejadian</p>
                        <p className="text-gray-800 font-medium">{c.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Jadwal Konseling</p>
                        <p className="text-gray-800 font-medium">
                          {c.counseling_schedule ? new Date(c.counseling_schedule).toLocaleString('id-ID') : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Konselor</p>
                        <p className="text-gray-800 font-medium">{c.counselor_name || '-'}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        onClick={() => openDetail(c)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => openStatus(c)}
                        className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Ubah Status
                      </button>
                      <button
                        onClick={() => openSchedule(c)}
                        className="w-full px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Jadwalkan
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-gray-500">
                  <FiFileText className="mx-auto text-4xl mb-3 opacity-50" />
                  <p className="text-lg">Belum ada laporan pengaduan.</p>
                </div>
              )}
            </div>

            {!isLoading && complaints.length > 0 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="text-xs sm:text-sm text-gray-600 mb-4 lg:mb-0">
                  Halaman {pagination.current_page || currentPage} dari {totalPages} — total {pagination.total} laporan
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft size={16} className="sm:size-5" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-colors text-xs sm:text-sm ${currentPage === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight size={16} className="sm:size-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {detailModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => setDetailModal({ open: false, complaint: null })} />
              <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Detail Pengaduan</h3>
                  <p className="text-sm text-gray-600 mt-1">{detailModal.complaint?.report_id}</p>
                </div>
                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Nama Pelapor</p>
                    <p className="font-medium text-gray-900 mt-1">{detailModal.complaint?.user_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Korban</p>
                    <p className="font-medium text-gray-900 mt-1">{getVictimLabel(detailModal.complaint || {})}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Tempat Kejadian</p>
                    <p className="font-medium text-gray-900 mt-1">{detailModal.complaint?.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(detailModal.complaint?.status)}`}>{detailModal.complaint?.status}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Urgensi</p>
                    <p className="font-medium text-gray-900 mt-1">{detailModal.complaint?.urgency_level || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Jadwal Konseling</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {detailModal.complaint?.counseling_schedule
                        ? new Date(detailModal.complaint.counseling_schedule).toLocaleString('id-ID')
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setDetailModal({ open: false, complaint: null })}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {statusModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => !isSubmitting && setStatusModal({ open: false, complaint: null, status: 'pending' })} />
              <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Ubah Status</h3>
                  <p className="text-sm text-gray-600 mt-1">{statusModal.complaint?.report_id}</p>
                </div>
                <div className="px-6 py-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusModal.status}
                    onChange={(e) => setStatusModal((p) => ({ ...p, status: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Diproses / Disetujui</option>
                    <option value="completed">Selesai</option>
                    <option value="rejected">Ditolak / Jadwalkan Ulang</option>
                  </select>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() => setStatusModal({ open: false, complaint: null, status: 'pending' })}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={submitStatus}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {scheduleModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => !isSubmitting && setScheduleModal({ open: false, complaint: null, counseling_schedule: '' })} />
              <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Jadwalkan Konseling</h3>
                  <p className="text-sm text-gray-600 mt-1">{scheduleModal.complaint?.report_id}</p>
                </div>
                <div className="px-6 py-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu</label>
                  <input
                    type="datetime-local"
                    value={scheduleModal.counseling_schedule}
                    onChange={(e) => setScheduleModal((p) => ({ ...p, counseling_schedule: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-5">
                    <button
                      type="button"
                      onClick={() => setScheduleModal({ open: false, complaint: null, counseling_schedule: '' })}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={submitSchedule}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
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

export default ComplaintsManagementPage;
