import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiClock, FiUser, FiPlus } from 'react-icons/fi';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Dashboard Mahasiswa</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Mahasiswa</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 mb-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-2">Selamat Datang di PolijeCare</h2>
          <p className="opacity-90">
            Portal layanan perlindungan dan kesejahteraan sivitas akademika Politeknik Negeri Jember
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiPlus className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">+</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Buat Laporan</h3>
            <p className="text-sm text-gray-600">Ajukan pengaduan atau konseling</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiFileText className="w-8 h-8 text-accent" />
              <span className="text-2xl font-bold text-gray-900">12</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Riwayat Laporan</h3>
            <p className="text-sm text-gray-600">Lihat semua laporan Anda</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiClock className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Sedang Diproses</h3>
            <p className="text-sm text-gray-600">Laporan dalam proses</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiUser className="w-8 h-8 text-purple-500" />
              <span className="text-sm font-medium text-primary">Profil</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Pengaturan</h3>
            <p className="text-sm text-gray-600">Kelola akun Anda</p>
          </motion.div>
        </div>

        {/* Recent Reports */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Terbaru</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Laporan #{item}</h4>
                  <p className="text-sm text-gray-600">Dibuat 2 hari yang lalu</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Sedang Diproses
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
