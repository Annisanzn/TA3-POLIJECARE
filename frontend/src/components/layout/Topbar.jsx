import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const Topbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Greeting logic removed to avoid redundancy with dashboard headers

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Section: Breadcrumb and Greeting */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-[#6666DE] font-medium">Dashboard</span>
              <span className="mx-2">/</span>
              <span className="capitalize">{user?.role === 'user' ? 'Layanan' : user?.role}</span>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Overview</span>
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