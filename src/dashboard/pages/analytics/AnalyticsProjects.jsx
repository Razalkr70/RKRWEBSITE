import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Briefcase, CheckCircle, Clock } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { filterByDateRange } from './AnalyticsUtils';

export default function AnalyticsProjects() {
  const { dateRange } = useOutletContext();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(JSON.parse(localStorage.getItem('rkr_projects') || '[]'));
  }, []);

  const filteredProjects = filterByDateRange(projects, 'created_at', dateRange);

  const totalProjects = filteredProjects.length;
  const completedProjects = filteredProjects.filter(p => p.status === 'Completed').length;
  const activeProjects = filteredProjects.filter(p => p.status === 'In Progress' || p.status === 'Active').length;

  useEffect(() => {
    const handleExport = () => {
      const csvContent = `KPI,Value\nTotal Projects,${totalProjects}\nActive Projects,${activeProjects}\nCompleted Projects,${completedProjects}\n\n`;
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analytics_projects_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    window.addEventListener('exportAnalytics', handleExport);
    return () => window.removeEventListener('exportAnalytics', handleExport);
  });

  // Process Status Distribution
  const processStatus = () => {
    const statuses = {};
    filteredProjects.forEach(p => {
      statuses[p.status] = (statuses[p.status] || 0) + 1;
    });
    return Object.keys(statuses).map(name => ({ name, value: statuses[name] }));
  };
  const statusData = processStatus();
  
  const COLORS = ['#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Projects</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{totalProjects}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Briefcase size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Projects</p>
            <h3 className="text-3xl font-black text-orange-600 mt-1">{activeProjects}</h3>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Clock size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
            <h3 className="text-3xl font-black text-green-600 mt-1">{completedProjects}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle size={24}/></div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-wider">Project Status Distribution</h3>
          <div className="h-[300px] w-full">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" label>
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontWeight: 'bold' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-400">No data</div>}
          </div>
        </div>
      </div>

    </div>
  );
}
