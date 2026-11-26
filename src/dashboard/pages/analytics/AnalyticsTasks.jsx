import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckSquare, Clock, AlertCircle, PlayCircle } from 'lucide-react';
import { filterByDateRange } from './AnalyticsUtils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AnalyticsTasks() {
  const { dateRange } = useOutletContext();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    setTasks(JSON.parse(localStorage.getItem('rkr_tasks') || '[]'));
  }, []);

  const filteredTasks = filterByDateRange(tasks, 'created_at', dateRange);

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress' || t.status === 'Review').length;
  const overdueTasks = filteredTasks.filter(t => {
    if (t.status === 'Completed') return false;
    const due = new Date(t.due_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    return due < today;
  }).length;

  useEffect(() => {
    const handleExport = () => {
      const csvContent = `KPI,Value\nTotal Tasks,${totalTasks}\nCompleted,${completedTasks}\nIn Progress,${inProgressTasks}\nOverdue,${overdueTasks}\n\n`;
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analytics_tasks_${dateRange}.csv`);
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
    filteredTasks.forEach(t => {
      statuses[t.status] = (statuses[t.status] || 0) + 1;
    });
    return Object.keys(statuses).map(name => ({ name, value: statuses[name] }));
  };
  const statusData = processStatus();
  const COLORS = ['#94A3B8', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tasks</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{totalTasks}</h3>
          </div>
          <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center"><CheckSquare size={20}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
            <h3 className="text-3xl font-black text-green-600 mt-1">{completedTasks}</h3>
          </div>
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle size={20}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Progress</p>
            <h3 className="text-3xl font-black text-blue-600 mt-1">{inProgressTasks}</h3>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><PlayCircle size={20}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overdue</p>
            <h3 className="text-3xl font-black text-red-600 mt-1">{overdueTasks}</h3>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><AlertCircle size={20}/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-wider">Task Status Distribution</h3>
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

// Temporary CheckCircle icon component since it wasn't imported from lucide
function CheckCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
