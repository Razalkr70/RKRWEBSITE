import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, UserSquare2, Briefcase, CheckSquare, DollarSign, CreditCard, 
  Activity, Calendar, Clock, FileText, FileSignature, ArrowRight, 
  Plus, MoreVertical, ArrowUpRight, ArrowDownRight, UserPlus, 
  Settings, RefreshCw, X, ChevronUp, ChevronDown, List as ListIcon,
  MessageSquare, FolderOpen, AlertCircle, File
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DEFAULT_WIDGETS = [
  { id: "kpis", title: "Top KPIs", visible: true, order: 0, size: "full" },
  { id: "revenueOverview", title: "Revenue Overview", visible: true, order: 1, size: "half" },
  { id: "leadPipeline", title: "Lead Pipeline", visible: true, order: 2, size: "half" },
  { id: "activeProjects", title: "Active Projects", visible: true, order: 3, size: "half" },
  { id: "taskOverview", title: "Task Overview", visible: true, order: 4, size: "half" },
  { id: "projectDeadlines", title: "Upcoming Deadlines", visible: true, order: 5, size: "half" },
  { id: "recentActivity", title: "Recent Activity", visible: true, order: 6, size: "half" },
  { id: "recentLeads", title: "Recent Leads", visible: true, order: 7, size: "half" },
  { id: "recentPayments", title: "Recent Payments", visible: true, order: 8, size: "half" },
  { id: "quickActions", title: "Quick Actions", visible: true, order: 9, size: "half" },
  { id: "recentCommunications", title: "Recent Communications", visible: true, order: 10, size: "half" },
  { id: "clientAssets", title: "Client Assets", visible: true, order: 11, size: "half" },
  { id: "upcomingFollowUps", title: "Upcoming Follow-ups", visible: true, order: 12, size: "half" },
  { id: "servicePerformance", title: "Service Performance", visible: true, order: 13, size: "full" },
];

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function DashboardHome() {
  const navigate = useNavigate();
  
  // Data State
  const [data, setData] = useState({
    leads: [], clients: [], projects: [], tasks: [], 
    payments: [], assets: [], communications: [], activities: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Config State
  const [dateRange, setDateRange] = useState('This Month');
  const [widgets, setWidgets] = useState([]);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    try {
      const getParsed = (key) => JSON.parse(localStorage.getItem(key) || '[]');
      setData({
        leads: getParsed('rkr_leads'),
        clients: getParsed('rkr_clients'),
        projects: getParsed('rkr_projects'),
        tasks: getParsed('rkr_tasks'),
        payments: getParsed('rkr_payments'),
        assets: getParsed('rkr_assets'),
        communications: getParsed('rkr_communications'),
        activities: getParsed('rkr_asset_activities') // reusing asset activities or global activities if available
      });
      setLastUpdated(new Date());
    } catch(e) {
      console.error('Error loading dashboard data', e);
    }
    setIsLoading(false);
  };

  const loadConfig = () => {
    try {
      const savedConfig = JSON.parse(localStorage.getItem('rkr_dashboard_config'));
      if (savedConfig && savedConfig.widgets && savedConfig.widgets.length > 0) {
        // Merge missing defaults just in case
        const mergedWidgets = savedConfig.widgets.map(sw => {
           const dft = DEFAULT_WIDGETS.find(dw => dw.id === sw.id);
           return dft ? { ...dft, ...sw } : sw;
        }).sort((a,b) => a.order - b.order);
        
        // Append any new widgets added to defaults
        DEFAULT_WIDGETS.forEach(dw => {
           if (!mergedWidgets.find(mw => mw.id === dw.id)) {
             mergedWidgets.push({...dw, order: mergedWidgets.length});
           }
        });
        
        setWidgets(mergedWidgets);
        if (savedConfig.dateRange) setDateRange(savedConfig.dateRange);
      } else {
        setWidgets([...DEFAULT_WIDGETS]);
      }
    } catch(e) {
      setWidgets([...DEFAULT_WIDGETS]);
    }
  };

  const saveConfig = (newWidgets, newDateRange) => {
    setWidgets(newWidgets);
    if (newDateRange) setDateRange(newDateRange);
    localStorage.setItem('rkr_dashboard_config', JSON.stringify({
      dateRange: newDateRange || dateRange,
      widgets: newWidgets
    }));
  };

  useEffect(() => {
    loadConfig();
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  const handleReset = () => {
    if(confirm('Reset dashboard layout to default?')) {
      saveConfig([...DEFAULT_WIDGETS], 'This Month');
      setIsCustomizeOpen(false);
    }
  };

  const moveWidget = (id, direction) => {
    const idx = widgets.findIndex(w => w.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === widgets.length - 1)) return;
    
    const newWidgets = [...widgets];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    // Swap orders
    const tempOrder = newWidgets[idx].order;
    newWidgets[idx].order = newWidgets[swapIdx].order;
    newWidgets[swapIdx].order = tempOrder;
    
    newWidgets.sort((a, b) => a.order - b.order);
    saveConfig(newWidgets);
  };

  const toggleWidget = (id) => {
    const newWidgets = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    saveConfig(newWidgets);
  };

  // -----------------------------------------------------
  // FILTERING LOGIC
  // -----------------------------------------------------
  const isWithinDateRange = (dateStr) => {
    if (!dateStr) return true;
    if (dateRange === 'All Time') return true;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (dateRange === 'Today') return date >= today;
    if (dateRange === 'Yesterday') {
      const yest = new Date(today); yest.setDate(yest.getDate() - 1);
      return date >= yest && date < today;
    }
    if (dateRange === 'Last 7 Days') {
      const last7 = new Date(today); last7.setDate(last7.getDate() - 7);
      return date >= last7;
    }
    if (dateRange === 'Last 30 Days') {
      const last30 = new Date(today); last30.setDate(last30.getDate() - 30);
      return date >= last30;
    }
    if (dateRange === 'This Month') {
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }
    if (dateRange === 'Last Month') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
      return date >= lastMonth && date <= endLastMonth;
    }
    if (dateRange === 'This Year') {
      return date.getFullYear() === today.getFullYear();
    }
    return true;
  };

  const filteredData = {
    leads: data.leads.filter(l => isWithinDateRange(l.created_at || l.date)),
    payments: data.payments.filter(p => isWithinDateRange(p.date)),
    communications: data.communications.filter(c => isWithinDateRange(c.date)),
    assets: data.assets.filter(a => isWithinDateRange(a.uploaded_at)),
  };

  // Derived KPI Data
  const revenueValue = filteredData.payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingPayments = data.payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  // Reusable Components
  const KPICard = ({ title, value, icon, link }) => (
    <div onClick={() => navigate(link)} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1E3A8A]/30 transition-all cursor-pointer flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-blue-50 text-[#1E3A8A] rounded-xl group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide">{title}</h3>
        <h2 className="text-2xl font-black text-gray-900">{value}</h2>
      </div>
    </div>
  );

  const WidgetHeader = ({ title, link, onHide }) => (
    <div className="flex justify-between items-center mb-5">
      <h2 className="text-[15px] font-black text-gray-900">{title}</h2>
      <div className="flex gap-2">
        {link && <Link to={link} className="text-xs font-bold text-[#1E3A8A] hover:underline">View All</Link>}
      </div>
    </div>
  );

  const EmptyState = ({ message, actionText, actionLink }) => (
    <div className="flex flex-col items-center justify-center h-40 text-center">
      <AlertCircle className="text-gray-300 mb-2" size={32} />
      <p className="text-sm font-semibold text-gray-500 mb-3">{message}</p>
      {actionText && actionLink && (
        <button onClick={() => navigate(actionLink)} className="px-4 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-colors">
          {actionText}
        </button>
      )}
    </div>
  );

  // Widget Renderers
  const renderKPIs = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
      <KPICard title="Total Leads" value={data.leads.length} icon={<UserSquare2 size={20} />} link="/dashboard/leads" />
      <KPICard title="Active Clients" value={data.clients.length} icon={<Users size={20} />} link="/dashboard/clients" />
      <KPICard title="Active Projects" value={data.projects.filter(p => p.status !== 'Completed').length} icon={<Briefcase size={20} />} link="/dashboard/projects" />
      <KPICard title="Pending Tasks" value={data.tasks.filter(t => t.status !== 'Completed').length} icon={<CheckSquare size={20} />} link="/dashboard/tasks" />
      <KPICard title="Pending Payments" value={`₹${pendingPayments.toLocaleString()}`} icon={<CreditCard size={20} />} link="/dashboard/payments" />
      <KPICard title="Revenue" value={`₹${revenueValue.toLocaleString()}`} icon={<DollarSign size={20} />} link="/dashboard/analytics" />
    </div>
  );

  const renderLeadPipeline = () => {
    const statuses = ['New', 'Contacted', 'Qualified', 'Follow-up', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];
    const counts = statuses.map((s, i) => ({
      name: s, 
      value: filteredData.leads.filter(l => l.status === s).length,
      color: COLORS[i % COLORS.length]
    })).filter(c => c.value > 0);

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <WidgetHeader title="Lead Pipeline" link="/dashboard/leads" />
        {counts.length > 0 ? (
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={counts} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {counts.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {counts.map(stat => (
                <div key={stat.name} className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div><span className="font-semibold text-gray-700 truncate">{stat.name}</span></div>
                  <span className="font-bold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : <EmptyState message="No leads found for this period" actionText="Add Lead" actionLink="/dashboard/leads" />}
      </div>
    );
  };

  const renderRevenueOverview = () => {
    // Group payments by month or day (mock logic: group by service type for now as we don't have deep time series data locally)
    const revData = [
      { name: 'Week 1', revenue: revenueValue * 0.2 },
      { name: 'Week 2', revenue: revenueValue * 0.3 },
      { name: 'Week 3', revenue: revenueValue * 0.1 },
      { name: 'Week 4', revenue: revenueValue * 0.4 },
    ].filter(d => revenueValue > 0);

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[15px] font-black text-gray-900">{`Revenue Overview (${dateRange})`}</h2>
          <div className="flex gap-2">
            <Link to="/dashboard/reports/create" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              <FileText size={12} /> Generate Report
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/dashboard/analytics" className="text-xs font-bold text-[#1E3A8A] hover:underline">
              View Analytics
            </Link>
          </div>
        </div>
        {revData.length > 0 ? (
          <div className="flex-1 min-h-[220px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{fill: '#F3F4F6'}} formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#1E3A8A" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <EmptyState message="No revenue recorded yet" actionText="Record Payment" actionLink="/dashboard/payments" />}
      </div>
    );
  };

  const renderActiveProjects = () => {
    const active = data.projects.filter(p => p.status !== 'Completed').slice(0,5);
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <WidgetHeader title="Active Projects" link="/dashboard/projects" />
        {active.length > 0 ? (
          <div className="space-y-4">
            {active.map(p => (
              <div key={p.id} className="cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#1E3A8A] transition-colors">{p.name}</h4>
                    <p className="text-[10px] text-gray-500">{p.client}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 text-[#1E3A8A] px-2 py-0.5 rounded uppercase">{p.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-[#1E3A8A] h-1.5 rounded-full" style={{width: `${p.progress}%`}}></div></div>
                  <span className="text-xs font-bold text-gray-700 w-8 text-right">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState message="No active projects" actionText="Create Project" actionLink="/dashboard/projects" />}
      </div>
    );
  };

  const renderProjectDeadlines = () => {
    const projectsWithDeadlines = data.projects.filter(p => p.deadline && p.status !== 'Completed')
      .map(p => {
        const d = new Date(p.deadline);
        const diff = Math.ceil((d - new Date()) / (1000 * 3600 * 24));
        return { ...p, daysDiff: diff };
      })
      .sort((a, b) => a.daysDiff - b.daysDiff)
      .slice(0, 5);

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <WidgetHeader title="Upcoming Deadlines" link="/dashboard/projects" />
        {projectsWithDeadlines.length > 0 ? (
          <div className="space-y-3">
            {projectsWithDeadlines.map(p => (
              <div key={p.id} className={`flex justify-between items-center p-3 rounded-lg border ${p.daysDiff < 0 ? 'bg-red-50/50 border-red-100' : p.daysDiff <= 3 ? 'bg-orange-50/50 border-orange-100' : 'border-gray-100'}`}>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{p.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Due: {p.deadline}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${p.daysDiff < 0 ? 'bg-red-100 text-red-700' : p.daysDiff <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                  {p.daysDiff < 0 ? `${Math.abs(p.daysDiff)} Days Overdue` : p.daysDiff === 0 ? 'Due Today' : `In ${p.daysDiff} Days`}
                </span>
              </div>
            ))}
          </div>
        ) : <EmptyState message="No upcoming deadlines" />}
      </div>
    );
  };

  const renderTaskOverview = () => {
    const statuses = ['To Do', 'In Progress', 'Review', 'Completed', 'Blocked', 'Overdue'];
    const taskCounts = statuses.map(s => ({
      name: s, 
      count: data.tasks.filter(t => t.status === s || (s==='To Do' && t.status==='Pending') || (s==='Overdue' && t.due==='Overdue')).length
    }));

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <WidgetHeader title="Task Overview" link="/dashboard/tasks" />
        {data.tasks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {taskCounts.map(tc => (
              <div key={tc.name} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                <span className="text-xs font-semibold text-gray-600 uppercase">{tc.name}</span>
                <span className={`text-lg font-black ${tc.count > 0 ? 'text-[#1E3A8A]' : 'text-gray-300'}`}>{tc.count}</span>
              </div>
            ))}
          </div>
        ) : <EmptyState message="No tasks created" actionText="Create Task" actionLink="/dashboard/tasks" />}
      </div>
    );
  };

  const renderRecentActivity = () => {
    const acts = data.activities.slice(0,5);
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <WidgetHeader title="Recent Activity" />
        {acts.length > 0 ? (
          <div className="relative pl-4 border-l-2 border-gray-100 space-y-5 mt-2">
            {acts.map((act, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#1E3A8A] ring-4 ring-white"></div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{act.action}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{act.assetName} {act.details}</p>
                  <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">{new Date(act.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState message="No recent system activity" />}
      </div>
    );
  };

  const renderRecentLeads = () => {
    const rLeads = filteredData.leads.slice(0,5);
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <WidgetHeader title="Recent Leads" link="/dashboard/leads" />
        {rLeads.length > 0 ? (
          <div className="space-y-3">
            {rLeads.map((l, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{l.name}</h4>
                  <p className="text-[10px] text-gray-500">{l.service} • {l.company || 'N/A'}</p>
                </div>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded">{l.status}</span>
              </div>
            ))}
          </div>
        ) : <EmptyState message="No leads for this period" actionText="Add Lead" actionLink="/dashboard/leads" />}
      </div>
    );
  };

  const renderRecentPayments = () => {
    const rPayments = filteredData.payments.slice(0,5);
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <WidgetHeader title="Recent Payments" link="/dashboard/payments" />
        {rPayments.length > 0 ? (
          <div className="space-y-3">
            {rPayments.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{p.client}</h4>
                  <p className="text-[10px] text-gray-500">{p.date} • {p.method}</p>
                </div>
                <span className={`text-sm font-black ${p.status === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>₹{Number(p.amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : <EmptyState message="No recent payments" actionText="Record Payment" actionLink="/dashboard/payments" />}
      </div>
    );
  };

  const renderQuickActions = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
      <h2 className="text-[15px] font-black text-gray-900 mb-5">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
        <button onClick={() => navigate('/dashboard/leads')} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:border-[#1E3A8A]/30 hover:bg-blue-50/30 transition-colors group">
          <UserPlus size={18} className="text-gray-400 group-hover:text-[#1E3A8A] mb-1" />
          <span className="text-[10px] font-bold text-gray-600 group-hover:text-[#1E3A8A]">Add Lead</span>
        </button>
        <button onClick={() => navigate('/dashboard/projects')} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:border-[#1E3A8A]/30 hover:bg-blue-50/30 transition-colors group">
          <Briefcase size={18} className="text-gray-400 group-hover:text-[#1E3A8A] mb-1" />
          <span className="text-[10px] font-bold text-gray-600 group-hover:text-[#1E3A8A]">Project</span>
        </button>
        <button onClick={() => navigate('/dashboard/tasks')} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:border-[#1E3A8A]/30 hover:bg-blue-50/30 transition-colors group">
          <CheckSquare size={18} className="text-gray-400 group-hover:text-[#1E3A8A] mb-1" />
          <span className="text-[10px] font-bold text-gray-600 group-hover:text-[#1E3A8A]">Task</span>
        </button>
        <button onClick={() => navigate('/dashboard/quotations')} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:border-[#1E3A8A]/30 hover:bg-blue-50/30 transition-colors group">
          <FileSignature size={18} className="text-gray-400 group-hover:text-[#1E3A8A] mb-1" />
          <span className="text-[10px] font-bold text-gray-600 group-hover:text-[#1E3A8A]">Quotation</span>
        </button>
        <button onClick={() => navigate('/dashboard/payments')} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:border-[#1E3A8A]/30 hover:bg-blue-50/30 transition-colors group">
          <DollarSign size={18} className="text-gray-400 group-hover:text-[#1E3A8A] mb-1" />
          <span className="text-[10px] font-bold text-gray-600 group-hover:text-[#1E3A8A]">Payment</span>
        </button>
        <button onClick={() => navigate('/dashboard/assets')} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-lg hover:border-[#1E3A8A]/30 hover:bg-blue-50/30 transition-colors group">
          <FolderOpen size={18} className="text-gray-400 group-hover:text-[#1E3A8A] mb-1" />
          <span className="text-[10px] font-bold text-gray-600 group-hover:text-[#1E3A8A]">Asset</span>
        </button>
      </div>
    </div>
  );

  const renderClientAssets = () => {
    const recentAssets = data.assets.slice(0,4);
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <WidgetHeader title="Recent Assets" link="/dashboard/assets" />
        {recentAssets.length > 0 ? (
          <div className="space-y-3">
            {recentAssets.map(a => (
              <div key={a.asset_id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-50 rounded text-gray-400">
                    <File size={16}/>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{a.name}</h4>
                    <p className="text-[10px] text-gray-500">{a.category} • {a.client || 'General'}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(a.uploaded_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : <EmptyState message="No assets uploaded" actionText="Upload Asset" actionLink="/dashboard/assets" />}
      </div>
    );
  };

  const renderServicePerformance = () => {
    // 7 Core Services mock aggregation
    const coreServices = ['AI Solutions', 'Web Development', 'CRM & ERP Solutions', 'Dashboards & BI', 'Automation Solutions', 'Data Analytics', 'E-Commerce Solutions'];
    const serviceData = coreServices.map(s => {
      const sLeads = data.leads.filter(l => l.service === s).length;
      return { name: s.split(' ')[0], full: s, leads: sLeads, projects: Math.floor(sLeads * 0.4) };
    });

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col w-full">
        <WidgetHeader title="Service Performance (Leads vs Projects)" link="/dashboard/analytics" />
        <div className="flex-1 min-h-[250px]">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} angle={-30} textAnchor="end" />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6B7280'}} />
              <Tooltip cursor={{fill: '#F3F4F6'}} />
              <Bar dataKey="leads" name="Leads" fill="#1E3A8A" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="projects" name="Projects" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderRecentCommunications = () => {
    const recentComms = data.communications.sort((a,b) => new Date(b.communication_date) - new Date(a.communication_date)).slice(0, 5);
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <WidgetHeader title="Recent Communications" link="/dashboard/communications" />
        {recentComms.length > 0 ? (
          <div className="space-y-3">
            {recentComms.map((c, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{c.contact_name}</h4>
                    <p className="text-[10px] text-gray-500">{c.entity_type} • {c.channel}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(c.communication_date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : <EmptyState message="No recent communications" actionText="Log Communication" actionLink="/dashboard/communications/add" />}
      </div>
    );
  };

  const renderUpcomingFollowUps = () => {
    const followUps = data.communications
      .filter(c => c.follow_up_required && c.status !== 'Completed' && c.follow_up_date)
      .sort((a,b) => new Date(a.follow_up_date) - new Date(b.follow_up_date))
      .slice(0, 5);

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
        <WidgetHeader title="Upcoming Follow-ups" link="/dashboard/communications/follow-ups" />
        {followUps.length > 0 ? (
          <div className="space-y-3">
            {followUps.map((c, idx) => {
              const daysDiff = Math.ceil((new Date(c.follow_up_date) - new Date()) / (1000 * 3600 * 24));
              return (
                <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border ${daysDiff < 0 ? 'bg-red-50/50 border-red-100' : daysDiff <= 1 ? 'bg-orange-50/50 border-orange-100' : 'border-gray-100'}`}>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{c.contact_name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{c.channel}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${daysDiff < 0 ? 'bg-red-100 text-red-700' : daysDiff <= 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                    {daysDiff < 0 ? `${Math.abs(daysDiff)} Days Overdue` : daysDiff === 0 ? 'Today' : `In ${daysDiff} Days`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : <EmptyState message="No upcoming follow-ups scheduled" actionText="View Communications" actionLink="/dashboard/communications" />}
      </div>
    );
  };

  // Component Map
  const widgetComponents = {
    kpis: renderKPIs,
    leadPipeline: renderLeadPipeline,
    revenueOverview: renderRevenueOverview,
    activeProjects: renderActiveProjects,
    taskOverview: renderTaskOverview,
    projectDeadlines: renderProjectDeadlines,
    recentActivity: renderRecentActivity,
    recentLeads: renderRecentLeads,
    recentPayments: renderRecentPayments,
    quickActions: renderQuickActions,
    servicePerformance: renderServicePerformance,
    recentCommunications: renderRecentCommunications,
    clientAssets: renderClientAssets,
    upcomingFollowUps: renderUpcomingFollowUps,
  };


  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 bg-gray-50/30 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative z-20">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Overview of your business activity and performance</p>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select 
            value={dateRange}
            onChange={(e) => saveConfig(widgets, e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 cursor-pointer"
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
          <button onClick={handleRefresh} className="p-2 border border-gray-200 text-gray-500 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-colors" title="Refresh Data">
             <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setIsCustomizeOpen(true)} className="flex items-center gap-2 bg-[#1E3A8A] text-white font-bold text-sm px-5 py-2 rounded-lg hover:bg-[#152c6e] transition-colors shadow-sm">
            <Settings size={16} /> Customize
          </button>
        </div>
      </div>

      {/* Customization Panel */}
      {isCustomizeOpen && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg animate-in slide-in-from-top-4 relative z-10 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900">Customize Dashboard</h2>
              <p className="text-xs text-gray-500 font-medium">Toggle visibility and reorder your widgets.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleReset} className="text-sm font-bold text-red-600 hover:underline">Reset to Default</button>
              <button onClick={() => setIsCustomizeOpen(false)} className="p-1 text-gray-400 hover:text-gray-900 rounded-lg bg-gray-50"><X size={20}/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {widgets.map((w, idx) => (
              <div key={w.id} className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${w.visible ? 'border-[#1E3A8A]/30 bg-blue-50/20' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={w.visible} onChange={() => toggleWidget(w.id)} className="w-4 h-4 rounded text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer" />
                  <span className="text-sm font-bold text-gray-900">{w.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveWidget(w.id, 'up')} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-30"><ChevronUp size={16}/></button>
                  <button onClick={() => moveWidget(w.id, 'down')} disabled={idx === widgets.length - 1} className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-30"><ChevronDown size={16}/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => setIsCustomizeOpen(false)} className="px-6 py-2 bg-[#1E3A8A] text-white font-bold rounded-lg shadow-sm">Done Customizing</button>
          </div>
        </div>
      )}

      {/* Dynamic Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {widgets.filter(w => w.visible).map(w => {
           const Renderer = widgetComponents[w.id];
           if (!Renderer) return null;
           
           return (
             <div key={w.id} className={`${w.size === 'full' ? 'lg:col-span-2' : 'col-span-1'} animate-in fade-in duration-300`}>
                <Renderer />
             </div>
           );
        })}
      </div>

    </div>
  );
}
