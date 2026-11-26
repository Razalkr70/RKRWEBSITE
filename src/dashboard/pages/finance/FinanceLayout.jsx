import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, Clock, Activity, BarChart2 } from 'lucide-react';

const tabs = [
  { name: 'Overview', path: '/dashboard/finance', icon: <LayoutDashboard size={16} /> },
  { name: 'Invoices', path: '/dashboard/finance/invoices', icon: <FileText size={16} /> },
  { name: 'Payments', path: '/dashboard/finance/payments', icon: <CreditCard size={16} /> },
  { name: 'Outstanding', path: '/dashboard/finance/outstanding', icon: <Clock size={16} /> },
  { name: 'Transactions', path: '/dashboard/finance/transactions', icon: <Activity size={16} /> },
  { name: 'Reports', path: '/dashboard/finance/reports', icon: <BarChart2 size={16} /> },
];

export default function FinanceLayout() {
  const location = useLocation();
  const isDetailsPage = location.pathname.match(/\/finance\/(invoices|payments)\/.+/);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-20 relative print:p-0 print:m-0 print:space-y-0">
      {/* HEADER - Hide on Details Pages */}
      {!isDetailsPage && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2 print:hidden">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Payments & Finance</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage invoices, collect payments, and track your financial health.</p>
          </div>
          <div className="flex items-center gap-2">
            <NavLink to="/dashboard/reports?type=Finance" className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              <FileText size={16} /> Advanced Reports
            </NavLink>
          </div>
        </div>
      )}

      {/* FINANCE TABS - Hide on Details Pages */}
      {!isDetailsPage && (
        <div className="border-b border-gray-200 print:hidden">
          <nav className="-mb-px flex space-x-6 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const isActive = tab.path === '/dashboard/finance' 
                ? location.pathname === '/dashboard/finance' 
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
      )}

      {/* PAGE CONTENT */}
      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}
