import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import SummaryCard from '../../components/SummaryCard';
import ChartSection from '../../components/ChartSection';
import ActivityList from '../../components/ActivityList';

const OperatorDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const summaryData = [
    {
      title: 'Laporan Baru',
      value: '7',
      icon: 'new',
      badge: '+16%',
      trend: '+16%',
      description: '7 laporan belum diproses'
    },
    {
      title: 'Laporan Diproses',
      value: '2',
      icon: 'processing',
      badge: '-33%',
      trend: '-33%',
      description: '2 dalam penanganan'
    },
    {
      title: 'Laporan Selesai',
      value: '3',
      icon: 'completed',
      badge: '+50%',
      trend: '+50%',
      description: '3 telah diselesaikan'
    },
    {
      title: 'Total Laporan',
      value: '12',
      icon: 'total',
      badge: '+20%',
      trend: '+20%',
      description: '12 total laporan'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar dengan gradient ungu #E6E6FA */}
      <div
        className="fixed inset-y-0 left-0 z-30"
        style={{
          background: 'linear-gradient(180deg, #E6E6FA 0%, #D6D6EA 100%)'
        }}
      >
        <Sidebar
          collapsed={sidebarCollapsed} 
          toggleCollapse={toggleSidebar} 
        />
      </div>

      {/* Main Content Area */}
      <div 
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Topbar */}
        <Topbar />

        {/* Main Content */}
        <div className="p-6">
          {/* Welcome Banner */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-[#E6E6FA] to-[#D6D6EA] rounded-2xl p-8 text-gray-800">
              <h1 className="text-2xl font-bold mb-2">Selamat Datang, Operator!</h1>
              <p className="opacity-90 mb-4">
                Anda memiliki <span className="font-bold">7 laporan baru</span> yang membutuhkan perhatian segera.
                Pantau aktivitas sistem dan kelola laporan dengan efisien.
              </p>
              <div className="flex items-center space-x-4">
                <button className="bg-white text-[#6666DE] hover:bg-gray-100 px-5 py-2.5 rounded-xl font-medium transition-colors">
                  Tinjau Laporan Baru
                </button>
                <button className="bg-gray-800/20 hover:bg-gray-800/30 text-gray-800 px-5 py-2.5 rounded-xl font-medium transition-colors">
                  Lihat Statistik
                </button>
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
        </div>
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
