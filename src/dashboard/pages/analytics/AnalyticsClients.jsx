import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserPlus, Users, Archive } from 'lucide-react';
import { filterByDateRange } from './AnalyticsUtils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AnalyticsClients() {
  const { dateRange } = useOutletContext();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    setClients(JSON.parse(localStorage.getItem('rkr_clients') || '[]'));
  }, []);

  const filteredClients = filterByDateRange(clients, 'created_at', dateRange);

  const totalClients = filteredClients.length;
  const activeClients = filteredClients.filter(c => c.status === 'Active').length;
  const archivedClients = filteredClients.filter(c => c.status === 'Archived' || c.status === 'Inactive').length;

  useEffect(() => {
    const handleExport = () => {
      const csvContent = `KPI,Value\nTotal Clients,${totalClients}\nActive Clients,${activeClients}\nArchived Clients,${archivedClients}\n\n`;
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analytics_clients_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    window.addEventListener('exportAnalytics', handleExport);
    return () => window.removeEventListener('exportAnalytics', handleExport);
  });

  // Client Acquisition Over Time
  const processClientGrowth = () => {
    const map = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => map[m] = 0);
    
    filteredClients.forEach(c => {
      const date = new Date(c.created_at);
      if (!isNaN(date)) {
        const month = months[date.getMonth()];
        map[month] += 1;
      }
    });
    
    return Object.keys(map).map(name => ({ name, clients: map[name] })).filter(d => d.clients > 0 || name === months[new Date().getMonth()]);
  };
  const growthData = processClientGrowth();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Clients</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{totalClients}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Clients</p>
            <h3 className="text-3xl font-black text-green-600 mt-1">{activeClients}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><UserPlus size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Archived / Inactive</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{archivedClients}</h3>
          </div>
          <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center"><Archive size={24}/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-wider">Client Acquisition</h3>
          <div className="h-[300px] w-full">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} />
                  <Bar dataKey="clients" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-400">No data</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
