import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import SummaryCard from '../../components/SummaryCard';
import ChartSection from '../../components/ChartSection';
import CounselingCalendar from '../../components/CounselingCalendar';
import ActivityList from '../../components/ActivityList';
import api from '../../api/axios';
import { FiRefreshCw } from 'react-icons/fi';
import DashboardNotification from '../../components/DashboardNotification';

const OperatorDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    summary: { new: 0, processing: 0, completed: 0, total: 0 },
    quickStats: { activeUsers: 24, satisfaction: '98%', avgResponseTime: '45m' }
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const resp = await api.get('/operator/dashboard');
      if (resp.data.success) {
        setStats(resp.data.data);
      }
    } catch (e) {
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

  const summaryData = [
    {
      title: 'Laporan Baru',
      value: isLoading ? '...' : stats.summary.new,
      icon: 'new',
      badge: '', // Removed hardcoded trend for realism
      trend: '',
      description: `${stats.summary.new} laporan belum diproses`
    },
    {
      title: 'Laporan Diproses',
      value: isLoading ? '...' : stats.summary.processing,
      icon: 'processing',
      badge: '',
      trend: '',
      description: `${stats.summary.processing} dalam penanganan`
    },
    {
      title: 'Laporan Selesai',
      value: isLoading ? '...' : stats.summary.completed,
      icon: 'completed',
      badge: '',
      trend: '',
      description: `${stats.summary.completed} telah diselesaikan`
    },
    {
      title: 'Total Laporan',
      value: isLoading ? '...' : stats.summary.total,
      icon: 'total',
      badge: '',
      trend: '',
      description: `${stats.summary.total} total laporan`
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-auto">
          {/* Welcome Banner */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-[#E6E6FA] to-[#D6D6EA] rounded-2xl p-8 text-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Selamat Datang, Operator!</h1>
                  <p className="opacity-90 mb-4">
                    Anda memiliki <span className="font-bold">{stats.summary.new} laporan baru</span> yang membutuhkan perhatian segera.
                    Pantau aktivitas sistem dan kelola laporan dengan efisien.
                  </p>
                  <div className="flex items-center space-x-4">
                    <button className="bg-white text-[#6666DE] hover:bg-gray-100 px-5 py-2.5 rounded-xl font-medium transition-colors">
                      Tinjau Laporan Baru
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DashboardNotification role="operator" />
                  <button
                    onClick={fetchDashboardData}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards Grid */}
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
            <CounselingCalendar role="operator" />
          </div>

          {/* Activity List */}
          <div className="mb-8">
            <ActivityList />
          </div>

          {/* Quick Stats Footer */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-[#E6E6FA] mb-2">24</div>
                <div className="text-sm text-gray-600">Pengguna Aktif Hari Ini</div>
              </div>
              <div className="text-center p-4 border-l border-r border-gray-100">
                <div className="text-2xl font-bold text-green-600 mb-2">98%</div>
                <div className="text-sm text-gray-600">Kepuasan Pengguna</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">45m</div>
                <div className="text-sm text-gray-600">Rata-rata Waktu Tanggapan</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default OperatorDashboard;
