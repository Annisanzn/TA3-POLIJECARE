import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiFileText, FiClock, FiCheckCircle, FiPlus } from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../hooks/useAuth';
import userComplaintService from '../../services/userComplaintService';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const UserDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    resolved: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Ambil maksimal 100 laporan untuk menghitung statistik status
        const res = await userComplaintService.getHistoriPengaduan({ per_page: 100 });
        const complaints = res.data || [];

        setRecentComplaints(complaints.slice(0, 3));
        setStats({
          total: res.meta?.total || complaints.length,
          processing: complaints.filter(c => c.status === 'approved' || c.status === 'pending').length,
          resolved: complaints.filter(c => c.status === 'completed').length
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
              <h1 className="text-2xl font-bold mb-2">Selamat Datang, {user?.name || 'Mahasiswa'}!</h1>
              <p className="opacity-90 mb-4">
                Ini adalah portal layanan perlindungan dan kesejahteraan sivitas akademika Politeknik Negeri Jember.
                Jangan ragu berkonsultasi atau melaporkan tindakan kekerasan di sekitar Anda.
              </p>
              <div className="flex items-center space-x-4">
                <Link to="/user/buat-laporan" className="bg-white text-[#8B5CF6] hover:bg-gray-100 flex items-center px-5 py-2.5 rounded-xl font-medium transition-colors">
                  <FiPlus className="w-5 h-5 mr-2" />
                  Buat Laporan Baru
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions / Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              onClick={() => navigate('/user/histori-pengaduan')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FiFileText className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.total}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Total Pengaduan</h3>
              <p className="text-sm text-gray-500">Histori laporan Anda</p>
            </motion.div>

            <motion.div
              onClick={() => navigate('/user/histori-pengaduan?status=approved')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.processing}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Sedang Diproses</h3>
              <p className="text-sm text-gray-500">Laporan dalam penanganan</p>
            </motion.div>

            <motion.div
              onClick={() => navigate('/user/histori-pengaduan?status=completed')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.resolved}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Telah Selesai</h3>
              <p className="text-sm text-gray-500">Laporan diselesaikan</p>
            </motion.div>
          </div>

          {/* Recent Reports */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Laporan Terbaru</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-gray-500 py-4">Memuat data terbaru...</div>
              ) : recentComplaints.length === 0 ? (
                <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-xl border border-gray-100">
                  Anda belum memiliki laporan pengaduan.
                </div>
              ) : recentComplaints.map((item) => (
                <div key={item.id} onClick={() => navigate(`/user/histori-pengaduan/${item.id}`)} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer gap-4 sm:gap-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <FiFileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 line-clamp-1" title={item.title}>{item.title}</h4>
                      <p className="text-sm text-gray-500">
                        {dayjs(item.created_at).locale('id').fromNow ? dayjs(item.created_at).locale('id').fromNow() : dayjs(item.created_at).locale('id').format('DD MMM YYYY')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg self-start sm:self-auto ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {item.status === 'completed' ? 'Selesai' :
                      item.status === 'approved' ? 'Diproses / Disetujui' :
                        item.status === 'rejected' ? 'Jadwalkan Ulang / Ditolak' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <Link to="/user/histori-pengaduan" className="text-[#8B5CF6] text-sm font-medium hover:text-purple-700 hover:underline">
                Lihat Semua Histori Pengaduan
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
