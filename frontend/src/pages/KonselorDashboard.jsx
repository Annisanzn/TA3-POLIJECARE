import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiFileText, FiCheckCircle } from 'react-icons/fi';

const KonselorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Dashboard Konselor</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Konselor</span>
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="bg-gradient-to-r from-accent to-primary rounded-2xl p-8 mb-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-2">Dashboard Konseling</h2>
          <p className="opacity-90">
            Kelola dan monitoring layanan konseling untuk sivitas akademika
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiFileText className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">45</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Total Laporan</h3>
            <p className="text-sm text-gray-600">Semua laporan masuk</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiCalendar className="w-8 h-8 text-accent" />
              <span className="text-2xl font-bold text-gray-900">8</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Jadwal Hari Ini</h3>
            <p className="text-sm text-gray-600">Sesi konseling</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiCheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">32</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Selesai</h3>
            <p className="text-sm text-gray-600">Laporan selesai</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiUsers className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">13</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Sedang Diproses</h3>
            <p className="text-sm text-gray-600">Laporan aktif</p>
          </motion.div>
        </div>

        {/* Recent Reports */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Membutuhkan Perhatian</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Kasus #{item}</h4>
                  <p className="text-sm text-gray-600">Prioritas Tinggi • 1 jam lalu</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KonselorDashboard;
