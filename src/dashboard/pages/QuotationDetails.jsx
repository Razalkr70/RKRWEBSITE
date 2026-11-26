import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, Edit2, Archive, FileText, CheckCircle2, Copy, 
  Trash2, Printer, Download, Send, CheckSquare, X, DollarSign,
  Building, MapPin, Mail, Phone, Clock, Plus, Layout, Activity, FolderOpen
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

const numberToWordsINR = (num) => {
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const processStr = (n) => {
    let str = '';
    if (n < 20) str = a[n];
    else if (n < 100) str = b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    else if (n < 1000) str = a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + processStr(n % 100) : '');
    return str;
  };

  let numStr = Math.floor(num).toString();
  if (numStr.length > 9) return 'Amount too large';

  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';

  let str = '';
  str += (n[1] != 0) ? processStr(Number(n[1])) + ' Crore ' : '';
  str += (n[2] != 0) ? processStr(Number(n[2])) + ' Lakh ' : '';
  str += (n[3] != 0) ? processStr(Number(n[3])) + ' Thousand ' : '';
  str += (n[4] != 0) ? processStr(Number(n[4])) + ' Hundred ' : '';
  str += (n[5] != 0) ? ((str !== '') ? 'and ' : '') + processStr(Number(n[5])) + ' Rupees Only' : 'Rupees Only';
  
  return str.trim();
};

export default function QuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quotation, setQuotation] = useState(null);
  const [client, setClient] = useState(null);
  const [project, setProject] = useState(null);
  const [quotationAssets, setQuotationAssets] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    const quotes = JSON.parse(localStorage.getItem('rkr_quotations') || '[]');
    const found = quotes.find(q => q.id.toString() === id);
    if (found) {
      if (!found.activities) found.activities = [];
      setQuotation(found);
      
      const clients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      const c = clients.find(cl => cl.id.toString() === found.client_id.toString());
      setClient(c || null);

      const projects = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
      const p = projects.find(pr => pr.id.toString() === found.project_id?.toString());
      setProject(p || null);

      const allAssets = JSON.parse(localStorage.getItem('rkr_assets') || '[]');
      setQuotationAssets(allAssets.filter(a => a.client === found.client_name || a.project === found.project_name));
    }
    setServicesList(JSON.parse(localStorage.getItem('rkr_services') || '[]'));
  };

  const saveUpdates = (updatedQuotation, actionDesc) => {
    const newAct = { id: Date.now(), type: 'Quotation Updated', desc: actionDesc, user: 'Admin', date: new Date().toISOString() };
    updatedQuotation.activities = [newAct, ...updatedQuotation.activities];
    updatedQuotation.updated_at = new Date().toISOString();
    
    const quotes = JSON.parse(localStorage.getItem('rkr_quotations') || '[]');
    const newQuotes = quotes.map(q => q.id === updatedQuotation.id ? updatedQuotation : q);
    localStorage.setItem('rkr_quotations', JSON.stringify(newQuotes));
    
    setQuotation(updatedQuotation);
    loadData(); // refresh dependencies
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === quotation.status) return;
    saveUpdates({ ...quotation, status: newStatus }, `Status changed to ${newStatus}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDuplicate = () => {
    const newId = Date.now();
    const newQuotation = {
      ...quotation,
      id: newId,
      quotation_number: `RKR-QUO-${newId.toString().slice(-4)}`,
      status: 'Draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activities: [{ id: Date.now()+1, type: 'Quotation Duplicated', desc: `Duplicated from ${quotation.quotation_number}`, user: 'Admin', date: new Date().toISOString() }]
    };
    const existing = JSON.parse(localStorage.getItem('rkr_quotations') || '[]');
    localStorage.setItem('rkr_quotations', JSON.stringify([newQuotation, ...existing]));
    navigate(`/dashboard/quotations/${newId}`);
  };

  const handleDelete = () => {
    const existing = JSON.parse(localStorage.getItem('rkr_quotations') || '[]');
    localStorage.setItem('rkr_quotations', JSON.stringify(existing.filter(q => q.id !== quotation.id)));
    navigate('/dashboard/quotations');
  };

  const handleCreateProject = () => {
    const newProjId = Date.now();
    const newProj = {
      id: newProjId,
      project_id: `RKR-PRJ-${newProjId.toString().slice(-4)}`,
      name: `Project for ${quotation.quotation_number}`,
      client_id: quotation.client_id,
      service: quotation.items[0]?.service_id || 'Custom', // use primary service
      description: `Converted from accepted quotation ${quotation.quotation_number}. ${quotation.notes}`,
      priority: 'Medium',
      status: 'Planning',
      contract_value: quotation.total,
      client_name: quotation.client_name,
      start_date: new Date().toISOString().split('T')[0],
      project_manager: 'Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: [], comments: [], files: [], activities: []
    };
    const projects = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
    localStorage.setItem('rkr_projects', JSON.stringify([newProj, ...projects]));
    
    // Link back to quotation
    saveUpdates({ ...quotation, project_id: newProjId, project_name: newProj.name }, `Converted to Project ${newProj.project_id}`);
    navigate(`/dashboard/projects/${newProjId}`);
  };

  const openEditModal = () => {
    setEditForm(JSON.parse(JSON.stringify(quotation))); // Deep copy
    setShowEditModal(true);
  };

  const updateEditItem = (id, field, value) => {
    setEditForm({
      ...editForm, 
      items: editForm.items.map(i => {
        if(i.id === id) {
          const updated = { ...i, [field]: value };
          if (field === 'service_id' && value) {
            const svc = servicesList.find(s => s.name === value);
            if (svc) {
              updated.description = svc.short_description || svc.name;
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

  const addEditItem = () => setEditForm({...editForm, items: [...editForm.items, { id: Date.now(), service_id: '', description: '', quantity: 1, unit_price: 0, discount: 0, tax: 0 }]});
  const removeEditItem = (id) => {
    if (editForm.items.length === 1) return alert("Must have at least one item.");
    setEditForm({...editForm, items: editForm.items.filter(i => i.id !== id)});
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    
    const processedItems = editForm.items.map(item => {
      const line_total_before_tax = (item.quantity * item.unit_price) - item.discount;
      const tax_amt = line_total_before_tax * (item.tax / 100);
      const line_total = line_total_before_tax + tax_amt;
      subtotal += (item.quantity * item.unit_price);
      totalDiscount += Number(item.discount);
      totalTax += tax_amt;
      return { ...item, line_total };
    });

    const grand_total = subtotal - totalDiscount + totalTax;
    
    saveUpdates({
      ...editForm,
      items: processedItems,
      subtotal, discount: totalDiscount, tax: totalTax, total: grand_total
    }, 'Quotation details and items edited.');
    
    setShowEditModal(false);
  };

  const handleSend = () => {
    saveUpdates({ ...quotation, status: 'Sent' }, 'Quotation sent to client via WhatsApp.');
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);

    let phone = client?.phone || '';
    phone = phone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone; 

    const formatCurrencyForMsg = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    const message = `Hello ${client?.name || quotation.client_name || ''},\n\nHere is your quotation (${quotation.quotation_number}) for the amount of ${formatCurrencyForMsg(quotation.total)}.\n\nThank you for choosing RKR Solutions!`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    if (phone) {
      window.open(whatsappUrl, '_blank');
    } else {
      console.warn('No phone number found for client.');
    }
  };

  if (!quotation) return <div className="p-12 text-center font-bold text-gray-500">Loading Quotation...</div>;

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6 pb-20 print:p-0 print:max-w-none print:m-0">
      
      {/* NO-PRINT: HEADER */}
      <div className="print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
          <Link to="/dashboard/quotations" className="hover:text-blue-600 transition-colors">Quotations</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600 truncate max-w-[200px]">{quotation.quotation_number}</span>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{quotation.quotation_number}</h1>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[quotation.status] || STATUS_COLORS['Draft']}`}>
                {quotation.status}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span>{quotation.client_name}</span>
              {quotation.project_name && (
                <>
                  <span className="text-gray-300">•</span>
                  <Link to={`/dashboard/projects/${quotation.project_id}`} className="hover:text-blue-600 hover:underline">{quotation.project_name}</Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold outline-none cursor-pointer hover:bg-gray-50" value={quotation.status} onChange={e => handleStatusChange(e.target.value)}>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s === 'Sent' ? 'Mark Sent' : s === 'Viewed' ? 'Mark Viewed' : s === 'Accepted' ? 'Mark Accepted' : s === 'Rejected' ? 'Mark Rejected' : s}</option>)}
            </select>
            
            <button onClick={openEditModal} className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" title="Edit Quotation">
              <Edit2 size={18} />
            </button>
            <button onClick={handleDuplicate} className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" title="Duplicate Quotation">
              <Copy size={18} />
            </button>
            <button onClick={handlePrint} className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" title="Print / PDF">
              <Printer size={18} />
            </button>
            
            {quotation.status === 'Accepted' && !quotation.project_name && (
               <button onClick={handleCreateProject} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm cursor-pointer flex items-center gap-2">
                 <CheckSquare size={16} /> Create Project
               </button>
            )}
            
            <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm cursor-pointer flex items-center gap-2">
              <Send size={16} /> Send to Client
            </button>
          </div>
        </div>
      </div>

      {/* PRINTABLE QUOTATION DOCUMENT */}
      <div className="bg-white p-10 md:p-14 rounded-2xl border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0 font-sans text-gray-900 max-w-[900px] mx-auto min-h-[1056px] relative">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
          <div className="flex items-center gap-5">
            <img src="/logo.png" alt="RKR Solutions Logo" className="h-16 w-auto object-contain" />
            <div>
              <h2 className="text-2xl font-black text-[#1E3A8A] tracking-tight">RKR Solutions</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Building Intelligent Digital Solutions</p>
              <div className="mt-3 text-xs font-medium text-gray-600 space-y-0.5">
                <p>razalkrdeveloper@gmail.com</p>
                <p>+91 8606230949</p>
                <p>www.rkrsolutions.com</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-4">Quotation</h1>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-medium">
              <span className="text-gray-500">Quotation No:</span>
              <span className="font-bold text-gray-900">{quotation.quotation_number}</span>
              
              <span className="text-gray-500">Issue Date:</span>
              <span className="font-bold text-gray-900">{new Date(quotation.issue_date).toLocaleDateString()}</span>
              
              <span className="text-gray-500">Valid Until:</span>
              <span className="font-bold text-gray-900">{new Date(quotation.valid_until).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Client & Project Info */}
        <div className="flex justify-between items-start mb-10">
          <div className="w-1/2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Prepared For</h3>
            {client ? (
              <div className="text-sm space-y-1">
                <p className="font-bold text-lg text-gray-900">{client.company || client.name}</p>
                {client.company && <p className="font-medium text-gray-600">{client.name}</p>}
                {client.address && <p className="text-gray-600 mt-1">{client.address}</p>}
                {(client.city || client.country) && <p className="text-gray-600">{client.city}, {client.country}</p>}
                {client.email && <p className="text-gray-600 mt-2">{client.email}</p>}
                {client.phone && <p className="text-gray-600">{client.phone}</p>}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-600">{quotation.client_name}</p>
            )}
          </div>
          
          {project && (
            <div className="w-1/3">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Project Details</h3>
               <p className="font-bold text-gray-900 text-sm mb-1">{project.name}</p>
               <p className="text-xs text-gray-500 font-medium">ID: {project.project_id}</p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="py-3 px-4 text-xs font-black text-gray-700 uppercase">Description</th>
                <th className="py-3 px-4 text-xs font-black text-gray-700 uppercase w-20 text-center">Qty</th>
                <th className="py-3 px-4 text-xs font-black text-gray-700 uppercase w-32 text-right">Unit Price</th>
                <th className="py-3 px-4 text-xs font-black text-gray-700 uppercase w-32 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotation.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 px-4 align-top">
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.service_id || 'Service Item'}</p>
                    <p className="text-xs font-medium text-gray-500 whitespace-pre-wrap">{item.description}</p>
                  </td>
                  <td className="py-4 px-4 text-center text-sm font-medium text-gray-700 align-top">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-sm font-medium text-gray-700 align-top">{formatCurrency(item.unit_price)}</td>
                  <td className="py-4 px-4 text-right text-sm font-bold text-gray-900 align-top">{formatCurrency(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Notes */}
        <div className="flex justify-between items-start gap-8">
          
          {/* Notes & Terms */}
          <div className="w-1/2 space-y-6">
            {quotation.payment_terms && (
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Payment Terms</h3>
                <p className="text-xs font-medium text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{quotation.payment_terms}</p>
              </div>
            )}
            
            {quotation.terms && (
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Terms & Conditions</h3>
                <p className="text-[11px] font-medium text-gray-500 leading-relaxed whitespace-pre-wrap">{quotation.terms}</p>
              </div>
            )}
            
            {quotation.notes && (
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Additional Notes</h3>
                <p className="text-[11px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            )}
          </div>
          
          {/* Summary Box */}
          <div className="w-1/2 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(quotation.subtotal)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="flex justify-between text-sm font-bold text-red-500">
                  <span>Discount:</span>
                  <span>-{formatCurrency(quotation.discount)}</span>
                </div>
              )}
              {quotation.tax > 0 && (
                <div className="flex justify-between text-sm font-bold text-gray-600">
                  <span>Tax Amount:</span>
                  <span>{formatCurrency(quotation.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black text-[#1E3A8A] border-t border-gray-300 pt-4 mt-4">
                <span>Total:</span>
                <div className="text-right">
                  <div>{formatCurrency(quotation.total)}</div>
                  <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest whitespace-nowrap">{numberToWordsINR(quotation.total)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Thank you for your business
        </div>
      </div>

      {/* NO-PRINT: TIMELINE & ADMIN ACTIONS */}
      <div className="print:hidden mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-[900px] mx-auto">
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2"><Activity size={18} className="text-blue-600"/> Activity Timeline</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {quotation.activities.map((act, idx) => (
              <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900 text-sm">{act.type}</h4>
                    <time className="text-[10px] font-bold text-gray-400 uppercase">{new Date(act.date).toLocaleDateString()}</time>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* ASSETS ZONE */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2"><FolderOpen size={18} className="text-orange-500"/> Quotation Assets</h3>
              <a href="/dashboard/assets" className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded hover:bg-orange-100 transition-colors cursor-pointer">
                + Upload
              </a>
            </div>
            
            <div className="space-y-3">
              {quotationAssets.length > 0 ? quotationAssets.map(asset => (
                <div key={asset.asset_id} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                      <FileText size={16} />
                    </div>
                    <div className="truncate pr-2 max-w-[120px]">
                      <p className="text-xs font-bold text-gray-900 truncate">{asset.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{asset.category}</p>
                    </div>
                  </div>
                  <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer shrink-0">
                    <Download size={14}/>
                  </button>
                </div>
              )) : (
                <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-[10px] font-medium text-gray-500">No assets for this quotation.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm h-fit">
            <h3 className="text-sm font-black text-red-600 mb-4 flex items-center gap-2"><Archive size={18}/> Danger Zone</h3>
            <p className="text-xs font-medium text-gray-500 mb-4">Deleting a quotation permanently removes it and all its associated data. Archive instead if possible.</p>
            <button onClick={() => setShowDeleteModal(true)} className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors cursor-pointer flex items-center justify-center gap-2">
              <Trash2 size={16} /> Delete Quotation
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-white z-[200] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200 print:hidden">
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Edit Quotation {editForm.quotation_number}</h2>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="button" onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-sm cursor-pointer flex items-center gap-2"><CheckCircle2 size={16}/> Save Changes</button>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50/50 p-6 md:p-10">
            <form className="max-w-[1200px] mx-auto space-y-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2"><Layout size={16} className="text-blue-600"/> Edit Items</h3>
                  <button type="button" onClick={addEditItem} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
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
                        <th className="py-3 px-4 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {editForm.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="py-3 px-6">
                            <div className="space-y-2">
                              <select className="w-full p-2 border border-gray-200 rounded-lg outline-none text-xs font-bold text-gray-700 bg-gray-50 cursor-pointer focus:border-blue-400" value={item.service_id} onChange={e => updateEditItem(item.id, 'service_id', e.target.value)}>
                                <option value="">Custom Service</option>
                                {servicesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                              </select>
                              <textarea rows="1" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-xs text-gray-600 bg-transparent resize-y min-h-[40px] focus:border-blue-400" value={item.description} onChange={e => updateEditItem(item.id, 'description', e.target.value)}></textarea>
                            </div>
                          </td>
                          <td className="py-3 px-4 align-top">
                            <input type="number" min="1" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm text-gray-900 bg-white focus:border-blue-400" value={item.quantity} onChange={e => updateEditItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="py-3 px-4 align-top">
                            <input type="number" min="0" step="0.01" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm text-gray-900 bg-white focus:border-blue-400" value={item.unit_price} onChange={e => updateEditItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="py-3 px-4 align-top">
                            <input type="number" min="0" step="0.01" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm text-gray-900 bg-white focus:border-blue-400" value={item.discount} onChange={e => updateEditItem(item.id, 'discount', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="py-3 px-4 align-top">
                            <input type="number" min="0" max="100" step="1" className="w-full p-2 border border-gray-200 rounded-lg outline-none text-sm text-gray-900 bg-white focus:border-blue-400" value={item.tax} onChange={e => updateEditItem(item.id, 'tax', parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="py-3 px-4 align-top text-center">
                            <button type="button" onClick={() => removeEditItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer mt-0.5">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2 pb-2 border-b border-gray-50">Document Dates</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Issue Date</label>
                    <input type="date" className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm" value={editForm.issue_date} onChange={e => setEditForm({...editForm, issue_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Valid Until</label>
                    <input type="date" className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm" value={editForm.valid_until} onChange={e => setEditForm({...editForm, valid_until: e.target.value})} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2 pb-2 border-b border-gray-50">Terms & Payment</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Terms</label>
                    <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" value={editForm.payment_terms} onChange={e => setEditForm({...editForm, payment_terms: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Terms & Conditions</label>
                    <textarea className="w-full p-2.5 border border-gray-300 rounded-lg text-sm min-h-[60px]" value={editForm.terms} onChange={e => setEditForm({...editForm, terms: e.target.value})}></textarea>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Delete Quotation?</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 cursor-pointer">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {showToast && (
        <div className="fixed bottom-10 right-10 z-[300] bg-white border-l-4 border-green-500 shadow-2xl rounded-lg p-4 flex items-center gap-3 transition-all duration-300 print:hidden">
          <div className="bg-green-100 p-1.5 rounded-full text-green-600">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900">Successfully Sent!</h4>
            <p className="text-xs font-medium text-gray-500">Quotation opened in WhatsApp.</p>
          </div>
        </div>
      )}

    </div>
  );
}
