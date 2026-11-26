import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building, Mail, Phone, Calendar, 
  CheckCircle2, Activity, Edit2, 
  ChevronRight, Plus, X, PhoneCall, 
  DollarSign, Briefcase, FileText,
  CreditCard, FolderOpen, Link as LinkIcon, Download, Trash2, MessageSquare
} from 'lucide-react';

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [clientAssets, setClientAssets] = useState([]);
  const [communications, setCommunications] = useState([]);
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Forms
  const [editForm, setEditForm] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [docForm, setDocForm] = useState({ name: '', type: 'Contract', fileData: null, fileSize: '', fileName: '' });
  const [projectForm, setProjectForm] = useState({ name: '', service: 'Website Development', status: 'In Progress', budget: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: '', ref: '' });

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = () => {
    const localClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
    const found = localClients.find(c => c.id.toString() === id);
    
    // Load Global Assets for this client
    const allAssets = JSON.parse(localStorage.getItem('rkr_assets') || '[]');
    const allComms = JSON.parse(localStorage.getItem('rkr_communications') || '[]');

    if (found) {
      setClientAssets(allAssets.filter(a => a.client === found.name));
      setCommunications(allComms.filter(c => c.entity_id === found.id.toString() || c.contact_name === found.name));
      if (!found.activities) found.activities = [{ id: 1, type: 'Client Created', desc: 'Client entered into system', user: 'System', date: found.created_at || new Date().toISOString() }];
      if (!found.notes) found.notes = [];
      if (!found.documents || !Array.isArray(found.documents)) found.documents = [];
      if (!found.projects || !Array.isArray(found.projects)) found.projects = [];
      if (!found.services || !Array.isArray(found.services)) found.services = [];
      
      // Auto-add project from LTV if they came from conversion and projects list is empty
      if (found.project && found.projects.length === 0) {
        found.projects = [{
          id: Date.now(), name: `${found.company || found.name} Project`, service: found.project, 
          status: 'In Progress', budget: found.ltv || '$0', paid: '$0', pending: found.ltv || '$0'
        }];
      }
      
      setClient(found);
      setEditForm(found);
    }
  };

  const saveUpdatesToStorage = (updatedClientData) => {
    const localClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
    const newClients = localClients.map(c => c.id === updatedClientData.id ? updatedClientData : c);
    localStorage.setItem('rkr_clients', JSON.stringify(newClients));
    setClient(updatedClientData);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const newAct = { id: Date.now(), type: 'Client Updated', desc: 'Client details were modified', user: 'Admin', date: new Date().toISOString() };
    const updatedClient = {
      ...client, ...editForm, updated_at: new Date().toISOString(), activities: [newAct, ...(client.activities || [])]
    };
    saveUpdatesToStorage(updatedClient);
    setShowEditModal(false);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    const newNote = { id: Date.now(), content: noteContent, user: 'Admin', date: new Date().toISOString() };
    const newAct = { id: Date.now() + 1, type: 'Note Added', desc: 'Internal note added to client profile', user: 'Admin', date: new Date().toISOString() };
    const updatedClient = {
      ...client, updated_at: new Date().toISOString(), notes: [newNote, ...(client.notes || [])], activities: [newAct, ...(client.activities || [])]
    };
    saveUpdatesToStorage(updatedClient);
    setShowNoteModal(false);
    setNoteContent('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit. Please select a smaller file.");
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocForm({...docForm, name: docForm.name || file.name, fileData: reader.result, fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB', fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!docForm.name.trim() || !docForm.fileData) {
      alert("Please provide a name and select a file.");
      return;
    }
    const newDoc = { id: Date.now(), name: docForm.name, type: docForm.type, user: 'Admin', date: new Date().toISOString(), size: docForm.fileSize, fileData: docForm.fileData, fileName: docForm.fileName };
    const newAct = { id: Date.now() + 1, type: 'Document Uploaded', desc: `Uploaded ${docForm.type}: ${docForm.name}`, user: 'Admin', date: new Date().toISOString() };
    const updatedClient = {
      ...client, updated_at: new Date().toISOString(), documents: [newDoc, ...(client.documents || [])], activities: [newAct, ...(client.activities || [])]
    };
    saveUpdatesToStorage(updatedClient);
    setShowDocModal(false);
    setDocForm({ name: '', type: 'Contract', fileData: null, fileSize: '', fileName: '' });
  };
  
  const handleAddProject = (e) => {
    e.preventDefault();
    const newProject = { 
      id: Date.now(), name: projectForm.name, service: projectForm.service, 
      status: projectForm.status, budget: projectForm.budget, paid: '0', pending: projectForm.budget 
    };
    const newAct = { id: Date.now() + 1, type: 'Project Created', desc: `Project started: ${projectForm.name}`, user: 'Admin', date: new Date().toISOString() };
    const updatedClient = {
      ...client, updated_at: new Date().toISOString(), projects: [newProject, ...(client.projects || [])], activities: [newAct, ...(client.activities || [])]
    };
    saveUpdatesToStorage(updatedClient);
    setShowProjectModal(false);
    setProjectForm({ name: '', service: 'Website Development', status: 'In Progress', budget: '' });
  };

  const [allInvoices, setAllInvoices] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  
  useEffect(() => {
    loadClient();
    setAllInvoices(JSON.parse(localStorage.getItem('rkr_invoices') || '[]'));
    setAllPayments(JSON.parse(localStorage.getItem('rkr_payments') || '[]'));
  }, [id]);

  if (!client) return <div className="p-12 text-center text-gray-500 font-bold">Loading Client Profile...</div>;

  const clientInvoices = allInvoices.filter(i => i.client_id.toString() === id);
  const clientPayments = allPayments.filter(p => p.client_id.toString() === id);

  let totalContractValue = 0;
  clientInvoices.forEach(i => {
    if (i.status !== 'Cancelled' && i.status !== 'Void') {
      totalContractValue += Number(i.total);
    }
  });
  
  let totalPaid = 0;
  clientPayments.forEach(p => {
    totalPaid += Number(p.amount);
  });
  
  const totalPending = totalContractValue - totalPaid;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
            <Link to="/dashboard/clients" className="hover:text-primary transition-colors cursor-pointer">Clients</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900">{client.company || client.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{client.company || client.name}</h1>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${client.status==='Active'?'bg-green-100 text-green-700':client.status==='Archived'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>
              {client.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Building size={14} /> {client.industry || 'General'} <span className="text-gray-300">|</span> ID: {client.id}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate(`/dashboard/communications/add?type=Client&id=${client.id}&name=${encodeURIComponent(client.company || client.name)}`)} className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
            <MessageSquare size={16} /> Log Comm
          </button>
          <button onClick={() => setShowEditModal(true)} className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
            <Edit2 size={16} /> Edit
          </button>
          <button onClick={() => setShowProjectModal(true)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
            <Briefcase size={16} /> Create Project
          </button>
        </div>
      </div>
      
      {/* 8. CLIENT OVERVIEW / KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Briefcase size={14}/> Total Projects</p>
            <p className="text-2xl font-bold text-gray-900">{client.projects?.length || 0}</p>
         </div>
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1"><DollarSign size={14}/> Contract Value</p>
            <p className="text-2xl font-bold text-blue-600">${totalContractValue.toLocaleString()}</p>
         </div>
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={14}/> Amount Paid</p>
            <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
         </div>
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-orange-600 mb-1 uppercase tracking-wider flex items-center gap-1"><CreditCard size={14}/> Pending Balance</p>
            <p className="text-2xl font-bold text-orange-600">${totalPending.toLocaleString()}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 7. CLIENT SUMMARY */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Contact</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{client.contact || client.name}</p>
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <a href={`tel:${client.phone}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"><Phone size={12}/> {client.phone || 'N/A'}</a>
                  {client.phone && <a href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold hover:bg-green-100 transition">WhatsApp</a>}
                </div>
                <div className="flex items-center justify-between">
                  <a href={`mailto:${client.email}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 truncate cursor-pointer"><Mail size={12}/> {client.email || 'N/A'}</a>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Manager</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{client.manager || 'Admin'}</p>
              <p className="text-xs font-bold text-gray-500 uppercase mt-3">Client Since</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{client.created_at ? new Date(client.created_at).toLocaleDateString() : client.date}</p>
            </div>
          </div>
          
          {/* 9. PROJECTS */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><Briefcase size={18} className="text-blue-500"/> Projects</h3>
              <button onClick={() => setShowProjectModal(true)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer shadow-sm">
                <Plus size={14} /> New Project
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.projects && client.projects.length > 0 ? client.projects.map(p => {
                let badgeStyle = 'bg-gray-50 text-gray-600 border-gray-200';
                if (p.status === 'In Progress') badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                if (p.status === 'Completed') badgeStyle = 'bg-green-50 text-green-700 border-green-200';
                
                return (
                <div key={p.id} onClick={() => navigate('/dashboard/projects')} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Briefcase size={20} />
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${badgeStyle}`}>
                      {p.status}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{p.name}</h4>
                  <p className="text-xs text-gray-500 mb-4 flex-grow">{p.service}</p>
                  
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Budget</p>
                      <p className="text-sm font-bold text-gray-900">{p.budget}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500" />
                  </div>
                </div>
              )}) : (
                <div className="col-span-1 md:col-span-2 p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500">No projects started yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* 12. PAYMENT HISTORY */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><CreditCard size={18} className="text-green-500"/> Payments History</h3>
              <Link to="/dashboard/payments" className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-1 cursor-pointer shadow-sm">
                View Billing
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {clientPayments.length > 0 ? clientPayments.map(pay => (
                    <tr key={pay.payment_id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 text-sm font-medium text-gray-900">{pay.payment_date}</td>
                      <td className="py-3 text-sm font-bold text-green-600">₹{Number(pay.amount).toLocaleString()}</td>
                      <td className="py-3 text-sm font-semibold text-blue-600">{pay.invoice_id}</td>
                      <td className="py-3 text-sm text-gray-500">{pay.payment_method}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg mt-2 inline-block w-full">
                        No payments recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 13. CLIENT ASSETS */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><FolderOpen size={18} className="text-orange-500"/> Client Assets</h3>
              <a href="/dashboard/assets" className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors flex items-center gap-1 cursor-pointer shadow-sm">
                <Plus size={14} /> Upload Asset
              </a>
            </div>
            
            <div className="space-y-3">
              {clientAssets.length > 0 ? clientAssets.map(asset => (
                <div key={asset.asset_id} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{asset.name}</p>
                      <p className="text-xs text-gray-500">{asset.category} • Uploaded on {new Date(asset.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer inline-flex">
                      <Download size={16}/>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg w-full inline-block">
                  No assets uploaded for this client. Go to Client Assets to upload.
                </div>
              )}
            </div>
          </div>

          
          {/* 14. COMMUNICATION HISTORY */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><MessageSquare size={18} className="text-blue-500"/> Communication History</h3>
              <button onClick={() => navigate(`/dashboard/communications/add?type=Client&id=${client.id}&name=${encodeURIComponent(client.company || client.name)}`)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer shadow-sm">
                <Plus size={14} /> Log Comm
              </button>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {communications.length > 0 ? communications.map(comm => (
                <div key={comm.communication_id} onClick={() => navigate(`/dashboard/communications/${comm.communication_id}`)} className="p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-1.5 py-0.5 bg-white border border-gray-200 rounded">{comm.channel}</span>
                      <span className="text-sm font-bold text-gray-900">{comm.subject}</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(comm.communication_date).toLocaleDateString()}</span>
                  </div>
                  {comm.follow_up_required && (
                    <p className="text-xs text-orange-600 font-bold mt-1">Follow-up: {new Date(comm.follow_up_date).toLocaleDateString()}</p>
                  )}
                </div>
              )) : (
                <div className="py-6 text-center text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  No communications logged.
                </div>
              )}
            </div>
          </div>
          
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          
          {/* 17. LEAD ORIGIN */}
          {client.source === 'Converted Lead' && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
              <h3 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-2"><LinkIcon size={18}/> Lead Origin</h3>
              <p className="text-xs text-blue-800 mb-4 font-medium">This client was successfully converted from a Lead.</p>
              <Link to={client.lead_id ? `/dashboard/leads/${client.lead_id}` : "/dashboard/leads"} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex justify-center items-center gap-2 cursor-pointer">
                View Original Lead
              </Link>
            </div>
          )}

          {/* 15. INTERNAL NOTES */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-gray-500"/> Internal Notes</h3>
              <button onClick={() => setShowNoteModal(true)} className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer shadow-sm border border-gray-200">
                + Add
              </button>
            </div>
            <div className="space-y-4">
              {client.notes && client.notes.length > 0 ? client.notes.map(note => (
                <div key={note.id} className="p-3 bg-yellow-50/50 border border-yellow-100 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-2">By {note.user} • {new Date(note.date).toLocaleDateString()}</p>
                </div>
              )) : (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500">No internal notes.</p>
                </div>
              )}
            </div>
          </div>

          {/* 16. ACTIVITY TIMELINE */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6"><Activity size={18} className="text-purple-500"/> Activity Log</h3>
            <div className="relative pl-5 border-l-2 border-gray-100 space-y-6 max-h-[600px] overflow-y-auto pr-2">
              {client.activities && client.activities.map(act => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{act.type}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{act.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        {new Date(act.date).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400">By {act.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Edit Client Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Edit Client</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company / Name</label>
                  <input required className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={editForm.company || editForm.name} onChange={e=>setEditForm({...editForm, company: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Person</label>
                  <input className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={editForm.contact} onChange={e=>setEditForm({...editForm, contact: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                  <input className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={editForm.email} onChange={e=>setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer" value={editForm.status} onChange={e=>setEditForm({...editForm, status: e.target.value})}>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>On Hold</option>
                    <option>Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Manager</label>
                  <input className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={editForm.manager || 'Admin'} onChange={e=>setEditForm({...editForm, manager: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-800 cursor-pointer shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Briefcase size={20} className="text-blue-600"/> Create Project</h3>
              <button onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <p className="text-xs text-gray-500 mb-4">This project will be automatically associated with <strong>{client.company || client.name}</strong>.</p>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Project Name</label>
                <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} placeholder="e.g. Corporate Website Redesign" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Service Type</label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer" value={projectForm.service} onChange={e => setProjectForm({...projectForm, service: e.target.value})}>
                  <option>Website Development</option>
                  <option>AI Solutions</option>
                  <option>Dashboard Development</option>
                  <option>Marketing</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Budget / Value</label>
                  <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={projectForm.budget} onChange={e => setProjectForm({...projectForm, budget: e.target.value})} placeholder="$5,000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer" value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value})}>
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>On Hold</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-800 cursor-pointer shadow-sm">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Add Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><FolderOpen size={20} className="text-orange-500"/> Attach Document</h3>
              <button onClick={() => setShowDocModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Name</label>
                <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} placeholder="e.g. Signed Contract" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer" value={docForm.type} onChange={e => setDocForm({...docForm, type: e.target.value})}>
                  <option>Contract</option>
                  <option>Quotation</option>
                  <option>Invoice</option>
                  <option>Receipt</option>
                  <option>Requirements</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">File Attachment (Max 2MB)</label>
                <input required type="file" onChange={handleFileChange} className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm bg-white cursor-pointer" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-800 cursor-pointer shadow-sm">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><FileText size={20} className="text-gray-500"/> Internal Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddNote} className="p-6">
              <textarea required className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm min-h-[120px] resize-none" placeholder="Add private note about this client..." value={noteContent} onChange={e => setNoteContent(e.target.value)} />
              <div className="pt-4 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowNoteModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-black cursor-pointer shadow-sm">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
