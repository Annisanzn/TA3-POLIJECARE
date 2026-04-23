import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import SummaryCard from '../../components/SummaryCard';
import ChartSection from '../../components/ChartSection';
import CounselingCalendar from '../../components/CounselingCalendar';
import ActivityList from '../../components/ActivityList';
import api from '../../api/axios';
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import DashboardNotification from '../../components/DashboardNotification';

const KonselorDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/konselor/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      } else {
        setError(res.data.message || 'Gagal memuat statistik');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal terhubung ke server');
      console.error('Failed to fetch dashboard stats', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const j = stats?.jadwal || {};

  const summaryData = [
    {
      title: 'Jadwal Menunggu',
      value: isLoading ? '...' : (j.pending ?? 0),
      icon: 'new',
      badge: '',
      trend: '',
      description: `${j.pending ?? 0} perlu konfirmasi`
    },
    {
      title: 'Jadwal Disetujui',
      value: isLoading ? '...' : (j.approved ?? 0),
      icon: 'approved',
      badge: '',
      trend: '',
      description: `${j.approved ?? 0} jadwal aktif`
    },
    {
      title: 'Sesi Selesai',
      value: isLoading ? '...' : (j.completed ?? 0),
      icon: 'completed',
      badge: '',
      trend: '',
      description: `${j.completed ?? 0} telah diselesaikan`
    },
    {
      title: 'Total Jadwal',
      value: isLoading ? '...' : (j.total ?? 0),
      icon: 'total',
      badge: '',
      trend: '',
      description: `${j.total ?? 0} total jadwal`
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar — same as operator */}
        <Topbar onMenuClick={toggleSidebar} title="Ringkasan Statistik" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-auto">
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <FiAlertCircle className="flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Welcome Banner */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Selamat Datang, Konselor!</h1>
              <p className="text-gray-600 max-w-2xl">
                Anda memiliki <span className="font-bold text-gray-900">{j.pending ?? 0} jadwal menunggu konfirmasi</span> yang membutuhkan perhatian segera.
                Pantau aktivitas konseling dan kelola jadwal dengan efisien.
              </p>
              <div className="flex items-center space-x-4 mt-6">
                <button
                  onClick={() => navigate('/konselor/jadwal')}
                  className="bg-[#6666DE] text-white hover:bg-[#5555CC] shadow-md px-6 py-2.5 rounded-xl font-medium transition-colors"
                >
                  Lihat Jadwal
                </button>
                <button
                  onClick={() => navigate('/konselor/pengaduan')}
                  className="bg-white text-[#6666DE] border border-gray-200 hover:bg-gray-50 shadow-sm px-6 py-2.5 rounded-xl font-medium transition-colors"
                >
                  Lihat Pengaduan
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DashboardNotification role="konselor" />
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
              >
                <FiRefreshCw className={isLoading ? 'animate-spin text-gray-400' : 'text-gray-600'} />
                Refresh
              </button>
            </div>
          </div>

          {/* Summary Cards Grid — 4 cards like operator */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryData.map((item, index) => (
              <SummaryCard
                key={index}
                title={item.title}
                value={item.value}
                icon={item.icon}
                badge={item.badge}
                trend={item.trend}
                description={item.description}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="mb-8">
            <ChartSection />
          </div>

          {/* Counseling Calendar */}
          <div className="mb-8">
            <CounselingCalendar role="konselor" />
          </div>

          {/* Activity List */}
          <div className="mb-8">
            <ActivityList />
          </div>

          {/* Quick Stats Footer */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-[#E6E6FA] mb-2">{j.today ?? 0}</div>
                <div className="text-sm text-gray-600">Sesi Hari Ini</div>
              </div>
              <div className="text-center p-4 border-l border-r border-gray-100">
                <div className="text-2xl font-bold text-green-600 mb-2">{j.upcoming ?? 0}</div>
                <div className="text-sm text-gray-600">Jadwal Mendatang</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">{stats?.materi ?? 0}</div>
                <div className="text-sm text-gray-600">Total Materi Saya</div>
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
};

export default KonselorDashboard;
