import React, { useState } from 'react';
import { FiSearch, FiBell, FiUser, FiChevronDown, FiFilter } from 'react-icons/fi';

const Topbar = () => {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = ['Semua', 'Baru', 'Diproses', 'Selesai'];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Section: Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari laporan, pengguna, atau aktivitas..."
                className="pl-12 pr-4 py-3 w-full md:w-80 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E6E6FA] focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-500" />
              <div className="flex bg-gray-100 rounded-full p-1">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                      activeFilter === filter
                        ? 'bg-white text-[#6666DE] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section: Actions and Profile */}
          <div className="flex items-center space-x-4">
            {/* View All Reports Button */}
            <button className="bg-[#E6E6FA] hover:bg-[#D6D6EA] text-gray-800 px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-colors">
              <span>Lihat Semua Laporan</span>
              <FiChevronDown className="ml-1" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <FiBell size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Operator Admin</p>
                <p className="text-xs text-gray-500">PolijeCare System</p>
              </div>
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E6E6FA] to-[#D6D6EA] rounded-full flex items-center justify-center text-gray-800 font-bold">
                    OA
                  </div>
                  <FiChevronDown className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <span className="text-[#6666DE] font-medium">Dashboard</span>
          <span className="mx-2">/</span>
          <span>Operator</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Overview</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;