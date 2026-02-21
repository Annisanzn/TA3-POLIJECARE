import React, { useState } from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiBook, 
  FiTag, 
  FiCalendar, 
  FiClock, 
  FiBell, 
  FiSettings, 
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiFilter
} from 'react-icons/fi';

const Sidebar = ({ collapsed, toggleCollapse }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const menuItems = [
    {
      category: 'UTAMA',
      items: [
        { name: 'Dashboard', icon: <FiHome />, active: true },
      ]
    },
    {
      category: 'MANAJEMEN',
      items: [
        { name: 'Manajemen Pengguna', icon: <FiUsers /> },
        { name: 'Manajemen Pengaduan', icon: <FiFileText /> },
        { name: 'Manajemen Materi', icon: <FiBook /> },
        { name: 'Kategori Kekerasan', icon: <FiTag /> },
        { name: 'Jadwal Konseling', icon: <FiCalendar /> },
        { name: 'Jadwal Konselor', icon: <FiClock /> },
        { name: 'Manajemen Pengumuman', icon: <FiBell /> },
      ]
    },
    {
      category: 'PENGATURAN',
      items: [
        { name: 'Manajemen Admin', icon: <FiSettings /> },
        { name: 'Profil Operator', icon: <FiUser /> },
      ]
    }
  ];

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} fixed lg:relative z-40`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-[#E6E6FA]/30">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#6666DE] font-bold text-lg">PC</span>
              </div>
              <div>
                <h2 className="text-gray-800 font-bold text-lg">PolijeCare</h2>
                <p className="text-gray-600 text-xs">Operator Dashboard</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto">
              <span className="text-[#6666DE] font-bold text-lg">PC</span>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-hidden p-4">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h3 className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
                {section.category}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <button
                    onClick={() => setActiveMenu(item.name)}
                    className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                      activeMenu === item.name
                        ? 'bg-gray-800/10 text-gray-800 border-l-4 border-[#6666DE]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>
                    )}
                    {item.active && !collapsed && (
                      <span className="ml-auto w-2 h-2 bg-green-400 rounded-full"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#E6E6FA]/30">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#E6E6FA] to-[#D6D6EA] rounded-full"></div>
              <div>
                <p className="text-gray-800 text-sm font-medium">Operator</p>
                <p className="text-gray-600 text-xs">admin@polijecare.ac.id</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"></div>
          )}
          <button className="text-white hover:bg-white/10 p-2 rounded-lg">
            <FiSettings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;