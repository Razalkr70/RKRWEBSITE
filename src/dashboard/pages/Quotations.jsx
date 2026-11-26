import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, Trash2, Edit2, FileText, Download,
  CheckCircle2, AlertCircle, Clock, FileCheck, X, Eye, 
  CheckSquare, Activity, DollarSign, Building, User, Layout, Smartphone, Bot, Database
} from 'lucide-react';

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
  'Sent': 'bg-blue-100 text-blue-700 border-blue-200',
  'Viewed': 'bg-purple-100 text-purple-700 border-purple-200',
  'Accepted': 'bg-green-100 text-green-700 border-green-200',
  'Rejected': 'bg-red-100 text-red-700 border-red-200',
  'Expired': 'bg-orange-100 text-orange-700 border-orange-200',
  'Cancelled': 'bg-gray-100 text-gray-500 border-gray-200'
};

const ALL_STATUSES = ['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired', 'Cancelled'];

export default function Quotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: 'All', client_id: 'All', dateRange: 'All' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);

  // New Quotation Form
  const initialItem = { id: Date.now(), service_id: '', description: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 };
  const [form, setForm] = useState({
    client_id: '',
    project_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
    currency: 'USD',
    status: 'Draft',
    notes: '',
    terms: '1. Quotation valid for 30 days.\n2. 50% advance payment required to commence work.\n3. Final delivery upon full payment.',
    payment_terms: '50% Advance, 50% on Completion',
    items: [initialItem]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const q = JSON.parse(localStorage.getItem('rkr_quotations') || '[]');
    setQuotations(q.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    
    setClientsList(JSON.parse(localStorage.getItem('rkr_clients') || '[]'));
    setProjectsList(JSON.parse(localStorage.getItem('rkr_projects') || '[]'));
    setServicesList(JSON.parse(localStorage.getItem('rkr_services') || '[]'));
  };

  const handleCreateQuotation = (e, saveAction = 'Save Draft') => {
    e.preventDefault();
    if (!form.client_id) {
      alert("Client is required.");
      return;
    }
    if (form.items.length === 0 || !form.items[0].description) {
      alert("At least one valid item is required.");
      return;
    }
    
    const client = clientsList.find(c => c.id.toString() === form.client_id.toString());
    const project = projectsList.find(p => p.id.toString() === form.project_id.toString());
    
    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    
    const processedItems = form.items.map(item => {
      const line_total_before_tax = (item.quantity * item.unit_price) - item.discount;
      const tax_amt = line_total_before_tax * (item.tax / 100);
      const line_total = line_total_before_tax + tax_amt;
      
      subtotal += (item.quantity * item.unit_price);
      totalDiscount += Number(item.discount);
      totalTax += tax_amt;
      
      return { ...item, line_total };
    });

    const grand_total = subtotal - totalDiscount + totalTax;
    
    const quoStatus = saveAction === 'Save & Send' ? 'Sent' : 'Draft';
    
    const newQuotation = {
      id: Date.now(),
      quotation_number: `RKR-QUO-${Date.now().toString().slice(-4)}`,
      ...form,
      items: processedItems,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total: grand_total,
      client_name: client ? (client.company || client.name) : 'Unknown Client',
      project_name: project ? project.name : '',
      status: quoStatus,
      created_by: 'Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activities: [{ id: Date.now()+1, type: 'Quotation Created', desc: `Quotation created as ${quoStatus}.`, user: 'Admin', date: new Date().toISOString() }]
    };

    const existing = JSON.parse(localStorage.getItem('rkr_quotations') || '[]');
    localStorage.setItem('rkr_quotations', JSON.stringify([newQuotation, ...existing]));
    
    setShowCreateModal(false);
    setForm({
      client_id: '', project_id: '', issue_date: new Date().toISOString().split('T')[0], valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'USD', status: 'Draft', notes: '', terms: '1. Quotation valid for 30 days.\n2. 50% advance payment required to commence work.', payment_terms: '50% Advance', items: [{ id: Date.now(), service_id: '', description: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 }]
    });
    loadData();

    if(saveAction === 'Save & Preview') {
      navigate(`/dashboard/quotations/${newQuotation.id}`);
    }
  };

  const deleteQuotation = () => {
    if (quotationToDelete) {
      const existing = JSON.parse(localStorage.getItem('rkr_quotations') || '[]');
      localStorage.setItem('rkr_quotations', JSON.stringify(existing.filter(q => q.id !== quotationToDelete)));
      setQuotationToDelete(null);
      loadData();
    }
  };

  // Item management in form
  const addItem = () => setForm({...form, items: [...form.items, { id: Date.now(), service_id: '', description: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 }]});
  
  const removeItem = (id) => {
    if (form.items.length === 1) return alert("You must have at least one item.");
    setForm({...form, items: form.items.filter(i => i.id !== id)});
  };

  const updateItem = (id, field, value) => {
    setForm({
      ...form, 
      items: form.items.map(i => {
        if(i.id === id) {
          const updated = { ...i, [field]: value };
          // If service is selected, auto-fill description and price if available
          if (field === 'service_id' && value) {
            const svc = servicesList.find(s => s.name === value);
            if (svc) {
              updated.description = svc.short_description || svc.name;
              // Extract numeric value from base_price string (e.g. "$1,500" -> 1500) if available
              if (svc.base_price) {
                const numeric = svc.base_price.replace(/[^0-9.]/g, '');
                if (numeric) updated.unit_price = parseFloat(numeric);
              }
            }
          }
          return updated;
        }
        return i;
      })
    });
  };

  // KPIs
  const totalQuotations = quotations.length;
  const kpiDrafts = quotations.filter(q => q.status === 'Draft').length;
  const kpiSent = quotations.filter(q => q.status === 'Sent' || q.status === 'Viewed').length;
  const kpiAccepted = quotations.filter(q => q.status === 'Accepted').length;

  // Filtering
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchesSearch = q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            q.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            q.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status === 'All' || q.status === filters.status;
      const matchesClient = filters.client_id === 'All' || q.client_id.toString() === filters.client_id;
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [quotations, searchTerm, filters]);

  const exportCSV = () => {
    if (filteredQuotations.length === 0) return alert('No quotations to export.');
    const headers = ['Quotation Number', 'Client Name', 'Project Name', 'Issue Date', 'Valid Until', 'Currency', 'Total Amount', 'Status'];
    const rows = filteredQuotations.map(q => [
      q.quotation_number,
      `"${(q.client_name || '').replace(/"/g, '""')}"`,
      `"${(q.project_name || '').replace(/"/g, '""')}"`,
      q.issue_date,
      q.valid_until,
      q.currency,
      q.total,
      q.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.setAttribute('href', encodedUri);
    a.setAttribute('download', 'rkr_quotations_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const paginatedQuotations = filteredQuotations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
  };

  // Form Subtotal Preview
  const currentSubtotal = form.items.reduce((acc, i) => acc + (i.quantity * i.unit_price), 0);
  const currentDiscount = form.items.reduce((acc, i) => acc + Number(i.discount), 0);
  const currentTax = form.items.reduce((acc, i) => {
    const preTax = (i.quantity * i.unit_price) - i.discount;
    return acc + (preTax * (i.tax / 100));
  }, 0);
  const currentTotal = currentSubtotal - currentDiscount + currentTax;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-20 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Quotations</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Create, manage, and track professional business proposals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
            <Plus size={16} /> Create Quotation
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{l: 'Total Quotations', v: totalQuotations, icon: FileText, c: 'blue'}, 
          {l: 'Drafts', v: kpiDrafts, icon: Edit2, c: 'gray'}, 
          {l: 'Sent / Viewed', v: kpiSent, icon: Clock, c: 'orange'}, 
          {l: 'Accepted', v: kpiAccepted, icon: CheckCircle2, c: 'green'}].map((kpi, idx) => (
          <div key={idx} onClick={() => setFilters({...filters, status: kpi.l === 'Total Quotations' ? 'All' : kpi.l === 'Sent / Viewed' ? 'Sent' : kpi.l.replace('s', '')})} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col hover:border-blue-200 cursor-pointer transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{kpi.l}</p>
              <div className={`p-1.5 rounded-lg bg-${kpi.c}-50 text-${kpi.c}-500 group-hover:scale-110 transition-transform`}><kpi.icon size={16}/></div>
            </div>
            <p className="text-3xl font-black text-gray-900">{kpi.v}</p>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search quotation number, client, or project..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 md:flex-none px-4 py-2 border rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} /> Filters {(filters.status !== 'All' || filters.client_id !== 'All') && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium cursor-pointer" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Client</label>
            <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium cursor-pointer" value={filters.client_id} onChange={e => setFilters({...filters, client_id: e.target.value})}>
              <option value="All">All Clients</option>
              {clientsList.map(c => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({status: 'All', client_id: 'All', dateRange: 'All'})} className="w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent rounded-lg transition-colors cursor-pointer">
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Quotation</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Client & Project</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Dates</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedQuotations.map(q => (
                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-black text-gray-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate(`/dashboard/quotations/${q.id}`)}>{q.quotation_number}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5 mb-1"><Building size={14} className="text-gray-400"/> {q.client_name}</div>
                    {q.project_name && <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5"><Layout size={12} className="text-blue-400"/> {q.project_name}</div>}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{formatCurrency(q.total, q.currency)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs font-medium text-gray-600 mb-1"><span className="text-gray-400">Issued:</span> {new Date(q.issue_date).toLocaleDateString()}</div>
                    <div className="text-xs font-medium text-gray-600"><span className="text-gray-400">Valid:</span> {new Date(q.valid_until).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[q.status] || STATUS_COLORS['Draft']}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/dashboard/quotations/${q.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="View Details">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => setQuotationToDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedQuotations.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center bg-white border border-gray-100 rounded-b-xl">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileText size={48} className="mb-4 text-gray-300" />
                      <p className="text-sm font-medium">No quotations found.</p>
                      <button onClick={() => setShowCreateModal(true)} className="mt-4 text-blue-600 font-bold hover:underline cursor-pointer">Create your first quotation</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE QUOTATION FULL-SCREEN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-white z-[200] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <FileCheck className="text-blue-600" size={24}/> Create New Quotation
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="button" onClick={(e) => handleCreateQuotation(e, 'Save Draft')} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-200 cursor-pointer">Save Draft</button>
              <button type="button" onClick={(e) => handleCreateQuotation(e, 'Save & Preview')} className="px-4 py-2 border border-blue-600 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-50 cursor-pointer">Save & Preview</button>
              <button type="button" onClick={(e) => handleCreateQuotation(e, 'Save & Send')} className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-sm cursor-pointer">Save & Send</button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 bg-gray-50/50 p-6 md:p-10">
            <form id="quoForm" className="max-w-[1200px] mx-auto space-y-8">
              
              {/* Top Details Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Client & Project */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2 pb-2 border-b border-gray-50">Client & Project Info</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Client *</label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer bg-gray-50" value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}>
                        <option value="">-- Choose Client --</option>
                        {clientsList.map(c => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Project (Optional)</label>
                      <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer bg-gray-50" value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})}>
                        <option value="">-- No Project --</option>
                        {projectsList.filter(p => !form.client_id || p.client_id.toString() === form.client_id.toString()).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dates & Currency */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2 pb-2 border-b border-gray-50">Document Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Issue Date *</label>
                      <input required type="date" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-gray-50" value={form.issue_date} onChange={e => setForm({...form, issue_date: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Valid Until *</label>
                      <input required type="date" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-gray-50" value={form.valid_until} onChange={e => setForm({...form, valid_until: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Currency</label>
                      <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer bg-gray-50" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2"><Layout size={16} className="text-blue-600"/> Services & Line Items</h3>
                  <button type="button" onClick={addItem} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
                    <Plus size={14}/> Add Item
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase w-1/3">Service / Description</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase w-24">Qty</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase w-32">Unit Price</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase w-28">Discount</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase w-24">Tax (%)</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-right w-32">Amount</th>
                        <th className="py-3 px-4 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {form.items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-3 px-6">
                            <div className="space-y-2">
                              <select className="w-full p-2 border border-gray-200 rounded-lg outline-none text-xs font-bold text-gray-700 bg-gray-50 cursor-pointer focus:border-blue-400" value={item.service_id} onChange={e => updateItem(item.id, 'service_id', e.target.value)}>
                                <option value="">Custom Service</option>
                                {servicesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                              </select>
                              <textarea rows="1" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-xs text-gray-600 bg-transparent resize-y min-h-[40px] focus:border-blue-400" placeholder="Detailed description..." value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}></textarea>
                            </div>
                          </td>
                          <td className="py-3 px-4 align-top">
                            <input type="number" min="1" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm text-gray-900 bg-white focus:border-blue-400" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="py-3 px-4 align-top">
                            <input type="number" min="0" step="0.01" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm text-gray-900 bg-white focus:border-blue-400" value={item.unit_price} onChange={e => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="py-3 px-4 align-top">
                            <input type="number" min="0" step="0.01" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm text-gray-900 bg-white focus:border-blue-400" value={item.discount} onChange={e => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="py-3 px-4 align-top">
                            <input type="number" min="0" max="100" step="1" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm text-gray-900 bg-white focus:border-blue-400" value={item.tax} onChange={e => updateItem(item.id, 'tax', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="py-3 px-4 align-top text-right">
                            <div className="p-2 text-sm font-bold text-gray-900">
                              {formatCurrency(((item.quantity * item.unit_price) - item.discount) * (1 + item.tax/100), form.currency)}
                            </div>
                          </td>
                          <td className="py-3 px-4 align-top text-center">
                            <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer mt-0.5">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="bg-gray-50 border-t border-gray-200 p-6 flex flex-col items-end gap-3 rounded-b-2xl">
                  <div className="w-full md:w-80 space-y-3">
                    <div className="flex justify-between text-sm font-bold text-gray-600">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(currentSubtotal, form.currency)}</span>
                    </div>
                    {currentDiscount > 0 && (
                      <div className="flex justify-between text-sm font-bold text-red-500">
                        <span>Discount:</span>
                        <span>-{formatCurrency(currentDiscount, form.currency)}</span>
                      </div>
                    )}
                    {currentTax > 0 && (
                      <div className="flex justify-between text-sm font-bold text-gray-600">
                        <span>Tax:</span>
                        <span>{formatCurrency(currentTax, form.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-black text-gray-900 border-t border-gray-300 pt-3 mt-3">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(currentTotal, form.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Notes Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2 pb-2 border-b border-gray-50">Notes & Information</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Internal/Client Notes</label>
                    <textarea className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all min-h-[80px]" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Additional details not included in line items..."></textarea>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2 pb-2 border-b border-gray-50">Terms & Payment</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Terms & Conditions</label>
                    <textarea className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all min-h-[60px]" value={form.terms} onChange={e => setForm({...form, terms: e.target.value})}></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Terms</label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all bg-gray-50" value={form.payment_terms} onChange={e => setForm({...form, payment_terms: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="pb-12"></div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {quotationToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 border border-gray-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-200">
              <AlertCircle size={28} className="text-red-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Delete Quotation?</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">This action cannot be undone. Are you sure you want to permanently delete this quotation?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setQuotationToDelete(null)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
              <button onClick={deleteQuotation} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-colors cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
