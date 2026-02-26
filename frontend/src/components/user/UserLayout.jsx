import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Topbar from '../layout/Topbar';

const UserLayout = ({ children, user }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
