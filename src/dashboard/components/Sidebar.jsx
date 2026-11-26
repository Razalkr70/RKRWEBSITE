import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserSquare2, Briefcase, CheckSquare, Layers, LineChart, MessageSquare, FileText, Settings, HelpCircle, User, FileSignature, CreditCard, ClipboardList } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Leads', path: '/dashboard/leads', icon: <UserSquare2 size={20} /> },
  { name: 'Clients', path: '/dashboard/clients', icon: <Users size={20} /> },
  { name: 'Projects', path: '/dashboard/projects', icon: <Briefcase size={20} /> },
  { name: 'Tasks', path: '/dashboard/tasks', icon: <CheckSquare size={20} /> },
  { name: 'Services', path: '/dashboard/services', icon: <Layers size={20} /> },
  { name: 'Quotations', path: '/dashboard/quotations', icon: <FileSignature size={20} /> },
  { name: 'Payments', path: '/dashboard/finance', icon: <CreditCard size={20} /> },
  { name: 'Analytics', path: '/dashboard/analytics', icon: <LineChart size={20} /> },
  { name: 'Reports', path: '/dashboard/reports', icon: <FileText size={20} /> },
  { name: 'Communications', path: '/dashboard/communications', icon: <MessageSquare size={20} /> },
  { name: 'Client Assets', path: '/dashboard/assets', icon: <FileText size={20} /> },
  { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} print:hidden`}>
      <div className="sidebar-header">
        <a href="/">
          <img src="/logo.png" alt="RKR Solutions" className="sidebar-logo-img" />
        </a>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <ul>
          <li>
            <NavLink to="/dashboard/help" className="nav-link">
              <HelpCircle size={20} />
              <span>Help & Support</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/profile" className="nav-link">
              <User size={20} />
              <span>User Profile</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
}
