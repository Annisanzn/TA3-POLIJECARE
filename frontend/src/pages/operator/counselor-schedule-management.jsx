import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUser, FiCheck, FiX,
  FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch,
  FiEye, FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';

const CounselorScheduleManagementPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [counselorFilter, setCounselorFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, schedule: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, schedule: null });
  const [formData, setFormData] = useState({
    counselor_id: '',
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '12:00',
    slot_duration: 60,
    is_active: true,
  });

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/counselor-schedules');
      if (response.data.success) {
        let schedulesData = response.data.data;
        
        // If user is a counselor (not operator), filter to show only their schedules
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

  const fetchCounselors = async () => {
    try {
      const response = await axios.get('/api/counselor-schedules/counselors/with-schedules');
      if (response.data.success) {
        setCounselors(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching counselors:', err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchCounselors();
  }, []);

  useEffect(() => {
    let filtered = schedules;
    if (counselorFilter !== 'all') {
      filtered = filtered.filter(s => s.counselor_id.toString() === counselorFilter);
    }
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
        s.counselor?.name?.toLowerCase().includes(query) ||
        s.hari.toLowerCase().includes(query) ||
        s.jam_mulai.toLowerCase().includes(query)
      );
    }
    setFilteredSchedules(filtered);
  }, [schedules, counselorFilter, dayFilter, statusFilter, searchQuery]);

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
      const response = await axios.post('/api/counselor-schedules', formData);
      if (response.data.success) {
        toast.success('Jadwal berhasil ditambahkan');
        setAddModal(false);
        setFormData({
          counselor_id: '',
          hari: 'Senin',
          jam_mulai: '08:00',
          jam_selesai: '12:00',
          slot_duration: 60,
          is_active: true,
        });
        fetchSchedules();
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
        fetchSchedules();
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
        fetchSchedules();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal menghapus jadwal';
      toast.error(errorMsg);
    }
  };

  const openEditModal = (schedule) => {
    setEditModal({ open: true, schedule });
    setFormData({
      counselor_id: schedule.counselor_id,
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
      counselor_id: '',
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manajemen Jadwal Konselor</h1>
              <p className="text-gray-600 mt-2">Kelola jadwal ketersediaan konselor</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium"
            >
              <FiPlus className="w-5 h-5" />
              Tambah Jadwal
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Jadwal', value: schedules.length, icon: FiCalendar, color: 'bg-blue-500' },
            { label: 'Aktif', value: schedules.filter(s => s.is_active).length, icon: FiCheck, color: 'bg-green-500' },
            { label: 'Konselor', value: counselors.length, icon: FiUser, color: 'bg-purple-500' },
            { label: 'Hari', value: new Set(schedules.map(s => s.hari)).size, icon: FiClock, color: 'bg-yellow-500' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiSearch className="inline w-4 h-4 mr-2" /> Cari
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline w-4 h-4 mr-2" /> Konselor
              </label>
              <select
                value={counselorFilter}
                onChange={(e) => setCounselorFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua</option>
                {counselors.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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
                <option value="all">Semua</option>
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
                <option value="all">Semua</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konselor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hari</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <FiUser className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{schedule.counselor?.name || 'Tidak diketahui'}</div>
                            <div className="text-sm text-gray-500">{schedule.counselor?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{schedule.hari}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{schedule.jam_mulai} - {schedule.jam_selesai}</div>
                        <div className="text-sm text-gray-500">{schedule.slot_duration} menit/slot</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{schedule.slot_duration} menit</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(schedule.is_active)}`}>
                          {getStatusText(schedule.is_active)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(schedule)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, schedule })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Hapus"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSchedules.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada jadwal ditemukan</h3>
                  <p className="text-gray-500">Coba ubah filter pencarian</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {addModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tambah Jadwal</h3>
                <form onSubmit={handleAddSchedule}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Konselor</label>
                      <select
                        name="counselor_id"
                        value={formData.counselor_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Pilih Konselor</option>
                        {counselors.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Jadwal</h3>
                <form onSubmit={handleEditSchedule}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Konselor</label>
                      <select
                        name="counselor_id"
                        value={formData.counselor_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Pilih Konselor</option>
                        {counselors.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            >
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CounselorScheduleManagementPage;