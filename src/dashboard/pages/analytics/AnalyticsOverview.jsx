import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, UserPlus, FileText, CheckCircle, IndianRupee, Layout, 
  Briefcase, TrendingUp, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { filterByDateRange } from './AnalyticsUtils';

export default function AnalyticsOverview() {
  const { dateRange } = useOutletContext();
  const [data, setData] = useState({
    leads: [], clients: [], projects: [], 
    tasks: [], invoices: [], payments: [], quotations: []
  });

  useEffect(() => {
    setData({
      leads: JSON.parse(localStorage.getItem('rkr_leads') || '[]'),
      clients: JSON.parse(localStorage.getItem('rkr_clients') || '[]'),
      projects: JSON.parse(localStorage.getItem('rkr_projects') || '[]'),
      tasks: JSON.parse(localStorage.getItem('rkr_tasks') || '[]'),
      invoices: JSON.parse(localStorage.getItem('rkr_invoices') || '[]'),
      payments: JSON.parse(localStorage.getItem('rkr_payments') || '[]'),
      quotations: JSON.parse(localStorage.getItem('rkr_quotations') || '[]'),
    });
  }, []);

  useEffect(() => {
    const handleExport = () => {
      const csvContent = `KPI,Value\nTotal Leads,${totalLeads}\nConverted Leads,${convertedLeads}\nActive Clients,${activeClients}\nTotal Clients,${totalClients}\nTotal Projects,${totalProjects}\nActive Projects,${activeProjects}\nCompleted Projects,${completedProjects}\nTotal Invoiced,${totalInvoiced}\nTotal Paid,${totalPaid}\nOutstanding Amount,${outstandingAmount}`;
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analytics_overview_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    window.addEventListener('exportAnalytics', handleExport);
    return () => window.removeEventListener('exportAnalytics', handleExport);
  });

  // Filter Data
  const filteredLeads = filterByDateRange(data.leads, 'created_at', dateRange);
  const filteredClients = filterByDateRange(data.clients, 'created_at', dateRange);
  const filteredProjects = filterByDateRange(data.projects, 'created_at', dateRange);
  const filteredInvoices = filterByDateRange(data.invoices, 'issue_date', dateRange);
  const filteredPayments = filterByDateRange(data.payments, 'payment_date', dateRange);
  const filteredQuotations = filterByDateRange(data.quotations, 'date', dateRange);

  // Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // KPI Calculations
  const totalLeads = filteredLeads.length;
  const convertedLeads = filteredLeads.filter(l => l.status === 'Converted').length;
  const activeClients = filteredClients.filter(c => c.status === 'Active').length;
  const totalClients = filteredClients.length;
  
  const totalProjects = filteredProjects.length;
  const activeProjects = filteredProjects.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
  const completedProjects = filteredProjects.filter(p => p.status === 'Completed').length;

  const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalPaid = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const outstandingAmount = totalInvoiced - totalPaid;

  const totalQuotations = filteredQuotations.length;
  const acceptedQuotations = filteredQuotations.filter(q => q.status === 'Accepted').length;

  // Chart Data Processing
  
  // 1. Revenue Over Time (Using payments based on month)
  const processRevenueByMonth = () => {
    const monthlyMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => monthlyMap[m] = 0);

    filteredPayments.forEach(pay => {
      const date = new Date(pay.payment_date);
      const month = months[date.getMonth()];
      monthlyMap[month] += Number(pay.amount);
    });

    return Object.keys(monthlyMap).map(name => ({ name, revenue: monthlyMap[name] })).filter(d => d.revenue > 0 || name === months[new Date().getMonth()]);
  };
  const revenueData = processRevenueByMonth();

  // 2. Leads vs Conversions
  const processLeadSources = () => {
    const sources = {};
    filteredLeads.forEach(l => {
      const src = l.source || 'Other';
      sources[src] = (sources[src] || 0) + 1;
    });
    return Object.keys(sources).map(name => ({ name, count: sources[name] })).sort((a,b) => b.count - a.count);
  };
  const leadSourceData = processLeadSources();
  const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#E0E7FF'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* EXECUTIVE KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue KPI */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(totalPaid)}</h3>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-gray-500">Outstanding: <span className="text-orange-600">{formatCurrency(outstandingAmount)}</span></span>
            <span className="text-gray-500">Invoiced: {formatCurrency(totalInvoiced)}</span>
          </div>
        </div>

        {/* Lead KPI */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Volume</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{totalLeads}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Users size={20} />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> {convertedLeads} Converted</span>
            <span className="text-gray-500">{totalLeads > 0 ? Math.round((convertedLeads/totalLeads)*100) : 0}% Win Rate</span>
          </div>
        </div>

        {/* Client KPI */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Clients</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{activeClients}</h3>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <UserPlus size={20} />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-gray-500">Total Database: {totalClients}</span>
          </div>
        </div>

        {/* Projects KPI */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Projects</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{activeProjects}</h3>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> {completedProjects} Completed</span>
            <span className="text-gray-500">Total: {totalProjects}</span>
          </div>
        </div>

      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" /> Revenue Growth (Monthly)
          </h3>
          <div className="h-[300px] w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">Not enough data to render chart</div>
            )}
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
            <Layout size={16} className="text-blue-600" /> Top Lead Sources
          </h3>
          <div className="h-[240px] w-full">
            {leadSourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">No leads found</div>
            )}
          </div>
          
          <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto pr-2">
            {leadSourceData.map((src, i) => (
              <div key={src.name} className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-gray-700">{src.name}</span>
                </div>
                <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">{src.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
