import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, CalendarClock, LayoutTemplate } from 'lucide-react';
import '../Leads.css';

export default function CommunicationsLayout() {
  const location = useLocation();
  const isDetailsOrAdd = location.pathname.includes('/add') || 
                         (location.pathname.match(/\/communications\/[^/]+$/) && !location.pathname.includes('/templates') && !location.pathname.includes('/follow-ups'));

  return (
    <div className="leads-page">
      {!isDetailsOrAdd && (
        <div className="page-header mb-6">
          <div>
            <h1 className="page-title">Communications Hub</h1>
            <p className="page-subtitle">Manage client interactions, follow-ups, and communication templates.</p>
          </div>
        </div>
      )}

      {!isDetailsOrAdd && (
        <div className="flex border-b border-gray-200 mb-6 space-x-8">
          <NavLink 
            to="/dashboard/communications" 
            end
            className={({ isActive }) => `pb-3 font-medium text-sm flex items-center border-b-2 transition-colors ${isActive ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <MessageSquare size={16} className="mr-2" />
            History
          </NavLink>
          <NavLink 
            to="/dashboard/communications/follow-ups" 
            className={({ isActive }) => `pb-3 font-medium text-sm flex items-center border-b-2 transition-colors ${isActive ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <CalendarClock size={16} className="mr-2" />
            Follow-ups
          </NavLink>
          <NavLink 
            to="/dashboard/communications/templates" 
            className={({ isActive }) => `pb-3 font-medium text-sm flex items-center border-b-2 transition-colors ${isActive ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <LayoutTemplate size={16} className="mr-2" />
            Templates
          </NavLink>
        </div>
      )}

      <Outlet />
    </div>
  );
}
