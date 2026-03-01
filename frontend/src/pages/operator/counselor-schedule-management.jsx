import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUser, FiCheck, FiX,
  FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch,
  FiEye, FiRefreshCw, FiInfo
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../api/axios';
import Sidebar from '../../components/layout/Sidebar';
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
      {toast.type === 'success' ? <FiCheck size={18} /> : <FiX size={18} />}
      {toast.msg}
    </div>
  );
};

const CounselorScheduleManagementPage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [counselorFilter, setCounselorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const BLANK_FORM = {
    counselor_id: '',
    hari: 'Senin',
    jam_mulai: '',
    jam_selesai: '',
    slot_duration: 45,
    is_active: true
  };
  const [formData, setFormData] = useState(BLANK_FORM);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, schedule: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, schedule: null });
  const [submitting, setSubmitting] = useState(false);

  const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    fetchSchedules();
    fetchCounselors();
  }, []);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/operator/counselor-schedules');
      if (response.data.success) {
        setSchedules(response.data.data);
      }
    } catch (err) {
      showToast('Gagal memuat daftar jadwal', 'error');
      console.error('Error fetching schedules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const response = await axios.get('/operator/users/counselors');
      if (response.data.success) {
        setCounselors(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching counselors:', err);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.counselor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.hari.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDay = dayFilter === 'all' || schedule.hari === dayFilter;
    const matchesCounselor = counselorFilter === 'all' || schedule.counselor_id.toString() === counselorFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && schedule.is_active) ||
      (statusFilter === 'inactive' && !schedule.is_active);

    return matchesSearch && matchesDay && matchesCounselor && matchesStatus;
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post('/operator/counselor-schedules', formData);
      if (response.data.success) {
        showToast('Jadwal berhasil ditambahkan');
        setAddModal(false);
        setFormData(BLANK_FORM);
        fetchSchedules();
      } else {
        showToast(response.data.message || 'Gagal menambahkan jadwal', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
      console.error('Error adding schedule:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.put(`/operator/counselor-schedules/${editModal.schedule.id}`, formData);
      if (response.data.success) {
        showToast('Jadwal berhasil diperbarui');
        setEditModal({ open: false, schedule: null });
        fetchSchedules();
      } else {
        showToast(response.data.message || 'Gagal memperbarui jadwal', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
      console.error('Error updating schedule:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async () => {
    setSubmitting(true);
    try {
      const response = await axios.delete(`/operator/counselor-schedules/${deleteModal.schedule.id}`);
      if (response.data.success) {
        showToast('Jadwal berhasil dihapus');
        setDeleteModal({ open: false, schedule: null });
        fetchSchedules();
      } else {
        showToast(response.data.message || 'Gagal menghapus jadwal', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
      console.error('Error deleting schedule:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (schedule) => {
    setEditModal({ open: true, schedule });
    setFormData({
      counselor_id: schedule.counselor_id,
      hari: schedule.hari,
      jam_mulai: schedule.jam_mulai,
      jam_selesai: schedule.jam_selesai,
      slot_duration: schedule.slot_duration,
      is_active: schedule.is_active
    });
  };

  // Helper variables to match jadwal-konseling.jsx aesthetic
  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Aktif' : 'Non-Aktif';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header matching Counselor Schedule Page */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Jam Kerja Konselor</h1>
              <p className="text-gray-600 mt-1">Kelola ketersediaan hari dan jam operasional seluruh konselor</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchSchedules}
                disabled={isLoading}
                className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                title="Refresh Data"
              >
                <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => { setAddModal(true); setFormData(BLANK_FORM); }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                <FiPlus size={16} /> Tambah Jadwal
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Jadwal Sistem', value: schedules.length, color: 'bg-blue-100', icon: <FiCalendar className="text-blue-600" size={22} /> },
              { label: 'Jadwal Aktif', value: schedules.filter(s => s.is_active).length, color: 'bg-green-100', icon: <FiCheck className="text-green-600" size={22} /> },
              { label: 'Konselor Terdaftar', value: counselors.length, color: 'bg-purple-100', icon: <FiUser className="text-purple-600" size={22} /> },
              { label: 'Jadwal Nonaktif', value: schedules.filter(s => !s.is_active).length, color: 'bg-red-100', icon: <FiInfo className="text-red-600" size={22} /> },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? '—' : stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${stat.color}`}>{stat.icon}</div>
              </div>
            ))}
          </div>

          {/* Premium Filter Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari konselor atau hari..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                />
              </div>

              <div className="w-full md:w-48">
                <select
                  value={counselorFilter}
                  onChange={(e) => setCounselorFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                >
                  <option value="all">Semua Konselor</option>
                  {counselors.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-40">
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                >
                  <option value="all">Semua Hari</option>
                  {DAYS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Cards Grid - Replaces previous Table */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <FiRefreshCw className="w-10 h-10 text-green-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Memuat data jadwal operasional...</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                <FiCalendar className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak ada jadwal ditemukan</h3>
              <p className="text-gray-500">Coba ubah filter pencarian Anda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredSchedules.map((schedule) => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden group"
                  >
                    <div className="p-5 flex-1 relative">
                      {/* Operational Status indicator line */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${schedule.is_active ? 'bg-green-500' : 'bg-red-500'}`} />

                      <div className="flex justify-between items-start mb-5 mt-1">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${getStatusColor(schedule.is_active)}`}>
                          {getStatusText(schedule.is_active)}
                        </span>

                        <div className="flex opacity-50 group-hover:opacity-100 transition-opacity bg-gray-50 rounded-lg p-1 border border-gray-100">
                          <button
                            onClick={() => openEdit(schedule)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Edit Jadwal"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, schedule })}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                            title="Hapus Jadwal"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Counselor Info */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center shadow-inner">
                          <FiUser className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate" title={schedule.counselor?.name}>
                            {schedule.counselor?.name || 'Konselor'}
                          </h3>
                          <p className="text-[11px] text-gray-500 truncate">{schedule.counselor?.email || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <FiCalendar className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">Hari Kerja</p>
                            <p className="text-sm font-bold text-gray-900">{schedule.hari}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                            <FiClock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">Jam Tayang</p>
                            <p className="text-sm font-bold text-gray-900">
                              {schedule.jam_mulai?.substring(0, 5)} - {schedule.jam_selesai?.substring(0, 5)} WIB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Durasi Per Sesi</span>
                      <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-700 shadow-sm">
                        {schedule.slot_duration} Menit
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Modern Add/Edit Modal */}
      <AnimatePresence>
        {(addModal || editModal.open) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => !submitting && (addModal ? setAddModal(false) : setEditModal({ open: false, schedule: null }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">
                  {addModal ? 'Tambah Jam Kerja Baru' : 'Perbarui Jam Kerja'}
                </h3>
                <button
                  onClick={() => !submitting && (addModal ? setAddModal(false) : setEditModal({ open: false, schedule: null }))}
                  className="text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm"
                >
                  <FiX size={16} />
                </button>
              </div>

              <form onSubmit={addModal ? handleAddSchedule : handleEditSchedule} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Konselor Bertugas</label>
                    <select
                      name="counselor_id"
                      value={formData.counselor_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                    >
                      <option value="">Pilih Konselor...</option>
                      {counselors.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Hari Operasional</label>
                    <select
                      name="hari"
                      value={formData.hari}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                    >
                      {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Jam Buka</label>
                      <input
                        type="time"
                        name="jam_mulai"
                        value={formData.jam_mulai}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Jam Tutup</label>
                      <input
                        type="time"
                        name="jam_selesai"
                        value={formData.jam_selesai}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Interval Sesi (Menit)</label>
                    <input
                      type="number"
                      name="slot_duration"
                      value={formData.slot_duration}
                      onChange={handleInputChange}
                      required
                      min="15"
                      max="120"
                      step="15"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1.5 ml-1">Menentukan lama waktu konsultasi per mahasiswa.</p>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          className="w-5 h-5 accent-green-600 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">Status Aktif</span>
                        <span className="text-[10px] text-gray-500">Jadwal ini tersedia dan bisa dipilih oleh mahasiswa.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { addModal ? setAddModal(false) : setEditModal({ open: false, schedule: null }) }}
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 active:scale-[0.98] transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                  >
                    {submitting ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                    {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Delete Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => !submitting && setDeleteModal({ open: false, schedule: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200 shrink-0">
                <FiTrash2 className="text-red-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Jadwal?</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Konfirmasi hapus jadwal <strong>{deleteModal.schedule?.hari}</strong> Konselor <strong>{deleteModal.schedule?.counselor?.name}</strong>? Tindakan ini tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ open: false, schedule: null })}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteSchedule}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {submitting ? <FiRefreshCw className="animate-spin" /> : null}
                  {submitting ? 'Menghapus...' : 'Hapus Jadwal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CounselorScheduleManagementPage;