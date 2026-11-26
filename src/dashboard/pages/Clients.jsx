import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, Trash2, X, Edit2, Download, 
  MoreVertical, CheckSquare, ChevronLeft, ChevronRight,
  Mail, Phone, Building, Briefcase, FileText, AlertTriangle, Users
} from 'lucide-react';

export default function Clients() {
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: '', manager: '', service: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedClients, setSelectedClients] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  const initialForm = {
    name: '', company: '', contact: '', phone: '', altPhone: '', email: '', 
    website: '', industry: '', gst: '', regNumber: '', 
    address: '', city: '', state: '', country: '', postalCode: '',
    source: 'Website', status: 'Active', manager: 'Admin', notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const statuses = ['Active', 'Inactive', 'On Hold', 'Archived'];
  const sources = ['Converted Lead', 'Referral', 'Website', 'Instagram', 'WhatsApp', 'Direct Contact', 'Other'];

  useEffect(() => {
    loadClients();
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) setActionMenuOpen(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadClients = () => {
    try {
      const localClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      if (localClients.length === 0) {
        // Mock data if completely empty
        const mock = [
          { id: 201, name: 'TechNova Solutions', contact: 'Alice Smith', email: 'alice@technova.com', phone: '555-0101', status: 'Active', manager: 'Admin', date: new Date().toISOString(), ltv: '$12,500', project: 'AI Development' },
          { id: 202, name: 'BuildIt Inc', contact: 'Bob Jones', email: 'bob@buildit.com', phone: '555-0202', status: 'Active', manager: 'Admin', date: new Date().toISOString(), ltv: '$4,000', project: 'Website Redesign' },
        ];
        localStorage.setItem('rkr_clients', JSON.stringify(mock));
        setClients(mock);
      } else {
        setClients(localClients);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveClient = (e) => {
    e.preventDefault();
    if (!editingClient && !duplicateWarning) {
      const isDup = clients.some(c => 
        (c.email && formData.email && c.email.toLowerCase() === formData.email.toLowerCase()) || 
        (c.phone && formData.phone && c.phone === formData.phone) ||
        (c.company && formData.company && c.company.toLowerCase() === formData.company.toLowerCase())
      );
      if (isDup) {
        setDuplicateWarning(true);
        return; 
      }
    }

    try {
      let existingClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      
      if (editingClient) {
        const updated = { ...editingClient, ...formData, updated_at: new Date().toISOString() };
        existingClients = existingClients.map(c => c.id === editingClient.id ? updated : c);
        
        // Log activity inside the client record if it exists
        const acts = updated.activities || [];
        acts.unshift({ id: Date.now(), type: 'Client Updated', desc: 'Client profile details were updated.', user: 'Admin', date: new Date().toISOString() });
        updated.activities = acts;
      } else {
        const newClientRecord = {
          ...formData,
          id: Date.now(),
          created_at: new Date().toISOString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          activities: [{ id: Date.now(), type: 'Client Created', desc: 'Client entered into system manually.', user: 'Admin', date: new Date().toISOString() }]
        };
        existingClients = [newClientRecord, ...existingClients];
      }
      
      localStorage.setItem('rkr_clients', JSON.stringify(existingClients));
      setClients(existingClients);
      
      setShowModal(false);
      setEditingClient(null);
      setFormData(initialForm);
      setDuplicateWarning(false);
      showToast(editingClient ? 'Client updated successfully!' : 'New client created successfully!');
    } catch (err) { console.error(err); }
  };

  const confirmArchive = () => {
    if (!deleteTarget) return;
    try {
      let existingClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      existingClients = existingClients.map(c => c.id === deleteTarget.id ? { ...c, status: 'Archived' } : c);
      localStorage.setItem('rkr_clients', JSON.stringify(existingClients));
      setClients(existingClients);
      setDeleteTarget(null);
      showToast('Client archived.');
    } catch (e) { console.error(e); }
  };

  const confirmBulkArchive = () => {
    try {
      let existingClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      existingClients = existingClients.map(c => selectedClients.includes(c.id) ? { ...c, status: 'Archived' } : c);
      localStorage.setItem('rkr_clients', JSON.stringify(existingClients));
      setClients(existingClients);
      setSelectedClients([]);
      setShowBulkDeleteModal(false);
      showToast('Selected clients archived.');
    } catch (e) { console.error(e); }
  };

  const exportCSV = () => {
    if (filteredClients.length === 0) return alert('No clients to export.');
    const headers = ['ID', 'Name/Company', 'Contact', 'Email', 'Phone', 'Status', 'Manager', 'Date'];
    const rows = filteredClients.map(c => [
      c.id, `"${c.name || c.company || ''}"`, `"${c.contact || ''}"`, c.email || '', c.phone || '', c.status, c.manager || 'Admin', c.date || c.created_at
    ].join(','));
    
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rkr_clients_export.csv';
    a.click();
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedClients(paginatedClients.map(c => c.id));
    else setSelectedClients([]);
  };

  const toggleSelect = (id) => {
    if (selectedClients.includes(id)) setSelectedClients(selectedClients.filter(sId => sId !== id));
    else setSelectedClients([...selectedClients, id]);
  };

  // KPIs
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Active').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newClientsThisMonth = clients.filter(c => {
    const d = new Date(c.created_at || c.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  
  const clientsWithProjects = clients.filter(c => c.project || (c.projects && c.projects.length > 0)).length;

  const filteredClients = clients.filter(c => {
    const matchesSearch = searchTerm === '' || 
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.contact && c.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm));
      
    const matchesStatus = filters.status === '' || c.status === filters.status;
    const matchesManager = filters.manager === '' || c.manager === filters.manager;
    return matchesSearch && matchesStatus && matchesManager;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-50 text-green-700 border-green-200';
      case 'Inactive': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'On Hold': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Archived': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-[300] flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <CheckSquare size={18} className="text-green-400" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your clients, projects, services and business relationships.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
            <Download size={16} /> Export
          </button>
          <button onClick={() => { setEditingClient(null); setFormData(initialForm); setShowModal(true); }} className="bg-primary text-white hover:bg-blue-800 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
            <Plus size={16} /> Add Client
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {[{l: 'Total Clients', v: totalClients}, {l: 'Active Clients', v: activeClients}, 
          {l: 'New This Month', v: newClientsThisMonth}, {l: 'With Active Projects', v: clientsWithProjects}].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">{kpi.l}</p>
            <p className="text-3xl font-bold text-gray-900">{kpi.v}</p>
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
              placeholder="Search by name, company, email, phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {selectedClients.length > 0 && (
              <button onClick={() => setShowBulkDeleteModal(true)} className="px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                Archive ({selectedClients.length})
              </button>
            )}
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 text-sm font-semibold border rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary cursor-pointer">
                <option value="">All Statuses</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Manager</label>
              <select value={filters.manager} onChange={(e) => setFilters({...filters, manager: e.target.value})} className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary cursor-pointer">
                <option value="">All Managers</option>
                <option value="Admin">Admin</option>
                <option value="Razal">Razal</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => setFilters({ status: '', manager: '', service: '' })} className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer mb-2">Clear Filters</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 w-12"><input type="checkbox" onChange={toggleSelectAll} checked={selectedClients.length === paginatedClients.length && paginatedClients.length > 0} className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" /></th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client / Company</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Details</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Project</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map(client => (
                <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <input type="checkbox" checked={selectedClients.includes(client.id)} onChange={() => toggleSelect(client.id)} className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                  </td>
                  <td className="p-4">
                    <Link to={`/dashboard/clients/${client.id}`} className="font-bold text-gray-900 hover:text-primary transition-colors block cursor-pointer">
                      {client.name || client.company || 'Unnamed Client'}
                    </Link>
                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Building size={12}/> {client.company || 'Individual'}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-800">{client.contact || client.name}</div>
                    <div className="flex flex-col space-y-0.5 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12}/> {client.email || '-'}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Phone size={12}/> {client.phone || '-'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Briefcase size={14} className="text-gray-400"/> {client.project || 'None'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getStatusStyle(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-gray-900">{client.ltv || '$0'}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="relative inline-block action-menu-container">
                      <button onClick={() => setActionMenuOpen(actionMenuOpen === client.id ? null : client.id)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer">
                        <MoreVertical size={18} />
                      </button>
                      {actionMenuOpen === client.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden py-1 text-left">
                          <button onClick={() => navigate(`/dashboard/clients/${client.id}`)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">View Profile</button>
                          <button onClick={() => { setEditingClient(client); setFormData({...initialForm, ...client}); setShowModal(true); setActionMenuOpen(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">Edit Details</button>
                          <div className="border-t border-gray-100 my-1"></div>
                          {client.status !== 'Archived' ? (
                            <button onClick={() => { setDeleteTarget(client); setActionMenuOpen(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer">Archive Client</button>
                          ) : (
                            <button onClick={() => { 
                              const updated = clients.map(c => c.id === client.id ? {...c, status: 'Active'} : c);
                              localStorage.setItem('rkr_clients', JSON.stringify(updated)); setClients(updated); setActionMenuOpen(null); showToast('Client reactivated.');
                            }} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium cursor-pointer">Restore Client</button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedClients.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{searchTerm || filters.status ? 'No clients match your filters.' : 'No clients yet'}</h3>
                    <p className="text-gray-500 mb-4">{searchTerm || filters.status ? 'Try adjusting your search criteria.' : 'Convert leads or add clients directly.'}</p>
                    {searchTerm || filters.status ? (
                      <button onClick={() => { setSearchTerm(''); setFilters({ status: '', manager: '', service: '' }); }} className="text-primary font-semibold hover:underline cursor-pointer">Clear Filters</button>
                    ) : (
                      <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 hover:bg-blue-800 transition-colors cursor-pointer">
                        <Plus size={16} /> Add Client
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
            <span className="text-sm text-gray-500">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} results</span>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 text-gray-600 cursor-pointer"><ChevronLeft size={16}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)} className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 text-gray-600 cursor-pointer"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Archive Single Client Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-gray-900 text-lg text-red-600">Archive Client</h3>
               <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                 <X size={20} />
               </button>
             </div>
             <div className="p-6 text-sm text-gray-700 leading-relaxed">
               Are you sure you want to archive <strong>{deleteTarget.name || deleteTarget.company}</strong>? Their records will be kept but hidden from active views.
             </div>
             <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button onClick={confirmArchive} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm cursor-pointer">Archive</button>
             </div>
          </div>
        </div>
      )}

      {/* Archive Multiple Clients Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-gray-900 text-lg text-red-600">Bulk Archive</h3>
               <button onClick={() => setShowBulkDeleteModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                 <X size={20} />
               </button>
             </div>
             <div className="p-6 text-sm text-gray-700 leading-relaxed">
               Are you sure you want to archive <strong>{selectedClients.length} clients</strong>?
             </div>
             <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowBulkDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button onClick={confirmBulkArchive} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm cursor-pointer">Archive All</button>
             </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={() => { setShowModal(false); setDuplicateWarning(false); }} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveClient} className="p-6 overflow-y-auto space-y-6">
              
              {duplicateWarning && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-orange-800">Possible Duplicate Client</h4>
                    <p className="text-xs text-orange-700 mt-1">A client with this email, phone, or company name already exists.</p>
                    <div className="mt-2 flex gap-3">
                      <button type="button" onClick={() => setDuplicateWarning(false)} className="text-xs font-bold text-primary hover:underline cursor-pointer">Ignore & Save Anyway</button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Client / Company Name *</label>
                    <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={formData.name || formData.company} onChange={e => setFormData({...formData, name: e.target.value, company: e.target.value})} placeholder="e.g. Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Primary Contact Person</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="e.g. Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone *</label>
                    <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Business Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Industry</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="e.g. Technology" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Website</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">GST Number</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={formData.gst} onChange={e => setFormData({...formData, gst: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                    <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Internal Notes</label>
                <textarea className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Important client context..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => { setShowModal(false); setDuplicateWarning(false); }} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold text-sm cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 font-bold text-sm shadow-sm cursor-pointer">
                  {editingClient ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
