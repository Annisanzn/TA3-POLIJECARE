import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome, FiUsers, FiFileText, FiBook, FiTag,
  FiCalendar, FiClock, FiBell, FiSettings,
  FiUser, FiChevronLeft, FiChevronRight, FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

/* ── Menu definitions per role ──────────────────────────────────────────────── */
const OPERATOR_MENU = [
  {
    category: 'UTAMA',
    items: [
      { name: 'Dashboard', icon: <FiHome />, path: '/operator/dashboard' },
    ],
  },
  {
    category: 'MANAJEMEN',
    items: [
      { name: 'Manajemen Pengguna', icon: <FiUsers />, path: '/operator/user-management' },
      { name: 'Manajemen Pengaduan', icon: <FiFileText />, path: '/operator/complaints-management' },
      { name: 'Manajemen Materi', icon: <FiBook />, path: '/operator/materials-management' },
      { name: 'Kategori Kekerasan', icon: <FiTag />, path: '/operator/violence-categories-management' },
      { name: 'Jadwal Konseling', icon: <FiCalendar />, path: '/operator/counseling-management' },
      { name: 'Manajemen Jadwal Konselor', icon: <FiClock />, path: '/operator/counselor-schedule-management' },
      { name: 'Manajemen Artikel', icon: <FiBell />, path: '/operator/article-management' },
    ],
  },
  {
    category: 'PENGATURAN',
    items: [
      { name: 'Profil Operator', icon: <FiUser />, path: '#' },
    ],
  },
];

const KONSELOR_MENU = [
  {
    category: 'UTAMA',
    items: [
      { name: 'Dashboard', icon: <FiHome />, path: '/konselor/dashboard' },
    ],
  },
  {
    category: 'MANAJEMEN',
    items: [
      { name: 'Manajemen Jadwal Konselor', icon: <FiCalendar />, path: '/konselor/jadwal' },
      { name: 'Manajemen Pengaduan', icon: <FiFileText />, path: '/konselor/pengaduan' },
      { name: 'Manajemen Materi', icon: <FiBook />, path: '/konselor/materi' },
    ],
  },
  {
    category: 'AKUN',
    items: [
      { name: 'Profil Saya', icon: <FiUser />, path: '#' },
    ],
  },
];

/* ── Role metadata ───────────────────────────────────────────────────────────── */
const ROLE_META = {
  operator: { label: 'Operator Dashboard', color: '#6666DE' },
  konselor: { label: 'Konselor Dashboard', color: '#059669' },
};

/* ── Sidebar Component ───────────────────────────────────────────────────────── */
const Sidebar = ({ collapsed, toggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role || 'operator';

  const menuSections = role === 'konselor' ? KONSELOR_MENU : OPERATOR_MENU;
  const meta = ROLE_META[role] || ROLE_META.operator;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout?.();
    navigate('/login-new');
  };

  return (
    <div
      className={`h-screen flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
        } shrink-0 sticky top-0 z-40`}
      style={{ background: 'linear-gradient(180deg, #E6E6FA 0%, #D6D6EA 100%)' }}
    >
      {/* ── Header ── */}
      <div className="p-6 border-b border-[#E6E6FA]/30">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: meta.color }}
              >
                <span className="text-white font-bold text-lg">PC</span>
              </div>
              <div>
                <h2 className="text-gray-800 font-bold text-lg">PolijeCare</h2>
                <p className="text-gray-600 text-xs">{meta.label}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto"
              style={{ background: meta.color }}
            >
              <span className="text-white font-bold text-lg">PC</span>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="text-gray-600 hover:bg-gray-200 p-2 rounded-lg transition-colors"
          >
            {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* ── Menu ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
                {section.category}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.path}
                    className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
                      ? 'bg-white/60 text-gray-900 shadow-sm border-l-4'
                      : 'text-gray-700 hover:bg-white/40'
                      }`}
                    style={
                      isActive(item.path)
                        ? { borderLeftColor: meta.color }
                        : {}
                    }
                  >
                    <span
                      className={`text-lg ${collapsed ? 'mx-auto' : 'mr-3'}`}
                      style={{ color: isActive(item.path) ? meta.color : undefined }}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="font-medium text-sm whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Footer / User Info + Logout ── */}
      <div className="p-4 border-t border-[#E6E6FA]/30">
        <div className={`flex items-center ${collapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: meta.color }}
              >
                <span className="text-white text-xs font-bold">
                  {(user?.name || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-gray-800 text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-gray-500 text-xs truncate">{user?.email || ''}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: meta.color }}
            >
              <span className="text-white text-xs font-bold">
                {(user?.name || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;