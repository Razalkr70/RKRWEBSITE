import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Trash2, CheckCircle2, Clock, AlertCircle, X, ChevronRight, Briefcase, Calendar, Users, DollarSign, Activity, FileText, ChevronLeft, Building, ChevronDown, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ALL_STATUSES = ['Draft', 'Planning', 'In Progress', 'Review', 'Client Review', 'Revision', 'On Hold', 'Completed', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

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

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-700',
  'Medium': 'bg-blue-50 text-blue-700',
  'High': 'bg-orange-50 text-orange-700',
  'Urgent': 'bg-red-50 text-red-700',
};

export default function Projects() {
  const navigate = useNavigate();
  const [projectsList, setProjectsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    client_id: 'All'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  // New Project Form
  const [form, setForm] = useState({
    name: '',
    client_id: '',
    service: 'Web Development',
    description: '',
    priority: 'Medium',
    status: 'Planning',
    start_date: '',
    deadline: '',
    contract_value: '',
    project_manager: 'Admin'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    let p = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
    
    // Migration: Fix legacy "Website Development" to "Web Development"
    let migrated = false;
    p = p.map(proj => {
      if (proj.service === 'Website Development') {
        migrated = true;
        return { ...proj, service: 'Web Development' };
      }
      return proj;
    });
    if (migrated) {
      localStorage.setItem('rkr_projects', JSON.stringify(p));
    }

    setProjectsList(p.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    const c = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
    setClientsList(c);
    setServicesList(JSON.parse(localStorage.getItem('rkr_services') || '[]'));
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!form.name || !form.client_id || !form.service) {
      alert("Project Name, Client, and Service are required.");
      return;
    }
    
    const client = clientsList.find(c => c.id.toString() === form.client_id);
    const newProject = {
      id: Date.now(),
      project_id: `RKR-PRJ-${Date.now().toString().slice(-4)}`,
      ...form,
      client_name: client ? (client.company || client.name) : 'Unknown Client',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: [],
      milestones: [],
      documents: [],
      activities: [{ id: Date.now()+1, type: 'Project Created', desc: `Project ${form.name} initiated.`, user: 'Admin', date: new Date().toISOString() }]
    };

    const existing = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
    localStorage.setItem('rkr_projects', JSON.stringify([newProject, ...existing]));
    
    // Also inject back to client's projects array to keep legacy linkage working (optional but good for hybrid)
    if (client) {
      const updatedClient = {
        ...client,
        projects: [...(client.projects || []), { id: newProject.id, name: newProject.name, service: newProject.service, status: newProject.status, budget: newProject.contract_value }]
      };
      const allClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      localStorage.setItem('rkr_clients', JSON.stringify(allClients.map(c => c.id === client.id ? updatedClient : c)));
    }

    setShowCreateModal(false);
    setForm({ name: '', client_id: '', service: '', description: '', priority: 'Medium', status: 'Planning', start_date: '', deadline: '', contract_value: '', project_manager: 'Admin' });
    loadData();
  };

  const triggerDeleteProject = (id) => {
    setProjectToDelete(id);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      const existing = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
      localStorage.setItem('rkr_projects', JSON.stringify(existing.filter(p => p.id !== projectToDelete)));
      setProjectToDelete(null);
      loadData();
    }
  };

  // Filtering Logic
  const filteredProjects = useMemo(() => {
    return projectsList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.project_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'All' || p.status === filters.status;
      const matchesPriority = filters.priority === 'All' || p.priority === filters.priority;
      const matchesClient = filters.client_id === 'All' || p.client_id.toString() === filters.client_id;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesClient;
    });
  }, [projectsList, searchTerm, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
  const currentProjects = filteredProjects.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // KPIs
  const totalProjects = projectsList.length;
  const activeProjects = projectsList.filter(p => !['Completed', 'Cancelled', 'On Hold'].includes(p.status)).length;
  const completedProjects = projectsList.filter(p => p.status === 'Completed').length;
  
  // Basic Overdue logic: deadline exists and is past today, and not completed
  const overdueProjects = projectsList.filter(p => {
    if (['Completed', 'Cancelled'].includes(p.status) || !p.deadline) return false;
    return new Date(p.deadline) < new Date();
  }).length;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Plan, manage and track all your client projects in one place.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link to="/dashboard/reports?type=Projects" className="px-4 py-2 bg-white border border-gray-200 text-indigo-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
            <FileText size={16} /> Reports
          </Link>
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            Export CSV
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
            <Plus size={16} /> Create Project
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Projects</p>
            <h3 className="text-2xl font-black text-gray-900">{totalProjects}</h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setFilters({...filters, status: 'In Progress'})}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Projects</p>
            <h3 className="text-2xl font-black text-gray-900">{activeProjects}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-green-300 transition-colors" onClick={() => setFilters({...filters, status: 'Completed'})}>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Completed</p>
            <h3 className="text-2xl font-black text-gray-900">{completedProjects}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Overdue</p>
            <h3 className="text-2xl font-black text-red-600">{overdueProjects}</h3>
          </div>
        </div>
      </div>

      {/* PIPELINE OVERVIEW (Optional visual summary) */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {ALL_STATUSES.map(status => {
          const count = projectsList.filter(p => p.status === status).length;
          const isActive = filters.status === status;
          return (
            <button 
              key={status} 
              onClick={() => setFilters({...filters, status: isActive ? 'All' : status})}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold border transition-colors cursor-pointer flex items-center gap-2
                ${isActive ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}
            >
              {status}
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by ID, Project Name, or Client..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 md:flex-none px-4 py-2.5 border rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <Filter size={16} /> Filters {(filters.status !== 'All' || filters.priority !== 'All' || filters.client_id !== 'All') && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
            <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium focus:border-blue-400 cursor-pointer" value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
              <option value="All">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Client</label>
            <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium focus:border-blue-400 cursor-pointer" value={filters.client_id} onChange={e => setFilters({...filters, client_id: e.target.value})}>
              <option value="All">All Clients</option>
              {clientsList.map(c => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({status: 'All', priority: 'All', client_id: 'All'})} className="w-full py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent rounded-lg transition-colors cursor-pointer">
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Project</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Client</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Progress</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Deadline</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentProjects.map(project => {
                const badgeStr = statusColors[project.status] || 'bg-gray-100 text-gray-600';
                const prioBadge = priorityColors[project.priority] || 'bg-gray-100 text-gray-600';
                return (
                  <tr key={project.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span onClick={() => navigate(`/dashboard/projects/${project.id}`)} className="text-sm font-bold text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors">{project.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 font-medium">{project.project_id}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${prioBadge}`}>{project.priority}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-700">{project.client_name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badgeStr}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 w-32">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600 w-8">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
                        {project.deadline && new Date(project.deadline) < new Date() && project.status !== 'Completed' && (
                          <span className="text-[10px] text-red-500 font-bold mt-0.5">Overdue</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/dashboard/projects/${project.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="View Details">
                          <ChevronRight size={18} />
                        </button>
                        <button onClick={() => triggerDeleteProject(project.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {currentProjects.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Briefcase size={48} className="mb-4 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">No projects found matching your criteria.</p>
                      <button onClick={() => setShowCreateModal(true)} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
                        Create your first project
                      </button>
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
            <p className="text-xs font-medium text-gray-500">Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredProjects.length)} of {filteredProjects.length} entries</p>
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

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Create New Project</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Set up a new workspace for your client</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-900 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
              <form id="createProjectForm" onSubmit={handleCreateProject} className="space-y-6">
                
                {/* Basic Info */}
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Project Name *</label>
                      <input required type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Website Redesign Q4" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Client *</label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer bg-white" value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}>
                        <option value="">Select a Client</option>
                        {clientsList.map(c => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Service Type</label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer bg-white" value={form.service} onChange={e => setForm({...form, service: e.target.value})}>
                        <option value="">Select a Service</option>
                        {servicesList.length > 0 ? (
                          servicesList.filter(s => s.status === 'Active').map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                        ) : (
                          <>
                            <option>AI Solutions</option>
                            <option>Web Development</option>
                            <option>CRM & ERP Solutions</option>
                            <option>Dashboards & Business Intelligence</option>
                            <option>Automation Solutions</option>
                            <option>Data Analytics</option>
                            <option>E-Commerce Solutions</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Brief Description</label>
                      <textarea className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all resize-none min-h-[80px]" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What is the main objective of this project?"></textarea>
                    </div>
                  </div>
                </div>

                {/* Setup */}
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Planning & Setup</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer bg-white" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Priority</label>
                      <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer bg-white" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                        {PRIORITIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Start Date</label>
                      <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Deadline</label>
                      <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all cursor-pointer" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Contract Value / Budget</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input type="number" required className="w-full pl-8 p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" value={form.contract_value} onChange={e => setForm({...form, contract_value: e.target.value})} placeholder="5000" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Project Manager</label>
                      <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" value={form.project_manager} onChange={e => setForm({...form, project_manager: e.target.value})} placeholder="Admin" />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-white transition-colors shadow-sm cursor-pointer">
                Cancel
              </button>
              <button type="submit" form="createProjectForm" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                <Check size={16} /> Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-2">Delete Project?</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Are you sure you want to permanently delete this project? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setProjectToDelete(null)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer flex-1">
                Cancel
              </button>
              <button onClick={confirmDeleteProject} className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm cursor-pointer flex-1">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
