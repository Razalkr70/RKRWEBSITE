import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, Building, Calendar, CheckCircle2, AlertCircle, 
  ChevronRight, Plus, X, Edit2, FileText, CheckSquare, 
  MessageSquare, DollarSign, Activity, Upload, Download,
  MapPin, Phone, Mail, Link as LinkIcon, Users, FolderOpen
} from 'lucide-react';

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
  'Planning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Review': 'bg-purple-100 text-purple-800 border-purple-200',
  'Client Review': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Revision': 'bg-orange-100 text-orange-800 border-orange-200',
  'On Hold': 'bg-red-50 text-red-700 border-red-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Cancelled': 'bg-gray-200 text-gray-500 border-gray-300',
};

const ALL_STATUSES = ['Draft', 'Planning', 'In Progress', 'Review', 'Client Review', 'Revision', 'On Hold', 'Completed', 'Cancelled'];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const [projectAssets, setProjectAssets] = useState([]);
  const [communications, setCommunications] = useState([]);
  
  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  // Forms
  const [statusVal, setStatusVal] = useState('');
  const [progressVal, setProgressVal] = useState('');
  const [taskForm, setTaskForm] = useState({ name: '', assignee: 'Admin', priority: 'Medium', due_date: '' });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    const projects = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
    const found = projects.find(p => p.id.toString() === id);
    if (found) {
      if (!found.tasks) found.tasks = [];
      if (!found.activities) found.activities = [];
      if (!found.documents) found.documents = [];
      setProject(found);
      setStatusVal(found.status);
      setProgressVal(found.progress);
      
      const clients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      const c = clients.find(cl => cl.id.toString() === found.client_id.toString());
      setClientInfo(c || null);

      const allAssets = JSON.parse(localStorage.getItem('rkr_assets') || '[]');
      setProjectAssets(allAssets.filter(a => a.project === found.name));

      const allComms = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
      setCommunications(allComms.filter(c => c.entity_id === found.id.toString()));
    }
  };

  const saveUpdates = (updatedProj) => {
    const projects = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
    const newProjects = projects.map(p => p.id === updatedProj.id ? updatedProj : p);
    localStorage.setItem('rkr_projects', JSON.stringify(newProjects));
    setProject(updatedProj);
    
    // Attempt to sync client projects array if status changed
    if (clientInfo) {
      const clients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      const newClients = clients.map(c => {
        if (c.id === clientInfo.id) {
          const cProjs = c.projects || [];
          const updatedCProjs = cProjs.map(cp => cp.id === updatedProj.id ? { ...cp, status: updatedProj.status } : cp);
          return { ...c, projects: updatedCProjs };
        }
        return c;
      });
      localStorage.setItem('rkr_clients', JSON.stringify(newClients));
    }
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (statusVal === project.status) {
      setShowStatusModal(false);
      return;
    }
    const newAct = { id: Date.now(), type: 'Status Changed', desc: `Project status updated to ${statusVal}`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({
      ...project, 
      status: statusVal, 
      updated_at: new Date().toISOString(),
      activities: [newAct, ...project.activities]
    });
    setShowStatusModal(false);
  };

  const handleUpdateProgress = (e) => {
    e.preventDefault();
    const newAct = { id: Date.now(), type: 'Progress Updated', desc: `Project progress updated to ${progressVal}%`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({
      ...project, 
      progress: parseInt(progressVal), 
      updated_at: new Date().toISOString(),
      activities: [newAct, ...project.activities]
    });
    setShowProgressModal(false);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if(!taskForm.name.trim()) return;
    const newTask = {
      id: Date.now(),
      name: taskForm.name,
      assignee: taskForm.assignee,
      priority: taskForm.priority,
      due_date: taskForm.due_date,
      status: 'Pending'
    };
    const newAct = { id: Date.now()+1, type: 'Task Added', desc: `Task created: ${newTask.name}`, user: 'Admin', date: new Date().toISOString() };
    saveUpdates({
      ...project,
      tasks: [newTask, ...project.tasks],
      updated_at: new Date().toISOString(),
      activities: [newAct, ...project.activities]
    });
    setShowTaskModal(false);
    setTaskForm({ name: '', assignee: 'Admin', priority: 'Medium', due_date: '' });
  };

  const handleToggleTask = (taskId) => {
    const updatedTasks = project.tasks.map(t => {
      if (t.id === taskId) {
        const newStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...t, status: newStatus };
      }
      return t;
    });
    saveUpdates({ ...project, tasks: updatedTasks });
  };

  if (!project) return <div className="p-12 text-center font-bold text-gray-500">Loading Project...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-20">
      
      {/* HEADER BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
        <Link to="/dashboard/projects" className="hover:text-blue-600 transition-colors">Projects</Link>
        <ChevronRight size={12} />
        <span className="text-gray-600 truncate max-w-[200px]">{project.name}</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm mt-1">
            <Briefcase size={28} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{project.name}</h1>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                {project.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm font-medium text-gray-600">
              <span className="flex items-center gap-1.5"><Building size={16} className="text-gray-400"/> {project.client_name}</span>
              <span className="flex items-center gap-1.5"><FileText size={16} className="text-gray-400"/> {project.service}</span>
              <span className="flex items-center gap-1.5"><AlertCircle size={16} className="text-gray-400"/> {project.priority} Priority</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button onClick={() => navigate(`/dashboard/communications/add?type=Project&id=${project.id}&name=${encodeURIComponent(project.name)}`)} className="flex-1 xl:flex-none px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
            <MessageSquare size={16} /> Log Comm
          </button>
          <button onClick={() => setShowTaskModal(true)} className="flex-1 xl:flex-none px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
            <CheckSquare size={16} /> Add Task
          </button>
          <button onClick={() => setShowStatusModal(true)} className="flex-1 xl:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
            <Edit2 size={16} /> Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - MAIN CONTENT */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* SUMMARY KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setShowProgressModal(true)}>
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Progress</p>
              <h3 className="text-2xl font-black text-gray-900">{project.progress}%</h3>
              <p className="text-[10px] text-blue-600 font-bold mt-2 group-hover:underline">Update</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Budget</p>
              <h3 className="text-2xl font-black text-gray-900">${Number(project.contract_value).toLocaleString()}</h3>
              <p className="text-[10px] text-gray-500 font-bold mt-2">Contract Value</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
              <h3 className="text-lg font-black text-gray-900 mt-2">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
              <h3 className={`text-lg font-black mt-2 ${project.deadline && new Date(project.deadline) < new Date() && project.status !== 'Completed' ? 'text-red-600' : 'text-gray-900'}`}>
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
              </h3>
            </div>
          </div>

          {/* PROJECT DESCRIPTION */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18} className="text-blue-500"/> Project Overview</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{project.description || 'No description provided.'}</p>
          </div>

          {/* TASKS */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><CheckSquare size={18} className="text-indigo-500"/> Tasks</h3>
              <button onClick={() => setShowTaskModal(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                + New Task
              </button>
            </div>
            <div className="space-y-2">
              {project.tasks.length > 0 ? project.tasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 transition-colors">
                  <div className="cursor-pointer" onClick={() => handleToggleTask(task.id)}>
                    {task.status === 'Completed' ? 
                      <CheckCircle2 size={20} className="text-green-500" /> : 
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    }
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{task.assignee}</span>
                      <span className="text-[10px] font-bold text-gray-400">• {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Due Date'}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${task.priority === 'High' ? 'bg-red-50 text-red-600' : task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium">No tasks created yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* PROJECT ASSETS */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><FolderOpen size={18} className="text-orange-500"/> Project Assets</h3>
              <a href="/dashboard/assets" className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors flex items-center gap-1 cursor-pointer shadow-sm">
                <Plus size={14} /> Upload Asset
              </a>
            </div>
            
            <div className="space-y-3">
              {projectAssets.length > 0 ? projectAssets.map(asset => (
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
                  No assets uploaded for this project. Go to Client Assets to upload.
                </div>
              )}
            </div>
          </div>
          
          {/* COMMUNICATION HISTORY */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><MessageSquare size={18} className="text-blue-500"/> Communication History</h3>
              <button onClick={() => navigate(`/dashboard/communications/add?type=Project&id=${project.id}&name=${encodeURIComponent(project.name)}`)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer shadow-sm">
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
        
        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* CLIENT INFO */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><Building size={18} className="text-blue-500"/> Client Details</h3>
              <Link to={`/dashboard/clients/${project.client_id}`} className="text-xs font-bold text-blue-600 hover:underline">View Profile</Link>
            </div>
            
            {clientInfo ? (
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-900">{clientInfo.company || clientInfo.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400"/> {clientInfo.email || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400"/> {clientInfo.phone || 'N/A'}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Client information not available.</p>
            )}
          </div>

          {/* TEAM */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2"><Users size={18} className="text-purple-500"/> Team</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                {project.project_manager ? project.project_manager.charAt(0) : 'A'}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{project.project_manager || 'Admin'}</p>
                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Project Manager</p>
              </div>
            </div>
          </div>

          {/* ACTIVITY LOG */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6"><Activity size={18} className="text-green-500"/> Activity Log</h3>
            <div className="relative pl-5 border-l-2 border-gray-100 space-y-6 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
              {project.activities.map(act => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{act.type}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{act.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
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

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Update Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6">
              <label className="block text-xs font-bold text-gray-700 mb-2">Project Status</label>
              <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none cursor-pointer text-sm" value={statusVal} onChange={e => setStatusVal(e.target.value)}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowStatusModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE PROGRESS MODAL */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Update Progress</h3>
              <button onClick={() => setShowProgressModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateProgress} className="p-6">
              <label className="block text-xs font-bold text-gray-700 mb-2">Progress Percentage (0-100)</label>
              <input type="number" min="0" max="100" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none text-sm" value={progressVal} onChange={e => setProgressVal(e.target.value)} />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowProgressModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 cursor-pointer">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><CheckSquare size={20} className="text-indigo-600"/> Add Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1 rounded-full shadow-sm border border-gray-200 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Task Name</label>
                <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none text-sm" value={taskForm.name} onChange={e => setTaskForm({...taskForm, name: e.target.value})} placeholder="e.g. Design Wireframes" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Priority</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none cursor-pointer text-sm" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Due Date</label>
                  <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none cursor-pointer text-sm" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 cursor-pointer shadow-sm">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
