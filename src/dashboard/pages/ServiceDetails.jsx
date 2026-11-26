import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, Edit2, Archive, Briefcase, Users, FileText, CheckSquare, ListTodo, Activity, DollarSign, Clock, CheckCircle2, Layout, Smartphone, Database, Bot, Check, X, Plus, Trash2, Shield
} from 'lucide-react';

const ICONS = {
  Layout: <Layout size={28} className="text-blue-600" />,
  Smartphone: <Smartphone size={28} className="text-blue-600" />,
  Bot: <Bot size={28} className="text-blue-600" />,
  Database: <Database size={28} className="text-blue-600" />
};

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);

  // Modals for editing features/deliverables
  const [newFeature, setNewFeature] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');

  // Modals for editing service base info
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const ALL_CATEGORIES = [
    'AI Solutions', 'Web Development', 'CRM & ERP Solutions', 
    'Dashboards & Business Intelligence', 'Automation Solutions', 
    'Data Analytics', 'E-Commerce Solutions', 'Other'
  ];
  const PRICING_TYPES = ['Fixed', 'Hourly', 'Monthly', 'Custom', 'Contact for Pricing'];
  const DURATIONS = ['1 week', '2 weeks', '1 month', '3 months', 'Ongoing', 'Custom'];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    const services = JSON.parse(localStorage.getItem('rkr_services') || '[]');
    const found = services.find(s => s.id.toString() === id);
    if (found) {
      if (!found.features) found.features = [];
      if (!found.deliverables) found.deliverables = [];
      if (!found.activities) found.activities = [];
      setService(found);
    }
    setProjectsList(JSON.parse(localStorage.getItem('rkr_projects') || '[]'));
    setClientsList(JSON.parse(localStorage.getItem('rkr_clients') || '[]'));
  };

  const openEditModal = () => {
    setEditForm({ ...service, base_price: service.base_price || '' });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    saveUpdates({ 
      ...service, 
      ...editForm, 
      updated_at: new Date().toISOString(),
      activities: [{ id: Date.now(), type: 'Service Updated', desc: 'Service details and pricing updated', user: 'Admin', date: new Date().toISOString() }, ...service.activities]
    });
    setShowEditModal(false);
  };

  const saveUpdates = (updatedService) => {
    const services = JSON.parse(localStorage.getItem('rkr_services') || '[]');
    const newServices = services.map(s => s.id === updatedService.id ? updatedService : s);
    localStorage.setItem('rkr_services', JSON.stringify(newServices));
    setService(updatedService);
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    if(!newFeature.trim()) return;
    const featObj = { id: Date.now(), text: newFeature };
    const newAct = { id: Date.now()+1, type: 'Feature Added', desc: `Added feature: ${newFeature}`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({
      ...service,
      features: [...service.features, featObj],
      updated_at: new Date().toISOString(),
      activities: [newAct, ...service.activities]
    });
    setNewFeature('');
  };

  const handleDeleteFeature = (featId) => {
    saveUpdates({ ...service, features: service.features.filter(f => f.id !== featId), updated_at: new Date().toISOString() });
  };

  const handleAddDeliverable = (e) => {
    e.preventDefault();
    if(!newDeliverable.trim()) return;
    const delObj = { id: Date.now(), text: newDeliverable };
    const newAct = { id: Date.now()+1, type: 'Deliverable Added', desc: `Added deliverable: ${newDeliverable}`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({
      ...service,
      deliverables: [...service.deliverables, delObj],
      updated_at: new Date().toISOString(),
      activities: [newAct, ...service.activities]
    });
    setNewDeliverable('');
  };

  const handleDeleteDeliverable = (delId) => {
    saveUpdates({ ...service, deliverables: service.deliverables.filter(d => d.id !== delId), updated_at: new Date().toISOString() });
  };

  const handleStatusChange = (newStatus) => {
    const newAct = { id: Date.now(), type: 'Status Changed', desc: `Status changed to ${newStatus}`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({ ...service, status: newStatus, updated_at: new Date().toISOString(), activities: [newAct, ...service.activities] });
  };

  if (!service) return <div className="p-12 text-center font-bold text-gray-500">Loading Service...</div>;

  // Derivations
  const serviceProjects = projectsList.filter(p => p.service === service.name);
  const activeProjectsCount = serviceProjects.filter(p => !['Completed', 'Cancelled'].includes(p.status)).length;
  
  // Clients mapped through projects
  const clientIds = [...new Set(serviceProjects.map(p => p.client_id))];
  const serviceClients = clientsList.filter(c => clientIds.includes(c.id) || clientIds.includes(c.id.toString()));

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 pb-20">
      
      {/* HEADER BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
        <Link to="/dashboard/services" className="hover:text-blue-600 transition-colors">Services</Link>
        <ChevronRight size={12} />
        <span className="text-gray-600 truncate max-w-[200px]">{service.name}</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4 w-full">
          <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
            {ICONS[service.icon] || ICONS['Layout']}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{service.name}</h1>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${service.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : service.status === 'Inactive' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {service.status}
              </span>
              <span className="text-xs text-gray-400 font-medium">{service.service_id}</span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-3">{service.short_description}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-gray-600">
              <span className="flex items-center gap-1.5"><Shield size={16} className="text-gray-400"/> {service.category}</span>
              <span className="flex items-center gap-1.5"><DollarSign size={16} className="text-gray-400"/> {service.pricing_type} {service.base_price && <span className="font-bold text-gray-900 border-l pl-1.5 ml-1.5 border-gray-300">{service.base_price}</span>}</span>
              <span className="flex items-center gap-1.5"><Clock size={16} className="text-gray-400"/> {service.estimated_duration}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button onClick={openEditModal} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
            <Edit2 size={16} /> Edit Settings
          </button>
          {service.status !== 'Archived' && (
            <button onClick={() => navigate('/dashboard/projects')} className="flex-1 xl:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
              <Plus size={16} /> Create Project
            </button>
          )}
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold outline-none cursor-pointer hover:bg-gray-50" value={service.status} onChange={e => handleStatusChange(e.target.value)}>
              <option value="Active">Mark Active</option>
              <option value="Inactive">Mark Inactive</option>
              <option value="Archived">Archive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - CONTENT */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* FEATURES SECTION */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2"><CheckSquare size={18} className="text-blue-500"/> Service Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {service.features.map(feat => (
                <div key={feat.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 group transition-all hover:border-blue-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                    <span className="text-sm font-bold text-gray-700">{feat.text}</span>
                  </div>
                  <button onClick={() => handleDeleteFeature(feat.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
              {service.features.length === 0 && (
                <div className="col-span-full p-4 border border-dashed border-gray-200 rounded-xl text-center text-sm font-medium text-gray-400">
                  No service features added yet.
                </div>
              )}
            </div>

            <form onSubmit={handleAddFeature} className="flex gap-2">
              <input type="text" className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-colors" placeholder="e.g. Responsive Design" value={newFeature} onChange={e => setNewFeature(e.target.value)} />
              <button type="submit" disabled={!newFeature.trim()} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"><Plus size={16}/> Add Feature</button>
            </form>
          </div>

          {/* DELIVERABLES SECTION */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2"><ListTodo size={18} className="text-purple-500"/> Core Deliverables</h3>
            
            <div className="space-y-3 mb-6">
              {service.deliverables.map(del => (
                <div key={del.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 group transition-all hover:border-purple-200">
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="text-purple-500 mt-0.5" />
                    <span className="text-sm font-bold text-gray-700">{del.text}</span>
                  </div>
                  <button onClick={() => handleDeleteDeliverable(del.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
              {service.deliverables.length === 0 && (
                <div className="col-span-full p-4 border border-dashed border-gray-200 rounded-xl text-center text-sm font-medium text-gray-400">
                  No deliverables defined yet.
                </div>
              )}
            </div>

            <form onSubmit={handleAddDeliverable} className="flex gap-2">
              <input type="text" className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none transition-colors" placeholder="e.g. Source Code Repository" value={newDeliverable} onChange={e => setNewDeliverable(e.target.value)} />
              <button type="submit" disabled={!newDeliverable.trim()} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"><Plus size={16}/> Add Deliverable</button>
            </form>
          </div>
          
          {/* RELATED PROJECTS */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><Briefcase size={18} className="text-indigo-500"/> Associated Projects</h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{serviceProjects.length} Total</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-bold text-gray-500 uppercase">Project</th>
                    <th className="pb-3 text-xs font-bold text-gray-500 uppercase">Client</th>
                    <th className="pb-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="pb-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {serviceProjects.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="py-3 text-sm font-bold text-gray-900">{p.name}</td>
                      <td className="py-3 text-sm font-medium text-gray-600">{p.client_name}</td>
                      <td className="py-3"><span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">{p.status}</span></td>
                      <td className="py-3 text-right">
                        <button onClick={() => navigate(`/dashboard/projects/${p.id}`)} className="text-blue-600 hover:text-blue-800 text-sm font-bold cursor-pointer">View</button>
                      </td>
                    </tr>
                  ))}
                  {serviceProjects.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-sm font-medium text-gray-400">No projects are currently associated with this service.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
        
        {/* RIGHT COLUMN - ANALYTICS & USAGE */}
        <div className="space-y-6">
          
          {/* ANALYTICS */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4"><Activity size={16} className="text-blue-500"/> Service Usage Analytics</h3>
             <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center flex flex-col items-center justify-center">
                 <Briefcase size={20} className="text-blue-500 mb-2"/>
                 <h4 className="text-2xl font-black text-gray-900">{activeProjectsCount}</h4>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Active Projects</p>
               </div>
               <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center flex flex-col items-center justify-center">
                 <Users size={20} className="text-green-500 mb-2"/>
                 <h4 className="text-2xl font-black text-gray-900">{serviceClients.length}</h4>
                 <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Total Clients</p>
               </div>
             </div>
          </div>

          {/* SERVICE CLIENTS */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4"><Users size={16} className="text-green-500"/> Client History</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
              {serviceClients.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:border-gray-200 cursor-pointer" onClick={() => navigate(`/dashboard/clients/${c.id}`)}>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{c.company || c.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{c.email}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400"/>
                </div>
              ))}
              {serviceClients.length === 0 && (
                <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-sm font-medium text-gray-400">
                  No clients have used this service yet.
                </div>
              )}
            </div>
          </div>

          {/* ACTIVITY LOG */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-6"><Clock size={16} className="text-orange-500"/> Timeline History</h3>
            <div className="relative pl-5 border-l-2 border-gray-100 space-y-6 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
              {service.activities.map(act => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-white"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{act.type}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{act.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                        {new Date(act.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <h3 className="font-black text-gray-900 text-lg">Edit Service Configuration</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Service Name *</label>
                  <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Category *</label>
                  <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                    {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Pricing Type *</label>
                  <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer" value={editForm.pricing_type} onChange={e => setEditForm({...editForm, pricing_type: e.target.value})}>
                    {PRICING_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Base Price (Optional)</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all" value={editForm.base_price || ''} onChange={e => setEditForm({...editForm, base_price: e.target.value})} placeholder="e.g. $1,500 or $50/hr" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Estimated Duration *</label>
                  <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer" value={editForm.estimated_duration} onChange={e => setEditForm({...editForm, estimated_duration: e.target.value})}>
                    {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Short Description</label>
                  <textarea className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all min-h-[80px]" value={editForm.short_description} onChange={e => setEditForm({...editForm, short_description: e.target.value})}></textarea>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold text-sm cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm shadow-sm cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
