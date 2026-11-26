import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Trash2, CheckCircle2, Clock, AlertCircle, X, ChevronRight, Briefcase, Calendar, CheckSquare, AlignLeft, Columns, ChevronLeft, Building, FileText, Check, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ALL_STATUSES = ['To Do', 'In Progress', 'Review', 'Completed', 'Blocked', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const statusColors = {
  'To Do': 'bg-gray-100 text-gray-700 border-gray-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Review': 'bg-purple-100 text-purple-800 border-purple-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Blocked': 'bg-red-100 text-red-800 border-red-200',
  'Cancelled': 'bg-gray-200 text-gray-500 border-gray-300',
};

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-700',
  'Medium': 'bg-blue-50 text-blue-700',
  'High': 'bg-orange-50 text-orange-700',
  'Urgent': 'bg-red-50 text-red-700',
};

export default function Tasks() {
  const navigate = useNavigate();
  const [tasksList, setTasksList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  
  // View mode
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    project_id: 'All'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  // New Task Form
  const [form, setForm] = useState({
    title: '',
    project_id: '',
    client_id: '',
    description: '',
    priority: 'Medium',
    status: 'To Do',
    due_date: '',
    assignee: 'Admin'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const t = JSON.parse(localStorage.getItem('rkr_tasks') || '[]');
    setTasksList(t.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    const p = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
    setProjectsList(p);
    const c = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
    setClientsList(c);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!form.title || !form.project_id) {
      alert("Task Title and Project are required.");
      return;
    }
    
    const proj = projectsList.find(p => p.id.toString() === form.project_id);
    const client = clientsList.find(c => c.id.toString() === proj?.client_id.toString());
    
    const newTask = {
      id: Date.now(),
      task_id: `RKR-TSK-${Date.now().toString().slice(-4)}`,
      ...form,
      client_id: proj?.client_id || '',
      project_name: proj ? proj.name : 'Unknown Project',
      client_name: client ? (client.company || client.name) : 'Unknown Client',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      checklist: [],
      comments: [],
      attachments: [],
      activities: [{ id: Date.now()+1, type: 'Task Created', desc: `Task ${form.title} created.`, user: 'Admin', date: new Date().toISOString() }]
    };

    const existing = JSON.parse(localStorage.getItem('rkr_tasks') || '[]');
    localStorage.setItem('rkr_tasks', JSON.stringify([newTask, ...existing]));
    
    // Auto sync to project tasks array for redundancy
    if (proj) {
      const updatedProj = {
        ...proj,
        tasks: [...(proj.tasks || []), { id: newTask.id, name: newTask.title, assignee: newTask.assignee, priority: newTask.priority, due_date: newTask.due_date, status: newTask.status }]
      };
      const allProjs = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
      localStorage.setItem('rkr_projects', JSON.stringify(allProjs.map(p => p.id === proj.id ? updatedProj : p)));
    }

    setShowCreateModal(false);
    setForm({ title: '', project_id: '', client_id: '', description: '', priority: 'Medium', status: 'To Do', due_date: '', assignee: 'Admin' });
    loadData();
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      const existing = JSON.parse(localStorage.getItem('rkr_tasks') || '[]');
      localStorage.setItem('rkr_tasks', JSON.stringify(existing.filter(t => t.id !== taskToDelete)));
      setTaskToDelete(null);
      loadData();
    }
  };

  // Kanban Drag and Drop simulation
  const updateTaskStatus = (taskId, newStatus) => {
    const existing = JSON.parse(localStorage.getItem('rkr_tasks') || '[]');
    const updated = existing.map(t => {
      if(t.id === taskId) {
        return { 
          ...t, 
          status: newStatus, 
          progress: newStatus === 'Completed' ? 100 : t.progress,
          updated_at: new Date().toISOString(),
          activities: [{ id: Date.now(), type: 'Status Changed', desc: `Task status updated to ${newStatus}`, user: 'Admin', date: new Date().toISOString() }, ...t.activities]
        };
      }
      return t;
    });
    localStorage.setItem('rkr_tasks', JSON.stringify(updated));
    loadData();
  };

  // Filtering Logic
  const filteredTasks = useMemo(() => {
    return tasksList.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.task_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'All' || t.status === filters.status;
      const matchesPriority = filters.priority === 'All' || t.priority === filters.priority;
      const matchesProject = filters.project_id === 'All' || t.project_id.toString() === filters.project_id;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [tasksList, searchTerm, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);
  const currentTasks = filteredTasks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // KPIs
  const totalTasks = tasksList.length;
  const todoTasks = tasksList.filter(t => t.status === 'To Do').length;
  const inProgressTasks = tasksList.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasksList.filter(t => t.status === 'Completed').length;
  
  const overdueTasks = tasksList.filter(t => {
    if (['Completed', 'Cancelled'].includes(t.status) || !t.due_date) return false;
    return new Date(t.due_date) < new Date();
  }).length;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Organize, assign and track work across all your projects.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <AlignLeft size={16} /> List
            </button>
            <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${viewMode === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <Columns size={16} /> Kanban
            </button>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
            <Plus size={16} /> Create Task
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: <CheckSquare size={18}/>, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'To Do', value: todoTasks, icon: <Clock size={18}/>, color: 'text-gray-600', bg: 'bg-gray-100' },
          { label: 'In Progress', value: inProgressTasks, icon: <Activity size={18}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: completedTasks, icon: <CheckCircle2 size={18}/>, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Overdue', value: overdueTasks, icon: <AlertCircle size={18}/>, color: 'text-red-600', bg: 'bg-red-50' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                {kpi.icon}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
              <h3 className={`text-xl font-black ${kpi.label === 'Overdue' ? 'text-red-600' : 'text-gray-900'}`}>{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by ID, Task Name, or Project..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 md:flex-none px-4 py-2 border rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} /> Filters {(filters.status !== 'All' || filters.priority !== 'All' || filters.project_id !== 'All') && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Project</label>
            <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium cursor-pointer" value={filters.project_id} onChange={e => setFilters({...filters, project_id: e.target.value})}>
              <option value="All">All Projects</option>
              {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({status: 'All', priority: 'All', project_id: 'All'})} className="w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent rounded-lg transition-colors cursor-pointer">
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* VIEWS */}
      {viewMode === 'list' ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Task</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Project</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Assignee</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Due Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentTasks.map(task => {
                  const badgeStr = statusColors[task.status] || 'bg-gray-100 text-gray-600';
                  const prioBadge = priorityColors[task.priority] || 'bg-gray-100 text-gray-600';
                  return (
                    <tr key={task.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span onClick={() => navigate(`/dashboard/tasks/${task.id}`)} className="text-sm font-bold text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors">{task.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 font-medium">{task.task_id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${prioBadge}`}>{task.priority}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-gray-700">{task.project_name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badgeStr}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {task.assignee ? task.assignee.charAt(0) : 'A'}
                          </div>
                          <span className="text-sm font-bold text-gray-700">{task.assignee}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}</span>
                          {task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed' && (
                            <span className="text-[10px] text-red-500 font-bold mt-0.5">Overdue</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate(`/dashboard/tasks/${task.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="View Details">
                            <ChevronRight size={18} />
                          </button>
                          <button onClick={() => setTaskToDelete(task.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {currentTasks.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <CheckSquare size={48} className="mb-4 text-gray-300" />
                        <p className="text-sm font-medium text-gray-500">No tasks found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-xs font-medium text-gray-500">Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredTasks.length)} of {filteredTasks.length} entries</p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm bg-gray-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-gray-700 px-2">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm bg-gray-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* KANBAN BOARD */
        <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar min-h-[600px] items-start">
          {['To Do', 'In Progress', 'Review', 'Completed', 'Blocked'].map(statusCol => {
            const colTasks = filteredTasks.filter(t => t.status === statusCol);
            return (
              <div key={statusCol} className="w-[320px] flex-shrink-0 bg-gray-50/80 rounded-xl border border-gray-200 flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100 rounded-t-xl sticky top-0 z-10">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[statusCol].split(' ')[0]}`}></div>
                    {statusCol}
                  </h3>
                  <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3 hide-scrollbar">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group relative cursor-pointer" onClick={() => navigate(`/dashboard/tasks/${task.id}`)}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${priorityColors[task.priority]}`}>{task.priority}</span>
                        <div className="relative group/dropdown">
                           <button className="text-gray-400 hover:text-gray-900" onClick={(e) => { e.stopPropagation(); }}>
                             <ChevronRight size={14} className="rotate-90"/>
                           </button>
                           {/* Quick Action Dropdown simulation for Kanban */}
                           <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 shadow-xl rounded-lg w-32 py-1 hidden group-hover/dropdown:block z-20">
                             {ALL_STATUSES.map(s => (
                               <button key={s} onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, s); }} className="w-full text-left px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Move to {s}</button>
                             ))}
                           </div>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1 leading-snug group-hover:text-blue-600 transition-colors">{task.title}</h4>
                      <p className="text-xs text-gray-500 mb-3 truncate font-medium"><Building size={12} className="inline mr-1 text-gray-400"/>{task.project_name}</p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <Clock size={12} className={task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed' ? 'text-red-500' : ''}/>
                          <span className={task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed' ? 'text-red-500' : ''}>
                            {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : '-'}
                          </span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]" title={task.assignee}>
                          {task.assignee ? task.assignee.charAt(0) : 'A'}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button onClick={() => {setForm({...form, status: statusCol}); setShowCreateModal(true);}} className="w-full py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-colors cursor-pointer flex justify-center items-center gap-1.5">
                    <Plus size={14} /> Add Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Create New Task</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Assign actionable work to your team</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
              <form id="createTaskForm" onSubmit={handleCreateTask} className="space-y-6">
                
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Task Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Task Title *</label>
                      <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Design Homepage UI" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Project *</label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer bg-white" value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})}>
                        <option value="">Select a Project</option>
                        {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Assigned To *</label>
                      <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all" value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})} placeholder="e.g. Admin" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Task Description</label>
                      <textarea className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all resize-none min-h-[80px]" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Provide detailed instructions for this task..."></textarea>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Status & Timing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer bg-white" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Priority</label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer bg-white" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                        {PRIORITIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Due Date</label>
                      <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm transition-all cursor-pointer" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-white transition-colors shadow-sm cursor-pointer">
                Cancel
              </button>
              <button type="submit" form="createTaskForm" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                <Check size={16} /> Save Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-2">Delete Task?</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Are you sure you want to permanently delete this task?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setTaskToDelete(null)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer flex-1">
                Cancel
              </button>
              <button onClick={confirmDeleteTask} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm cursor-pointer flex-1">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
