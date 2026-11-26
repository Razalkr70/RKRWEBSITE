import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Filter, ArrowUpRight, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { filterByDateRange } from './AnalyticsUtils';

export default function AnalyticsLeads() {
  const { dateRange } = useOutletContext();
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    setLeads(JSON.parse(localStorage.getItem('rkr_leads') || '[]'));
  }, []);

  const filteredLeads = filterByDateRange(leads, 'created_at', dateRange);

  const totalLeads = filteredLeads.length;
  const convertedLeads = filteredLeads.filter(l => l.status === 'Converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  useEffect(() => {
    const handleExport = () => {
      const csvContent = `KPI,Value\nTotal Leads,${totalLeads}\nConverted Leads,${convertedLeads}\nConversion Rate,${conversionRate}%\n\n`;
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analytics_leads_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    window.addEventListener('exportAnalytics', handleExport);
    return () => window.removeEventListener('exportAnalytics', handleExport);
  });

  // Process Status Distribution
  const processStatusDistribution = () => {
    const statuses = {};
    filteredLeads.forEach(l => {
      statuses[l.status] = (statuses[l.status] || 0) + 1;
    });
    return Object.keys(statuses).map(name => ({ name, value: statuses[name] }));
  };
  const statusData = processStatusDistribution();

  // Process Lead Sources
  const processSources = () => {
    const sources = {};
    filteredLeads.forEach(l => {
      const src = l.source || 'Other';
      sources[src] = (sources[src] || 0) + 1;
    });
    return Object.keys(sources).map(name => ({ name, count: sources[name] }));
  };
  const sourceData = processSources();

  const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Leads</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{totalLeads}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Converted Leads</p>
            <h3 className="text-3xl font-black text-green-600 mt-1">{convertedLeads}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><ArrowUpRight size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conversion Rate</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{conversionRate}%</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><TrendingUp size={24}/></div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lead Status Funnel/Pie */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-wider">Lead Status Pipeline</h3>
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

        {/* Lead Sources Bar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-wider">Acquisition Sources</h3>
          <div className="h-[300px] w-full">
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#374151' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontWeight: 'bold' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-400">No data</div>}
          </div>
        </div>

      </div>

    </div>
  );
}
