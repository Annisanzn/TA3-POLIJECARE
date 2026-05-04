import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Switch from '../sky-toggle';

const Topbar = ({ onMenuClick, title = "Overview" }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Greeting logic removed to avoid redundancy with dashboard headers

  return (
    <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
      <div className="px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={onMenuClick}
              className="p-2 bg-gray-50 rounded-lg lg:hidden hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <FiMenu size={20} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                <span className="text-[#6666DE] dark:text-indigo-400 font-medium">Layanan</span>
                <span className="mx-1 sm:mx-2">/</span>
                <span className="capitalize">{user?.role}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[150px] sm:max-w-none">
                {title}
              </h1>
            </div>
          </div>

          {/* Right Section: Actions and Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center scale-75 sm:scale-90 md:scale-100">
              <Switch />
            </div>

            <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-800 hidden sm:block"></div>

            {/* Profile Dropdown */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role === 'user' ? 'Mahasiswa' : user?.role || 'Guest'}</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#E6E6FA] to-[#D6D6EA] dark:from-indigo-900 dark:to-slate-800 rounded-full flex items-center justify-center text-gray-800 dark:text-indigo-200 font-bold uppercase shadow-sm">
                    {(user?.name || 'U').charAt(0)}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;