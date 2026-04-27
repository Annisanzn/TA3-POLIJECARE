import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiAlertCircle, FiCalendar, FiCheck, FiMapPin, FiVideo, 
  FiFileText, FiLoader, FiSave, FiUser, FiSmartphone, FiMail, FiHash, FiShield,
  FiUsers, FiPlus, FiMenu, FiCheckCircle
} from 'react-icons/fi';
import axios from '../../api/axios';
import Topbar from '../../components/layout/Topbar';
import Sidebar from '../../components/layout/Sidebar';
import TimePicker24h from '../../components/ui/TimePicker24h';

const OperatorManualCounseling = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const [categories, setCategories] = useState([]);
  const [counselors, setCounselors] = useState([]);
  
  const [manualForm, setManualForm] = useState({
    counselee_name: '',
    guest_nim: '',
    guest_email: '',
    guest_phone: '',
    guest_wa: '',
    suspect_name: '',
    suspect_status: 'Mahasiswa',
    suspect_affiliation: '',
    suspect_phone: '',
    jenis_pengaduan: '',
    tanggal: new Date().toISOString().split('T')[0],
    jam_mulai: '09:00',
    jam_selesai: '10:00',
    metode: 'offline',
    lokasi: 'Kantor Satgas',
    meeting_link: '',
    counselee_type: 'pelapor',
    is_record_only: false,
    keterangan_pihak: '',
    saran_konselor: '',
    counselor_id: '',
    counselor_target: 'assign'
  });
  
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [catRes, counsRes] = await Promise.all([
          axios.get('/public-categories'),
          axios.get('/operator/counseling/counselors')
        ]);
        if (catRes.data?.success) setCategories(catRes.data.data);
        if (counsRes.data?.success) setCounselors(counsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchInitData();
  }, []);

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (name, val) => {
    setManualForm(prev => ({ ...prev, [name]: val }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualSubmitting(true);
    setManualError('');
    try {
      if (manualForm.jam_selesai <= manualForm.jam_mulai) throw new Error('Jam selesai harus lebih besar.');
      if (!manualForm.counselor_id) throw new Error('Pilih Konselor.');
      await axios.post('/operator/counseling/request', manualForm);
      setSuccessToast(true);
      setTimeout(() => navigate('/operator/case-management'), 2000);
    } catch (err) {
      setManualError(err.response?.data?.message || err.message);
    } finally {
      setManualSubmitting(false);
    }
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
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-4 md:px-8 py-4 md:py-6 shrink-0 z-30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={toggleSidebar} className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl lg:hidden hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                <FiMenu size={20} className="dark:text-white" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                  <FiPlus className="text-indigo-600" /> Konseling Manual
                </h1>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">Dokumentasi & Penjadwalan Langsung</p>
              </div>
            </div>
            <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-all active:scale-95 shadow-sm">
                <FiArrowLeft size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 scroll-smooth custom-scrollbar transition-all">
          
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-all">
              
              <div className="px-8 md:px-16 py-16 md:py-24 bg-slate-50/50 dark:bg-slate-800/20 border-b border-gray-100 dark:border-slate-800 text-center md:text-left">
                 <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="w-24 h-24 bg-indigo-600 dark:bg-indigo-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40 shrink-0 animate-in zoom-in duration-500">
                       <FiPlus size={44} />
                    </div>
                     <div className="space-y-2">
                       <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none">Form Input <span className="text-indigo-600 tracking-normal">Premium</span></h2>
                       <p className="text-slate-500 text-sm md:text-lg font-medium opacity-80">Lengkapi data untuk pencatatan administratif sesi konseling.</p>
                     </div>
                 </div>
              </div>

              <form onSubmit={handleManualSubmit} className="p-8 md:p-16 space-y-20">
                <AnimatePresence>
                  {(successToast || manualError) && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      className={`p-6 rounded-[1.5rem] border flex items-center gap-4 font-bold text-xs shadow-xl ${successToast ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                      {successToast ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                      {successToast ? 'Data berhasil disimpan. Mengalihkan...' : manualError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col items-center gap-8">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-[2.5rem] flex gap-3 w-full max-w-2xl border border-gray-100 dark:border-slate-800 shadow-inner">
                    <button type="button" onClick={() => setManualForm(p => ({...p, is_record_only: false}))}
                      className={`flex-1 py-5 rounded-[2rem] text-xs font-bold transition-all flex items-center justify-center gap-3 ${!manualForm.is_record_only ? 'bg-white text-indigo-600 shadow-2xl' : 'text-slate-400 hover:text-slate-600'}`}>
                      <FiCalendar size={18} /> JADWALKAN
                    </button>
                    <button type="button" onClick={() => setManualForm(p => ({...p, is_record_only: true}))}
                      className={`flex-1 py-5 rounded-[2rem] text-xs font-bold transition-all flex items-center justify-center gap-3 ${manualForm.is_record_only ? 'bg-white text-emerald-600 shadow-2xl' : 'text-slate-400 hover:text-slate-600'}`}>
                      <FiCheck size={18} /> ARSIP SELESAI
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
                  <div className="space-y-12">
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                         <FiCalendar size={22} />
                      </div>
                       <h3 className="text-xl font-bold text-slate-900 tracking-tight">Detail Sesi & Konselor</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Kategori Pelaporan</label>
                        <select name="jenis_pengaduan" value={manualForm.jenis_pengaduan} onChange={handleManualChange} required
                          className="w-full px-6 py-4 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl text-xs font-bold text-slate-900 outline-none transition-all shadow-inner appearance-none cursor-pointer">
                          <option value="">-- PILIH KATEGORI --</option>
                          {categories.map(cat => <option key={cat.unique_id} value={cat.name}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pilih Konselor</label>
                        <select name="counselor_id" value={manualForm.counselor_id} onChange={handleManualChange} required
                          className="w-full px-6 py-4 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl text-xs font-bold text-slate-900 outline-none transition-all shadow-inner appearance-none cursor-pointer">
                          <option value="">-- PILIH KONSELOR --</option>
                          {counselors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tanggal</label>
                        <input type="date" name="tanggal" value={manualForm.tanggal} onChange={handleManualChange} required
                          className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-[10px] font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-inner" />
                      </div>
                      <TimePicker24h label="Mulai" value={manualForm.jam_mulai} onChange={(v) => handleTimeChange('jam_mulai', v)} />
                      <TimePicker24h label="Selesai" value={manualForm.jam_selesai} onChange={(v) => handleTimeChange('jam_selesai', v)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Metode Pertemuan</label>
                        <div className="flex gap-4 p-1.5 bg-slate-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl">
                          <button type="button" onClick={() => setManualForm(p => ({...p, metode: 'offline', lokasi: 'Kantor Satgas'}))}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${manualForm.metode === 'offline' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                            OFFLINE
                          </button>
                          <button type="button" onClick={() => setManualForm(p => ({...p, metode: 'online', lokasi: 'Google Meet'}))}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${manualForm.metode === 'online' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                            ONLINE
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Lokasi / Link Meet</label>
                        <input type="text" name="lokasi" value={manualForm.lokasi} onChange={handleManualChange} placeholder="Contoh: Kantor Satgas"
                          className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-inner" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                         <FiUser size={22} />
                      </div>
                       <h3 className="text-xl font-bold text-slate-900 tracking-tight">Informasi Pelapor</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nama Mahasiswa</label>
                        <input type="text" name="counselee_name" value={manualForm.counselee_name} onChange={handleManualChange} required placeholder="Nama Lengkap"
                          className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-inner" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">NIM Mahasiswa</label>
                        <input type="text" name="guest_nim" value={manualForm.guest_nim} onChange={handleManualChange} placeholder="NIM"
                          className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-inner" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">WhatsApp</label>
                        <input type="text" name="guest_wa" value={manualForm.guest_wa} onChange={handleManualChange} placeholder="08xxxx"
                          className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-inner" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email</label>
                        <input type="email" name="guest_email" value={manualForm.guest_email} onChange={handleManualChange} placeholder="Email"
                          className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-inner" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ringkasan Masalah</label>
                      <textarea name="keterangan_pihak" value={manualForm.keterangan_pihak} onChange={handleManualChange} rows={5} required placeholder="Tuliskan inti masalah..."
                        className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-[2.5rem] text-sm font-medium text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 shadow-inner resize-none transition-all" />
                    </div>
                  </div>
                </div>

                {manualForm.is_record_only && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="pt-16 border-t-2 border-dashed border-gray-100 dark:border-slate-800">
                    <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-8 md:p-12 rounded-[3rem] border border-emerald-100 dark:border-emerald-900/30">
                      <label className="text-[10px] font-bold text-emerald-700 mb-6 block uppercase tracking-wide">Catatan Terapi / Hasil Akhir</label>
                      <textarea name="saran_konselor" value={manualForm.saran_konselor} onChange={handleManualChange} rows={6} placeholder="Masukkan hasil akhir untuk arsip ini..."
                        className="w-full px-8 py-6 bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-800/50 focus:border-emerald-500 rounded-[2rem] text-sm font-medium text-slate-900 dark:text-white outline-none resize-none shadow-sm" />
                    </div>
                  </motion.div>
                )}

                <div className="pt-16 flex flex-col md:flex-row justify-end items-center gap-10">
                  <button type="button" onClick={() => navigate(-1)} className="text-xs font-bold text-slate-400 uppercase tracking-wide hover:text-rose-500 transition-all">Batalkan</button>
                  <button type="submit" disabled={manualSubmitting}
                    className={`w-full md:min-w-[400px] py-8 text-white font-bold rounded-full text-xs tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 ${
                      manualForm.is_record_only ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                    }`}
                  >
                    {manualSubmitting ? <><FiLoader className="animate-spin" /> PROSES...</> : <><FiSave size={24} /> SIMPAN DATA</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OperatorManualCounseling;
