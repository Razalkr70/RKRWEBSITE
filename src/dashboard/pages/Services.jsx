import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Trash2, LayoutGrid, List as ListIcon, Bot, Smartphone, Layout, Database, ChevronRight, X, Briefcase, Users, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ALL_CATEGORIES = [
  'AI Solutions', 
  'Web Development', 
  'CRM & ERP Solutions', 
  'Dashboards & Business Intelligence', 
  'Automation Solutions', 
  'Data Analytics', 
  'E-Commerce Solutions', 
  'Other'
];
const PRICING_TYPES = ['Fixed', 'Hourly', 'Monthly', 'Custom', 'Contact for Pricing'];
const DURATIONS = ['1 week', '2 weeks', '1 month', '3 months', 'Ongoing', 'Custom'];

const ICONS = {
  Layout: <Layout size={24} className="text-blue-600" />,
  Smartphone: <Smartphone size={24} className="text-blue-600" />,
  Bot: <Bot size={24} className="text-blue-600" />,
  Database: <Database size={24} className="text-blue-600" />
};

export default function Services() {
  const navigate = useNavigate();
  const [servicesList, setServicesList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  
  // View mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'All',
    pricing_type: 'All'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  
  // New Service Form
  const [form, setForm] = useState({
    name: '',
    category: 'Web Development',
    short_description: '',
    status: 'Active',
    pricing_type: 'Custom',
    base_price: '',
    estimated_duration: 'Custom',
    icon: 'Layout'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    let s = JSON.parse(localStorage.getItem('rkr_services') || '[]');

    const defaultServices = [
        { 
          id: 1, service_id: 'RKR-SRV-0001', name: 'AI Solutions', category: 'AI Solutions', short_description: 'AI-powered solutions including Generative AI, chatbots, and NLP.', status: 'Active', pricing_type: 'Custom', estimated_duration: 'Custom', icon: 'Bot', 
          features: [{id:11, text:'Generative AI Integration'}, {id:12, text:'Custom Chatbots'}, {id:13, text:'Machine Learning Models'}, {id:14, text:'NLP Processing'}, {id:15, text:'Computer Vision Analytics'}], 
          deliverables: [{id:11, text:'AI Architecture Strategy'}, {id:12, text:'Deployed AI Application'}, {id:13, text:'API & System Documentation'}, {id:14, text:'Source Code'}, {id:15, text:'Staff Training'}], 
          activities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() 
        },
        { 
          id: 2, service_id: 'RKR-SRV-0002', name: 'Web Development', category: 'Web Development', short_description: 'Professional web solutions, business websites, and Django applications.', status: 'Active', pricing_type: 'Custom', estimated_duration: 'Custom', icon: 'Layout', 
          features: [{id:21, text:'Custom Responsive Design'}, {id:22, text:'SEO Optimization'}, {id:23, text:'High-Performance Architecture'}, {id:24, text:'CMS Integration'}, {id:25, text:'Secure Backend API'}], 
          deliverables: [{id:21, text:'UI/UX Figma Prototypes'}, {id:22, text:'Deployed Web Application'}, {id:23, text:'Admin Dashboard'}, {id:24, text:'Database Schema'}, {id:25, text:'Maintenance Guide'}], 
          activities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() 
        },
        { 
          id: 3, service_id: 'RKR-SRV-0003', name: 'CRM & ERP Solutions', category: 'CRM & ERP Solutions', short_description: 'Business management systems, custom CRM/ERP and workflow software.', status: 'Active', pricing_type: 'Custom', estimated_duration: 'Custom', icon: 'Database', 
          features: [{id:31, text:'Lead & Pipeline Management'}, {id:32, text:'Employee Access Control'}, {id:33, text:'Automated Workflows'}, {id:34, text:'Custom Business Logic'}, {id:35, text:'Inventory Tracking'}], 
          deliverables: [{id:31, text:'Deployed CRM/ERP System'}, {id:32, text:'Role & Permission Setup'}, {id:33, text:'Data Migration Scripts'}, {id:34, text:'System Training Manual'}, {id:35, text:'Admin Walkthrough'}], 
          activities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() 
        },
        { 
          id: 4, service_id: 'RKR-SRV-0004', name: 'Dashboards & Business Intelligence', category: 'Dashboards & Business Intelligence', short_description: 'KPI dashboards, Power BI, and interactive reporting solutions.', status: 'Active', pricing_type: 'Custom', estimated_duration: 'Custom', icon: 'Layout', 
          features: [{id:41, text:'Real-time Data Sync'}, {id:42, text:'Interactive Charts'}, {id:43, text:'Role-based Analytics'}, {id:44, text:'PDF/CSV Exporting'}, {id:45, text:'KPI Goal Tracking'}], 
          deliverables: [{id:41, text:'Custom Dashboard Portal'}, {id:42, text:'Data Integration Scripts'}, {id:43, text:'Analytics Strategy Deck'}, {id:44, text:'Weekly Automated Reports'}, {id:45, text:'Admin Configuration'}], 
          activities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() 
        },
        { 
          id: 5, service_id: 'RKR-SRV-0005', name: 'Automation Solutions', category: 'Automation Solutions', short_description: 'Business process automation for leads, workflows, and repetitive tasks.', status: 'Active', pricing_type: 'Custom', estimated_duration: 'Custom', icon: 'Bot', 
          features: [{id:51, text:'Cross-Platform Syncing'}, {id:52, text:'Custom Webhooks'}, {id:53, text:'Automated Email Triggers'}, {id:54, text:'Task Auto-assignment'}, {id:55, text:'Error Logging & Alerts'}], 
          deliverables: [{id:51, text:'Process Workflow Diagrams'}, {id:52, text:'Deployed Automation Scripts'}, {id:53, text:'API Secrets Management'}, {id:54, text:'ROI & Time Saved Report'}, {id:55, text:'System Handover'}], 
          activities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() 
        },
        { 
          id: 6, service_id: 'RKR-SRV-0006', name: 'Data Analytics', category: 'Data Analytics', short_description: 'Data-driven insights, business analytics, and performance visualization.', status: 'Active', pricing_type: 'Custom', estimated_duration: 'Custom', icon: 'Database', 
          features: [{id:61, text:'Customer Segmentation'}, {id:62, text:'Sales Trend Forecasting'}, {id:63, text:'Predictive Analytics'}, {id:64, text:'Big Data Processing'}, {id:65, text:'Data Cleansing'}], 
          deliverables: [{id:61, text:'Comprehensive Data Audit'}, {id:62, text:'Cleaned & Structured Dataset'}, {id:63, text:'Predictive Models'}, {id:64, text:'Strategy Recommendation Deck'}, {id:65, text:'Visualization Dashboard'}], 
          activities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() 
        },
        { 
          id: 7, service_id: 'RKR-SRV-0007', name: 'E-Commerce Solutions', category: 'E-Commerce Solutions', short_description: 'Complete online commerce solutions with inventory and payment integration.', status: 'Active', pricing_type: 'Custom', estimated_duration: 'Custom', icon: 'Smartphone', 
          features: [{id:71, text:'Secure Payment Gateways'}, {id:72, text:'Inventory Management'}, {id:73, text:'Shopping Cart & Checkout'}, {id:74, text:'Discount & Coupon Engine'}, {id:75, text:'Customer Profiles & Auth'}], 
          deliverables: [{id:71, text:'Functional Storefront'}, {id:72, text:'Admin Panel Setup'}, {id:73, text:'Payment Integration Keys'}, {id:74, text:'Shipping Configuration'}, {id:75, text:'Launch & SEO Support'}], 
          activities: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() 
        }
    ];

    // Seed default 7 services if absolutely empty
    if (s.length === 0) {
      localStorage.setItem('rkr_services', JSON.stringify(defaultServices));
      s = defaultServices;
    }

    // Migration: If user already seeded the initial blank features, let's patch them
    s = s.map(service => {
      if (service.features.length === 0 && service.deliverables.length === 0) {
        const defaultMatch = defaultServices.find(d => d.id === service.id);
        if (defaultMatch) {
          return { ...service, features: defaultMatch.features, deliverables: defaultMatch.deliverables };
        }
      }
      return service;
    });
    localStorage.setItem('rkr_services', JSON.stringify(s));

    setServicesList(s.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    const p = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
    setProjectsList(p);
  };

  const handleCreateService = (e) => {
    e.preventDefault();
    if (!form.name || !form.category) return;
    
    const newService = {
      id: Date.now(),
      service_id: `RKR-SRV-${Date.now().toString().slice(-4)}`,
      ...form,
      features: [],
      deliverables: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activities: [{ id: Date.now()+1, type: 'Service Created', desc: `Service ${form.name} created.`, user: 'Admin', date: new Date().toISOString() }]
    };

    const existing = JSON.parse(localStorage.getItem('rkr_services') || '[]');
    localStorage.setItem('rkr_services', JSON.stringify([newService, ...existing]));
    
    setShowCreateModal(false);
    setForm({ name: '', category: 'Web Development', short_description: '', status: 'Active', pricing_type: 'Custom', base_price: '', estimated_duration: 'Custom', icon: 'Layout' });
    loadData();
  };

  const confirmDeleteService = () => {
    if (serviceToDelete) {
      const existing = JSON.parse(localStorage.getItem('rkr_services') || '[]');
      localStorage.setItem('rkr_services', JSON.stringify(existing.filter(s => s.id !== serviceToDelete)));
      setServiceToDelete(null);
      loadData();
    }
  };

  // Helper to count active projects for a service
  const getProjectUsage = (serviceName) => {
    return projectsList.filter(p => p.service === serviceName).length;
  };

  // Helper to count unique clients using a service
  const getClientUsage = (serviceName) => {
    const clients = projectsList.filter(p => p.service === serviceName).map(p => p.client_id);
    return new Set(clients).size;
  };

  // Filtering Logic
  const filteredServices = useMemo(() => {
    return servicesList.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.service_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'All' || s.status === filters.status;
      const matchesCategory = filters.category === 'All' || s.category === filters.category;
      const matchesPricing = filters.pricing_type === 'All' || s.pricing_type === filters.pricing_type;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPricing;
    });
  }, [servicesList, searchTerm, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredServices.length / rowsPerPage);
  const currentServices = filteredServices.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // KPIs
  const totalServices = servicesList.length;
  const activeServices = servicesList.filter(s => s.status === 'Active').length;
  const inactiveServices = servicesList.filter(s => s.status === 'Inactive').length;
  const servicesUsedInProjects = servicesList.filter(s => getProjectUsage(s.name) > 0).length;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Services</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage the services offered by RKR Solutions and organize them across client projects.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <LayoutGrid size={16} /> Grid
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <ListIcon size={16} /> List
            </button>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
            <Plus size={16} /> Add Service
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Services', value: totalServices, icon: <LayoutGrid size={18}/>, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Active Services', value: activeServices, icon: <Check size={18}/>, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Inactive Services', value: inactiveServices, icon: <AlertCircle size={18}/>, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Services Used in Projects', value: servicesUsedInProjects, icon: <Briefcase size={18}/>, color: 'text-blue-600', bg: 'bg-blue-50' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                {kpi.icon}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
              <h3 className="text-xl font-black text-gray-900">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by ID, Name, or Category..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 md:flex-none px-4 py-2 border rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} /> Filters {(filters.status !== 'All' || filters.category !== 'All' || filters.pricing_type !== 'All') && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
            <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium cursor-pointer" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
              <option value="All">All Categories</option>
              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium cursor-pointer" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="All">All Statuses</option>
              {['Active', 'Inactive', 'Archived'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pricing Type</label>
            <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium cursor-pointer" value={filters.pricing_type} onChange={e => setFilters({...filters, pricing_type: e.target.value})}>
              <option value="All">All Pricing Types</option>
              {PRICING_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({status: 'All', category: 'All', pricing_type: 'All'})} className="w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent rounded-lg transition-colors cursor-pointer">
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* VIEWS */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentServices.map(service => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                  {ICONS[service.icon] || ICONS['Layout']}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${service.status === 'Active' ? 'bg-green-100 text-green-700' : service.status === 'Inactive' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {service.status}
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1 leading-snug group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/services/${service.id}`)}>{service.name}</h3>
              <p className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mb-3">{service.category}</p>
              <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">{service.short_description || 'No description provided.'}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Projects</span>
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><Briefcase size={12}/> {getProjectUsage(service.name)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Clients</span>
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5"><Users size={12}/> {getClientUsage(service.name)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Pricing</span>
                  <span className="text-sm font-bold text-gray-900">{service.pricing_type} {service.base_price && <span className="text-gray-500 text-xs border-l pl-1 ml-1 border-gray-200">{service.base_price}</span>}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setServiceToDelete(service.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Archive/Delete">
                     <Trash2 size={16} />
                   </button>
                   <button onClick={() => navigate(`/dashboard/services/${service.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="View Details">
                     <ChevronRight size={16} />
                   </button>
                </div>
              </div>
            </div>
          ))}
          {currentServices.length === 0 && (
             <div className="col-span-full py-12 text-center bg-white border border-gray-100 rounded-xl">
               <div className="flex flex-col items-center justify-center text-gray-400">
                 <LayoutGrid size={48} className="mb-4 text-gray-300" />
                 <p className="text-sm font-medium text-gray-500">No services found matching your criteria.</p>
               </div>
             </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Service</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Pricing</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Usage</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentServices.map(service => (
                  <tr key={service.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                          {ICONS[service.icon] ? React.cloneElement(ICONS[service.icon], {size: 16}) : <Layout size={16}/>}
                        </div>
                        <div className="flex flex-col">
                          <span onClick={() => navigate(`/dashboard/services/${service.id}`)} className="text-sm font-bold text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors">{service.name}</span>
                          <span className="text-xs text-gray-400 font-medium">{service.service_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{service.category}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${service.status === 'Active' ? 'bg-green-100 text-green-700' : service.status === 'Inactive' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-700">{service.pricing_type}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1" title="Projects"><Briefcase size={12}/> {getProjectUsage(service.name)}</span>
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1" title="Clients"><Users size={12}/> {getClientUsage(service.name)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/dashboard/services/${service.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="View Details">
                          <ChevronRight size={18} />
                        </button>
                        <button onClick={() => setServiceToDelete(service.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentServices.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <p className="text-sm font-medium text-gray-500">No services found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE SERVICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Add New Service</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Define a new offering for your catalog</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
              <form id="createServiceForm" onSubmit={handleCreateService} className="space-y-6">
                
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Service Name *</label>
                      <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. E-commerce Development" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Category *</label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer bg-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Service Icon</label>
                      <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer bg-white" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})}>
                        <option value="Layout">Website/Layout</option>
                        <option value="Smartphone">Mobile/App</option>
                        <option value="Bot">AI/Bot</option>
                        <option value="Database">Backend/Database</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Short Description *</label>
                      <textarea required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all resize-none min-h-[60px]" value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} placeholder="Provide a brief summary of the service..."></textarea>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Service Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
                      <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer bg-white" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Pricing Type</label>
                      <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer bg-white" value={form.pricing_type} onChange={e => setForm({...form, pricing_type: e.target.value})}>
                        {PRICING_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Base Price (Optional)</label>
                      <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all bg-white" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} placeholder="e.g. $1,500" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Est. Duration</label>
                      <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer bg-white" value={form.estimated_duration} onChange={e => setForm({...form, estimated_duration: e.target.value})}>
                        {DURATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-white transition-colors shadow-sm cursor-pointer">
                Cancel
              </button>
              <button type="submit" form="createServiceForm" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                <Check size={16} /> Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {serviceToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-2">Delete Service?</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Are you sure you want to permanently delete this service? If this service has been used in past projects, consider archiving it instead.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setServiceToDelete(null)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer flex-1">
                Cancel
              </button>
              <button onClick={confirmDeleteService} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm cursor-pointer flex-1">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
