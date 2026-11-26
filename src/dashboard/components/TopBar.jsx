import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, Menu, LogOut, User, Settings, CheckCircle, HelpCircle } from 'lucide-react';
import { checkAndGenerateNotifications } from '../services/notificationService';
import './TopBar.css';

export default function TopBar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommunications, setShowCommunications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [recentComms, setRecentComms] = useState([]);

  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setShowNotifications(false);
      if (messagesRef.current && !messagesRef.current.contains(event.target)) setShowCommunications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Ctrl+K Shortcut
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const MOCK_NOTIFICATIONS = [
    { id: 'm1', title: 'New Lead: TechFlow', time: '2m ago', read: false },
    { id: 'm2', title: 'Project "HR Dashboard" completed', time: '1h ago', read: false },
    { id: 'm3', title: 'Invoice #1042 paid', time: '3h ago', read: true },
  ];

  useEffect(() => {
    const loadNotifs = () => {
      const allNotifs = checkAndGenerateNotifications();
      // Sort by created_at desc
      allNotifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(allNotifs);

      const comms = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
      comms.sort((a,b) => new Date(b.communication_date) - new Date(a.communication_date));
      setRecentComms(comms.slice(0, 3));
    };
    
    loadNotifs();
    const interval = setInterval(loadNotifs, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    localStorage.setItem('rkr_notifications', JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleMarkReadAndNavigate = (n) => {
    const updated = notifications.map(notif => notif.notification_id === n.notification_id ? { ...notif, is_read: true } : notif);
    localStorage.setItem('rkr_notifications', JSON.stringify(updated));
    setNotifications(updated);
    if (n.url) {
      navigate(n.url);
    }
    setShowNotifications(false);
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <header className="topbar relative z-[100] print:hidden">
      <div className="topbar-left relative z-[200]">
        <button className="menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="search-container relative" ref={searchRef}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search anything... (Ctrl+K)" 
            className="search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
          />
          {showSearchDropdown && searchQuery.trim() && (
            <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[70vh] overflow-y-auto">
              {Object.entries(searchResults).length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p className="text-sm font-medium mb-1">No results found for "{searchQuery}"</p>
                  <p className="text-xs">Try searching for Client name, Project name, Lead, or Invoice number.</p>
                </div>
              ) : (
                <div className="p-2">
                  {Object.entries(searchResults).map(([type, results]) => (
                    <div key={type} className="mb-4 last:mb-0">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">{type}</h4>
                      <div className="space-y-1">
                        {results.map((res, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => { navigate(res.url); setShowSearchDropdown(false); setSearchQuery(''); }}
                            className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{res.title}</p>
                              <p className="text-xs text-gray-500 truncate">{res.subtitle}</p>
                            </div>
                            {res.status && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 flex-shrink-0 ml-2">
                                {res.status}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="topbar-right flex items-center space-x-2">
        
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button className="icon-btn" onClick={() => { setShowNotifications(!showNotifications); setShowCommunications(false); setShowProfile(false); }}>
            <Bell size={20} />
            {hasUnread && <span className="notification-dot"></span>}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-[100] overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={handleMarkAllRead}>Mark all read</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(n => {
                  const isWarning = n.priority === 'Warning';
                  const isCritical = n.priority === 'Critical';
                  return (
                    <div 
                      key={n.notification_id} 
                      onClick={() => handleMarkReadAndNavigate(n)}
                      className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${n.is_read ? 'opacity-70' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm ${n.is_read ? 'text-gray-600' : 'font-semibold text-gray-900'} ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-600' : ''}`}>
                          {n.title}
                        </span>
                        {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 ml-2"></div>}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 line-clamp-2 pr-2">{n.message}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-2 font-medium">
                        {new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                {notifications.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                )}
              </div>
              <div className="p-3 text-center border-t border-gray-100 cursor-pointer hover:bg-gray-50 text-sm text-gray-600 font-medium">
                View All Notifications
              </div>
            </div>
          )}
        </div>

        {/* Communications */}
        <div className="relative" ref={messagesRef}>
          <button className="icon-btn" onClick={() => { setShowCommunications(!showCommunications); setShowNotifications(false); setShowProfile(false); }}>
            <MessageSquare size={20} />
          </button>
          {showCommunications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-[100] overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-800">Recent Communications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {recentComms.length > 0 ? recentComms.map(c => (
                  <div key={c.communication_id} onClick={() => { navigate(`/dashboard/communications/${c.communication_id}`); setShowCommunications(false); }} className="p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                      {c.contact_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-900 truncate pr-2">{c.contact_name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{new Date(c.communication_date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{c.subject}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 text-center text-gray-500 text-sm">No recent communications</div>
                )}
              </div>
              <div 
                className="p-3 text-center border-t border-gray-100 cursor-pointer hover:bg-gray-50 text-sm text-gray-600 font-medium"
                onClick={() => { navigate('/dashboard/communications'); setShowCommunications(false); }}
              >
                View All Communications
              </div>
            </div>
          )}
        </div>
        
        {/* Profile */}
        <div className="relative ml-2" ref={profileRef}>
          <div className="profile-menu cursor-pointer" onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowCommunications(false); }}>
            <div className="avatar">
              <span className="avatar-text">RA</span>
            </div>
            <div className="profile-info hidden sm:flex flex-col">
              <span className="profile-name">RKR Admin</span>
              <span className="profile-role">Administrator</span>
            </div>
          </div>
          
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-[100] overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm text-gray-900 font-semibold">Razal KR</p>
                <p className="text-xs text-gray-500 truncate">razalkrdeveloper@gmail.com</p>
              </div>
              <button onClick={() => { navigate('/dashboard/profile'); setShowProfile(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <User size={16} className="mr-2" /> My Profile
              </button>
              <button onClick={() => { navigate('/dashboard/help'); setShowProfile(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <HelpCircle size={16} className="mr-2" /> Help & Support
              </button>
              <button onClick={() => { navigate('/dashboard/settings'); setShowProfile(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                <Settings size={16} className="mr-2" /> Settings
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center font-medium">
                <LogOut size={16} className="mr-2" /> Sign out
              </button>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
}
