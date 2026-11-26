import React, { useState, useEffect } from 'react';
import { 
  FileText, CreditCard, Plus, Search, Filter, Edit2, 
  Trash2, Download, CheckCircle, Clock, AlertCircle, Eye, 
  X, CheckSquare, DollarSign, ArrowRight, FolderOpen, FileText as FileTextIcon
} from 'lucide-react';

export default function Payments() {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' or 'payments'
  
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assetsList, setAssetsList] = useState([]);
  
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceView, setShowInvoiceView] = useState(null); // the invoice object to view

  const [toastMessage, setToastMessage] = useState('');

  // Invoice Form State
  const initialInvoiceForm = {
    invoice_id: '', client_id: '', project_id: '', currency: 'INR', 
    issue_date: new Date().toISOString().split('T')[0], 
    due_date: '', items: [{ id: Date.now(), description: '', quantity: 1, price: 0 }], 
    discount: 0, tax_rate: 0, status: 'Draft', notes: ''
  };
  const [invoiceForm, setInvoiceForm] = useState(initialInvoiceForm);

  // Payment Form State
  const initialPaymentForm = {
    invoice_id: '', amount: '', payment_method: 'Bank Transfer', 
    payment_date: new Date().toISOString().split('T')[0], reference: '', notes: ''
  };
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const localClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
    const localProjects = JSON.parse(localStorage.getItem('rkr_projects') || '[]'); // if exists
    
    // In real app, projects belong to clients. We map them.
    let projs = [];
    localClients.forEach(c => {
      if (c.projects) projs = [...projs, ...c.projects.map(p => ({...p, client_id: c.id}))];
    });

    const localInvoices = JSON.parse(localStorage.getItem('rkr_invoices') || '[]');
    const localPayments = JSON.parse(localStorage.getItem('rkr_payments') || '[]');
    const localAssets = JSON.parse(localStorage.getItem('rkr_assets') || '[]');

    setClients(localClients);
    setProjects(projs);
    setInvoices(localInvoices);
    setPayments(localPayments);
    setAssetsList(localAssets);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // ------------------- INVOICE LOGIC ------------------- //
  
  const generateInvoiceId = () => {
    const nextNum = invoices.length + 1;
    return `RKR-INV-${nextNum.toString().padStart(4, '0')}`;
  };

  const handleInvoiceItemChange = (id, field, value) => {
    const newItems = invoiceForm.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'description' ? value : Number(value) };
      }
      return item;
    });
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const addInvoiceItem = () => {
    setInvoiceForm({ 
      ...invoiceForm, 
      items: [...invoiceForm.items, { id: Date.now(), description: '', quantity: 1, price: 0 }] 
    });
  };
  const removeInvoiceItem = (id) => {
    setInvoiceForm({ 
      ...invoiceForm, 
      items: invoiceForm.items.filter(item => item.id !== id) 
    });
  };

  const calculateInvoiceTotals = (form) => {
    const subtotal = form.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discountAmt = Number(form.discount || 0);
    const subAfterDiscount = subtotal - discountAmt;
    const taxAmt = subAfterDiscount * (Number(form.tax_rate || 0) / 100);
    const total = subAfterDiscount + taxAmt;
    
    return { subtotal, discountAmt, taxAmt, total };
  };

  const getInvoiceAmountPaid = (invId) => {
    const invPayments = payments.filter(p => p.invoice_id === invId && p.status === 'Completed');
    return invPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const updateInvoiceStatus = (inv, amtPaid, total) => {
    if (inv.status === 'Cancelled' || inv.status === 'Void') return inv.status;
    if (amtPaid >= total && total > 0) return 'Paid';
    if (amtPaid > 0 && amtPaid < total) return 'Partially Paid';
    
    if (new Date(inv.due_date) < new Date() && amtPaid < total) return 'Overdue';
    if (inv.status === 'Draft') return 'Draft';
    return 'Sent';
  };

  const handleSaveInvoice = (e) => {
    e.preventDefault();
    if (!invoiceForm.client_id) return alert("Select a client.");
    
    const { subtotal, discountAmt, taxAmt, total } = calculateInvoiceTotals(invoiceForm);
    
    const newInvoice = {
      ...invoiceForm,
      invoice_id: invoiceForm.invoice_id || generateInvoiceId(),
      subtotal,
      discount: discountAmt,
      tax: taxAmt,
      total,
      created_at: new Date().toISOString()
    };

    const newInvoices = [newInvoice, ...invoices.filter(i => i.invoice_id !== newInvoice.invoice_id)];
    localStorage.setItem('rkr_invoices', JSON.stringify(newInvoices));
    setInvoices(newInvoices);
    setShowInvoiceModal(false);
    showToast("Invoice saved successfully.");
  };

  // ------------------- PAYMENT LOGIC ------------------- //

  const generatePaymentId = () => {
    const nextNum = payments.length + 1;
    return `RKR-PAY-${nextNum.toString().padStart(4, '0')}`;
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    const targetInvoice = invoices.find(i => i.invoice_id === paymentForm.invoice_id);
    if (!targetInvoice) return alert("Select a valid invoice.");
    
    const payAmt = Number(paymentForm.amount);
    if (payAmt <= 0) return alert("Payment amount must be greater than 0.");
    
    const currentPaid = getInvoiceAmountPaid(targetInvoice.invoice_id);
    const maxAllowed = targetInvoice.total - currentPaid;
    
    if (payAmt > maxAllowed) {
      return alert(`Payment exceeds remaining balance. Max allowed: ${targetInvoice.currency} ${maxAllowed.toFixed(2)}`);
    }

    const newPayment = {
      ...paymentForm,
      payment_id: generatePaymentId(),
      client_id: targetInvoice.client_id,
      project_id: targetInvoice.project_id,
      amount: payAmt,
      created_at: new Date().toISOString()
    };

    const newPayments = [newPayment, ...payments];
    localStorage.setItem('rkr_payments', JSON.stringify(newPayments));
    setPayments(newPayments);
    
    // Update Invoice Status dynamically
    const newPaid = currentPaid + payAmt;
    const newStatus = updateInvoiceStatus(targetInvoice, newPaid, targetInvoice.total);
    
    const updatedInvoices = invoices.map(i => 
      i.invoice_id === targetInvoice.invoice_id ? { ...i, status: newStatus } : i
    );
    localStorage.setItem('rkr_invoices', JSON.stringify(updatedInvoices));
    setInvoices(updatedInvoices);

    setShowPaymentModal(false);
    showToast("Payment recorded successfully.");
  };

  // ------------------- UI HELPERS ------------------- //

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'Partially Paid': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Sent': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'Cancelled': 
      case 'Void': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200'; // Draft
    }
  };

  // KPIs
  let totalRevenue = 0;
  payments.forEach(p => totalRevenue += p.amount);
  
  let totalPending = 0;
  invoices.filter(i => i.status !== 'Cancelled' && i.status !== 'Void').forEach(i => {
    const paid = getInvoiceAmountPaid(i.invoice_id);
    totalPending += (i.total - paid);
  });

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-20 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-[300] flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <CheckSquare size={18} className="text-green-400" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Billing & Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage invoices, collect payments, and track revenue.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('invoices')} 
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors cursor-pointer ${activeTab === 'invoices' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Invoices
          </button>
          <button 
            onClick={() => setActiveTab('payments')} 
            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors cursor-pointer ${activeTab === 'payments' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Payments
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1"><FileText size={14}/> Total Invoices</p>
          <p className="text-3xl font-bold text-gray-900">{invoices.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1"><CreditCard size={14}/> Total Payments</p>
          <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wider flex items-center gap-1"><CheckCircle size={14}/> Total Revenue</p>
          <p className="text-3xl font-bold text-green-700">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-orange-600 mb-2 uppercase tracking-wider flex items-center gap-1"><Clock size={14}/> Outstanding</p>
          <p className="text-3xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</p>
        </div>
      </div>

      {/* CONTENT BLOCK */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div>
            {activeTab === 'invoices' ? (
              <button onClick={() => { setInvoiceForm(initialInvoiceForm); setShowInvoiceModal(true); }} className="bg-primary text-white hover:bg-blue-800 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 cursor-pointer">
                <Plus size={16} /> Create Invoice
              </button>
            ) : (
              <button onClick={() => { setPaymentForm(initialPaymentForm); setShowPaymentModal(true); }} className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 cursor-pointer">
                <Plus size={16} /> Record Payment
              </button>
            )}
          </div>
        </div>

        {/* INVOICES TABLE */}
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice ID</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Due</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? invoices.map(inv => {
                  const client = clients.find(c => c.id.toString() === inv.client_id.toString());
                  const amtPaid = getInvoiceAmountPaid(inv.invoice_id);
                  const amtDue = inv.total - amtPaid;
                  
                  return (
                    <tr key={inv.invoice_id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{inv.invoice_id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{client ? (client.company || client.name) : 'Unknown'}</div>
                        <div className="text-xs text-gray-500">Project ID: {inv.project_id || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-800">Issued: {inv.issue_date}</div>
                        <div className="text-xs text-gray-500">Due: {inv.due_date || 'On Receipt'}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">{inv.currency} {inv.total.toLocaleString()}</td>
                      <td className="p-4 font-bold text-orange-600">{inv.currency} {amtDue.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${getStatusBadge(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => setShowInvoiceView(inv)} className="p-1.5 text-gray-500 hover:text-primary bg-white border border-gray-200 rounded cursor-pointer"><Eye size={16}/></button>
                        {inv.status !== 'Paid' && inv.status !== 'Void' && inv.status !== 'Cancelled' && (
                          <button onClick={() => { setPaymentForm({...initialPaymentForm, invoice_id: inv.invoice_id, amount: amtDue}); setShowPaymentModal(true); }} className="p-1.5 text-green-600 hover:text-green-700 bg-green-50 border border-green-200 rounded cursor-pointer font-bold text-xs">Pay</button>
                        )}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-gray-500">
                      <FileText size={32} className="mx-auto text-gray-300 mb-3"/>
                      <p className="font-semibold text-gray-900">No invoices generated yet</p>
                      <p className="text-sm mt-1 mb-4">Create your first invoice to start billing clients.</p>
                      <button onClick={() => { setInvoiceForm(initialInvoiceForm); setShowInvoiceModal(true); }} className="text-primary font-bold hover:underline cursor-pointer">Create Invoice</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAYMENTS TABLE */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment ID</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice / Project</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method / Ref</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? payments.map(pay => {
                  const client = clients.find(c => c.id.toString() === pay.client_id.toString());
                  return (
                    <tr key={pay.payment_id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{pay.payment_id}</td>
                      <td className="p-4 text-sm font-medium text-gray-800">{pay.payment_date}</td>
                      <td className="p-4 font-semibold text-gray-900">{client ? (client.company || client.name) : 'Unknown'}</td>
                      <td className="p-4">
                        <div className="font-semibold text-blue-600">{pay.invoice_id}</div>
                        <div className="text-xs text-gray-500">{pay.project_id ? `Project: ${pay.project_id}` : ''}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-800">{pay.payment_method}</div>
                        <div className="text-xs text-gray-500">{pay.reference || '-'}</div>
                      </td>
                      <td className="p-4 text-right font-bold text-green-600 text-lg">
                        ₹{Number(pay.amount).toLocaleString()}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-500">
                      <CreditCard size={32} className="mx-auto text-gray-300 mb-3"/>
                      <p className="font-semibold text-gray-900">No payments recorded</p>
                      <p className="text-sm mt-1">Payments recorded against invoices will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Create Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer p-1"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveInvoice} className="p-6 overflow-y-auto space-y-6">
              
              {/* Basic Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Client *</label>
                  <select required className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={invoiceForm.client_id} onChange={e => setInvoiceForm({...invoiceForm, client_id: e.target.value})}>
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Project (Optional)</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={invoiceForm.project_id} onChange={e => setInvoiceForm({...invoiceForm, project_id: e.target.value})}>
                    <option value="">Select Project</option>
                    {projects.filter(p => !invoiceForm.client_id || p.client_id.toString() === invoiceForm.client_id.toString()).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Issue Date</label>
                  <input required type="date" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={invoiceForm.issue_date} onChange={e => setInvoiceForm({...invoiceForm, issue_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
                  <input required type="date" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={invoiceForm.due_date} onChange={e => setInvoiceForm({...invoiceForm, due_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Currency</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={invoiceForm.currency} onChange={e => setInvoiceForm({...invoiceForm, currency: e.target.value})}>
                    <option>INR</option>
                    <option>USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={invoiceForm.status} onChange={e => setInvoiceForm({...invoiceForm, status: e.target.value})}>
                    <option>Draft</option>
                    <option>Sent</option>
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3 flex justify-between items-center">
                  Invoice Items
                  <button type="button" onClick={addInvoiceItem} className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"><Plus size={12}/> Add Item</button>
                </h4>
                
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-3 text-right">Unit Price</div>
                    <div className="col-span-1"></div>
                  </div>
                  {invoiceForm.items.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input required type="text" className="w-full p-2 border border-gray-300 rounded-md outline-none text-sm" placeholder="Service description" value={item.description} onChange={e => handleInvoiceItemChange(item.id, 'description', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <input required type="number" min="1" className="w-full p-2 border border-gray-300 rounded-md outline-none text-sm text-right" value={item.quantity} onChange={e => handleInvoiceItemChange(item.id, 'quantity', e.target.value)} />
                      </div>
                      <div className="col-span-3">
                        <input required type="number" min="0" className="w-full p-2 border border-gray-300 rounded-md outline-none text-sm text-right" value={item.price} onChange={e => handleInvoiceItemChange(item.id, 'price', e.target.value)} />
                      </div>
                      <div className="col-span-1 text-right">
                        <button type="button" onClick={() => removeInvoiceItem(item.id)} disabled={invoiceForm.items.length === 1} className="p-2 text-red-500 hover:bg-red-50 rounded cursor-pointer disabled:opacity-50"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Totals & Adjustments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Internal Notes</label>
                  <textarea className="w-full p-2 border border-gray-300 rounded-md outline-none text-sm h-24" placeholder="Notes..." value={invoiceForm.notes} onChange={e => setInvoiceForm({...invoiceForm, notes: e.target.value})} />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                    <span>Subtotal:</span>
                    <span>{invoiceForm.currency} {calculateInvoiceTotals(invoiceForm).subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-700">Discount Amount:</span>
                    <input type="number" min="0" className="w-24 p-1 border border-gray-300 rounded text-right text-sm" value={invoiceForm.discount} onChange={e => setInvoiceForm({...invoiceForm, discount: Number(e.target.value)})} />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-700">Tax Rate (%):</span>
                    <input type="number" min="0" max="100" className="w-24 p-1 border border-gray-300 rounded text-right text-sm" value={invoiceForm.tax_rate} onChange={e => setInvoiceForm({...invoiceForm, tax_rate: Number(e.target.value)})} />
                  </div>
                  <div className="border-t border-gray-300 my-2 pt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Total:</span>
                    <span className="font-bold text-blue-600 text-lg">{invoiceForm.currency} {calculateInvoiceTotals(invoiceForm).total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow cursor-pointer hover:bg-blue-800">Save Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer p-1"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Allocate to Invoice *</label>
                <select required className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={paymentForm.invoice_id} onChange={e => {
                  const invId = e.target.value;
                  const inv = invoices.find(i => i.invoice_id === invId);
                  if(inv) {
                    const amtDue = inv.total - getInvoiceAmountPaid(inv.invoice_id);
                    setPaymentForm({...paymentForm, invoice_id: invId, amount: amtDue});
                  } else {
                    setPaymentForm({...paymentForm, invoice_id: invId});
                  }
                }}>
                  <option value="">Select Invoice</option>
                  {invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void' && i.status !== 'Cancelled').map(i => {
                    const due = i.total - getInvoiceAmountPaid(i.invoice_id);
                    return <option key={i.invoice_id} value={i.invoice_id}>{i.invoice_id} (Due: {i.currency} {due.toLocaleString()})</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount Received *</label>
                <input required type="number" min="1" step="0.01" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm font-bold text-lg" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Date</label>
                  <input required type="date" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={paymentForm.payment_date} onChange={e => setPaymentForm({...paymentForm, payment_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Method</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={paymentForm.payment_method} onChange={e => setPaymentForm({...paymentForm, payment_method: e.target.value})}>
                    <option>Bank Transfer</option>
                    <option>Credit Card</option>
                    <option>Cash</option>
                    <option>Cheque</option>
                    <option>UPI / Wallet</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Transaction Reference</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" placeholder="TXN ID, Cheque #, etc." value={paymentForm.reference} onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})} />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-lg font-bold text-sm shadow cursor-pointer hover:bg-green-700">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW INVOICE MODAL */}
      {showInvoiceView && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Invoice {showInvoiceView.invoice_id}</h3>
              <button onClick={() => setShowInvoiceView(null)} className="text-gray-400 hover:text-gray-900 cursor-pointer p-1"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-100">
              {/* Mock Invoice PDF View */}
              <div className="bg-white p-8 rounded shadow-sm border border-gray-200">
                 <div className="flex justify-between items-start mb-8">
                   <div>
                     <h2 className="text-2xl font-bold text-blue-900">RKR Solutions</h2>
                     <p className="text-sm text-gray-500 mt-1">IT & Business Management</p>
                   </div>
                   <div className="text-right">
                     <h2 className="text-2xl font-black text-gray-200 uppercase">Invoice</h2>
                     <p className="text-sm font-bold text-gray-900 mt-1">{showInvoiceView.invoice_id}</p>
                     <p className="text-xs text-gray-500 mt-1">Issued: {showInvoiceView.issue_date}</p>
                     <p className="text-xs text-gray-500 mt-1">Due: {showInvoiceView.due_date}</p>
                   </div>
                 </div>
                 
                 <div className="mb-8 border-l-4 border-primary pl-4">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bill To:</p>
                   <p className="font-bold text-gray-900">{clients.find(c=>c.id.toString()===showInvoiceView.client_id.toString())?.company || 'Unknown Client'}</p>
                   <p className="text-sm text-gray-600">{clients.find(c=>c.id.toString()===showInvoiceView.client_id.toString())?.contact}</p>
                 </div>
                 
                 <table className="w-full text-left mb-6 border-collapse">
                   <thead>
                     <tr className="border-b-2 border-gray-900 text-sm">
                       <th className="py-2 font-bold text-gray-900">Description</th>
                       <th className="py-2 text-right font-bold text-gray-900">Qty</th>
                       <th className="py-2 text-right font-bold text-gray-900">Price</th>
                       <th className="py-2 text-right font-bold text-gray-900">Total</th>
                     </tr>
                   </thead>
                   <tbody>
                     {showInvoiceView.items.map(item => (
                       <tr key={item.id} className="border-b border-gray-200 text-sm">
                         <td className="py-3 text-gray-800">{item.description}</td>
                         <td className="py-3 text-right text-gray-800">{item.quantity}</td>
                         <td className="py-3 text-right text-gray-800">{showInvoiceView.currency} {Number(item.price).toLocaleString()}</td>
                         <td className="py-3 text-right text-gray-900 font-bold">{showInvoiceView.currency} {(item.quantity * item.price).toLocaleString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 
                 <div className="flex justify-end mb-8">
                   <div className="w-64 space-y-2 text-sm">
                     <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">{showInvoiceView.currency} {showInvoiceView.subtotal.toLocaleString()}</span></div>
                     <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="font-bold text-red-500">-{showInvoiceView.currency} {showInvoiceView.discount.toLocaleString()}</span></div>
                     <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="font-bold">{showInvoiceView.currency} {showInvoiceView.tax.toLocaleString()}</span></div>
                     <div className="border-t-2 border-gray-900 pt-2 flex justify-between text-lg"><span className="font-bold text-gray-900">Total</span><span className="font-black text-blue-600">{showInvoiceView.currency} {showInvoiceView.total.toLocaleString()}</span></div>
                   </div>
                 </div>

                 <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${getStatusBadge(showInvoiceView.status)}`}>
                        {showInvoiceView.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount Paid</p>
                      <p className="font-bold text-green-600">{showInvoiceView.currency} {getInvoiceAmountPaid(showInvoiceView.invoice_id).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Balance Due</p>
                      <p className="font-bold text-red-600">{showInvoiceView.currency} {(showInvoiceView.total - getInvoiceAmountPaid(showInvoiceView.invoice_id)).toLocaleString()}</p>
                    </div>
                 </div>

                 {/* INVOICE ASSETS */}
                 <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><FolderOpen size={16} className="text-orange-500"/> Finance Assets</h3>
                      <a href="/dashboard/assets" className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded hover:bg-orange-100 transition-colors cursor-pointer">
                        + Upload Proof
                      </a>
                    </div>
                    <div className="space-y-2">
                      {assetsList.filter(a => {
                        const clientName = clients.find(c => c.id.toString() === showInvoiceView.client_id.toString())?.name || '';
                        return a.client === clientName;
                      }).length > 0 ? assetsList.filter(a => {
                        const clientName = clients.find(c => c.id.toString() === showInvoiceView.client_id.toString())?.name || '';
                        return a.client === clientName;
                      }).map(asset => (
                        <div key={asset.asset_id} className="p-2 border border-gray-100 rounded flex justify-between items-center bg-gray-50">
                          <div className="flex items-center gap-2">
                            <FileTextIcon size={14} className="text-gray-400" />
                            <div>
                              <p className="text-xs font-bold text-gray-800">{asset.name}</p>
                              <p className="text-[9px] text-gray-500">{asset.category}</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800"><Download size={14}/></button>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-500 text-center py-2 border-2 border-dashed border-gray-100 rounded">No related assets found.</p>
                      )}
                    </div>
                 </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
