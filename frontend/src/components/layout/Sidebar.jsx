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
      { name: 'Manajemen Kasus', icon: <FiFileText />, path: '/operator/case-management' },
      { name: 'Manajemen Pengguna', icon: <FiUsers />, path: '/operator/user-management' },
      { name: 'Manajemen Jadwal Konselor', icon: <FiClock />, path: '/operator/counselor-schedule-management' },
      { name: 'Pusat Edukasi', icon: <FiBook />, path: '/operator/materials-management' },
      { name: 'Kategori Kekerasan', icon: <FiTag />, path: '/operator/violence-categories-management' },
      { name: 'Manajemen Artikel', icon: <FiBell />, path: '/operator/article-management' },
    ],
  },
  {
    category: 'PENGATURAN',
    items: [
      { name: 'Profil Operator', icon: <FiUser />, path: '/profile' },
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
      { name: 'Manajemen Kasus', icon: <FiFileText />, path: '/konselor/case-management' },
      { name: 'Manajemen Jadwal Konselor', icon: <FiCalendar />, path: '/konselor/jadwal' },
      { name: 'Pusat Edukasi', icon: <FiBook />, path: '/konselor/materi' },
    ],
  },
  {
    category: 'AKUN',
    items: [
      { name: 'Profil Saya', icon: <FiUser />, path: '/profile' },
    ],
  },
];

const USER_MENU = [
  {
    category: 'UTAMA',
    items: [
      { name: 'Dashboard', icon: <FiHome />, path: '/user/dashboard' },
    ],
  },
  {
    category: 'LAYANAN PENGADUAN',
    items: [
      { name: 'Buat Laporan', icon: <FiFileText />, path: '/user/buat-laporan' },
      { name: 'Histori Pengaduan', icon: <FiClock />, path: '/user/histori-pengaduan' },
    ],
  },
  {
    category: 'AKUN',
    items: [
      { name: 'Profil Saya', icon: <FiUser />, path: '/profile' },
    ],
  },
];

/* ── Role metadata ───────────────────────────────────────────────────────────── */
const ROLE_META = {
  operator: { label: 'Operator Dashboard', color: '#6366f1' }, // Indigo-500
  konselor: { label: 'Konselor Dashboard', color: '#8b5cf6' }, // Violet-500
  user: { label: 'User Dashboard', color: '#ec4899' }, // Pink-500
};

/* ── Sidebar Component ───────────────────────────────────────────────────────── */
const Sidebar = ({ collapsed, toggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role || 'operator';

  const menuSections = role === 'konselor' ? KONSELOR_MENU : (role === 'user' ? USER_MENU : OPERATOR_MENU);
  const meta = ROLE_META[role] || ROLE_META.user;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout?.();
    navigate('/login-new');
  };

  return (
    <>
      <style>{`
        /* POIN 5: Menghilangkan semua alat bantu scroll secara agresif */
        .no-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .sidebar-container * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        .sidebar-container *::-webkit-scrollbar { display: none !important; }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md transition-opacity duration-300"
          onClick={toggleCollapse}
        ></div>
      )}

      <div
      className={`sidebar-container h-screen flex flex-col transition-all duration-500 fixed z-50 inset-y-0 left-0 w-72
        ${collapsed ? '-translate-x-full' : 'translate-x-0'}
        lg:sticky lg:translate-x-0 ${collapsed ? 'lg:w-24' : 'lg:w-72'}
        overflow-hidden bg-white dark:bg-slate-950 border-r border-gray-100 dark:border-slate-800 transition-colors duration-500 shadow-2xl lg:shadow-none`}
    >
      {/* ── Header ── */}
      <div className="p-8 border-b border-gray-50 dark:border-slate-800/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-indigo-100"
                style={{ background: meta.color }}
              >
                <span className="text-white font-bold text-xl tracking-tighter">PC</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-slate-900 font-bold text-xl leading-none">PolijeCare</h2>
                <p className="text-slate-500 text-[10px] font-medium tracking-wide mt-1.5">{meta.label}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-100 transition-all active:scale-95 cursor-pointer"
              style={{ background: meta.color }}
              onClick={toggleCollapse}
            >
              <span className="text-white font-bold text-xl tracking-tighter">PC</span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={toggleCollapse}
              className="text-slate-400 hover:text-indigo-600 p-2 rounded-xl transition-all active:scale-90"
            >
               <FiChevronLeft size={24} />
            </button>
          )}
        </div>
      </div>

      {/* ── Menu ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            {!collapsed && (
              <h3 className="text-slate-400 text-[11px] font-bold tracking-wider px-4">
                {section.category}
              </h3>
            )}
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.path}
                    className={`w-full flex items-center px-5 py-4 rounded-[1.5rem] transition-all duration-300 ease-out group relative overflow-hidden ${isActive(item.path)
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/30'
                      : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                  >
                    <span
                      className={`text-2xl transition-all duration-300 ${collapsed ? 'mx-auto' : 'mr-4'} ${isActive(item.path) ? 'text-white' : 'group-hover:scale-110'}`}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="font-semibold text-sm whitespace-nowrap tracking-tight">
                        {item.name}
                      </span>
                    )}
                    {/* Active Indicator bar */}
                    {isActive(item.path) && !collapsed && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Footer / User Info + Logout ── */}
      <div className="p-8 border-t border-gray-50 dark:border-slate-800/50 bg-gray-50/30 dark:bg-slate-900/20">
        <div className={`flex items-center ${collapsed ? 'justify-center flex-col gap-6' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center space-x-4 min-w-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white dark:border-slate-800"
                style={{ background: meta.color }}
              >
                <span className="text-white text-base font-bold uppercase">
                  {(user?.name || 'U')[0]}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 text-sm font-bold truncate leading-none">{user?.name?.split(' ')[0] || 'Admin'}</p>
                <p className="text-slate-500 text-[10px] font-medium truncate mt-1.5">{user?.role || 'Operator'}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 transition-transform active:scale-95"
              style={{ background: meta.color }}
            >
              <span className="text-white text-base font-bold uppercase">
                {(user?.name || 'U')[0]}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Keluar Sesi"
            className="text-slate-400 dark:text-slate-700 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-3 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50 shadow-sm"
          >
            <FiLogOut size={22} />
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar;