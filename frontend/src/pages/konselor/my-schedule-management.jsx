import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUser, FiCheck, FiX,
  FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch,
  FiEye, FiRefreshCw, FiInfo, FiAlertCircle, FiSave, FiMenu
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';
import TimePicker24h from '../../components/ui/TimePicker24h';
import Sidebar from '../../components/layout/Sidebar';

const MyScheduleManagementPage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [submitting, setSubmitting] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, schedule: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, schedule: null });
  
  const BLANK_FORM = {
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '16:00',
    slot_duration: 60,
    is_active: true,
  };
  const [formData, setFormData] = useState(BLANK_FORM);

  const DAYS_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const fetchMySchedules = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/counselor-schedules');
      if (response.data.success) {
        let schedulesData = response.data.data;
        if (user?.role === 'konselor') {
          schedulesData = schedulesData.filter(s => s.counselor_id === user.id);
        }
        setSchedules(schedulesData);
      }
    } catch (err) {
      toast.error('Gagal memuat data jadwal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySchedules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post('/api/counselor-schedules', {
        ...formData,
        counselor_id: user.id
      });
      if (response.data.success) {
        toast.success('Jadwal berhasil ditambahkan');
        setAddModal(false);
        setFormData(BLANK_FORM);
        fetchMySchedules();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan jadwal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.put(`/api/counselor-schedules/${editModal.schedule.id}`, formData);
      if (response.data.success) {
        toast.success('Jadwal berhasil diperbarui');
        setEditModal({ open: false, schedule: null });
        fetchMySchedules();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui jadwal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async () => {
    setSubmitting(true);
    try {
      const response = await axios.delete(`/api/counselor-schedules/${deleteModal.schedule.id}`);
      if (response.data.success) {
        toast.success('Jadwal berhasil dihapus');
        setDeleteModal({ open: false, schedule: null });
        fetchMySchedules();
      }
    } catch (err) {
      toast.error('Gagal menghapus jadwal');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (schedule) => {
    setEditModal({ open: true, schedule });
    setFormData({
      hari: schedule.hari,
      jam_mulai: schedule.jam_mulai.substring(0, 5),
      jam_selesai: schedule.jam_selesai.substring(0, 5),
      slot_duration: schedule.slot_duration,
      is_active: schedule.is_active,
    });
  };

  // ── GROUPING LOGIC ────────────────────────────────────────────────────────
  const getGroupedSchedules = () => {
    const groups = {};
    schedules.forEach(s => {
      if (!groups[s.hari]) {
        groups[s.hari] = { hari: s.hari, slots: [] };
      }
      groups[s.hari].slots.push(s);
    });

    return Object.values(groups).map(group => {
      group.slots.sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
      group.slots = group.slots.map((slot, idx) => {
        let isOverlapping = false;
        if (idx > 0) {
          const prevSlot = group.slots[idx - 1];
          if (slot.jam_mulai < prevSlot.jam_selesai) isOverlapping = true;
        }
        return { ...slot, isOverlapping };
      });
      return group;
    }).sort((a, b) => DAYS_ORDER.indexOf(a.hari) - DAYS_ORDER.indexOf(b.hari));
  };

  const groupedData = getGroupedSchedules();

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Poppins']">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <header className="bg-white border-b border-slate-200 px-8 py-8 sticky top-0 z-30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 bg-slate-100 rounded-xl lg:hidden text-slate-600"><FiMenu size={20} /></button>
               <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
                    <FiCalendar className="text-indigo-600" /> Jadwal Saya
                  </h1>
                  <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">Atur ketersediaan waktu Anda untuk melayani mahasiswa.</p>
               </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button onClick={fetchMySchedules} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all flex-1 md:flex-none">
                <FiRefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => { setAddModal(true); setFormData(BLANK_FORM); }}
                className="flex items-center justify-center gap-3 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-bold tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex-[3] md:flex-none uppercase"
              >
                <FiPlus size={18} /> Tambah Jadwal
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 space-y-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menyiapkan Jadwal Anda...</p>
            </div>
          ) : groupedData.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <FiCalendar className="mx-auto text-slate-100 mb-6" size={80} />
              <h3 className="text-lg font-bold text-slate-900">Belum Ada Jadwal</h3>
              <p className="text-slate-500 text-sm mt-2">Mulai tambahkan jadwal kerja mingguan Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {groupedData.map((group, idx) => (
                <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                  <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                       <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-100">{group.hari}</span>
                       <div className="flex items-center gap-2">
                         <div className={`w-2.5 h-2.5 rounded-full ${group.slots.some(s => s.isOverlapping) ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                         <span className="text-[9px] font-bold text-slate-400 uppercase">{group.slots.length} Sesi</span>
                       </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-4 flex-1">
                    {group.slots.map((slot) => (
                      <div key={slot.id} className={`relative p-5 rounded-2xl border transition-all ${slot.isOverlapping ? 'bg-rose-50 border-rose-200' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-md'}`}>
                        {slot.isOverlapping && (
                          <div className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow-lg" title="Jadwal Bentrok!">
                            <FiAlertCircle size={14} />
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <FiClock className={slot.isOverlapping ? 'text-rose-600' : 'text-indigo-500'} size={16} />
                            <span className={`text-sm font-bold ${slot.isOverlapping ? 'text-rose-700' : 'text-slate-900'}`}>
                              {slot.jam_mulai.substring(0, 5)} - {slot.jam_selesai.substring(0, 5)}
                            </span>
                          </div>
                          <div className="flex gap-1">
                             <button onClick={() => openEdit(slot)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><FiEdit size={16} /></button>
                             <button onClick={() => setDeleteModal({ open: true, schedule: slot })} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><FiTrash2 size={16} /></button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Interval Sesi</span>
                           <span className="text-[10px] font-bold text-slate-600 px-3 py-1 bg-white border border-slate-100 rounded-lg">{slot.slot_duration} Menit</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(addModal || editModal.open) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => !submitting && (addModal ? setAddModal(false) : setEditModal({ open: false, schedule: null }))} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
            >
              <div className="px-10 py-10 bg-slate-50/50 border-b border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><FiPlus size={24} /></div>
                   {addModal ? 'Tambah Jadwal' : 'Edit Jadwal Kerja'}
                </h3>
              </div>

              <form onSubmit={addModal ? handleAddSchedule : handleEditSchedule} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Hari Operasional</label>
                    <select name="hari" value={formData.hari} onChange={handleInputChange} required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer">
                      {DAYS_ORDER.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sesi (Menit)</label>
                    <input type="number" name="slot_duration" value={formData.slot_duration} onChange={handleInputChange} required min="15" max="240" step="15"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl text-sm font-bold outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <TimePicker24h label="Mulai Kerja" value={formData.jam_mulai} onChange={val => handleInputChange({ target: { name: 'jam_mulai', value: val } })} />
                  <TimePicker24h label="Selesai Kerja" value={formData.jam_selesai} onChange={val => handleInputChange({ target: { name: 'jam_selesai', value: val } })} />
                </div>

                <label className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="w-5 h-5 accent-indigo-600 rounded" />
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">Tampilkan ke Mahasiswa</span>
                     <span className="text-[10px] text-slate-400 font-medium">Jadwal ini akan aktif dan dapat dipesan oleh mahasiswa.</span>
                  </div>
                </label>

                <div className="pt-6 flex gap-4">
                  <button type="button" disabled={submitting} onClick={() => { addModal ? setAddModal(false) : setEditModal({ open: false, schedule: null }) }}
                    className="flex-1 py-4 text-slate-400 font-bold text-xs tracking-widest uppercase">Batal</button>
                  <button type="submit" disabled={submitting}
                    className="flex-[2] py-5 bg-indigo-600 text-white rounded-full text-xs font-bold tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                    {submitting ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    {submitting ? 'Memproses...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteModal.open && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 text-center"
            >
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><FiTrash2 size={32} /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Jadwal?</h3>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed">Jadwal hari <span className="font-bold text-slate-900">{deleteModal.schedule?.hari}</span> akan dihapus dari sistem.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteModal({ open: false, schedule: null })} disabled={submitting} className="flex-1 py-4 text-slate-400 font-bold text-xs tracking-widest uppercase">Batal</button>
                <button onClick={handleDeleteSchedule} disabled={submitting} className="flex-1 py-4 bg-rose-600 text-white rounded-full text-xs font-bold tracking-widest hover:bg-rose-700 transition-all">Ya, Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyScheduleManagementPage;
