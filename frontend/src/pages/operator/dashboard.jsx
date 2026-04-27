import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiFileText, FiCheckCircle, FiClock, 
  FiTrendingUp, FiCalendar, FiMessageSquare, FiMenu, FiLogOut
} from 'react-icons/fi';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../components/layout/Sidebar';
import ChartSection from '../../components/ChartSection';
import CounselingCalendar from '../../components/CounselingCalendar';
import DashboardNotification from '../../components/DashboardNotification';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    summary: { total: 0, approved: 0, pending: 0, completed: 0, new: 0 },
    weekly: []
  });
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, compStatsRes] = await Promise.all([
          api.get('/counseling/statistics'),
          api.get('/operator/complaints-stats')
        ]);
        
        setStats({
          summary: {
            ...statsRes.data.data,
            pending: compStatsRes.data.data.pending,
            new: compStatsRes.data.data.pending, // Menggunakan pending sebagai 'new'
            total: compStatsRes.data.data.total
          }
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { 
      label: 'Total Pengaduan', 
      value: stats.summary.total, 
      icon: <FiFileText />, 
      color: 'bg-indigo-500',
      shadow: 'shadow-indigo-200 dark:shadow-indigo-900/20',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400'
    },
    { 
      label: 'Dalam Penanganan', 
      value: stats.summary.approved, 
      icon: <FiClock />, 
      color: 'bg-amber-500',
      shadow: 'shadow-amber-200 dark:shadow-amber-900/20',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400'
    },
    { 
      label: 'Selesai', 
      value: stats.summary.completed, 
      icon: <FiCheckCircle />, 
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-200 dark:shadow-emerald-900/20',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400'
    },
    { 
      label: 'Menunggu Atensi', 
      value: stats.summary.pending, 
      icon: <FiTrendingUp />, 
      color: 'bg-rose-500',
      shadow: 'shadow-rose-200 dark:shadow-rose-900/20',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      text: 'text-rose-600 dark:text-rose-400'
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-['Poppins'] overflow-hidden transition-colors duration-500">
      {/* Sidebar - Persistent Desktop, Drawer Mobile */}
      <div className="flex-none h-full overflow-y-auto no-scrollbar border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all">
        <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-4 md:px-8 py-4 md:py-6 shrink-0 z-30 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleSidebar}
                className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl lg:hidden hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
              >
                <FiMenu size={20} className="dark:text-white" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
                <p className="text-[11px] text-slate-500 font-medium tracking-wide">Ringkasan Sistem PolijeCare</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DashboardNotification role="operator" />
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 border border-rose-100"
                title="Keluar Sesi"
              >
                <FiLogOut size={16} /> <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50 transition-all">
          {/* Welcome Banner */}
          <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-1 text-slate-900 tracking-tight">
                Selamat Datang, <span className="text-indigo-600">{user?.name?.split(' ')[0]}!</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-medium text-sm leading-relaxed">
                Ada <span className="font-bold text-rose-600 px-1.5 py-0.5 bg-rose-50 rounded-lg">{stats.summary.new} laporan baru</span> yang menunggu atensi Anda hari ini.
                Mari kelola pengaduan dengan sigap dan efisien.
              </p>
              <div className="flex items-center space-x-4 mt-6 pt-2">
                <button 
                  onClick={() => navigate('/operator/case-management?tab=new')}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 px-8 py-3.5 rounded-2xl font-bold text-xs transition-all active:scale-95 flex items-center gap-3"
                >
                  Tinjau Laporan <FiTrendingUp size={16} />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FiCalendar size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waktu Sistem</p>
                    <p className="text-sm font-bold text-slate-800 tracking-tight">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statCards.map((card, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative"
              >
                <div className={`absolute -right-4 -bottom-4 opacity-5 text-slate-900 dark:text-white group-hover:scale-110 transition-transform`} style={{ fontSize: '100px' }}>
                    {card.icon}
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-3.5 ${card.bg} rounded-2xl ${card.text} shadow-inner group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(card.icon, { size: 24 })}
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">{card.label}</h3>
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Grid: Chart & Calendar */}
          <div className="space-y-8">
            <ChartSection />
            <div className="grid grid-cols-1 gap-8">
              <CounselingCalendar role="operator" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OperatorDashboard;
