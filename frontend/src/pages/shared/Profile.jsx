import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiUser, FiMail, FiPhone, FiInfo, FiCalendar, 
  FiArrowLeft, FiLogOut, FiBriefcase, FiHash,
  FiActivity, FiCheckCircle, FiShield, FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../utils/axiosConfig';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    unit: user?.unit || '',
    prodi: user?.prodi || '',
    nim: user?.nim || '',
    semester: user?.semester || '',
    bio: user?.bio || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total_contribution: 0, label: 'Kontribusi' });
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || '',
        unit: user.unit || '',
        prodi: user.prodi || '',
        nim: user.nim || '',
        semester: user.semester || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const response = await axios.get('/profile/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login-new');
  };

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.gender || !formData.unit) {
      toast.error('Nama, Jenis Kelamin, dan Unit wajib diisi!');
      return;
    }

    toast.dismiss();
    setIsSaving(true);
    try {
      const response = await axios.put('/profile', formData);
      if (response.data.success) {
        // Update local auth state so changes reflect immediately
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        toast.success('Profil berhasil diperbarui!', {
          duration: 4000,
          icon: '✅'
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update error:', error);
      const message = error.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleTheme = () => {
    switch (user?.role) {
      case 'operator':
      case 'admin':
        return {
          primary: 'from-blue-600 to-indigo-700',
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-100',
          iconBg: 'bg-blue-100',
          roleLabel: 'Satgas Admin'
        };
      case 'konselor':
        return {
          primary: 'from-purple-600 to-violet-700',
          bg: 'bg-purple-50',
          text: 'text-purple-600',
          border: 'border-purple-100',
          iconBg: 'bg-purple-100',
          roleLabel: 'Tim Satgas PPKPT'
        };
      default:
        return {
          primary: 'from-emerald-600 to-teal-700',
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-100',
          iconBg: 'bg-emerald-100',
          roleLabel: 'Pelapor'
        };
    }
  };

  const theme = getRoleTheme();
  const initial = user?.name ? user.name[0].toUpperCase() : 'U';

  const isProfileIncomplete = user?.role === 'user' && (!user?.gender || !user?.unit || !user?.name);

  return (
    <div className="flex min-h-screen bg-gray-50 font-['Poppins']">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Topbar onMenuClick={toggleSidebar} title="Profil Saya" />

        <div className="flex-1 overflow-y-auto">
          {/* ── Header / Banner ── */}
          <div className={`h-auto min-h-[300px] md:h-64 bg-gradient-to-r ${theme.primary} relative overflow-hidden pb-12 md:pb-0`}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 -right-24 w-64 h-64 bg-indigo-200 rounded-full blur-3xl" />
            </div>
            
            <div className="max-w-6xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center relative z-10 pt-10 md:pt-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-[32px] bg-white p-1.5 shadow-2xl relative z-10 rotate-2 group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
                    <div className={`w-full h-full rounded-[26px] bg-gradient-to-br ${theme.primary} flex items-center justify-center text-4xl md:text-5xl font-bold text-white shadow-inner`}>
                      {initial}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/10 rounded-[32px] blur-2xl -z-10 translate-y-4" />
                </div>

                <div className="flex-1 space-y-2 mb-2">
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                       <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-white/20 backdrop-blur-md border border-white/40 text-white text-2xl md:text-3xl font-semibold px-4 py-2 rounded-2xl outline-none placeholder:text-white/50 w-full md:w-auto"
                        placeholder="Nama Lengkap"
                       />
                    ) : (
                      <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                        {user?.name || 'Loading...'}
                      </h1>
                    )}
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-medium tracking-wide">
                      {theme.roleLabel}
                    </div>
                  </div>
                  <p className="text-white/80 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                    <FiMail className="opacity-60" /> {user?.email}
                  </p>
                </div>

                <div className="mb-2">
                    {!isEditing && (
                      <button 
                       onClick={() => setIsEditing(true)}
                       className="px-6 py-3 bg-white text-slate-900 rounded-2xl text-xs font-semibold tracking-wide shadow-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                      >
                         <FiSettings /> Edit Profil
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 md:-mt-10 relative z-20 pb-20">
            {isProfileIncomplete && (
              <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                    <FiInfo size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">Profil Belum Lengkap!</h3>
                    <p className="text-amber-700 text-xs">Mohon lengkapi Jenis Kelamin dan Unit sebelum dapat membuat laporan baru.</p>
                  </div>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-amber-500 text-white rounded-xl text-xs font-semibold tracking-wide hover:bg-amber-600 transition-all"
                  >
                    Lengkapi Sekarang
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* ── Left Column: Identity Info ── */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-sm border border-gray-100">
                   <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${theme.iconBg} ${theme.text}`}>
                          <FiUser size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Informasi Dasar</h2>
                          <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest mt-0.5">Detail Identitas PolijeCare</p>
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <FiHash className="text-indigo-500" /> NIM / ID PETUGAS
                        </label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={formData.nim} 
                            onChange={(e) => setFormData({...formData, nim: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-all"
                            placeholder="Masukkan NIM / ID"
                            maxLength="20"
                          />
                        ) : (
                          <p className="text-gray-900 font-semibold text-lg tabular-nums tracking-tight">
                            {user?.nim || '—'}
                          </p>
                        )}
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <FiCalendar className="text-amber-500" /> SEMESTER
                        </label>
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={formData.semester} 
                            onChange={(e) => setFormData({...formData, semester: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:border-amber-500 transition-all"
                            placeholder="Contoh: 4"
                            min="1"
                            max="14"
                          />
                        ) : (
                          <p className="text-gray-900 font-semibold text-lg tabular-nums tracking-tight">
                            {user?.semester ? `Semester ${user.semester}` : 'Belum diisi'}
                          </p>
                        )}
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <FiPhone className="text-emerald-500" /> NOMOR WHATSAPP
                        </label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={formData.phone} 
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 transition-all"
                            placeholder="Contoh: 08123456789"
                            maxLength="25"
                          />
                        ) : (
                          <p className="text-gray-900 font-semibold text-lg tabular-nums tracking-tight">
                            {user?.phone || 'Belum diisi'}
                          </p>
                        )}
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <FiActivity className="text-purple-500" /> JENIS KELAMIN
                        </label>
                        {isEditing ? (
                          <select 
                            value={formData.gender} 
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:border-purple-500 transition-all cursor-pointer"
                          >
                            <option value="">Pilih Jenis Kelamin</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 font-semibold text-lg tracking-tight">
                            {user?.gender || 'Belum diisi'}
                          </p>
                        )}
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <FiBriefcase className="text-rose-500" /> UNIT / DEPARTEMEN
                        </label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={formData.unit} 
                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:border-rose-500 transition-all"
                            placeholder="Contoh: Jurusan Teknologi Informasi"
                            maxLength="255"
                          />
                        ) : (
                          <p className="text-gray-900 font-semibold text-lg tracking-tight">
                            {user?.unit || 'Belum diisi'}
                          </p>
                        )}
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <FiBriefcase className="text-sky-500" /> PROGRAM STUDI
                        </label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={formData.prodi} 
                            onChange={(e) => setFormData({...formData, prodi: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold outline-none focus:border-sky-500 transition-all"
                            placeholder="Contoh: Teknik Informatika"
                            maxLength="255"
                          />
                        ) : (
                          <p className="text-gray-900 font-semibold text-lg tracking-tight">
                            {user?.prodi || 'Belum diisi'}
                          </p>
                        )}
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <FiInfo className="text-blue-500" /> BIOGRAFI / CATATAN
                        </label>
                        {isEditing ? (
                          <textarea 
                            value={formData.bio} 
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition-all min-h-[100px]"
                            placeholder="Tuliskan sedikit tentang Anda..."
                          />
                        ) : (
                          <p className="text-gray-600 text-sm font-medium leading-relaxed">
                            {user?.bio || 'Tidak ada biografi.'}
                          </p>
                        )}
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>
                   </div>

                   {isEditing && (
                     <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl text-xs font-semibold tracking-wide hover:bg-gray-200 transition-all order-2 sm:order-1"
                        >
                            Batal
                        </button>
                        <button 
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="w-full sm:w-auto px-10 py-4 bg-emerald-500 text-white rounded-2xl text-xs font-semibold tracking-wide shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                     </div>
                   )}
                </div>

                {/* Quick Actions Card - FIXED CONTRAST */}
                <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl shadow-slate-900/10 text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group border border-slate-800">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl transition-transform group-hover:scale-150 duration-1000" />
                   <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                           <FiSettings size={20} />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-white">Keamanan & Layanan</h3>
                     </div>
                     <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                       Butuh bantuan teknis atau ingin memperbarui keamanan akun? Silakan hubungi tim IT Satgas atau gunakan tombol logout di bawah.
                     </p>
                   </div>
                   <div className="flex gap-4 relative z-10 shrink-0">
                      <button 
                        onClick={handleLogout}
                        className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-[24px] text-xs font-bold tracking-widest uppercase transition-all shadow-xl shadow-rose-500/30 flex items-center gap-3 active:scale-95"
                      >
                        <FiLogOut /> Keluar Akun
                      </button>
                   </div>
                </div>
              </div>

              {/* ── Right Column: Stats ── */}
              <div className="space-y-8">
                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 overflow-hidden relative">
                   <div className="flex items-center gap-4 mb-10">
                      <div className={`p-3 rounded-2xl bg-indigo-50 text-indigo-600`}>
                        <FiActivity size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Ringkasan</h2>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Statistik Penggunaan</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      {/* Contribution Card */}
                      <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 group hover:shadow-md transition-all duration-500">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">{stats.label}</p>
                        <div className="flex items-end gap-3">
                          <span className="text-6xl font-bold text-indigo-600 tracking-tighter transition-transform group-hover:scale-105 duration-500 inline-block origin-left">
                            {isLoading ? '...' : stats.total_contribution}
                          </span>
                          <span className="text-lg font-bold text-indigo-400 mb-2">Item</span>
                        </div>
                      </div>

                      {/* Verification Card */}
                      <div className="p-8 rounded-[32px] bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Verifikasi</p>
                          <p className="text-lg font-bold text-gray-900">Email Kampus</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                          <FiCheckCircle size={24} />
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100">
                        <div className="flex gap-4">
                          <FiInfo className="text-amber-600 shrink-0 mt-0.5" size={18} />
                          <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                            Data identitas ditarik langsung dari sistem keanggotaan Polije. Untuk perubahan nama atau ID, harap hubungi administrator.
                          </p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
