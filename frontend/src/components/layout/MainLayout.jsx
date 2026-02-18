import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar dengan gradient ungu */}
      <div 
        className="fixed inset-y-0 left-0 z-30"
        style={{
          background: 'linear-gradient(180deg, #4C1D95 0%, #6D28D9 100%)'
        }}
      >
        <Sidebar 
          collapsed={sidebarCollapsed} 
          toggleCollapse={toggleSidebar} 
        />
      </div>

      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;