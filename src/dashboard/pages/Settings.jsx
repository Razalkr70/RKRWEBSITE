import React, { useState, useEffect } from 'react';
import { 
  Save, Globe, Building2, Palette, Briefcase, Users, Target, CheckSquare, 
  FileText, DollarSign, MessageSquare, Folder, Bell, BarChart2, Lock, 
  History, Database, Server, Plus, Trash2, Check, AlertTriangle
} from 'lucide-react';
import { getAuditLogs, logAuditAction } from '../services/auditLogger';
import './Leads.css';

const TABS = [
  { id: 'general', label: 'General', icon: <Globe size={18} /> },
  { id: 'business', label: 'Business Profile', icon: <Building2 size={18} /> },
  { id: 'branding', label: 'Branding', icon: <Palette size={18} /> },
  { id: 'services', label: 'Services', icon: <Briefcase size={18} /> },
  { id: 'leads', label: 'Lead Management', icon: <Target size={18} /> },
  { id: 'projects', label: 'Project Management', icon: <Folder size={18} /> },
  { id: 'tasks', label: 'Task Management', icon: <CheckSquare size={18} /> },
  { id: 'quotations', label: 'Quotations', icon: <FileText size={18} /> },
  { id: 'finance', label: 'Finance', icon: <DollarSign size={18} /> },
  { id: 'communications', label: 'Communications', icon: <MessageSquare size={18} /> },
  { id: 'assets', label: 'Client Assets', icon: <Folder size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { id: 'reports', label: 'Reports', icon: <BarChart2 size={18} /> },
  { id: 'security', label: 'Security', icon: <Lock size={18} /> },
  { id: 'audit', label: 'Audit Logs', icon: <History size={18} /> },
  { id: 'data', label: 'Data Management', icon: <Database size={18} /> },
  { id: 'system', label: 'System Information', icon: <Server size={18} /> },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);

  // Generic Settings State
  const [config, setConfig] = useState({
    general: {
      appName: 'RKR Solutions',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      timezone: 'Asia/Kolkata',
      firstDayOfWeek: 'Monday',
      defaultDateRange: 'This Month',
      pageSize: '10'
    },
    business: {
      name: 'RKR Solutions',
      tagline: 'Building Intelligent Digital Solutions',
      email: 'hello@rkrsolutions.com',
      phone: '+91 98765 43210',
      website: 'www.rkrsolutions.com',
      address: '123 Tech Park, Innovation Hub',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560001',
      taxInfo: 'GSTIN: 29ABCDE1234F1Z5'
    },
    branding: {
      primaryColor: '#1E3A8A',
      secondaryColor: '#2563EB',
      companyDisplayName: 'RKR Solutions'
    },
    notifications: {
      leadFollowUpDue: true,
      leadFollowUpOverdue: true,
      projectDeadline: true,
      taskOverdue: true,
      paymentReceived: true,
      invoiceOverdue: true,
      quotationExpiry: true,
      assetUpload: false
    }
  });

  // Dynamic Lists State
  const [leadStatuses, setLeadStatuses] = useState(['New', 'Contacted', 'Qualified', 'Follow-up', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost']);
  const [leadSources, setLeadSources] = useState(['Website', 'WhatsApp', 'Instagram', 'Facebook', 'Referral', 'Direct', 'Phone', 'Other']);
  const [projectStatuses, setProjectStatuses] = useState(['Draft', 'Planning', 'In Progress', 'Review', 'Client Review', 'Revision', 'On Hold', 'Completed', 'Cancelled']);
  const [taskStatuses, setTaskStatuses] = useState(['To Do', 'In Progress', 'Review', 'Completed', 'Blocked', 'Cancelled']);
  const [assetCategories, setAssetCategories] = useState(['Client Assets', 'Requirements', 'Brand Assets', 'Project Files', 'Designs', 'Proposals', 'Quotations', 'Invoices', 'Payment Proofs', 'Contracts / Agreements', 'Deliverables', 'Other']);
  const [communicationChannels, setCommunicationChannels] = useState(['WhatsApp', 'Email', 'Phone Call', 'Instagram', 'Facebook', 'Website', 'Manual']);
  const [communicationTypes, setCommunicationTypes] = useState(['Enquiry', 'Follow-up', 'Call', 'Meeting', 'Project Update', 'Quotation Discussion', 'Payment Reminder', 'Feedback Request']);
  const [serviceCategories, setServiceCategories] = useState(['AI Solutions', 'Web Development', 'CRM & ERP Solutions', 'Dashboards & Business Intelligence', 'Automation Solutions', 'Data Analytics', 'E-Commerce Solutions']);

  // Load from LocalStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('rkr_global_settings');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) { console.error("Error loading settings"); }
    }
    
    // Load lists if they exist separately, else use defaults
    const safeLoadList = (key, setter) => {
      const val = localStorage.getItem(key);
      if (val) {
        try { setter(JSON.parse(val)); } catch (e) {}
      }
    };
    safeLoadList('rkr_list_leadStatuses', setLeadStatuses);
    safeLoadList('rkr_list_leadSources', setLeadSources);
    safeLoadList('rkr_list_projectStatuses', setProjectStatuses);
    safeLoadList('rkr_list_taskStatuses', setTaskStatuses);
    safeLoadList('rkr_list_paymentMethods', setPaymentMethods);
    safeLoadList('rkr_list_assetCategories', setAssetCategories);

    if (activeTab === 'audit') {
      setAuditLogs(getAuditLogs());
    }
  }, [activeTab]);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem('rkr_global_settings', JSON.stringify(config));
      localStorage.setItem('rkr_list_leadStatuses', JSON.stringify(leadStatuses));
      localStorage.setItem('rkr_list_leadSources', JSON.stringify(leadSources));
      localStorage.setItem('rkr_list_projectStatuses', JSON.stringify(projectStatuses));
      localStorage.setItem('rkr_list_taskStatuses', JSON.stringify(taskStatuses));
      localStorage.setItem('rkr_list_assetCategories', JSON.stringify(assetCategories));
      localStorage.setItem('rkr_list_communicationChannels', JSON.stringify(communicationChannels));
      localStorage.setItem('rkr_list_communicationTypes', JSON.stringify(communicationTypes));
      localStorage.setItem('rkr_list_serviceCategories', JSON.stringify(serviceCategories));
      
      logAuditAction('Settings', 'Global Configuration', 'Update', 'System settings were updated by admin');
      
      setIsSaving(false);
      setSaveMessage('Changes saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 800);
  };

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const renderDynamicList = (title, items, setItems, placeholder) => {
    const [newItem, setNewItem] = useState('');
    return (
      <div className="mb-8 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" 
              placeholder={placeholder}
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newItem.trim()) {
                  setItems([...items, newItem.trim()]);
                  setNewItem('');
                }
              }}
            />
            <button 
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-100"
              onClick={() => {
                if (newItem.trim()) {
                  setItems([...items, newItem.trim()]);
                  setNewItem('');
                }
              }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-sm">
                <span className="font-medium text-gray-700">{item}</span>
                <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-20 relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Configure your platform, branding, modules and manage data.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-sm font-bold text-green-600 flex items-center gap-1 animate-in fade-in zoom-in">
              <Check size={16} /> {saveMessage}
            </span>
          )}
          <button 
            className="btn btn-primary shadow-sm flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-4">
            <div className="overflow-y-auto max-h-[80vh] p-3 space-y-1 hide-scrollbar">
              {TABS.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)} 
                  className={`w-full text-left px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-3 transition-colors ${
                    activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
          
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Application Name</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" value={config.general.appName} onChange={e => updateConfig('general', 'appName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Timezone</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white" value={config.general.timezone} onChange={e => updateConfig('general', 'timezone', e.target.value)}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Currency</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white" value={config.general.currency} onChange={e => updateConfig('general', 'currency', e.target.value)}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Date Format</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white" value={config.general.dateFormat} onChange={e => updateConfig('general', 'dateFormat', e.target.value)}>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Default Dashboard Date Range</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white" value={config.general.defaultDateRange} onChange={e => updateConfig('general', 'defaultDateRange', e.target.value)}>
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                    <option value="This Year">This Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Default Pagination Size</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white" value={config.general.pageSize} onChange={e => updateConfig('general', 'pageSize', e.target.value)}>
                    <option value="10">10 items per page</option>
                    <option value="25">25 items per page</option>
                    <option value="50">50 items per page</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* BUSINESS PROFILE */}
          {activeTab === 'business' && (
            <div className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Business Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Business Name</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" value={config.business.name} onChange={e => updateConfig('business', 'name', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Tagline</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" value={config.business.tagline} onChange={e => updateConfig('business', 'tagline', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email</label>
                  <input type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" value={config.business.email} onChange={e => updateConfig('business', 'email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input type="tel" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" value={config.business.phone} onChange={e => updateConfig('business', 'phone', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Website</label>
                  <input type="url" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" value={config.business.website} onChange={e => updateConfig('business', 'website', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Tax/GST Information</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" value={config.business.taxInfo} onChange={e => updateConfig('business', 'taxInfo', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Address</label>
                  <textarea rows="3" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-none" value={config.business.address} onChange={e => updateConfig('business', 'address', e.target.value)}></textarea>
                </div>
              </div>
            </div>
          )}

          {/* BRANDING */}
          {activeTab === 'branding' && (
            <div className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Branding Configuration</h3>
              <div className="max-w-2xl space-y-8">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Brand Logo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400">
                      <Building2 size={24} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                    </div>
                    <div className="text-sm text-gray-500 max-w-sm">
                      Upload your high-resolution company logo. Recommended format: Transparent PNG, at least 500x500px.
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" className="w-10 h-10 p-0 border-0 rounded cursor-pointer" value={config.branding.primaryColor} onChange={e => updateConfig('branding', 'primaryColor', e.target.value)} />
                      <input type="text" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" value={config.branding.primaryColor} onChange={e => updateConfig('branding', 'primaryColor', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" className="w-10 h-10 p-0 border-0 rounded cursor-pointer" value={config.branding.secondaryColor} onChange={e => updateConfig('branding', 'secondaryColor', e.target.value)} />
                      <input type="text" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" value={config.branding.secondaryColor} onChange={e => updateConfig('branding', 'secondaryColor', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC MODULES (Leads, Projects, etc) */}
          {activeTab === 'leads' && (
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Lead Management Settings</h3>
              <div className="max-w-4xl">
                {renderDynamicList('Lead Statuses', leadStatuses, setLeadStatuses, 'Add new status (e.g. Unqualified)')}
                {renderDynamicList('Lead Sources', leadSources, setLeadSources, 'Add new source (e.g. Google Ads)')}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Project Management Settings</h3>
              <div className="max-w-4xl">
                {renderDynamicList('Project Statuses', projectStatuses, setProjectStatuses, 'Add new project status')}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Task Management Settings</h3>
              <div className="max-w-4xl">
                {renderDynamicList('Task Statuses', taskStatuses, setTaskStatuses, 'Add new task status')}
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Finance Settings</h3>
              <div className="max-w-4xl space-y-8">
                {renderDynamicList('Payment Methods', paymentMethods, setPaymentMethods, 'Add new payment method')}
                
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900">Invoice Defaults</h4>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Invoice Prefix</label>
                      <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" defaultValue="INV-2026-" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Default Payment Terms (Days)</label>
                      <input type="number" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" defaultValue="15" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Client Assets Settings</h3>
              <div className="max-w-4xl">
                {renderDynamicList('Asset Categories', assetCategories, setAssetCategories, 'Add new category (e.g. Legal Documents)')}
              </div>
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Communication Settings</h3>
              <div className="max-w-4xl space-y-6">
                {renderDynamicList('Communication Channels', communicationChannels, setCommunicationChannels, 'Add new channel (e.g. LinkedIn)')}
                {renderDynamicList('Communication Types', communicationTypes, setCommunicationTypes, 'Add new type (e.g. Welcome Message)')}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Service Offerings</h3>
              <div className="max-w-4xl">
                {renderDynamicList('Service Categories', serviceCategories, setServiceCategories, 'Add new service category')}
              </div>
            </div>
          )}

          {activeTab === 'quotations' && (
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Quotation Settings</h3>
              <div className="max-w-4xl grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Default Validity Period (Days)</label>
                  <input type="number" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" defaultValue="30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Quotation Prefix</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" defaultValue="RKR-QTN-" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Default Tax %</label>
                  <input type="number" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" defaultValue="18" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Default Terms & Notes</label>
                  <textarea rows="3" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-none" defaultValue="50% advance payment required. Valid for 30 days."></textarea>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Report Settings</h3>
              <div className="max-w-4xl grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Default Export Format</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500">
                    <option>PDF</option>
                    <option>CSV</option>
                    <option>XLSX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Default Orientation</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500">
                    <option>Portrait</option>
                    <option>Landscape</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Report Footer Text</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" defaultValue="Confidential Document - Generated by RKR Solutions Platform" />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">Notification Preferences</h3>
              <div className="max-w-3xl border border-gray-100 rounded-xl overflow-hidden">
                {[
                  { key: 'leadFollowUpDue', title: 'Lead Follow-up Due', desc: 'Notify when a lead requires follow-up today.' },
                  { key: 'leadFollowUpOverdue', title: 'Lead Follow-up Overdue', desc: 'Notify when a lead follow-up date has passed.' },
                  { key: 'projectDeadline', title: 'Project Deadline Approaching', desc: 'Notify when a project deadline is near.' },
                  { key: 'taskOverdue', title: 'Task Overdue', desc: 'Notify when a task has passed its deadline.' },
                  { key: 'paymentReceived', title: 'Payment Received', desc: 'Notify when a new payment is recorded.' },
                  { key: 'invoiceOverdue', title: 'Invoice Overdue', desc: 'Notify when an invoice passes its due date.' },
                  { key: 'quotationExpiry', title: 'Quotation Expiry', desc: 'Notify when a quotation is about to expire.' },
                  { key: 'assetUpload', title: 'Client Asset Uploaded', desc: 'Notify when a new file is uploaded to client assets.' }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={config.notifications[item.key]}
                        onChange={(e) => updateConfig('notifications', item.key, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="flex-1 flex flex-col h-full">
              <div className="p-6 md:p-8 pb-4">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 inline-block w-full">System Audit Logs</h3>
                    <p className="text-sm text-gray-500 mt-2">Track important system actions, data creation, updates, and configuration changes.</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                    Export Logs
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto px-6 md:px-8 pb-8">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="bg-gray-50/80 border-y border-gray-200">
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Module</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditLogs.length > 0 ? auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{log.user}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            log.action === 'Create' ? 'bg-green-50 text-green-700 border-green-200' : 
                            log.action === 'Update' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            log.action === 'Delete' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-700">{log.module}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {log.description} 
                          {log.record && <span className="font-semibold text-gray-900 ml-1">({log.record})</span>}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="p-8 text-center text-sm text-gray-500">No audit logs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECURITY & DATA */}
          {(activeTab === 'security' || activeTab === 'data') && (
            <div className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">
                {activeTab === 'security' ? 'Security Settings' : 'Data Management'}
              </h3>
              
              {activeTab === 'security' && (
                <div className="max-w-xl space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">New Password</label>
                    <input type="password" placeholder="Enter new password" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div className="pt-2">
                    <button className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors shadow-sm">Update Password</button>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="max-w-3xl space-y-8">
                  <div className="p-5 border border-gray-200 rounded-xl bg-gray-50">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Export Business Data</h4>
                    <p className="text-xs text-gray-500 mb-4">Download a complete archive of your system data in CSV format.</p>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 shadow-sm transition-colors">
                      Export All Data (CSV)
                    </button>
                  </div>
                  
                  <div className="p-5 border border-red-200 rounded-xl bg-red-50/50">
                    <h4 className="font-bold text-red-700 text-sm mb-1 flex items-center gap-2"><AlertTriangle size={16} /> Danger Zone</h4>
                    <p className="text-xs text-red-600/80 mb-4">Resetting the configuration will permanently delete all local cache, custom lists, and leads!</p>
                    <button 
                      onClick={() => {
                        if(confirm("DANGER: Are you sure you want to permanently delete all local data? This action cannot be undone.")) {
                          localStorage.clear();
                          localStorage.setItem('isAuthenticated', 'true'); // Keep logged in
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-colors"
                    >
                      Factory Reset Database
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SYSTEM INFO */}
          {activeTab === 'system' && (
            <div className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-4 mb-6">System Information</h3>
              <div className="max-w-2xl grid grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Application</p>
                  <p className="font-semibold text-gray-900">RKR Solutions Admin Platform</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Version</p>
                  <p className="font-semibold text-gray-900">1.0.0 (Build 2026.10)</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Environment</p>
                  <p className="font-semibold text-gray-900">Production</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Last Update</p>
                  <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="col-span-2 pt-6 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">System Health Checks</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">Database Connection (Local)</span>
                      <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded uppercase tracking-wider">Operational</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">Storage Availability</span>
                      <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded uppercase tracking-wider">Operational</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">Background Scheduler</span>
                      <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded uppercase tracking-wider">Operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK FOR UNIMPLEMENTED TABS */}
          {!['general', 'business', 'branding', 'leads', 'projects', 'tasks', 'finance', 'assets', 'communications', 'services', 'quotations', 'reports', 'notifications', 'audit', 'security', 'data', 'system'].includes(activeTab) && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <Settings size={48} className="mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Module Settings</h3>
              <p className="text-sm max-w-sm">Configuration for {TABS.find(t => t.id === activeTab)?.label} is handled by default module parameters.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
