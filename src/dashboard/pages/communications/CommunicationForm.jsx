import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, X, Paperclip, MessageSquare } from 'lucide-react';
import { logAuditAction } from '../../services/auditLogger';

export default function CommunicationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    entity_type: searchParams.get('type') || 'Lead',
    entity_id: searchParams.get('id') || '',
    contact_name: searchParams.get('name') || '',
    channel: 'WhatsApp',
    communication_type: 'General',
    direction: 'Outgoing',
    status: 'Completed',
    communication_date: new Date().toISOString().slice(0, 10),
    communication_time: new Date().toTimeString().slice(0, 5),
    subject: '',
    summary: '',
    notes: '',
    follow_up_required: false,
    follow_up_date: '',
    follow_up_time: '',
    follow_up_priority: 'Medium',
    follow_up_note: ''
  });

  const [channels, setChannels] = useState(['WhatsApp', 'Email', 'Phone Call', 'Meeting', 'Instagram', 'Facebook', 'Manual']);
  const [types, setTypes] = useState(['Initial Contact', 'Follow-up', 'Requirement Discussion', 'Quotation Discussion', 'Project Discussion', 'Payment Discussion', 'Support', 'General']);
  const [entities, setEntities] = useState([]); // List of possible clients/leads based on entity_type

  useEffect(() => {
    // Load config from settings
    const storedChannels = localStorage.getItem('rkr_list_communicationChannels');
    if (storedChannels) setChannels(JSON.parse(storedChannels));
    const storedTypes = localStorage.getItem('rkr_list_communicationTypes');
    if (storedTypes) setTypes(JSON.parse(storedTypes));

    if (isEdit) {
      const all = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
      const found = all.find(c => c.communication_id === id);
      if (found) setFormData(found);
    }
  }, [id, isEdit]);

  useEffect(() => {
    // Load possible entities
    let key = 'rkr_leads';
    if (formData.entity_type === 'Client') key = 'rkr_clients';
    if (formData.entity_type === 'Project') key = 'rkr_projects';
    if (formData.entity_type === 'Quotation') key = 'rkr_quotations';
    if (formData.entity_type === 'Invoice') key = 'rkr_invoices';

    try {
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      setEntities(items);
    } catch (e) {
      setEntities([]);
    }
  }, [formData.entity_type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Auto-fill contact_name if an ID is selected but name is empty
    let updatedData = { ...formData };
    if (updatedData.entity_id && !updatedData.contact_name) {
      const selected = entities.find(ent => ent.id === updatedData.entity_id);
      if (selected) {
        updatedData.contact_name = selected.name || selected.client_name || selected.company || selected.id;
      }
    }

    const all = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
    let newAll;
    
    if (isEdit) {
      updatedData.updated_at = new Date().toISOString();
      newAll = all.map(c => c.communication_id === id ? updatedData : c);
      logAuditAction('Communications', id, 'Update', 'Communication record updated');
    } else {
      updatedData.communication_id = `COM-${Math.floor(1000 + Math.random() * 9000)}`;
      updatedData.created_at = new Date().toISOString();
      newAll = [updatedData, ...all];
      logAuditAction('Communications', updatedData.communication_id, 'Create', `Communication record created for ${updatedData.contact_name}`);
    }

    localStorage.setItem('rkr_communications', JSON.stringify(newAll));
    navigate('/dashboard/communications');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="text-blue-600" /> 
          {isEdit ? 'Edit Communication' : 'Log Communication'}
        </h2>
        <button className="icon-btn" onClick={() => navigate(-1)}><X size={20} /></button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* RELATIONSHIP */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Related Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Relationship Type</label>
              <select className="w-full input bg-white" value={formData.entity_type} onChange={e => setFormData({...formData, entity_type: e.target.value, entity_id: '', contact_name: ''})}>
                <option value="Lead">Lead</option>
                <option value="Client">Client</option>
                <option value="Project">Project</option>
                <option value="Quotation">Quotation</option>
                <option value="Invoice">Invoice</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Select Record</label>
              <select className="w-full input bg-white" value={formData.entity_id} onChange={e => setFormData({...formData, entity_id: e.target.value})} required>
                <option value="">Select {formData.entity_type}...</option>
                {entities.map(ent => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name || ent.client_name || ent.company || ent.project_id || ent.invoice_id || ent.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* COMMUNICATION DETAILS */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Channel</label>
              <select className="w-full input" value={formData.channel} onChange={e => setFormData({...formData, channel: e.target.value})}>
                {channels.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Type</label>
              <select className="w-full input" value={formData.communication_type} onChange={e => setFormData({...formData, communication_type: e.target.value})}>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Direction</label>
              <select className="w-full input" value={formData.direction} onChange={e => setFormData({...formData, direction: e.target.value})}>
                <option value="Outgoing">Outgoing</option>
                <option value="Incoming">Incoming</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Date</label>
              <input type="date" className="w-full input" value={formData.communication_date} onChange={e => setFormData({...formData, communication_date: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Time</label>
              <input type="time" className="w-full input" value={formData.communication_time} onChange={e => setFormData({...formData, communication_time: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Status</label>
              <select className="w-full input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Subject / Summary</label>
              <input type="text" className="w-full input" placeholder="e.g., Follow up regarding Phase 2" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
            </div>
            
            <div className="col-span-1 md:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Detailed Notes</label>
              <textarea rows="4" className="w-full input resize-none" placeholder="Enter full message or meeting notes..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
            </div>
          </div>
        </div>

        {/* FOLLOW-UP */}
        <div className="p-6 bg-orange-50/30 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Follow-up Required?</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={formData.follow_up_required} onChange={e => setFormData({...formData, follow_up_required: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {formData.follow_up_required && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Follow-up Date</label>
                <input type="date" className="w-full input bg-white" value={formData.follow_up_date} onChange={e => setFormData({...formData, follow_up_date: e.target.value})} required={formData.follow_up_required} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Follow-up Time</label>
                <input type="time" className="w-full input bg-white" value={formData.follow_up_time} onChange={e => setFormData({...formData, follow_up_time: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Priority</label>
                <select className="w-full input bg-white" value={formData.follow_up_priority} onChange={e => setFormData({...formData, follow_up_priority: e.target.value})}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="col-span-1 md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Follow-up Note</label>
                <input type="text" className="w-full input bg-white" placeholder="What needs to be done?" value={formData.follow_up_note} onChange={e => setFormData({...formData, follow_up_note: e.target.value})} />
              </div>
            </div>
          )}
        </div>

        {/* ATTACHMENTS */}
        <div className="p-6 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Paperclip size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Attachments</p>
              <p className="text-xs text-gray-500">Upload related files to Client Assets</p>
            </div>
          </div>
          <button type="button" className="btn btn-outline text-xs px-3 py-1" onClick={() => alert("Upload logic links with Client Assets module.")}>
            Browse Files
          </button>
        </div>

        {/* ACTIONS */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary bg-blue-600 hover:bg-blue-700">
            <Save size={18} /> {isEdit ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
