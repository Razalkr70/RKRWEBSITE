import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Trash2, Edit2, FileText, 
  Download, Eye, CheckCircle2, AlertCircle, X, Layout, Building
} from 'lucide-react';

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
  'Sent': 'bg-blue-100 text-blue-700 border-blue-200',
  'Partially Paid': 'bg-purple-100 text-purple-700 border-purple-200',
  'Paid': 'bg-green-100 text-green-700 border-green-200',
  'Overdue': 'bg-red-100 text-red-700 border-red-200',
  'Cancelled': 'bg-gray-100 text-gray-500 border-gray-200',
  'Void': 'bg-orange-100 text-orange-700 border-orange-200'
};

export default function FinanceInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [payments, setPayments] = useState([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form State
  const initialItem = { id: Date.now(), description: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 };
  const [form, setForm] = useState(getInitialForm());

  function getInitialForm() {
    return {
      invoice_number: '', // will be auto-generated on open
      client_id: '',
      project_id: '',
      currency: 'INR',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +15 days
      status: 'Draft',
      items: [{...initialItem, id: Date.now()}],
      notes: '',
      payment_terms: 'Due on Receipt',
      terms: '1. Please pay within the stated due date.\n2. Late payments may incur additional charges.'
    };
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const i = JSON.parse(localStorage.getItem('rkr_invoices') || '[]');
    setInvoices(i.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    setClientsList(JSON.parse(localStorage.getItem('rkr_clients') || '[]'));
    setProjectsList(JSON.parse(localStorage.getItem('rkr_projects') || '[]'));
    setPayments(JSON.parse(localStorage.getItem('rkr_payments') || '[]'));
  };

  const generateInvoiceNumber = () => {
    const existing = JSON.parse(localStorage.getItem('rkr_invoices') || '[]');
    const nextNum = existing.length + 1;
    return `RKR-INV-${nextNum.toString().padStart(4, '0')}`;
  };

  const handleOpenCreate = () => {
    setForm({ ...getInitialForm(), invoice_number: generateInvoiceNumber() });
    setShowCreateModal(true);
  };

  const getAmountPaid = (invNumber) => {
    const invPayments = payments.filter(p => p.invoice_id === invNumber && p.status === 'Completed');
    return invPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  };

  // Dynamic Status Calculation based on rules
  const getDynamicStatus = (inv) => {
    if (inv.status === 'Cancelled' || inv.status === 'Void') return inv.status;
    
    const paid = getAmountPaid(inv.invoice_number);
    const total = Number(inv.total);
    
    if (paid >= total && total > 0) return 'Paid';
    if (paid > 0 && paid < total) return 'Partially Paid';
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(inv.due_date);
    if (dueDate < today && paid < total) return 'Overdue';
    
    return inv.status; // Draft or Sent
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!form.client_id) return alert("Client is required.");
    if (form.items.length === 0 || !form.items[0].description) return alert("At least one valid item is required.");
    
    // Calculate Totals
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
    
    const newInvoice = {
      id: Date.now(), // Unique internal ID
      invoice_number: form.invoice_number || generateInvoiceNumber(),
      client_id: form.client_id,
      project_id: form.project_id,
      currency: form.currency,
      issue_date: form.issue_date,
      due_date: form.due_date,
      status: form.status,
      items: processedItems,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total: grand_total,
      notes: form.notes,
      payment_terms: form.payment_terms,
      terms: form.terms,
      created_by: 'Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('rkr_invoices') || '[]');
    localStorage.setItem('rkr_invoices', JSON.stringify([newInvoice, ...existing]));
    
    setShowCreateModal(false);
    loadData();
  };

  // Item Management
  const addItem = () => setForm({...form, items: [...form.items, { id: Date.now(), description: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 }]});
  const removeItem = (id) => {
    if (form.items.length === 1) return alert("You must have at least one item.");
    setForm({...form, items: form.items.filter(i => i.id !== id)});
  };
  const updateItem = (id, field, value) => {
    setForm({
      ...form, 
      items: form.items.map(i => i.id === id ? { ...i, [field]: value } : i)
    });
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const client = clientsList.find(c => c.id.toString() === inv.client_id.toString());
      const cName = client ? (client.company || client.name) : '';
      return inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
             cName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [invoices, searchTerm, clientsList]);

  // Form Subtotal Preview
  const currentSubtotal = form.items.reduce((acc, i) => acc + (i.quantity * i.unit_price), 0);
  const currentDiscount = form.items.reduce((acc, i) => acc + Number(i.discount), 0);
  const currentTax = form.items.reduce((acc, i) => {
    const preTax = (i.quantity * i.unit_price) - i.discount;
    return acc + (preTax * (i.tax / 100));
  }, 0);
  const currentTotal = currentSubtotal - currentDiscount + currentTax;

  const handleExportCSV = () => {
    if (invoices.length === 0) return alert("No data to export");
    const headers = ['Invoice Number', 'Client', 'Issue Date', 'Due Date', 'Status', 'Subtotal', 'Tax', 'Discount', 'Total'];
    const csvRows = [headers.join(',')];
    
    invoices.forEach(inv => {
      const client = clientsList.find(c => c.id.toString() === inv.client_id.toString());
      const cName = client ? (client.company || client.name) : 'Unknown';
      const row = [
        inv.invoice_number,
        `"${cName}"`,
        inv.issue_date,
        inv.due_date,
        inv.status,
        inv.subtotal,
        inv.tax,
        inv.discount,
        inv.total
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search invoice number or client..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button onClick={handleExportCSV} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center">
            <Download size={16} /> Export
          </button>
          <button onClick={handleOpenCreate} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center">
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* INVOICES TABLE */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Invoice No.</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Client & Project</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Dates</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map(inv => {
                const client = clientsList.find(c => c.id.toString() === inv.client_id.toString());
                const project = projectsList.find(p => p.id.toString() === inv.project_id?.toString());
                const paid = getAmountPaid(inv.invoice_number);
                const outstanding = inv.total - paid;
                const dynamicStatus = getDynamicStatus(inv);

                return (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-black text-gray-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigate(`/dashboard/finance/invoices/${inv.id}`)}>
                        {inv.invoice_number}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                        <Building size={14} className="text-gray-400"/> {client ? (client.company || client.name) : 'Unknown'}
                      </div>
                      {project && (
                        <div className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                          <Layout size={12} className="text-blue-400"/> {project.name}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-medium text-gray-600 mb-1"><span className="text-gray-400">Issued:</span> {new Date(inv.issue_date).toLocaleDateString()}</div>
                      <div className="text-xs font-medium text-gray-600"><span className="text-gray-400">Due:</span> {new Date(inv.due_date).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-black text-gray-900 mb-1">{formatCurrency(inv.total, inv.currency)}</div>
                      <div className="text-[10px] font-bold text-gray-500 flex items-center gap-2">
                        <span className="text-green-600">Paid: {formatCurrency(paid, inv.currency)}</span>
                        {outstanding > 0 && <span className="text-orange-600">Due: {formatCurrency(outstanding, inv.currency)}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[dynamicStatus] || STATUS_COLORS['Draft']}`}>
                        {dynamicStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/dashboard/finance/invoices/${inv.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="View Invoice">
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center bg-white border border-gray-100 rounded-b-xl">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileText size={48} className="mb-4 text-gray-300" />
                      <p className="text-sm font-medium">No invoices found.</p>
                      <button onClick={handleOpenCreate} className="mt-4 text-blue-600 font-bold hover:underline cursor-pointer">Create your first invoice</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE FULL-SCREEN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-white z-[200] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <FileText className="text-blue-600" size={24}/> Create Invoice
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="button" onClick={handleCreateInvoice} className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-sm cursor-pointer">Save Invoice</button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 bg-gray-50/50 p-6 md:p-10">
            <form className="max-w-[1200px] mx-auto space-y-8">
              
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
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Invoice Number *</label>
                      <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-gray-50 font-bold" value={form.invoice_number} onChange={e => setForm({...form, invoice_number: e.target.value})} />
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
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Due Date *</label>
                      <input required type="date" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-gray-50" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Currency</label>
                        <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer bg-gray-50" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
                        <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer bg-gray-50 font-bold text-gray-900" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2"><Layout size={16} className="text-blue-600"/> Line Items</h3>
                  <button type="button" onClick={addItem} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
                    <Plus size={14}/> Add Item
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase w-1/3">Description</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase w-24">Qty</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase w-32">Unit Price</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase w-28">Discount</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase w-24">Tax (%)</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-right w-32">Amount</th>
                        <th className="py-3 px-4 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {form.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-3 px-6">
                            <textarea rows="1" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-xs text-gray-900 bg-transparent resize-y min-h-[40px] focus:border-blue-400 font-medium" placeholder="Item description..." value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}></textarea>
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
                        <span>Tax Amount:</span>
                        <span>{formatCurrency(currentTax, form.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-black text-[#1E3A8A] border-t border-gray-300 pt-3 mt-3">
                      <span>Total:</span>
                      <span>{formatCurrency(currentTotal, form.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Notes Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2 pb-2 border-b border-gray-50">Notes & Private Info</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Internal/Client Notes</label>
                    <textarea className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all min-h-[80px]" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Additional details not included in line items..."></textarea>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2 pb-2 border-b border-gray-50">Terms & Payment</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Terms</label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all bg-gray-50" value={form.payment_terms} onChange={e => setForm({...form, payment_terms: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Terms & Conditions</label>
                    <textarea className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all min-h-[60px]" value={form.terms} onChange={e => setForm({...form, terms: e.target.value})}></textarea>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
