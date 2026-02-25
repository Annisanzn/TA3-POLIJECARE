import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUser, FiCheck, FiX,
  FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch,
  FiEye, FiRefreshCw, FiInfo
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';

const MyScheduleManagementPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dayFilter, setDayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, schedule: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, schedule: null });
  const [formData, setFormData] = useState({
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '12:00',
    slot_duration: 60,
    is_active: true,
  });

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const fetchMySchedules = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/counselor-schedules');
      if (response.data.success) {
        let schedulesData = response.data.data;

        // If user is a counselor, filter to show only their schedules
        // If user is an operator, show all schedules
        if (user?.role === 'konselor') {
          schedulesData = schedulesData.filter(
            schedule => schedule.counselor_id === user.id
          );
        }

        setSchedules(schedulesData);
        setFilteredSchedules(schedulesData);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      toast.error('Gagal memuat data jadwal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySchedules();
  }, []);

  useEffect(() => {
    let filtered = schedules;
    if (dayFilter !== 'all') {
      filtered = filtered.filter(s => s.hari === dayFilter);
    }
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(s => s.is_active === isActive);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.hari.toLowerCase().includes(query) ||
        s.jam_mulai.toLowerCase().includes(query) ||
        s.jam_selesai.toLowerCase().includes(query)
      );
    }
    setFilteredSchedules(filtered);
  }, [schedules, dayFilter, statusFilter, searchQuery]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/counselor-schedules', {
        ...formData,
        counselor_id: user.id // Otomatis menggunakan ID konselor yang login
      });
      if (response.data.success) {
        toast.success('Jadwal berhasil ditambahkan');
        setAddModal(false);
        setFormData({
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '12:00',
          slot_duration: 60,
          is_active: true,
        });
        fetchMySchedules();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal menambahkan jadwal';
      toast.error(errorMsg);
    }
  };

  const handleEditSchedule = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/counselor-schedules/${editModal.schedule.id}`, formData);
      if (response.data.success) {
        toast.success('Jadwal berhasil diperbarui');
        setEditModal({ open: false, schedule: null });
        fetchMySchedules();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal memperbarui jadwal';
      toast.error(errorMsg);
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      const response = await axios.delete(`/api/counselor-schedules/${deleteModal.schedule.id}`);
      if (response.data.success) {
        toast.success('Jadwal berhasil dihapus');
        setDeleteModal({ open: false, schedule: null });
        fetchMySchedules();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal menghapus jadwal';
      toast.error(errorMsg);
    }
  };

  const openEditModal = (schedule) => {
    setEditModal({ open: true, schedule });
    setFormData({
      hari: schedule.hari,
      jam_mulai: schedule.jam_mulai,
      jam_selesai: schedule.jam_selesai,
      slot_duration: schedule.slot_duration,
      is_active: schedule.is_active,
    });
  };

  const openAddModal = () => {
    setAddModal(true);
    setFormData({
      hari: 'Senin',
      jam_mulai: '08:00',
      jam_selesai: '12:00',
      slot_duration: 60,
      is_active: true,
    });
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Aktif' : 'Nonaktif';
  };

  const generateTimeSlots = (schedule) => {
    const slots = [];
    const start = new Date(`1970-01-01T${schedule.jam_mulai}`);
    const end = new Date(`1970-01-01T${schedule.jam_selesai}`);
    const duration = schedule.slot_duration || 60;

    let current = start;
    while (current.getTime() + duration * 60000 <= end.getTime()) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      slots.push({
        start: current.toTimeString().substring(0, 5),
        end: slotEnd.toTimeString().substring(0, 5),
      });
      current = slotEnd;
    }

    return slots;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'operator' ? 'Jadwal Konselor' : 'Jadwal Saya'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'operator'
                  ? 'Lihat jadwal ketersediaan konselor'
                  : 'Kelola jadwal ketersediaan Anda untuk sesi konseling'}
              </p>
            </div>
            {user?.role === 'konselor' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAddModal}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium"
              >
                <FiPlus className="w-5 h-5" />
                Tambah Jadwal
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Jadwal', value: schedules.length, icon: FiCalendar, color: 'bg-blue-500' },
            { label: 'Aktif', value: schedules.filter(s => s.is_active).length, icon: FiCheck, color: 'bg-green-500' },
            {
              label: 'Slot Tersedia', value: schedules.reduce((acc, s) => {
                const slots = generateTimeSlots(s);
                return acc + slots.length;
              }, 0), icon: FiClock, color: 'bg-purple-500'
            },
            { label: 'Hari Aktif', value: new Set(schedules.filter(s => s.is_active).map(s => s.hari)).size, icon: FiInfo, color: 'bg-yellow-500' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiSearch className="inline w-4 h-4 mr-2" /> Cari
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hari atau jam..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline w-4 h-4 mr-2" /> Hari
              </label>
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua Hari</option>
                {days.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiFilter className="inline w-4 h-4 mr-2" /> Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule, index) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{schedule.hari}</h3>
                      <p className="text-gray-600 text-sm">
                        {schedule.jam_mulai} - {schedule.jam_selesai}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.is_active)}`}>
                      {getStatusText(schedule.is_active)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FiClock className="w-4 h-4 mr-2" />
                      <span>Durasi Slot: {schedule.slot_duration} menit</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Slot Tersedia:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {generateTimeSlots(schedule).map((slot, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                          >
                            {slot.start}-{slot.end}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    {user?.role === 'konselor' && (
                      <>
                        <button
                          onClick={() => openEditModal(schedule)}
                          className="px-4 py-2 text-sm bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg font-medium"
                        >
                          <FiEdit className="inline w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, schedule })}
                          className="px-4 py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium"
                        >
                          <FiTrash2 className="inline w-4 h-4 mr-1" />
                          Hapus
                        </button>
                      </>
                    )}
                    {user?.role === 'operator' && (
                      <button
                        onClick={() => window.location.href = `/operator/counselor-schedule-management`}
                        className="px-4 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium"
                      >
                        <FiEye className="inline w-4 h-4 mr-1" />
                        Kelola di Halaman Operator
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada jadwal</h3>
              <p className="text-gray-500 mb-6">Tambahkan jadwal ketersediaan Anda untuk memulai</p>
              <button
                onClick={openAddModal}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                <FiPlus className="inline w-5 h-5 mr-2" />
                Tambah Jadwal Pertama
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tambah Jadwal</h3>
              <form onSubmit={handleAddSchedule}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hari</label>
                    <select
                      name="hari"
                      value={formData.hari}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {days.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
                      <input
                        type="time"
                        name="jam_mulai"
                        value={formData.jam_mulai}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai</label>
                      <input
                        type="time"
                        name="jam_selesai"
                        value={formData.jam_selesai}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durasi Slot (menit)</label>
                    <input
                      type="number"
                      name="slot_duration"
                      value={formData.slot_duration}
                      onChange={handleInputChange}
                      required
                      min="15"
                      max="120"
                      step="15"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Aktif</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Jadwal</h3>
              <form onSubmit={handleEditSchedule}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hari</label>
                    <select
                      name="hari"
                      value={formData.hari}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {days.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
                      <input
                        type="time"
                        name="jam_mulai"
                        value={formData.jam_mulai}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai</label>
                      <input
                        type="time"
                        name="jam_selesai"
                        value={formData.jam_selesai}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durasi Slot (menit)</label>
                    <input
                      type="number"
                      name="slot_duration"
                      value={formData.slot_duration}
                      onChange={handleInputChange}
                      required
                      min="15"
                      max="120"
                      step="15"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Aktif</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditModal({ open: false, schedule: null })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Hapus Jadwal</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ open: false, schedule: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSchedule}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyScheduleManagementPage;
