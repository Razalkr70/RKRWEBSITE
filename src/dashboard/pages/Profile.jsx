import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Camera, Shield, Save, X, Key, CheckCircle, Clock, Smartphone, Globe, LogOut } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'Razal KR',
    email: 'razalkrdeveloper@gmail.com',
    phone: '+91 9000000000',
    jobTitle: 'AI Developer / Administrator',
    status: 'Active',
    created: '2023-01-15T00:00:00Z',
    photo: null,
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Load profile from storage or use default
    const saved = localStorage.getItem('rkr_admin_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    } else {
      localStorage.setItem('rkr_admin_profile', JSON.stringify(profile));
    }
  }, []);

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    const updated = { ...profile, ...formData };
    setProfile(updated);
    localStorage.setItem('rkr_admin_profile', JSON.stringify(updated));
    setEditMode(false);
    
    // Log to audit
    const audits = JSON.parse(localStorage.getItem('rkr_audit_logs') || '[]');
    audits.unshift({
      id: Date.now(),
      action: 'Profile Updated',
      module: 'Security',
      user: updated.name,
      details: 'Admin updated their profile information',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('rkr_audit_logs', JSON.stringify(audits));
    
    setMessage('Profile updated successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app this would upload to server. We'll use a local object URL for preview.
      const url = URL.createObjectURL(file);
      const updated = { ...profile, photo: url };
      setProfile(updated);
      localStorage.setItem('rkr_admin_profile', JSON.stringify(updated));
      
      const audits = JSON.parse(localStorage.getItem('rkr_audit_logs') || '[]');
      audits.unshift({
        id: Date.now(),
        action: 'Profile Photo Updated',
        module: 'Security',
        user: profile.name,
        details: 'Admin updated their profile photo',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('rkr_audit_logs', JSON.stringify(audits));
    }
  };

  const handleRemovePhoto = () => {
    const updated = { ...profile, photo: null };
    setProfile(updated);
    localStorage.setItem('rkr_admin_profile', JSON.stringify(updated));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert("New passwords do not match.");
      return;
    }
    if (passwordForm.new.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    const credsStr = localStorage.getItem('rkr_admin_credentials');
    const creds = credsStr ? JSON.parse(credsStr) : { email: 'admin@rkrsolutions.com', password: 'password123' };
    
    if (passwordForm.current !== creds.password) {
      alert("Current password is incorrect.");
      return;
    }

    // Save new password
    creds.password = passwordForm.new;
    localStorage.setItem('rkr_admin_credentials', JSON.stringify(creds));
    
    // Log to audit
    const audits = JSON.parse(localStorage.getItem('rkr_audit_logs') || '[]');
    audits.unshift({
      id: Date.now(),
      action: 'Password Changed',
      module: 'Security',
      user: profile.name,
      details: 'Admin changed their password',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('rkr_audit_logs', JSON.stringify(audits));
    
    // Notify
    const notifs = JSON.parse(localStorage.getItem('rkr_notifications') || '[]');
    notifs.unshift({
      notification_id: Date.now().toString(),
      title: 'Security Alert',
      message: 'Your account password was recently changed.',
      priority: 'Warning',
      is_read: false,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('rkr_notifications', JSON.stringify(notifs));
    
    setPasswordForm({ current: '', new: '', confirm: '' });
    setMessage('Password changed successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">Manage your account information and security settings.</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-200">
          <CheckCircle size={18} /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Profile Card & Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-white shadow-md">
                {profile.photo ? (
                  <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-sm transition-colors">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            
            {profile.photo && (
              <button onClick={handleRemovePhoto} className="text-xs text-red-500 hover:text-red-700 mb-3 font-medium">Remove Photo</button>
            )}

            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500 font-medium">{profile.jobTitle}</p>
            
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              {profile.status}
            </div>

            <div className="w-full mt-6 pt-6 border-t border-gray-100 space-y-4 text-left text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={16} className="text-gray-400" />
                <span>{profile.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={16} className="text-gray-400" />
                <span>Member since {new Date(profile.created).getFullYear()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-gray-400" /> Account Activity
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                <Globe size={16} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Current Session</p>
                  <p className="text-xs text-gray-500">Windows • Chrome • India</p>
                  <p className="text-xs text-green-600 font-medium mt-1">Active Now</p>
                </div>
              </div>
              <div className="flex gap-3 items-start p-3">
                <Smartphone size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Previous Login</p>
                  <p className="text-xs text-gray-500">iOS • Safari • India</p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday, 14:30</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit Form & Security */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <User size={20} className="text-blue-600" /> Personal Information
              </h3>
              {!editMode ? (
                <button onClick={() => { setFormData(profile); setEditMode(true); }} className="text-sm text-blue-600 font-bold hover:text-blue-800">
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-sm text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button onClick={handleSaveProfile} className="px-3 py-1.5 text-sm text-white bg-blue-600 font-bold hover:bg-blue-700 rounded-lg flex items-center gap-1"><Save size={14} /> Save</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                {editMode ? (
                  <input type="text" name="name" value={formData.name || ''} onChange={handleEditChange} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm font-medium" />
                ) : (
                  <p className="text-sm font-semibold text-gray-900 bg-gray-50 p-2.5 rounded border border-transparent">{profile.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Job Title</label>
                {editMode ? (
                  <input type="text" name="jobTitle" value={formData.jobTitle || ''} onChange={handleEditChange} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm font-medium" />
                ) : (
                  <p className="text-sm font-semibold text-gray-900 bg-gray-50 p-2.5 rounded border border-transparent">{profile.jobTitle}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <input type="email" value={profile.email} disabled className="w-full p-2 border border-gray-200 bg-gray-100 rounded text-sm font-medium text-gray-500 cursor-not-allowed" />
                  <span className="absolute right-2 top-2 text-xs text-gray-400">Locked</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Contact system admin to change email.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                {editMode ? (
                  <input type="text" name="phone" value={formData.phone || ''} onChange={handleEditChange} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-sm font-medium" />
                ) : (
                  <p className="text-sm font-semibold text-gray-900 bg-gray-50 p-2.5 rounded border border-transparent">{profile.phone || '—'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
              <Key size={20} className="text-orange-500" /> Security
            </h3>
            
            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-orange-500 outline-none text-sm" 
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-orange-500 outline-none text-sm" 
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-orange-500 outline-none text-sm" 
                  placeholder="Re-enter new password"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
