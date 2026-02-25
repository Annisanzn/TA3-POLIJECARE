import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import ChartSection from '../../components/ChartSection';
import {
  FiCalendar, FiClock, FiCheckCircle, FiXCircle,
  FiUsers, FiBook, FiAlertCircle, FiRefreshCw,
} from 'react-icons/fi';

/* ── Stat Card ─────────────────────────────────────────────────────────────── */
const StatCard = ({ title, value, sub, icon, color, loading }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          {loading ? <span className="animate-pulse">—</span> : value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

/* ── Quick Link Card ───────────────────────────────────────────────────────── */
const QuickLink = ({ to, title, desc, icon, accent }) => (
  <Link
    to={to}
    className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
      <span className="text-white text-xl">{icon}</span>
    </div>
    <div>
      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</p>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  </Link>
);

/* ── Main Component ─────────────────────────────────────────────────────────── */
const KonselorDashboard = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/konselor/dashboard');
      if (res.data.success) setStats(res.data.data);
      else setError(res.data.message || 'Gagal memuat statistik');
    } catch (e) {
      setError(e.response?.data?.message || 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const j = stats?.jadwal || {};

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(v => !v)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Konselor</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Selamat datang, <span className="font-medium text-green-700">{user?.name || 'Konselor'}</span>!
              </p>
            </div>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <FiAlertCircle className="flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Breadcrumb */}
          <p className="text-sm text-gray-400 mb-6">
            Dashboard / Konselor / <span className="text-gray-700 font-medium">Overview</span>
          </p>

          {/* Welcome Banner */}
          <div className="rounded-2xl p-6 mb-8 text-gray-800" style={{ backgroundColor: '#E6E6FA' }}>
            <h2 className="text-2xl font-bold mb-1 text-gray-900">Selamat Datang, {user?.name || 'Konselor'}! 👋</h2>
            <p className="opacity-80 text-sm text-gray-700">
              {j.pending > 0
                ? `Anda memiliki ${j.pending} jadwal menunggu konfirmasi.`
                : 'Semua jadwal sudah dikonfirmasi. Tetap semangat!'}
            </p>
            <div className="flex gap-3 mt-4">
              <Link
                to="/konselor/jadwal"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Lihat Jadwal
              </Link>
              <Link
                to="/konselor/pengaduan"
                className="px-4 py-2 bg-white text-indigo-700 border border-indigo-200 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
              >
                Lihat Pengaduan
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard loading={loading} title="Total Jadwal" value={j.total} sub="Semua waktu" icon={<FiCalendar size={22} className="text-blue-600" />} color="bg-blue-50" />
            <StatCard loading={loading} title="Menunggu" value={j.pending} sub="Perlu konfirmasi" icon={<FiClock size={22} className="text-yellow-600" />} color="bg-yellow-50" />
            <StatCard loading={loading} title="Disetujui" value={j.approved} sub="Jadwal aktif" icon={<FiCheckCircle size={22} className="text-green-600" />} color="bg-green-50" />
            <StatCard loading={loading} title="Selesai" value={j.completed} sub="Session completed" icon={<FiCheckCircle size={22} className="text-indigo-600" />} color="bg-indigo-50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard loading={loading} title="Hari Ini" value={j.today} sub="Session hari ini" icon={<FiCalendar size={22} className="text-purple-600" />} color="bg-purple-50" />
            <StatCard loading={loading} title="Akan Datang" value={j.upcoming} sub="Jadwal mendatang" icon={<FiClock size={22} className="text-orange-600" />} color="bg-orange-50" />
            <StatCard loading={loading} title="Total Materi" value={stats?.materi ?? '—'} sub="Materi milik saya" icon={<FiBook size={22} className="text-teal-600" />} color="bg-teal-50" />
          </div>

          {/* Charts Section */}
          <div className="mb-8">
            <ChartSection />
          </div>

          {/* Quick Links */}
          <h3 className="text-lg font-bold text-gray-900 mb-4">Akses Cepat</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickLink to="/konselor/jadwal" title="Jadwal Konseling" desc="Kelola sesi konseling mahasiswa" icon={<FiCalendar />} accent="bg-blue-500" />
            <QuickLink to="/konselor/pengaduan" title="Pengaduan" desc="Pengaduan yang ditangani Anda" icon={<FiUsers />} accent="bg-orange-500" />
            <QuickLink to="/konselor/materi" title="Materi" desc="Upload dan kelola materi" icon={<FiBook />} accent="bg-teal-500" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default KonselorDashboard;
