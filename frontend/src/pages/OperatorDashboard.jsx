import React from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiUsers, FiFileText, FiEdit, FiDatabase } from 'react-icons/fi';

const OperatorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Dashboard Operator</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Operator</span>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <FiSettings className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 mb-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-2">Sistem Administrasi</h2>
          <p className="opacity-90">
            Kelola seluruh sistem PolijeCare dan monitoring aktivitas
          </p>
        </motion.div>

        {/* Admin Functions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiUsers className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">156</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Manajemen Pengguna</h3>
            <p className="text-sm text-gray-600">Kelola akun pengguna</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiFileText className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">89</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Manajemen Pengaduan</h3>
            <p className="text-sm text-gray-600">Kelola semua pengaduan</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiEdit className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">24</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Manajemen Artikel</h3>
            <p className="text-sm text-gray-600">Kelola konten artikel</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiDatabase className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">12</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Manajemen Kategori</h3>
            <p className="text-sm text-gray-600">Kelola kategori laporan</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiSettings className="w-8 h-8 text-red-500" />
              <span className="text-sm font-medium text-gray-900">Pengaturan</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Setting Admin</h3>
            <p className="text-sm text-gray-600">Konfigurasi sistem</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-4">
              <FiFileText className="w-8 h-8 text-indigo-500" />
              <span className="text-2xl font-bold text-gray-900">5</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Audit Trail</h3>
            <p className="text-sm text-gray-600">Log aktivitas sistem</p>
          </motion.div>
        </div>

        {/* System Status */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Sistem</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Database</h4>
              <p className="text-sm text-green-600">Normal • 99.9% Uptime</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">API Server</h4>
              <p className="text-sm text-blue-600">Normal • Response: 45ms</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Storage</h4>
              <p className="text-sm text-yellow-600">Warning • 85% Used</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
