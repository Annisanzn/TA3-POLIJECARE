import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_contribution: 0, label: 'Kontribusi' });
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
          roleLabel: 'Konselor Spesialis'
        };
      default:
        return {
          primary: 'from-emerald-600 to-teal-700',
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-100',
          iconBg: 'bg-emerald-100',
          roleLabel: 'Pelapor (Mahasiswa/Umum)'
        };
    }
  };

  const theme = getRoleTheme();
  const initial = user?.name ? user.name[0].toUpperCase() : 'U';

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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
                    <div className={`w-full h-full rounded-[26px] bg-gradient-to-br ${theme.primary} flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-inner`}>
                      {initial}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/10 rounded-[32px] blur-2xl -z-10 translate-y-4" />
                </div>

                <div className="flex-1 space-y-2 mb-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
                      {user?.name || 'Loading...'}
                    </h1>
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[9px] font-black uppercase tracking-[0.2em]">
                      {theme.roleLabel}
                    </div>
                  </div>
                  <p className="text-white/80 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                    <FiMail className="opacity-60" /> {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 md:-mt-10 relative z-20 pb-20">
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
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Detail Identitas PolijeCare</p>
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <FiHash className="text-indigo-500" /> NIM / ID PETUGAS
                        </label>
                        <p className="text-gray-900 font-bold text-lg tabular-nums tracking-tight">
                          {user?.nim || '—'}
                        </p>
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <FiPhone className="text-emerald-500" /> NOMOR WHATSAPP
                        </label>
                        <p className="text-gray-900 font-bold text-lg tabular-nums tracking-tight">
                          {user?.phone || 'Belum diisi'}
                        </p>
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <FiBriefcase className="text-rose-500" /> POSISI / UNIT
                        </label>
                        <p className="text-gray-900 font-bold text-lg tracking-tight uppercase">
                          {user?.role === 'user' ? 'Mahasiswa' : 'Satgas PPKPKT'}
                        </p>
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <FiShield className="text-amber-500" /> STATUS AKUN
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                          <p className="text-gray-900 font-bold text-lg tracking-tight">Aktif & Terverifikasi</p>
                        </div>
                        <div className="h-px w-full bg-gray-50 mt-2" />
                      </div>
                   </div>
                </div>

                {/* Quick Actions Card - FIXED CONTRAST */}
                <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl shadow-slate-900/10 text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group border border-slate-800">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl transition-transform group-hover:scale-150 duration-1000" />
                   <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                           <FiSettings size={20} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-white">Keamanan & Layanan</h3>
                     </div>
                     <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                       Butuh bantuan teknis atau ingin memperbarui keamanan akun? Silakan hubungi tim IT Satgas atau gunakan tombol logout di bawah.
                     </p>
                   </div>
                   <div className="flex gap-4 relative z-10 shrink-0">
                      <button 
                        onClick={handleLogout}
                        className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-[24px] text-xs font-black tracking-widest uppercase transition-all shadow-xl shadow-rose-500/30 flex items-center gap-3 active:scale-95"
                      >
                        <FiLogOut /> KELUAR AKUN
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
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Statistik Penggunaan</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      {/* Contribution Card */}
                      <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 group hover:shadow-md transition-all duration-500">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">{stats.label}</p>
                        <div className="flex items-end gap-3">
                          <span className="text-6xl font-black text-indigo-600 tracking-tighter transition-transform group-hover:scale-105 duration-500 inline-block origin-left">
                            {isLoading ? '...' : stats.total_contribution}
                          </span>
                          <span className="text-lg font-bold text-indigo-400 mb-2">Item</span>
                        </div>
                      </div>

                      {/* Verification Card */}
                      <div className="p-8 rounded-[32px] bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Verifikasi</p>
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
                          <p className="text-[11px] text-amber-700 font-medium leading-relaxed italic">
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
