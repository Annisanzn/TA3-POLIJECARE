import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUser, FiCheck, FiX,
  FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch,
  FiEye, FiRefreshCw, FiInfo, FiMenu, FiAlertCircle, FiArrowRight, FiSave, FiCheckCircle
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../api/axios';
import Sidebar from '../../components/layout/Sidebar';
import { useNavigate } from 'react-router-dom';
import TimePicker24h from '../../components/ui/TimePicker24h';

/* ── Toast Component ───────────────────────────────────────────────────────── */
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed top-8 right-8 z-[150] flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-2xl text-white text-[11px] font-bold uppercase tracking-widest border backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-600/90 border-emerald-400 shadow-emerald-500/20' : 'bg-rose-600/90 border-rose-400 shadow-rose-500/20'}`}>
      {toast.type === 'success' ? <FiCheckCircle size={22} /> : <FiAlertCircle size={22} />}
      <span>{toast.msg}</span>
    </motion.div>
  );
};

const CounselorScheduleManagementPage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [counselorFilter, setCounselorFilter] = useState('all');

  // Modals
  const BLANK_FORM = {
    counselor_id: '',
    hari: 'Senin',
    jam_mulai: '08:00',
    jam_selesai: '16:00',
    slot_duration: 60,
    is_active: true
  };
  const [formData, setFormData] = useState(BLANK_FORM);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, schedule: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, schedule: null });
  const [submitting, setSubmitting] = useState(false);

  const DAYS_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const response = await axios.get('/operator/counseling/counselors');
      if (response.data.success) setCounselors(response.data.data);
    } catch (err) {}
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
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
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
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
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (schedule) => {
    setEditModal({ open: true, schedule });
    setFormData({
      counselor_id: schedule.counselor_id,
      hari: schedule.hari,
      jam_mulai: schedule.jam_mulai.substring(0, 5),
      jam_selesai: schedule.jam_selesai.substring(0, 5),
      slot_duration: schedule.slot_duration,
      is_active: schedule.is_active
    });
  };

  const getGroupedSchedules = () => {
    let filtered = schedules.filter(s => {
      const matchesCounselor = counselorFilter === 'all' || s.counselor_id.toString() === counselorFilter;
      const matchesSearch = s.counselor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCounselor && matchesSearch;
    });

    const groups = {};
    filtered.forEach(s => {
      const key = `${s.counselor_id}-${s.hari}`;
      if (!groups[key]) {
        groups[key] = { counselor: s.counselor, hari: s.hari, slots: [] };
      }
      groups[key].slots.push(s);
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
    }).sort((a, b) => {
      if (a.counselor?.name !== b.counselor?.name) {
        return a.counselor?.name?.localeCompare(b.counselor?.name);
      }
      return DAYS_ORDER.indexOf(a.hari) - DAYS_ORDER.indexOf(b.hari);
    });
  };

  const groupedData = getGroupedSchedules();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-['Poppins'] overflow-hidden transition-colors duration-500">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <div className="flex-none h-full overflow-y-auto no-scrollbar border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all">
        <Sidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-4 md:px-8 py-4 md:py-8 shrink-0 z-30 transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
               <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl lg:hidden text-slate-600 dark:text-white transition-all"><FiMenu size={20} /></button>
                <div>
                   <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                     <FiCalendar className="text-indigo-600 dark:text-indigo-400" /> Jadwal Kerja Konselor
                   </h1>
                   <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium tracking-wide mt-1.5">Manajemen Ketersediaan Layanan PolijeCare</p>
                </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={fetchSchedules} className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm">
                <FiRefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
               <button
                onClick={() => { setAddModal(true); setFormData(BLANK_FORM); }}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-xs font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 w-full md:w-auto"
              >
                <FiPlus size={20} /> Tambah Jadwal
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar transition-all">
          
          <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 shadow-sm transition-all">
            <div className="flex-1 relative group">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-all" size={20} />
              <input type="text" placeholder="Cari Nama Konselor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[2rem] text-sm font-medium text-slate-900 dark:text-white outline-none transition-all shadow-inner" />
            </div>
             <div className="w-full md:w-80">
              <select value={counselorFilter} onChange={(e) => setCounselorFilter(e.target.value)}
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[2rem] text-xs font-bold text-slate-600 dark:text-slate-400 outline-none appearance-none cursor-pointer shadow-inner">
                <option value="all">Semua Konselor</option>
                {counselors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="w-20 h-20 border-[6px] border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin mb-8" />
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-widest">Sinkronisasi Jadwal...</p>
             </div>
          ) : groupedData.length === 0 ? (
             <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-all">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-100 dark:border-slate-800">
                  <FiCalendar className="text-slate-200 dark:text-slate-700" size={50} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Belum Ada Jadwal</h3>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2">Gunakan tombol 'Tambah Jadwal' untuk memulai</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 pb-10">
              {groupedData.map((group, gIdx) => (
                <div key={gIdx} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
                  <div className="p-8 bg-slate-50/50 dark:bg-slate-950/30 border-b border-gray-100 dark:border-slate-800/50 flex items-center gap-5 transition-all">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xl border border-gray-100 dark:border-slate-700 shrink-0 group-hover:scale-110 transition-all">
                      <FiUser size={28} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight leading-none mb-2">{group.counselor?.name}</h3>
                      <div className="flex items-center gap-2">
                         <span className="px-4 py-1.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-[10px] font-bold">{group.hari}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-4 flex-1">
                    {group.slots.map((slot) => (
                      <div key={slot.id} className={`relative p-6 rounded-[2rem] border transition-all duration-300 ${slot.isOverlapping ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50' : 'bg-slate-50/30 dark:bg-slate-950/30 border-gray-50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-xl shadow-inner'}`}>
                        {slot.isOverlapping && (
                          <div className="absolute -top-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-2xl animate-bounce" title="Jadwal Bentrok!">
                            <FiAlertCircle size={16} />
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${slot.isOverlapping ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
                               <FiClock size={18} />
                            </div>
                            <span className={`text-[13px] font-bold tracking-tight ${slot.isOverlapping ? 'text-rose-700 dark:text-rose-300' : 'text-slate-900 dark:text-white'}`}>
                              {slot.jam_mulai.substring(0, 5)} — {slot.jam_selesai.substring(0, 5)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => openEdit(slot)} className="p-3 text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 rounded-xl transition-all shadow-sm"><FiEdit size={16} /></button>
                             <button onClick={() => setDeleteModal({ open: true, schedule: slot })} className="p-3 text-slate-400 dark:text-slate-600 hover:text-rose-600 bg-white dark:bg-slate-900 rounded-xl transition-all shadow-sm"><FiTrash2 size={16} /></button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-2">
                           <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">Sesi Durasi</span>
                           <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 px-4 py-1.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm">{slot.slot_duration} menit</span>
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

      <AnimatePresence>
        {(addModal || editModal.open) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xl"
              onClick={() => !submitting && (addModal ? setAddModal(false) : setEditModal({ open: false, schedule: null }))} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-800"
            >
              <div className="px-10 py-12 bg-slate-50/50 dark:bg-slate-950/30 border-b border-gray-100 dark:border-slate-800">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-5 tracking-tight">
                   <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-100"><FiPlus size={28} /></div>
                   {addModal ? 'Tambah Jadwal' : 'Edit Jadwal'}
                </h3>
              </div>
              <form onSubmit={addModal ? handleAddSchedule : handleEditSchedule} className="p-10 space-y-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest px-2">Konselor Bertugas</label>
                    <select name="counselor_id" value={formData.counselor_id} onChange={handleInputChange} required
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[2rem] text-xs font-bold text-slate-900 dark:text-white outline-none transition-all shadow-inner cursor-pointer">
                      <option value="">Pilih Konselor...</option>
                      {counselors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest px-2">Hari</label>
                      <select name="hari" value={formData.hari} onChange={handleInputChange} required
                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[2rem] text-xs font-bold text-slate-900 dark:text-white outline-none appearance-none cursor-pointer">
                        {DAYS_ORDER.map(day => <option key={day} value={day}>{day}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest px-2">Sesi (Menit)</label>
                      <input type="number" name="slot_duration" value={formData.slot_duration} onChange={handleInputChange} required min="15" max="240" step="15"
                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white outline-none shadow-inner" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <TimePicker24h label="JAM MULAI" value={formData.jam_mulai} onChange={val => handleInputChange({ target: { name: 'jam_mulai', value: val } })} />
                    <TimePicker24h label="JAM SELESAI" value={formData.jam_selesai} onChange={val => handleInputChange({ target: { name: 'jam_selesai', value: val } })} />
                  </div>
                  <label className="flex items-center gap-5 p-6 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-[2.5rem] cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group shadow-inner">
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="w-6 h-6 accent-indigo-600 rounded-lg shadow-sm" />
                    <div className="flex flex-col">
                       <span className="text-[11px] font-bold text-slate-900 dark:text-white tracking-widest group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">Jadwal Aktif</span>
                       <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">Dapat dipilih oleh mahasiswa di dashboard.</span>
                    </div>
                  </label>
                </div>
                <div className="pt-6 flex gap-6">
                  <button type="button" disabled={submitting} onClick={() => { addModal ? setAddModal(false) : setEditModal({ open: false, schedule: null }) }}
                    className="flex-1 py-5 text-slate-400 dark:text-slate-600 font-bold text-xs hover:text-rose-500 transition-all">Batal</button>
                  <button type="submit" disabled={submitting}
                    className="flex-[2] py-6 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-xs font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 active:scale-95"
                  >
                    {submitting ? <FiRefreshCw className="animate-spin" /> : <FiSave size={20} />}
                    {submitting ? 'Memproses...' : 'Simpan Jadwal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal.open && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 dark:bg-slate-950/80">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-sm p-12 text-center border border-gray-100 dark:border-slate-800"
            >
              <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-rose-600 shadow-inner"><FiTrash2 size={40} /></div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">Hapus Jadwal?</h3>
              <p className="text-[11px] font-medium text-slate-400 mb-12 leading-relaxed">Sesi di hari <span className="text-slate-900 font-bold">{deleteModal.schedule?.hari}</span> akan dihapus permanen.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteModal({ open: false, schedule: null })} disabled={submitting} className="flex-1 py-5 text-slate-400 font-bold text-xs uppercase hover:text-slate-900 transition-all">Batal</button>
                <button onClick={handleDeleteSchedule} disabled={submitting} className="flex-[2] py-5 bg-rose-600 text-white rounded-full text-xs font-bold shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95">Ya, Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CounselorScheduleManagementPage;