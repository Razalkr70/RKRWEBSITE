import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Users, Briefcase, IndianRupee, Layers, LineChart, Download, UserPlus, CheckSquare, FileText } from 'lucide-react';

export default function AnalyticsLayout() {
  const location = useLocation();
  const [dateRange, setDateRange] = useState('all_time');

  const handleExport = () => {
    window.dispatchEvent(new CustomEvent('exportAnalytics'));
  };

  const tabs = [
    { name: 'Overview', path: '/dashboard/analytics', icon: <BarChart3 size={18} /> },
    { name: 'Lead Analytics', path: '/dashboard/analytics/leads', icon: <Users size={18} /> },
    { name: 'Client Analytics', path: '/dashboard/analytics/clients', icon: <UserPlus size={18} /> },
    { name: 'Project Analytics', path: '/dashboard/analytics/projects', icon: <Briefcase size={18} /> },
    { name: 'Task Analytics', path: '/dashboard/analytics/tasks', icon: <CheckSquare size={18} /> },
    { name: 'Service Analytics', path: '/dashboard/analytics/services', icon: <Layers size={18} /> },
    { name: 'Quotation Analytics', path: '/dashboard/analytics/quotations', icon: <FileText size={18} /> },
    { name: 'Financial Analytics', path: '/dashboard/analytics/finance', icon: <IndianRupee size={18} /> },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <LineChart className="text-blue-600" size={32} />
            Analytics & Business Intelligence
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Real-time data insights to drive your business forward.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg px-4 py-2 outline-none cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
          >
            <option value="today">Today</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="all_time">All Time</option>
          </select>
          <button onClick={() => window.location.href = '/dashboard/reports/create'} className="flex items-center gap-2 bg-indigo-600 border border-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer">
            <FileText size={16} /> Save as Report
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 bg-blue-600 border border-blue-600 text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors cursor-pointer">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.path === '/dashboard/analytics' 
              ? location.pathname === '/dashboard/analytics' || location.pathname === '/dashboard/analytics/'
              : location.pathname.startsWith(tab.path);
              
            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors
                  ${isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.icon}
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* PAGE CONTENT */}
      <div className="pt-2">
        <Outlet context={{ dateRange }} />
      </div>
    </div>
  );
}
