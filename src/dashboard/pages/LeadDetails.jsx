import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Building, Mail, Phone, Calendar, 
  CheckCircle2, MessageSquare, Clock, FileText, UserPlus, 
  Edit2, Send, MessageCircle, MapPin, DollarSign, Briefcase, 
  ChevronRight, Plus, X, PhoneCall, Activity, Check, XCircle,
  FolderOpen, Upload, Download, Trash2
} from 'lucide-react';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [leadAssets, setLeadAssets] = useState([]);
  const [communications, setCommunications] = useState([]);
  
  // Modals
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  
  // Forms
  const [activityForm, setActivityForm] = useState({ type: 'Phone Call', desc: '' });
  const [noteContent, setNoteContent] = useState('');
  const [editForm, setEditForm] = useState(null);
  const [followUpForm, setFollowUpForm] = useState({ date: '', time: '', type: 'Phone Call', notes: '' });
  const [lostForm, setLostForm] = useState({ reason: 'Budget', notes: '' });
  const [docForm, setDocForm] = useState({ name: '', type: 'Requirement Document' });

  const pipelineStages = ['New', 'Contacted', 'Qualified', 'Follow-up', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];
  const pipelineDisplay = ['New', 'Contacted', 'Qualified', 'Follow-up', 'Proposal Sent', 'Negotiation', 'Converted']; // Lost is separate

  useEffect(() => {
    loadLead();
  }, [id]);

  const loadLead = () => {
    const localLeads = JSON.parse(localStorage.getItem('rkr_leads') || '[]');
    const found = localLeads.find(l => l.id.toString() === id);
    if (found) {
      if (!found.activities) found.activities = [{ id: 1, type: 'Lead Created', desc: 'Lead entered into system', user: 'System', date: found.created_at || new Date().toISOString() }];
      if (!found.notes) found.notes = [];
      if (!found.followUpsList) found.followUpsList = [];
      if (!found.documents) found.documents = [];
      setLead(found);
      setEditForm(found);

      const allAssets = JSON.parse(localStorage.getItem('rkr_assets') || '[]');
      setLeadAssets(allAssets.filter(a => a.client === found.name || a.client === found.company));
      
      const allComms = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
      setCommunications(allComms.filter(c => c.entity_id === found.id.toString() || c.contact_name === found.name));
    }
  };

  const saveUpdatesToStorage = (updatedLeadData) => {
    const localLeads = JSON.parse(localStorage.getItem('rkr_leads') || '[]');
    const newLeads = localLeads.map(l => l.id === updatedLeadData.id ? updatedLeadData : l);
    localStorage.setItem('rkr_leads', JSON.stringify(newLeads));
    setLead(updatedLeadData);
  };

  const handleStageChange = (stage) => {
    if (lead.status === 'Converted' || lead.status === 'Lost') return;
    
    if (stage === 'Lost') {
      setShowLostModal(true);
      return;
    }

    const newAct = { id: Date.now(), type: 'Status Changed', desc: `Stage updated to ${stage}`, user: 'Admin', date: new Date().toISOString() };
    const updatedLead = { 
      ...lead, 
      status: stage, 
      updated_at: new Date().toISOString(),
      activities: [newAct, ...(lead.activities || [])]
    };
    saveUpdatesToStorage(updatedLead);
  };

  const handleMarkLost = (e) => {
    e.preventDefault();
    const newAct = { id: Date.now(), type: 'Lead Lost', desc: `Lead marked as lost. Reason: ${lostForm.reason}. ${lostForm.notes}`, user: 'Admin', date: new Date().toISOString() };
    const updatedLead = { 
      ...lead, 
      status: 'Lost', 
      lost_reason: lostForm.reason,
      lost_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activities: [newAct, ...(lead.activities || [])]
    };
    saveUpdatesToStorage(updatedLead);
    setShowLostModal(false);
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    const newAct = { id: Date.now(), type: activityForm.type, desc: activityForm.desc, user: 'Admin', date: new Date().toISOString() };
    const updatedLead = {
      ...lead,
      updated_at: new Date().toISOString(),
      activities: [newAct, ...(lead.activities || [])]
    };
    saveUpdatesToStorage(updatedLead);
    setShowActivityModal(false);
    setActivityForm({ type: 'Phone Call', desc: '' });
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    const newNote = { id: Date.now(), content: noteContent, user: 'Admin', date: new Date().toISOString() };
    const newAct = { id: Date.now() + 1, type: 'Note Added', desc: 'Internal note added to lead profile', user: 'Admin', date: new Date().toISOString() };
    const updatedLead = {
      ...lead,
      updated_at: new Date().toISOString(),
      notes: [newNote, ...(lead.notes || [])],
      activities: [newAct, ...(lead.activities || [])]
    };
    saveUpdatesToStorage(updatedLead);
    setShowNoteModal(false);
    setNoteContent('');
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!docForm.name.trim()) return;
    const newDoc = { id: Date.now(), name: docForm.name, type: docForm.type, user: 'Admin', date: new Date().toISOString(), url: '#' };
    const newAct = { id: Date.now() + 1, type: 'Document Uploaded', desc: `Uploaded ${docForm.type}: ${docForm.name}`, user: 'Admin', date: new Date().toISOString() };
    const updatedLead = {
      ...lead,
      updated_at: new Date().toISOString(),
      documents: [newDoc, ...(lead.documents || [])],
      activities: [newAct, ...(lead.activities || [])]
    };
    saveUpdatesToStorage(updatedLead);
    setShowDocModal(false);
    setDocForm({ name: '', type: 'Requirement Document' });
  };
  
  const handleDeleteDocument = (docId) => {
    if(!confirm("Delete this document?")) return;
    const newDocs = lead.documents.filter(d => d.id !== docId);
    saveUpdatesToStorage({ ...lead, documents: newDocs });
  };

  const handleAddFollowUp = (e) => {
    e.preventDefault();
    const newFollowUp = {
      id: Date.now(), date: followUpForm.date, time: followUpForm.time, type: followUpForm.type, notes: followUpForm.notes, assigned: 'Admin', status: 'Scheduled'
    };
    const newAct = { id: Date.now() + 1, type: 'Follow-up Scheduled', desc: `Scheduled a ${followUpForm.type} follow-up for ${followUpForm.date}`, user: 'Admin', date: new Date().toISOString() };
    const updatedLead = {
      ...lead,
      followUp: `${followUpForm.date}T${followUpForm.time}`, 
      updated_at: new Date().toISOString(),
      followUpsList: [newFollowUp, ...(lead.followUpsList || [])],
      activities: [newAct, ...(lead.activities || [])]
    };
    saveUpdatesToStorage(updatedLead);
    setShowFollowUpModal(false);
    setFollowUpForm({ date: '', time: '', type: 'Phone Call', notes: '' });
  };

  const updateFollowUpStatus = (fId, newStatus) => {
    const target = lead.followUpsList.find(f => f.id === fId);
    if (!target) return;
    const updatedFollowUps = lead.followUpsList.map(f => f.id === fId ? { ...f, status: newStatus } : f);
    const newAct = { id: Date.now(), type: 'Follow-up Updated', desc: `Follow-up from ${target.date} marked as ${newStatus}`, user: 'Admin', date: new Date().toISOString() };
    saveUpdatesToStorage({
       ...lead,
       followUpsList: updatedFollowUps,
       activities: [newAct, ...(lead.activities || [])]
    });
  };

  const confirmConversion = () => {
    try {
      const clientToAdd = { 
        id: Date.now(), name: lead.company || `${lead.name} Business`, contact: lead.name, email: lead.email || '', phone: lead.phone || '', status: 'Active', ltv: lead.budget || '$0', project: lead.service, source: 'Converted Lead', lead_id: lead.id
      };
      const existingClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      localStorage.setItem('rkr_clients', JSON.stringify([clientToAdd, ...existingClients]));
      const newAct = { id: Date.now() + 1, type: 'Lead Converted', desc: 'Lead successfully converted to Client.', user: 'Admin', date: new Date().toISOString() };
      const updatedLead = {
        ...lead, status: 'Converted', converted_at: new Date().toISOString(), client_id: clientToAdd.id, updated_at: new Date().toISOString(), activities: [newAct, ...(lead.activities || [])]
      };
      saveUpdatesToStorage(updatedLead);
      setShowConvertModal(false);
      navigate('/dashboard/clients');
    } catch(e) { console.error(e); }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const newAct = { id: Date.now(), type: 'Lead Updated', desc: 'Lead details were modified', user: 'Admin', date: new Date().toISOString() };
    const updatedLead = {
      ...lead, ...editForm, updated_at: new Date().toISOString(), activities: [newAct, ...(lead.activities || [])]
    };
    saveUpdatesToStorage(updatedLead);
    setShowEditModal(false);
  };

  if (!lead) return <div className="p-12 text-center text-gray-500 font-bold">Loading Lead Profile...</div>;

  const currentStageIndex = pipelineDisplay.indexOf(lead.status);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
            <Link to="/dashboard/leads" className="hover:text-primary transition-colors cursor-pointer">Leads</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900">{lead.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${lead.status==='Converted'?'bg-green-100 text-green-700':lead.status==='Lost'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>
              {lead.status}
            </span>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${lead.priority==='Urgent'?'border-red-200 text-red-700 bg-red-50':lead.priority==='High'?'border-orange-200 text-orange-700 bg-orange-50':'border-gray-200 text-gray-700 bg-gray-50'}`}>
              {lead.priority} Priority
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Building size={14} /> {lead.company || 'No Company'} <span className="text-gray-300">|</span> ID: {lead.id}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate(`/dashboard/communications/add?type=Lead&id=${lead.id}&name=${encodeURIComponent(lead.name)}`)} className="px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
            <MessageSquare size={16} /> Log Comm
          </button>
          <button onClick={() => setShowEditModal(true)} className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
            <Edit2 size={16} /> Edit
          </button>
          <button onClick={() => setShowContactModal(true)} className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
            <PhoneCall size={16} /> Contact
          </button>
          <button onClick={() => setShowFollowUpModal(true)} className="px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
            <Calendar size={16} /> Schedule Follow-up
          </button>
          {lead.status === 'Converted' ? (
            <Link to={`/dashboard/clients/${lead.client_id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
              View Client Profile
            </Link>
          ) : lead.status !== 'Lost' && (
            <button onClick={() => setShowConvertModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
              <UserPlus size={16} /> Convert to Client
            </button>
          )}
        </div>
      </div>

      {/* 3. SALES PIPELINE */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-x-auto flex flex-col gap-4">
        <div className="flex justify-between items-center min-w-[800px]">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sales Pipeline</h3>
          {lead.status !== 'Converted' && lead.status !== 'Lost' && (
            <button onClick={() => setShowLostModal(true)} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
              Mark as Lost
            </button>
          )}
        </div>
        <div className="flex items-center min-w-[800px] mt-2">
          {pipelineDisplay.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx || lead.status === 'Converted';
            const isCurrent = lead.status === stage;
            const isLost = lead.status === 'Lost';
            
            return (
              <React.Fragment key={stage}>
                <div onClick={() => handleStageChange(stage)} className={`flex flex-col items-center relative z-10 cursor-pointer group ${isLost ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                    isCompleted ? 'bg-primary border-primary text-white' : 
                    isCurrent ? 'bg-white border-primary text-primary ring-4 ring-blue-50' : 
                    'bg-white border-gray-300 text-gray-400 group-hover:border-blue-300'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span className={`mt-2 text-xs font-bold ${isCurrent ? 'text-primary' : 'text-gray-500'}`}>{stage}</span>
                </div>
                
                {idx < pipelineDisplay.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                    isCompleted ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. LEAD SUMMARY */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Contact</p>
              <div className="mt-1 space-y-1">
                <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"><Phone size={12}/> {lead.phone || 'N/A'}</a>
                <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 truncate cursor-pointer"><Mail size={12}/> {lead.email || 'N/A'}</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Source</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{lead.source || 'Website'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Service</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{lead.service}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Budget</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{lead.budget || 'Not specified'}</p>
            </div>
          </div>

          {/* 9. DETAILED LEAD INFO */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Detailed Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Location</span>
                <span className="text-sm font-semibold text-gray-900">{lead.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Assigned To</span>
                <span className="text-sm font-semibold text-gray-900">{lead.assignedTo || 'Admin'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Created Date</span>
                <span className="text-sm font-semibold text-gray-900">{lead.date}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Next Follow-up</span>
                <span className="text-sm font-semibold text-purple-600">{lead.followUp ? new Date(lead.followUp).toLocaleString() : 'Not Set'}</span>
              </div>
            </div>
          </div>

          {/* 7. FOLLOW-UP SECTION */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><Calendar size={18} className="text-purple-500"/> Follow-ups</h3>
              <button onClick={() => setShowFollowUpModal(true)} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors flex items-center gap-1 cursor-pointer shadow-sm">
                <Plus size={14} /> Schedule Follow-up
              </button>
            </div>
            
            <div className="space-y-4">
              {lead.followUpsList && lead.followUpsList.length > 0 ? lead.followUpsList.map(f => (
                <div key={f.id} className="p-4 border border-gray-100 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${f.status === 'Completed' ? 'bg-green-100 text-green-700' : f.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {f.status}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{f.type}</span>
                    </div>
                    <div className="text-sm text-gray-800">{f.notes}</div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12}/> {f.date} at {f.time}</span>
                      <span className="flex items-center gap-1"><User size={12}/> {f.assigned}</span>
                    </div>
                  </div>
                  {f.status === 'Scheduled' && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateFollowUpStatus(f.id, 'Completed')} className="px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1">
                        <Check size={14}/> Complete
                      </button>
                      <button onClick={() => updateFollowUpStatus(f.id, 'Cancelled')} className="px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1">
                        <XCircle size={14}/> Cancel
                      </button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">No follow-ups scheduled yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* 6. NOTES SECTION */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-blue-500"/> Internal Notes</h3>
              <button onClick={() => setShowNoteModal(true)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer shadow-sm">
                <Plus size={14} /> Add Note
              </button>
            </div>
            
            <div className="space-y-4">
              {lead.notes && lead.notes.length > 0 ? lead.notes.map(note => (
                <div key={note.id} className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><User size={12}/> {note.user}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {new Date(note.date).toLocaleString()}</span>
                  </div>
                </div>
              )) : (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500">No internal notes added yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* 12. LEAD ASSETS SECTION */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><FolderOpen size={18} className="text-orange-500"/> Lead Assets</h3>
              <a href="/dashboard/assets" className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors flex items-center gap-1 cursor-pointer shadow-sm">
                <Upload size={14} /> Upload Asset
              </a>
            </div>
            
            <div className="space-y-3">
              {leadAssets.length > 0 ? leadAssets.map(asset => (
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
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"><Download size={16}/></button>
                  </div>
                </div>
              )) : (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500">No assets uploaded for this lead.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* 13. COMMUNICATION HISTORY */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><MessageSquare size={18} className="text-purple-500"/> Communication History</h3>
              <button onClick={() => navigate(`/dashboard/communications/add?type=Lead&id=${lead.id}&name=${encodeURIComponent(lead.name)}`)} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors flex items-center gap-1 cursor-pointer shadow-sm">
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
          
          {/* 10. CONVERSION SECTION */}
          {lead.status === 'Converted' ? (
             <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
               <h3 className="text-base font-bold text-green-900 mb-2 flex items-center gap-2"><CheckCircle2 size={18}/> Converted to Client</h3>
               <p className="text-sm text-green-800 mb-4 font-medium">This lead was successfully converted.</p>
               <div className="bg-white p-3 rounded border border-green-100 text-xs text-green-700 font-medium flex justify-between">
                 <span>Client ID: {lead.client_id}</span>
                 <span>{new Date(lead.converted_at).toLocaleDateString()}</span>
               </div>
               <button onClick={() => navigate('/dashboard/clients')} className="mt-4 w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm cursor-pointer">
                 View Client Profile
               </button>
             </div>
          ) : lead.status === 'Lost' ? (
             <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm">
               <h3 className="text-base font-bold text-red-900 mb-2 flex items-center gap-2"><XCircle size={18}/> Lead Lost</h3>
               <p className="text-sm text-red-800 font-medium">This lead was marked as lost.</p>
               <div className="bg-white p-3 rounded border border-red-100 text-xs text-red-700 font-medium mt-3">
                 <p className="font-bold mb-1">Reason: {lead.lost_reason}</p>
                 <p>{new Date(lead.lost_at).toLocaleDateString()}</p>
               </div>
             </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">Ready to convert?</h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">Convert this lead into a client. All history, notes, and activity will be permanently preserved.</p>
              <button onClick={() => setShowConvertModal(true)} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm flex justify-center items-center gap-2 cursor-pointer">
                <UserPlus size={16} /> Convert to Client
              </button>
            </div>
          )}

          {/* 4. ACTIVITY TIMELINE */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><Activity size={18} className="text-purple-500"/> Activity Timeline</h3>
              <button onClick={() => setShowActivityModal(true)} className="px-2.5 py-1 text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shadow-sm">
                <Plus size={14} /> Log
              </button>
            </div>
            
            <div className="relative pl-5 border-l-2 border-gray-100 space-y-6 max-h-[800px] overflow-y-auto pr-2">
              {lead.activities && lead.activities.map(act => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{act.type}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{act.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        {new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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

      {/* MODALS */}
      {showLostModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><XCircle className="text-red-500" size={20}/> Mark Lead as Lost</h3>
              <button onClick={() => setShowLostModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMarkLost} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Please provide a reason for losing this lead. This helps with analytics.</p>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Reason</label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer" value={lostForm.reason} onChange={e => setLostForm({...lostForm, reason: e.target.value})}>
                  <option>Budget</option>
                  <option>No Response</option>
                  <option>Chose Competitor</option>
                  <option>Project Cancelled</option>
                  <option>Not Interested</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Additional Notes (Optional)</label>
                <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm min-h-[80px] resize-none" placeholder="Add any details..." value={lostForm.notes} onChange={e => setLostForm({...lostForm, notes: e.target.value})} />
              </div>
              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowLostModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 cursor-pointer shadow-sm">Confirm Lost</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Attach Document</h3>
              <button onClick={() => setShowDocModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Name</label>
                <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" placeholder="e.g. Initial Requirements" value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Type</label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer" value={docForm.type} onChange={e => setDocForm({...docForm, type: e.target.value})}>
                  <option>Requirement Document</option>
                  <option>Initial Proposal</option>
                  <option>Reference Images</option>
                  <option>Contract Draft</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
                <Upload size={24} className="mx-auto text-gray-400 mb-2"/>
                <p className="text-xs text-gray-500 font-medium">Mock Upload: File attachment will be simulated.</p>
              </div>
              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-800 cursor-pointer shadow-sm">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Edit Lead Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                  <input required className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company</label>
                  <input className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={editForm.company} onChange={e=>setEditForm({...editForm, company: e.target.value})} />
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Service</label>
                  <input className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={editForm.service} onChange={e=>setEditForm({...editForm, service: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Budget</label>
                  <input className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm" value={editForm.budget} onChange={e=>setEditForm({...editForm, budget: e.target.value})} />
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

      {/* Convert Confirm Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><UserPlus className="text-green-600" size={20}/> Confirm Conversion</h3>
              <button onClick={() => setShowConvertModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 text-sm leading-relaxed border border-green-100">
                You are about to convert <strong>{lead.name}</strong> into a Client. This will create a permanent client record and lock this lead profile.
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm border-b border-gray-100 pb-2"><span className="text-gray-500">Name</span> <strong className="text-gray-900">{lead.name}</strong></div>
                <div className="flex justify-between text-sm border-b border-gray-100 pb-2"><span className="text-gray-500">Company</span> <strong className="text-gray-900">{lead.company || 'N/A'}</strong></div>
                <div className="flex justify-between text-sm border-b border-gray-100 pb-2"><span className="text-gray-500">Service</span> <strong className="text-gray-900">{lead.service}</strong></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowConvertModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button onClick={confirmConversion} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 cursor-pointer shadow-sm">Confirm & Convert</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Options Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><PhoneCall className="text-blue-600" size={20}/> Contact Lead</h3>
              <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <a href={`tel:${lead.phone}`} onClick={() => setShowContactModal(false)} className="w-full py-3 px-4 bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 rounded-lg flex items-center gap-3 text-sm font-bold text-gray-700 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Phone size={14}/></div>
                Call Phone
              </a>
              <a href={`https://wa.me/${(lead.phone||'').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" onClick={() => setShowContactModal(false)} className="w-full py-3 px-4 bg-gray-50 border border-gray-200 hover:bg-green-50 hover:border-green-200 rounded-lg flex items-center gap-3 text-sm font-bold text-gray-700 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><MessageCircle size={14}/></div>
                WhatsApp
              </a>
              <a href={`mailto:${lead.email}`} onClick={() => setShowContactModal(false)} className="w-full py-3 px-4 bg-gray-50 border border-gray-200 hover:bg-purple-50 hover:border-purple-200 rounded-lg flex items-center gap-3 text-sm font-bold text-gray-700 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><Mail size={14}/></div>
                Send Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Schedule Follow-up</h3>
              <button onClick={() => setShowFollowUpModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFollowUp} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                  <input type="date" required className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer" value={followUpForm.date} onChange={e => setFollowUpForm({...followUpForm, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Time</label>
                  <input type="time" required className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer" value={followUpForm.time} onChange={e => setFollowUpForm({...followUpForm, time: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Follow-up Type</label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer" value={followUpForm.type} onChange={e => setFollowUpForm({...followUpForm, type: e.target.value})}>
                  <option>Phone Call</option>
                  <option>WhatsApp Message</option>
                  <option>Email</option>
                  <option>Meeting</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes / Agenda</label>
                <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm min-h-[80px] resize-none" placeholder="What is this follow-up regarding?" value={followUpForm.notes} onChange={e => setFollowUpForm({...followUpForm, notes: e.target.value})} />
              </div>
              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowFollowUpModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 cursor-pointer shadow-sm">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Add Internal Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="p-6">
              <textarea 
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm min-h-[120px] resize-none" 
                placeholder="Type your private internal note here..."
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowNoteModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-800 cursor-pointer shadow-sm">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity / Communication Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Log Manual Activity</h3>
              <button onClick={() => setShowActivityModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddActivity} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Activity Type</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:border-primary outline-none text-sm cursor-pointer"
                  value={activityForm.type}
                  onChange={e => setActivityForm({...activityForm, type: e.target.value})}
                >
                  <option>Phone Call</option>
                  <option>WhatsApp Message</option>
                  <option>Email Sent</option>
                  <option>Meeting Completed</option>
                  <option>Proposal Sent</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description / Summary</label>
                <textarea 
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary outline-none text-sm min-h-[100px] resize-none" 
                  placeholder="Summary of the call, meeting notes, or activity details..."
                  value={activityForm.desc}
                  onChange={e => setActivityForm({...activityForm, desc: e.target.value})}
                />
              </div>
              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowActivityModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-800 cursor-pointer shadow-sm">Log Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
