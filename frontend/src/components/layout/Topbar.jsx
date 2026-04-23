import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const Topbar = ({ onMenuClick, title = "Overview" }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Greeting logic removed to avoid redundancy with dashboard headers

  return (
    <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
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
              <div className="flex items-center text-[10px] sm:text-xs text-gray-500">
                <span className="text-[#6666DE] font-medium">Layanan</span>
                <span className="mx-1 sm:mx-2">/</span>
                <span className="capitalize">{user?.role}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate max-w-[150px] sm:max-w-none">
                {title}
              </h1>
            </div>
          </div>

          {/* Right Section: Actions and Profile */}
          <div className="flex items-center space-x-4">
            {/* Profile Dropdown */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role === 'user' ? 'Mahasiswa' : user?.role || 'Guest'}</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#E6E6FA] to-[#D6D6EA] rounded-full flex items-center justify-center text-gray-800 font-bold uppercase">
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