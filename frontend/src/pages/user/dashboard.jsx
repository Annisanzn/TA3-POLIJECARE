import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiFileText, FiClock, FiCheckCircle, FiPlus, FiPhoneCall,
  FiMail, FiMapPin, FiHeart, FiBookOpen, FiCalendar, FiVideo,
  FiActivity, FiChevronRight, FiShield
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../hooks/useAuth';
import axios from '../../api/axios';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

const StatCard = ({ label, value, icon: Icon, color, sub, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-[24px] md:rounded-[28px] p-4 md:p-6 shadow-sm border border-gray-100 flex items-center gap-4 md:gap-5 cursor-pointer hover:shadow-md hover:border-violet-200 transition-all group">
    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-[18px] flex items-center justify-center shrink-0 ${color} group-hover:scale-105 transition-transform`}>
      <Icon size={18} className="md:w-[22px] text-white" />
    </div>
    <div>
      <p className="text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xl md:text-3xl font-bold text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-[10px] md:text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
    </div>
  </div>
);

const UserDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    stats: { total: 0, processing: 0, completed: 0 },
    recent_complaints: [],
    upcoming_schedule: null,
    recent_articles: [],
    satgas_contact: { phone: '', email: '', location: '' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Menunggu sebentar untuk memastikan token sudah siap
      try {
        setLoading(true);
        const res = await axios.get('/user/dashboard');

        // Cek struktur response
        if (res.data?.success) {
          setDashboardData(res.data.data);
        } else if (res.data && !res.data.success) {
          console.warn("API Error:", res.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const { stats, recent_complaints, upcoming_schedule, recent_articles, satgas_contact } = dashboardData;

  // Stagger variants for smooth entry animations
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={toggleSidebar} title="Mahasiswa PolijeCare" />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-[1500px] w-full mx-auto space-y-8">

            {/* Welcome Banner */}
            <motion.div variants={itemVariant} className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[32px] p-8 sm:p-10 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <h1 className="text-3xl font-bold mb-3 text-white">Halo, {user?.name || 'Mahasiswa'}! 👋</h1>
              <p className="opacity-90 max-w-2xl text-base sm:text-lg leading-relaxed font-medium text-white">
                Ruang aman Anda untuk menyampaikan laporan dan mendapatkan dukungan penuh dari Satgas PPKS Polije. Kami siap mendengar dan membantu Anda.
              </p>
            </motion.div>

            {/* 1. Statistik Laporan */}
            <motion.div variants={itemVariant}>
              <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Statistik Laporan Anda</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  label="Total Laporan" value={loading ? '-' : stats.total}
                  icon={FiFileText} color="bg-violet-600" sub="semua laporan Anda"
                  onClick={() => navigate('/user/histori-pengaduan')}
                />
                <StatCard
                  label="Dalam Peninjauan" value={loading ? '-' : stats.processing}
                  icon={FiShield} color="bg-blue-600" sub="laporan sedang ditinjau"
                  onClick={() => navigate('/user/histori-pengaduan?status=approved')}
                />
                <StatCard
                  label="Laporan Selesai" value={loading ? '-' : stats.completed}
                  icon={FiCheckCircle} color="bg-emerald-600" sub="penanganan tuntas"
                  onClick={() => navigate('/user/histori-pengaduan?status=completed')}
                />
              </div>
            </motion.div>

            {/* 2. Quick Action */}
            <motion.div variants={itemVariant}>
              <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Akses Cepat</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => navigate('/user/buat-laporan')} className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group text-center gap-3">
                  <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                    <FiPlus size={22} />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm leading-tight">Buat Laporan<br />Baru</span>
                </button>
                <button onClick={() => alert('Fitur Self Assessment akan segera hadir!')} className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group text-center gap-3 relative overflow-hidden">
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full uppercase">Beta</div>
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <FiActivity size={22} />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm leading-tight">Cek Kondisi<br />Psikologis</span>
                </button>
                <button onClick={() => navigate('/articles')} className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group text-center gap-3">
                  <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                    <FiBookOpen size={22} />
                  </div>
                  <span className="font-semibold text-gray-800 text-sm leading-tight">Materi<br />Edukasi</span>
                </button>
              </div>
            </motion.div>

            {/* Main Content Grid (Left: Reports & Schedule, Right: Edu & Contact) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT COLUMN */}
              <div className="lg:col-span-2 space-y-8">
                {/* 3. Laporan Terbaru */}
                <motion.div variants={itemVariant} className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Aktivitas Laporan Terbaru</h2>
                    <Link to="/user/histori-pengaduan" className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
                      Lihat Semua <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {loading ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl w-full" />)}
                    </div>
                  ) : recent_complaints.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
                        <FiFileText size={24} />
                      </div>
                      <p className="text-gray-500 font-medium">Belum ada aktivitas laporan saat ini.</p>
                      <button onClick={() => navigate('/user/buat-laporan')} className="mt-4 text-violet-600 font-semibold hover:underline text-sm">
                        Mulai buat laporan baru
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recent_complaints.map(item => (
                        <div key={item.id} onClick={() => navigate(`/user/histori-pengaduan/${item.id}`)} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 rounded-[20px] hover:bg-violet-50/50 hover:border-violet-100 border border-transparent transition-all cursor-pointer gap-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 mb-1">{dayjs(item.created_at).locale('id').format('DD MMMM YYYY')}</p>
                            <h4 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors line-clamp-1">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{item.violenceCategory?.name || 'Kategori Umum'}</p>
                          </div>
                          <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-xl self-start sm:self-auto whitespace-nowrap ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                              item.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                            {item.status === 'completed' ? 'LAPORAN SELESAI' :
                              item.status === 'approved' ? 'SEDANG DITANGANI' :
                                item.status === 'rejected' ? 'JADWAL ULANG' : 'SEDANG DITINJAU'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* 4. Jadwal Konseling Saya */}
                <motion.div variants={itemVariant} className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Jadwal Konseling Terdekat</h2>

                  {loading ? (
                    <div className="animate-pulse h-32 bg-gray-100 rounded-[24px]" />
                  ) : !upcoming_schedule ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 bg-indigo-50/50 rounded-[24px] border border-indigo-100 border-dashed text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-300 mb-4 shadow-sm">
                        <FiCalendar size={28} />
                      </div>
                      <h3 className="text-gray-900 font-semibold mb-1">Belum Ada Jadwal</h3>
                      <p className="text-gray-500 text-sm mb-5 font-medium max-w-xs">Anda tidak memiliki jadwal konseling yang aktif atau disetujui dalam waktu dekat.</p>
                      <button onClick={() => navigate('/user/counseling-schedule')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-200">
                        Ajukan Konseling Baru
                      </button>
                    </div>
                  ) : (
                    <div className="relative bg-white border border-indigo-100 rounded-[24px] p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
                      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <FiCalendar size={120} className="-mr-10 -mt-10 text-indigo-600" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-bold uppercase tracking-widest">Disetujui</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{dayjs(upcoming_schedule.tanggal).locale('id').format('dddd, DD MMMM YYYY')}</h3>
                        <p className="text-indigo-600 font-semibold text-lg mb-6 flex items-center gap-2">
                          <FiClock size={16} /> {upcoming_schedule.jam_mulai.substring(0, 5)} - {upcoming_schedule.jam_selesai.substring(0, 5)} WIB
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                          <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Konselor Bertugas</p>
                            <p className="font-semibold text-gray-800 flex items-center gap-2"><FiHeart size={14} className="text-rose-500" /> {upcoming_schedule.counselor?.name || 'TBA'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Metode & Lokasi</p>
                            <p className="font-semibold text-gray-800 flex items-center gap-2">
                              {upcoming_schedule.metode === 'online' ? <FiVideo size={14} className="text-sky-500" /> : <FiMapPin size={14} className="text-emerald-500" />}
                              {upcoming_schedule.metode === 'online' ? 'Konseling Online (Meet)' : 'Tatap Muka (Offline)'}
                            </p>
                          </div>
                        </div>
                        {upcoming_schedule.metode === 'online' && upcoming_schedule.meeting_link && (
                          <div className="mt-6">
                            <a href={upcoming_schedule.meeting_link} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm">
                              Masuk Ruangan Online
                            </a>
                          </div>
                        )}
                        {upcoming_schedule.metode === 'offline' && upcoming_schedule.lokasi && (
                          <div className="mt-5 p-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 border border-gray-100 flex items-start gap-3">
                            <FiMapPin className="text-gray-400 shrink-0 mt-0.5" size={16} />
                            <div>
                              <strong className="block text-gray-900 mb-0.5">Lokasi Tatap Muka:</strong>
                              {upcoming_schedule.lokasi}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-8">

                {/* 6. Self Assessment Widget */}
                <motion.div variants={itemVariant} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-[32px] p-6 sm:p-8 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 text-amber-200 w-32 h-32 rotate-12 transition-transform group-hover:scale-110">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.6,-46.3C91.4,-33.5,98,-18,97,-2.8C96,12.4,87.4,27.3,76.6,39.6C65.8,51.9,52.8,61.6,38.8,69.5C24.8,77.4,9.8,83.5,-5.8,88.1C-21.4,92.7,-37.6,95.8,-50.2,89.5C-62.8,83.2,-71.8,67.5,-79.3,51.8C-86.8,36.1,-92.8,20.4,-92.8,5.1C-92.8,-10.2,-86.8,-25.1,-78.9,-38.3C-71,-51.5,-61.2,-63,-48.6,-70.6C-36,-78.2,-20.6,-81.9,-4.9,-77.8C10.8,-73.7,21.6,-61.8,30.6,-73.5C39.6,-85.2,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm mb-5">
                      <FiActivity size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-amber-950 mb-2 leading-tight">Cek Kondisi Mental Anda</h2>
                    <p className="text-amber-800/80 font-medium text-sm mb-6 leading-relaxed">
                      Sering merasa cemas, tertekan, atau tidak aman di kampus? Kenali kondisi Anda lebih awal.
                    </p>
                    <button onClick={() => alert('Fitur Self Assessment akan segera hadir!')} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/30">
                      Mulai Self Assessment
                    </button>
                  </div>
                </motion.div>

                {/* 5. Edukasi dan Artikel */}
                <motion.div variants={itemVariant} className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Edukasi PPKS</h2>
                  </div>

                  {loading ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl w-full" />)}
                    </div>
                  ) : recent_articles.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-2xl text-sm font-medium">Belum ada artikel edukasi.</p>
                  ) : (
                    <div className="space-y-4">
                      {recent_articles.map(article => (
                        <Link to={`/articles/${article.slug}`} key={article.id} className="flex gap-4 group">
                          {article.cover_image ? (
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                              <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-sky-50 text-sky-300 flex items-center justify-center shrink-0">
                              <FiBookOpen size={24} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors line-clamp-2 text-sm leading-snug mb-1">{article.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2">{article.excerpt}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link to="/articles" className="w-full py-2.5 bg-gray-50 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-100 transition-colors block text-center">
                      Jelajahi Semua Materi
                    </Link>
                  </div>
                </motion.div>

                {/* 7. Kontak Satgas PPKS (Emergency) */}
                <motion.div variants={itemVariant} className="bg-gray-900 border border-gray-800 rounded-[32px] p-6 sm:p-8 shadow-xl shadow-gray-900/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                    <h2 className="text-xl font-bold text-white">Bantuan Darurat Satgas</h2>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-rose-400 shrink-0">
                        <FiPhoneCall size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Hotline 24/7</p>
                        <a href={`tel:${satgas_contact?.phone || ''}`} className="font-semibold text-base text-white hover:text-rose-400 transition-colors">
                          {satgas_contact?.phone || '+62 812-3456-7890'}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-400 shrink-0">
                        <FiMail size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Email Satgas</p>
                        <a href={`mailto:${satgas_contact?.email || ''}`} className="font-semibold text-sm text-white hover:text-blue-400 transition-colors">
                          {satgas_contact?.email || 'satgas.ppks@polije.ac.id'}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                        <FiMapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Lokasi Kantor</p>
                        <p className="font-semibold text-sm text-white leading-snug">
                          {satgas_contact?.location || 'Gedung Rektorat Lt. 1, Politeknik Negeri Jember'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;

