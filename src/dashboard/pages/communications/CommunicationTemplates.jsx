import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { logAuditAction } from '../../services/auditLogger';

export default function CommunicationTemplates() {
  const [templates, setTemplates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    template_id: '',
    name: '',
    channel: 'WhatsApp',
    communication_type: 'Initial Contact',
    subject: '',
    message: '',
    status: 'Active'
  });

  const [channels, setChannels] = useState(['WhatsApp', 'Email', 'Phone Call', 'Meeting']);
  const [types, setTypes] = useState(['Initial Contact', 'Follow-up', 'Quotation Discussion', 'Payment Reminder']);

  useEffect(() => {
    const raw = localStorage.getItem('rkr_communication_templates');
    if (raw) {
      try { setTemplates(JSON.parse(raw)); } catch (e) { console.error(e); }
    }
    
    const storedChannels = localStorage.getItem('rkr_list_communicationChannels');
    if (storedChannels) setChannels(JSON.parse(storedChannels));
    const storedTypes = localStorage.getItem('rkr_list_communicationTypes');
    if (storedTypes) setTypes(JSON.parse(storedTypes));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    let updatedData = { ...formData };
    let newAll;
    
    if (formData.template_id) {
      updatedData.updated_at = new Date().toISOString();
      newAll = templates.map(t => t.template_id === formData.template_id ? updatedData : t);
      logAuditAction('Communications', formData.template_id, 'Update', 'Communication template updated');
    } else {
      updatedData.template_id = `TMP-${Math.floor(1000 + Math.random() * 9000)}`;
      updatedData.created_at = new Date().toISOString();
      newAll = [updatedData, ...templates];
      logAuditAction('Communications', updatedData.template_id, 'Create', 'Communication template created');
    }

    setTemplates(newAll);
    localStorage.setItem('rkr_communication_templates', JSON.stringify(newAll));
    setIsEditing(false);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updated = templates.filter(t => t.template_id !== id);
      setTemplates(updated);
      localStorage.setItem('rkr_communication_templates', JSON.stringify(updated));
      logAuditAction('Communications', id, 'Delete', 'Communication template deleted');
    }
  };

  const openEdit = (t = null) => {
    if (t) {
      setFormData(t);
    } else {
      setFormData({
        template_id: '',
        name: '',
        channel: 'WhatsApp',
        communication_type: 'Initial Contact',
        subject: '',
        message: '',
        status: 'Active'
      });
    }
    setIsEditing(true);
  };

  const insertVariable = (variable) => {
    setFormData({ ...formData, message: formData.message + variable });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {!isEditing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><LayoutTemplate size={18} className="text-blue-600"/> Saved Templates</h3>
            <button className="btn btn-primary bg-blue-600 hover:bg-blue-700 py-1.5 px-3 text-xs" onClick={() => openEdit()}>
              <Plus size={14} /> New Template
            </button>
          </div>
          
          <div className="p-0">
            {templates.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Template Name</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Channel / Type</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t.template_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">{t.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{t.channel} <span className="mx-1">•</span> {t.communication_type}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          t.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button className="icon-btn" title="Edit" onClick={() => openEdit(t)}><Edit size={16} /></button>
                          <button className="icon-btn text-red-500 hover:bg-red-50" title="Delete" onClick={() => handleDelete(t.template_id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No templates saved yet. Create templates to speed up communications.
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-900">{formData.template_id ? 'Edit Template' : 'New Template'}</h3>
            <button type="button" className="icon-btn" onClick={() => setIsEditing(false)}><X size={18} /></button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Template Name</label>
              <input type="text" className="w-full input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Initial Welcome Email" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Status</label>
              <select className="w-full input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Channel</label>
              <select className="w-full input" value={formData.channel} onChange={e => setFormData({...formData, channel: e.target.value})}>
                {channels.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Communication Type</label>
              <select className="w-full input" value={formData.communication_type} onChange={e => setFormData({...formData, communication_type: e.target.value})}>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Subject (For Emails)</label>
              <input type="text" className="w-full input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="Enter subject line..." />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <div className="flex justify-between items-end mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase">Message Content</label>
                <div className="flex flex-wrap gap-1">
                  {['{{client_name}}', '{{project_name}}', '{{quotation_number}}', '{{amount}}'].map(v => (
                    <button key={v} type="button" onClick={() => insertVariable(v)} className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-[10px] font-mono transition-colors">
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <textarea rows="8" className="w-full input resize-none font-mono text-sm leading-relaxed" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Write your template message here..."></textarea>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary bg-blue-600 hover:bg-blue-700">
              <Save size={18} /> Save Template
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
