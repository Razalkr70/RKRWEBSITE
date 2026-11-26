import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import '../dashboard.css';
import './Layout.css';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-app">
      <div className="layout">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <div className="main-wrapper">
          <TopBar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
