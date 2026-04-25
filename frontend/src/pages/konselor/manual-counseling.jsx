import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiAlertCircle, FiCalendar, FiCheck, FiMapPin, FiVideo, 
  FiFileText, FiLoader, FiSave, FiUser, FiSmartphone, FiMail, FiHash, FiShield
} from 'react-icons/fi';
import axios from '../../api/axios';
import Topbar from '../../components/layout/Topbar';
import Sidebar from '../../components/layout/Sidebar';
import TimePicker24h from '../../components/ui/TimePicker24h';

const ManualCounseling = () => {
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
    counselor_target: 'self'
  });
  
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState('');

  // Fetch init data
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [catRes, counsRes] = await Promise.all([
          axios.get('/public-categories'),
          axios.get('/counseling/counselors')
        ]);
        if (catRes.data?.success) setCategories(catRes.data.data);
        if (counsRes.data?.success) setCounselors(counsRes.data.data);
      } catch (error) {
        console.error('Error fetching init data:', error);
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
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const selectedStart = new Date(`${manualForm.tanggal}T${manualForm.jam_mulai}`);
      const selectedEnd = new Date(`${manualForm.tanggal}T${manualForm.jam_selesai}`);

      // Basic Time Order Check
      if (manualForm.jam_selesai <= manualForm.jam_mulai) {
        throw new Error('Jam selesai harus lebih besar dari jam mulai.');
      }

      if (!manualForm.is_record_only) {
        // Validation for FUTURE mode (Jadwalkan)
        if (selectedStart < now) {
          throw new Error('Untuk penjadwalan masa depan, silakan pilih tanggal dan jam yang belum terlewati.');
        }
      } else {
        // Validation for ARCHIVE mode (Arsip Selesai)
        if (manualForm.tanggal > todayStr) {
          throw new Error('Mode arsip hanya digunakan untuk mencatat sesi yang sudah terjadi (hari ini atau lampau).');
        }
      }

      if (manualForm.metode === 'offline' && !manualForm.lokasi) {
        throw new Error('Silakan isi lokasi untuk pertemuan tata muka.');
      }
      if (manualForm.metode === 'online' && !manualForm.meeting_link) {
        throw new Error('Silakan isi Link Meeting untuk konseling online.');
      }
      if (!manualForm.keterangan_pihak) {
        throw new Error('Deskripsi Kasus & Kronologi Singkat wajib diisi.');
      }

      await axios.post('/konselor/jadwal', manualForm);
      navigate('/konselor/case-management'); // redirect back on success
    } catch (err) {
      console.error('Error saat menyimpan jadwal/sesi manual:', err);
      // Conflict checking
      if (err.response && err.response.status === 409) {
        setManualError(err.response.data.message || 'Jadwal bertabrakan dengan sesi lain.');
      } else {
        setManualError(err.response?.data?.message || err.message || 'Gagal menyimpan sesi. Coba lagi.');
      }
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-['Poppins']">
      {/* Sidebar */}
      <div 
        className="fixed inset-y-0 left-0 z-30"
        style={{ background: 'linear-gradient(180deg, #44337A 0%, #2D3748 100%)' }}
      >
        <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} flex flex-col h-screen overflow-hidden`}>
        <div className="flex-none">
          <Topbar onMenuClick={toggleSidebar} title="Konseling Manual" subtitle="Pencatatan sesi tatap muka & pelaporan langsung" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="w-full space-y-6">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center text-gray-400 hover:text-purple-600 mb-2 font-medium text-sm tracking-widest transition-all"
            >
              <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> KEMBALI
            </button>

            <div className="bg-white rounded-[40px] shadow-2xl shadow-purple-900/5 border border-purple-50 overflow-hidden">
              <div className="px-10 py-8 bg-gradient-to-r from-white to-purple-50/30 border-b border-gray-100 relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <FiAlertCircle size={80} className="text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Form Konseling Manual</h2>
                <p className="text-base text-gray-500 mt-1 font-medium">Lengkapi data laporan dan sesi untuk administrasi internal Satgas.</p>
              </div>

              <form onSubmit={handleManualSubmit} className="px-10 py-8 space-y-10">
                {/* Error Banner */}
                {manualError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50 border-2 border-rose-100 text-rose-700 px-8 py-5 rounded-[24px] text-sm font-medium flex items-center gap-4 shadow-sm"
                  >
                    <div className="bg-rose-500 text-white p-2 rounded-full">
                      <FiAlertCircle size={20} />
                    </div>
                    {manualError}
                  </motion.div>
                )}

                {/* Mode Toggle & Info */}
                <section className="space-y-4">
                  <div className="bg-gray-100/80 rounded-[32px] p-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleManualChange({ target: { name: 'is_record_only', value: false } })}
                      className={`flex-1 py-4 rounded-[26px] text-xs font-semibold tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                        !manualForm.is_record_only
                          ? 'bg-white text-purple-700 shadow-xl shadow-purple-200'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <FiCalendar size={16} /> JADWALKAN
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualChange({ target: { name: 'is_record_only', value: true } })}
                      className={`flex-1 py-4 rounded-[26px] text-xs font-semibold tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                        manualForm.is_record_only
                          ? 'bg-white text-blue-700 shadow-xl shadow-blue-200'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <FiCheck size={16} /> ARSIP SELESAI
                    </button>
                  </div>
                  
                  <div className={`p-5 rounded-[24px] text-xs font-medium flex items-start gap-4 border ${
                    manualForm.is_record_only
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    <FiShield size={18} className="shrink-0" />
                    <p className="leading-relaxed">
                      {manualForm.is_record_only
                        ? 'Sesi ditandai SELESAI. Digunakan untuk mencatat obrolan walk-in yang sudah terjadi. Input Saran Konselor akan terbuka.'
                        : 'Sesi ditandai AKAN DATANG. Digunakan untuk booking jadwal tatap muka di masa depan melalui sistem.'
                      }
                    </p>
                  </div>
                </section>

                {/* SECTION 1: INFORMASI SESI */}
                <section className="space-y-6 bg-gray-50/50 p-8 rounded-[36px] border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                      <FiCalendar size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 tracking-wider">INFORMASI SESI</h3>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Waktu, Tempat & Kategori</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">Kategori Masalah <span className="text-rose-500">*</span></label>
                       <select
                        name="jenis_pengaduan"
                        value={manualForm.jenis_pengaduan}
                        onChange={handleManualChange}
                        required
                        className="w-full px-6 py-4 bg-white border-2 border-transparent hover:border-purple-100 focus:border-purple-500 rounded-[28px] text-base font-medium outline-none transition-all cursor-pointer shadow-sm shadow-purple-900/5 appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                      >
                        <option value="">-- PILIH KATEGORI --</option>
                        {categories.map(cat => (
                          <option key={cat.unique_id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">Tanggal Konseling <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        name="tanggal"
                        value={manualForm.tanggal}
                        onChange={handleManualChange}
                        required
                        min={!manualForm.is_record_only ? new Date().toISOString().split('T')[0] : undefined}
                        className="w-full px-6 py-4 bg-white border-2 border-transparent hover:border-purple-100 focus:border-purple-500 rounded-[28px] text-base font-medium outline-none transition-all shadow-sm shadow-purple-900/5 text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TimePicker24h 
                      label="Jam Mulai" 
                      value={manualForm.jam_mulai} 
                      onChange={(val) => handleTimeChange('jam_mulai', val)} 
                    />
                    <TimePicker24h 
                      label="Jam Selesai" 
                      value={manualForm.jam_selesai} 
                      onChange={(val) => handleTimeChange('jam_selesai', val)} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">Metode Pertemuan</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleManualChange({ target: { name: 'metode', value: 'offline' } })}
                          className={`flex-1 py-4 rounded-[28px] text-xs font-medium tracking-widest flex items-center justify-center gap-3 transition-all border-2 ${
                            manualForm.metode === 'offline'
                              ? 'bg-white text-emerald-600 border-emerald-500 shadow-lg shadow-emerald-100'
                              : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200'
                          }`}
                        >
                          <FiMapPin /> TATAP MUKA
                        </button>
                        <button
                          type="button"
                          onClick={() => handleManualChange({ target: { name: 'metode', value: 'online' } })}
                          className={`flex-1 py-4 rounded-[28px] text-xs font-medium tracking-widest flex items-center justify-center gap-3 transition-all border-2 ${
                            manualForm.metode === 'online'
                              ? 'bg-white text-indigo-600 border-indigo-500 shadow-lg shadow-indigo-100'
                              : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'
                          }`}
                        >
                          <FiVideo /> ONLINE
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">
                        {manualForm.metode === 'offline' ? 'Detail Lokasi' : 'Link Meeting (URL)'}
                       </label>
                       <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                          {manualForm.metode === 'offline' ? <FiMapPin size={16} /> : <FiVideo size={16} />}
                        </div>
                        <input
                          type={manualForm.metode === 'offline' ? 'text' : 'url'}
                          name={manualForm.metode === 'offline' ? 'lokasi' : 'meeting_link'}
                          value={manualForm.metode === 'offline' ? manualForm.lokasi : manualForm.meeting_link}
                          onChange={handleManualChange}
                          placeholder={manualForm.metode === 'offline' ? 'Contoh: Gedung JTI Lt. 2' : 'https://meet.google.com/...'}
                          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent hover:border-purple-100 focus:border-purple-500 rounded-[28px] text-base font-medium outline-none transition-all shadow-sm shadow-purple-900/5 placeholder:text-gray-300"
                        />
                       </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 2: DATA PELAPOR */}
                <section className="space-y-6 bg-purple-50/30 p-8 rounded-[36px] border border-purple-50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 tracking-wider">DATA PELAPOR (KORBAN)</h3>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Identitas Pihak Pengadu</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">Nama Lengkap <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        name="counselee_name"
                        value={manualForm.counselee_name}
                        onChange={handleManualChange}
                        placeholder="Nama asli pelapor"
                        required
                        className="w-full px-6 py-4 bg-white border-2 border-transparent hover:border-indigo-100 focus:border-indigo-500 rounded-[28px] text-base font-medium outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">NIM / ID Identitas</label>
                      <div className="relative">
                        <FiHash className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input
                          type="text"
                          name="guest_nim"
                          value={manualForm.guest_nim}
                          onChange={handleManualChange}
                          placeholder="Contoh: E4121xxxx"
                          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent hover:border-indigo-100 focus:border-indigo-500 rounded-[28px] text-base font-medium outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">Email Aktif</label>
                      <div className="relative">
                        <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input
                          type="email"
                          name="guest_email"
                          value={manualForm.guest_email}
                          onChange={handleManualChange}
                          placeholder="pelapor@gmail.com"
                          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent hover:border-indigo-100 focus:border-indigo-500 rounded-[28px] text-base font-medium outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">Nomor WhatsApp (WA)</label>
                      <div className="relative">
                        <FiSmartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input
                          type="text"
                          name="guest_wa"
                          value={manualForm.guest_wa}
                          onChange={handleManualChange}
                          placeholder="0812xxxxxxxx"
                          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent hover:border-indigo-100 focus:border-indigo-500 rounded-[28px] text-base font-medium outline-none transition-all shadow-sm placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 3: DATA TERLAPOR */}
                <section className="space-y-6 bg-rose-50/20 p-8 rounded-[36px] border border-rose-100/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                      <FiShield size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 tracking-wider">DATA TERLAPOR (PELAKU)</h3>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Informasi Pihak yang Diadukan</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">Nama Terlapor</label>
                      <input
                        type="text"
                        name="suspect_name"
                        value={manualForm.suspect_name}
                        onChange={handleManualChange}
                        placeholder="Nama pelaku/pihak terkait"
                        className="w-full px-6 py-4 bg-white border-2 border-transparent hover:border-rose-100 focus:border-rose-500 rounded-[28px] text-sm font-medium outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">Status Terlapor</label>
                      <select
                        name="suspect_status"
                        value={manualForm.suspect_status}
                        onChange={handleManualChange}
                        className="w-full px-6 py-4 bg-white border-2 border-transparent hover:border-rose-100 focus:border-rose-500 rounded-[28px] text-base font-medium outline-none transition-all cursor-pointer shadow-sm appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23F43F5E'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                      >
                        <option value="Mahasiswa">Mahasiswa</option>
                        <option value="Dosen">Dosen</option>
                        <option value="Tenaga Pendidik">Tenaga Pendidik</option>
                        <option value="Pihak Luar">Pihak Luar</option>
                        <option value="-">Tidak Diketahui</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">Afiliasi / Jurusan</label>
                       <input
                        type="text"
                        name="suspect_affiliation"
                        value={manualForm.suspect_affiliation}
                        onChange={handleManualChange}
                        placeholder="Contoh: TI, Teknik, dll"
                        className="w-full px-6 py-4 bg-white border-2 border-transparent hover:border-rose-100 focus:border-rose-500 rounded-[28px] text-sm font-medium outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-widest px-1">Kontak Terlapor</label>
                      <div className="relative">
                        <FiSmartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input
                          type="text"
                          name="suspect_phone"
                          value={manualForm.suspect_phone}
                          onChange={handleManualChange}
                          placeholder="Nomor HP/WA"
                          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent hover:border-rose-100 focus:border-rose-500 rounded-[28px] text-base font-medium outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* SESSI: KONTEN KASUS */}
                <section className="space-y-8 pt-8 border-t border-gray-100">
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-gray-900 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                      <FiFileText className="text-purple-600" /> DESKRIPSI KASUS & KRONOLOGI <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="keterangan_pihak"
                      value={manualForm.keterangan_pihak}
                      onChange={handleManualChange}
                      rows={6}
                      required
                      placeholder="Jelaskan kronologi singkat kejadian or alasan pelaporan..."
                      className="w-full px-8 py-6 bg-gray-50/50 border-2 border-transparent hover:border-purple-100 focus:bg-white focus:border-purple-500 rounded-[32px] text-base font-medium outline-none transition-all resize-none shadow-inner"
                    />
                  </div>

                  {manualForm.is_record_only && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-4 border-t-2 border-dashed border-blue-100"
                    >
                      <label className="text-xs font-semibold text-blue-700 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                        <FiSave /> CATATAN TERAPI / SARAN KONSELOR
                      </label>
                      <textarea
                        name="saran_konselor"
                        value={manualForm.saran_konselor}
                        onChange={handleManualChange}
                        rows={6}
                        placeholder="Apa hasil dari sesi ini? Catat di sini untuk arsip..."
                        className="w-full px-8 py-6 bg-blue-50/30 border-2 border-transparent hover:border-blue-200 focus:bg-white focus:border-blue-500 rounded-[32px] text-base font-medium outline-none transition-all resize-none shadow-inner"
                      />
                    </motion.div>
                  )}
                </section>

                {/* Submit Action */}
                <div className="pt-12 flex justify-end gap-6">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={manualSubmitting}
                    className="px-10 py-5 text-gray-400 hover:text-gray-900 font-semibold rounded-full tracking-[0.2em] text-xs transition-all"
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    disabled={manualSubmitting}
                    className={`px-12 py-5 text-white font-semibold rounded-full tracking-[0.2em] text-xs shadow-2xl transition-all active:scale-95 disabled:opacity-60 flex items-center gap-3 ${
                      manualForm.is_record_only
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                        : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30'
                    }`}
                  >
                    {manualSubmitting ? (
                      <><FiLoader className="animate-spin" size={18} /> PROSES...</>
                    ) : manualForm.is_record_only ? (
                      <><FiSave size={18} /> SIMPAN & SELESAIKAN</>
                    ) : (
                      <><FiCalendar size={18} /> BUAT JADWAL SESI</>
                    )}
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

export default ManualCounseling;
