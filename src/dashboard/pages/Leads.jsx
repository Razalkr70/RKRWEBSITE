import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, Trash2, X, Edit2, UserPlus, 
  Calendar, FileText, MoreVertical, Download, 
  CheckSquare, Square, ChevronLeft, ChevronRight, AlertTriangle, UserSquare2
} from 'lucide-react';

export default function Leads() {
  const navigate = useNavigate();
  
  // Data State
  const [leads, setLeads] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', source: '', service: '' });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Selection State (Bulk Actions)
  const [selectedLeads, setSelectedLeads] = useState([]);
  
  // Form/Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  // Confirmation Modals
  const [convertTarget, setConvertTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Constants
  const statuses = ['New', 'Contacted', 'Qualified', 'Follow-up', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const sources = ['Website', 'Instagram', 'Facebook', 'WhatsApp', 'Referral', 'Cold Call', 'Email', 'LinkedIn', 'Other'];
  const fallbackServices = ['AI Solutions', 'Web Development', 'CRM & ERP Solutions', 'Dashboards & Business Intelligence', 'Automation Solutions', 'Data Analytics', 'E-Commerce Solutions'];
  const activeServices = servicesList.length > 0 ? servicesList.filter(s => s.status === 'Active').map(s => s.name) : fallbackServices;

  // Form State
  const initialForm = {
    name: '', company: '', phone: '', email: '', location: '', 
    service: activeServices.length > 0 ? activeServices[0] : 'Web Development', source: 'Website', status: 'New', 
    priority: 'Medium', assignedTo: 'Admin', budget: '', followUp: '', notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // Constants Moved Up

  useEffect(() => {
    loadLeads();
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadLeads = () => {
    setServicesList(JSON.parse(localStorage.getItem('rkr_services') || '[]'));
    try {
      let localLeads = JSON.parse(localStorage.getItem('rkr_leads') || '[]');
      
      // Migration: Fix legacy "Website Development"
      let migrated = false;
      localLeads = localLeads.map(l => {
        if (l.service === 'Website Development') {
          migrated = true;
          return { ...l, service: 'Web Development' };
        }
        return l;
      });
      
      // Mock data injection if empty to show UI
      if (localLeads.length === 0) {
        const mock = [
          { id: 101, name: 'Alice Smith', company: 'TechNova', email: 'alice@technova.com', phone: '555-0101', service: 'AI Solutions', source: 'LinkedIn', status: 'New', priority: 'High', date: new Date().toISOString() },
          { id: 102, name: 'Bob Jones', company: 'BuildIt', email: 'bob@buildit.com', phone: '555-0202', service: 'Website Development', source: 'Website', status: 'Qualified', priority: 'Medium', followUp: new Date().toISOString(), date: new Date().toISOString() },
        ];
        localStorage.setItem('rkr_leads', JSON.stringify(mock));
        setLeads(mock);
      } else {
        setLeads(localLeads);
        if (migrated) localStorage.setItem('rkr_leads', JSON.stringify(localLeads));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveLead = (e) => {
    e.preventDefault();
    
    // Duplicate Detection
    if (!editingLead && !duplicateWarning) {
      const isDup = leads.some(l => 
        (l.email && formData.email && l.email.toLowerCase() === formData.email.toLowerCase()) || 
        (l.phone && formData.phone && l.phone === formData.phone)
      );
      if (isDup) {
        setDuplicateWarning(true);
        return; // Stop saving, show warning
      }
    }

    try {
      let existingLeads = JSON.parse(localStorage.getItem('rkr_leads') || '[]');
      
      if (editingLead) {
        existingLeads = existingLeads.map(l => l.id === editingLead.id ? { ...l, ...formData, updated_at: new Date().toISOString() } : l);
      } else {
        const newLeadRecord = {
          ...formData,
          id: Date.now(),
          created_at: new Date().toISOString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        existingLeads = [newLeadRecord, ...existingLeads];
      }
      
      localStorage.setItem('rkr_leads', JSON.stringify(existingLeads));
      setLeads(existingLeads);
      
      // Reset & Close
      setShowModal(false);
      setEditingLead(null);
      setFormData(initialForm);
      setDuplicateWarning(false);
      
      showToast(editingLead ? 'Lead updated successfully!' : 'New lead created successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const updated = leads.filter(l => l.id !== deleteTarget.id);
    localStorage.setItem('rkr_leads', JSON.stringify(updated));
    setLeads(updated);
    setSelectedLeads(selectedLeads.filter(selectedId => selectedId !== deleteTarget.id));
    setDeleteTarget(null);
    showToast('Lead deleted.');
  };

  const confirmBulkDelete = () => {
    const updated = leads.filter(l => !selectedLeads.includes(l.id));
    localStorage.setItem('rkr_leads', JSON.stringify(updated));
    setLeads(updated);
    setSelectedLeads([]);
    setShowBulkDeleteModal(false);
    showToast('Selected leads deleted.');
  };

  const confirmConversion = () => {
    if (!convertTarget) return;
    try {
      // 1. Create Client
      const clientToAdd = { 
        id: Date.now(), 
        name: convertTarget.company || `${convertTarget.name} Business`, 
        contact: convertTarget.name, 
        email: convertTarget.email || '', 
        phone: convertTarget.phone || '', 
        status: 'Active', 
        ltv: convertTarget.budget || '$0',
        project: convertTarget.service
      };
      const existingClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      localStorage.setItem('rkr_clients', JSON.stringify([clientToAdd, ...existingClients]));
      
      // 2. PRESERVE LEAD, update status
      const updatedLeads = leads.map(l => l.id === convertTarget.id ? { 
        ...l, 
        status: 'Converted', 
        converted_at: new Date().toISOString(), 
        client_id: clientToAdd.id 
      } : l);
      
      localStorage.setItem('rkr_leads', JSON.stringify(updatedLeads));
      setLeads(updatedLeads);
      
      setConvertTarget(null);
      navigate('/dashboard/clients');
    } catch(e) { console.error(e); }
  };

  const exportCSV = () => {
    if (filteredLeads.length === 0) return alert('No leads to export.');
    const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Service', 'Status', 'Priority', 'Source', 'Date'];
    const rows = filteredLeads.map(l => [
      l.id, `"${l.name}"`, `"${l.company || ''}"`, l.email || '', l.phone || '', l.service, l.status, l.priority, l.source, l.date
    ].join(','));
    
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rkr_leads_export.csv';
    a.click();
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(paginatedLeads.map(l => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const toggleSelect = (id) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(selectedId => selectedId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  // Derived State (KPIs)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const followUpsToday = leads.filter(l => l.followUp && l.followUp.startsWith(todayDateStr)).length;
  const proposalsSent = leads.filter(l => l.status === 'Proposal Sent').length;
  const convertedLeads = leads.filter(l => l.status === 'Converted').length;
  const lostLeads = leads.filter(l => l.status === 'Lost').length;

  // Filtering & Search
  const filteredLeads = leads.filter(l => {
    const matchesSearch = searchTerm === '' || 
      l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone?.includes(searchTerm);
      
    const matchesStatus = filters.status === '' || l.status === filters.status;
    const matchesPriority = filters.priority === '' || l.priority === filters.priority;
    const matchesSource = filters.source === '' || l.source === filters.source;
    const matchesService = filters.service === '' || l.service === filters.service;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSource && matchesService;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Status Styles
  const getStatusStyle = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-50 text-blue-700';
      case 'Contacted': return 'bg-yellow-50 text-yellow-700';
      case 'Qualified': return 'bg-indigo-50 text-indigo-700';
      case 'Follow-up': return 'bg-purple-50 text-purple-700';
      case 'Proposal Sent': return 'bg-cyan-50 text-cyan-700';
      case 'Negotiation': return 'bg-orange-50 text-orange-700';
      case 'Converted': return 'bg-green-50 text-green-700';
      case 'Lost': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'Urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-[300] flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <CheckSquare size={18} className="text-green-400" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Manage enquiries, prospects and follow-ups securely.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/reports?type=Leads" className="bg-white border border-gray-200 text-indigo-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
            <FileText size={16} /> Reports
          </Link>
          <button onClick={exportCSV} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
            <Download size={16} /> Export
          </button>
          <button onClick={() => { setEditingLead(null); setFormData(initialForm); setShowModal(true); }} className="bg-primary text-white hover:bg-blue-800 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[{l: 'Total Leads', v: totalLeads}, {l: 'New Leads', v: newLeads}, {l: 'Follow-ups Today', v: followUpsToday}, 
          {l: 'Proposals Sent', v: proposalsSent}, {l: 'Converted', v: convertedLeads}, {l: 'Lost', v: lostLeads}].map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 mb-1">{kpi.l}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.v}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, company, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {selectedLeads.length > 0 && (
              <button onClick={() => setShowBulkDeleteModal(true)} className="px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                Delete ({selectedLeads.length})
              </button>
            )}
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 text-sm font-semibold border rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary cursor-pointer">
                <option value="">All Statuses</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Priority</label>
              <select value={filters.priority} onChange={(e) => setFilters({...filters, priority: e.target.value})} className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary cursor-pointer">
                <option value="">All Priorities</option>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Source</label>
              <select value={filters.source} onChange={(e) => setFilters({...filters, source: e.target.value})} className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary cursor-pointer">
                <option value="">All Sources</option>
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Service</label>
              <select value={filters.service} onChange={(e) => setFilters({...filters, service: e.target.value})} className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary cursor-pointer">
                <option value="">All Services</option>
                {activeServices.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => setFilters({ status: '', priority: '', source: '', service: '' })} className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">Clear Filters</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 w-12"><input type="checkbox" onChange={toggleSelectAll} checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0} className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" /></th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Details</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service & Source</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status & Priority</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Follow-up</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map(lead => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => toggleSelect(lead.id)} className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                  </td>
                  <td className="p-4">
                    <Link to={`/dashboard/leads/${lead.id}`} className="font-bold text-gray-900 hover:text-primary transition-colors block cursor-pointer">{lead.name}</Link>
                    <span className="text-xs text-gray-500">{lead.company || 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-700">{lead.email || '-'}</div>
                    <div className="text-xs text-gray-500">{lead.phone || '-'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 font-medium">{lead.service}</div>
                    <div className="text-xs text-gray-500">{lead.source}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${getStatusStyle(lead.status)}`}>
                        {lead.status}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityStyle(lead.priority)}`}>
                        {lead.priority} Priority
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700">
                    {lead.followUp ? new Date(lead.followUp).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="relative inline-block action-menu-container">
                      <button onClick={() => setActionMenuOpen(actionMenuOpen === lead.id ? null : lead.id)} className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                        <MoreVertical size={18} />
                      </button>
                      {actionMenuOpen === lead.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                          <button onClick={() => navigate(`/dashboard/leads/${lead.id}`)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">View Details</button>
                          <button onClick={() => { setEditingLead(lead); setFormData(lead); setShowModal(true); setActionMenuOpen(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">Edit Lead</button>
                          {lead.status !== 'Converted' && (
                            <button onClick={() => { setConvertTarget(lead); setActionMenuOpen(null); }} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium cursor-pointer">Convert to Client</button>
                          )}
                          <div className="border-t border-gray-100 my-1"></div>
                          <button onClick={() => { setDeleteTarget(lead); setActionMenuOpen(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer">Delete Lead</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedLeads.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserSquare2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{searchTerm || filters.status ? 'No leads match your filters.' : 'No leads yet'}</h3>
                    <p className="text-gray-500 mb-4">{searchTerm || filters.status ? 'Try adjusting your search criteria.' : 'Start adding enquiries to manage your sales pipeline.'}</p>
                    {searchTerm || filters.status ? (
                      <button onClick={() => { setSearchTerm(''); setFilters({ status: '', priority: '', source: '', service: '' }); }} className="text-primary font-semibold hover:underline cursor-pointer">Clear Filters</button>
                    ) : (
                      <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 hover:bg-blue-800 transition-colors cursor-pointer">
                        <Plus size={16} /> Add Lead
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} results</span>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 text-gray-600 cursor-pointer"><ChevronLeft size={16}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 text-gray-600 cursor-pointer"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modals */}
      
      {/* Delete Single Lead */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-gray-900 text-lg text-red-600">Delete Lead</h3>
               <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                 <X size={20} />
               </button>
             </div>
             <div className="p-6 text-sm text-gray-700 leading-relaxed">
               Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
             </div>
             <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm cursor-pointer">Delete</button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Multiple Leads */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-gray-900 text-lg text-red-600">Bulk Delete</h3>
               <button onClick={() => setShowBulkDeleteModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                 <X size={20} />
               </button>
             </div>
             <div className="p-6 text-sm text-gray-700 leading-relaxed">
               Are you sure you want to permanently delete <strong>{selectedLeads.length} leads</strong>? This action cannot be undone.
             </div>
             <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowBulkDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button onClick={confirmBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm cursor-pointer">Delete All</button>
             </div>
          </div>
        </div>
      )}

      {/* Convert to Client Modal */}
      {convertTarget && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><UserPlus className="text-green-600" size={20}/> Confirm Conversion</h3>
              <button onClick={() => setConvertTarget(null)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 text-sm leading-relaxed border border-green-100">
                You are about to convert <strong>{convertTarget.name}</strong> into a Client. This will create a permanent client record and lock this lead profile.
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm border-b border-gray-100 pb-2"><span className="text-gray-500">Name</span> <strong className="text-gray-900">{convertTarget.name}</strong></div>
                <div className="flex justify-between text-sm border-b border-gray-100 pb-2"><span className="text-gray-500">Company</span> <strong className="text-gray-900">{convertTarget.company || 'N/A'}</strong></div>
                <div className="flex justify-between text-sm border-b border-gray-100 pb-2"><span className="text-gray-500">Service</span> <strong className="text-gray-900">{convertTarget.service}</strong></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConvertTarget(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button onClick={confirmConversion} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm cursor-pointer">Confirm & Convert</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h3>
              <button onClick={() => { setShowModal(false); setDuplicateWarning(false); }} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveLead} className="p-6 overflow-y-auto space-y-6">
              
              {duplicateWarning && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-orange-800">Possible Duplicate Lead Found</h4>
                    <p className="text-xs text-orange-700 mt-1">A lead with this email or phone number already exists.</p>
                    <div className="mt-2 flex gap-3">
                      <button type="button" onClick={() => setDuplicateWarning(false)} className="text-xs font-bold text-primary hover:underline cursor-pointer">Ignore & Create Anyway</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lead Name *</label>
                  <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company Name</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. Acme Corp" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone *</label>
                  <input required type="tel" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Interested Service</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})}>
                    {activeServices.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lead Source</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Follow-up Date</label>
                  <input type="datetime-local" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={formData.followUp} onChange={e => setFormData({...formData, followUp: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Internal Notes</label>
                <textarea className="w-full p-2 border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Initial requirements, budget context, etc..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => { setShowModal(false); setDuplicateWarning(false); }} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold text-sm cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 font-bold text-sm shadow-sm cursor-pointer">
                  {editingLead ? 'Update Lead' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
