import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Layers, TrendingUp } from 'lucide-react';
import { filterByDateRange } from './AnalyticsUtils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CORE_SERVICES = [
  "AI Solutions",
  "Web Development",
  "CRM & ERP Solutions",
  "Dashboards & Business Intelligence",
  "Automation Solutions",
  "Data Analytics",
  "E-Commerce Solutions"
];

export default function AnalyticsServices() {
  const { dateRange } = useOutletContext();
  const [data, setData] = useState({ leads: [], projects: [], quotations: [], payments: [] });

  useEffect(() => {
    setData({
      leads: JSON.parse(localStorage.getItem('rkr_leads') || '[]'),
      projects: JSON.parse(localStorage.getItem('rkr_projects') || '[]'),
      quotations: JSON.parse(localStorage.getItem('rkr_quotations') || '[]'),
      payments: JSON.parse(localStorage.getItem('rkr_payments') || '[]') // Assumes payments might not directly link to service, but we can try to infer if needed. Wait, invoices link to items which might link to services. For now, we use projects and quotations.
    });
  }, []);

  const filteredLeads = filterByDateRange(data.leads, 'created_at', dateRange);
  const filteredProjects = filterByDateRange(data.projects, 'created_at', dateRange);
  const filteredQuotations = filterByDateRange(data.quotations, 'date', dateRange);

  const servicePerformance = CORE_SERVICES.map(service => {
    const sLeads = filteredLeads.filter(l => l.service === service).length;
    const sProjects = filteredProjects.filter(p => p.service === service).length;
    const sQuots = filteredQuotations.filter(q => q.service === service).length;
    
    // Revenue could be calculated if we map projects -> invoices -> payments. For now, we just map project value or quotation value if accepted.
    const sRevenue = filteredQuotations
      .filter(q => q.service === service && q.status === 'Accepted')
      .reduce((sum, q) => sum + (Number(q.total) || 0), 0);

    return {
      service,
      leads: sLeads,
      projects: sProjects,
      quotations: sQuots,
      revenue: sRevenue
    };
  }).sort((a,b) => b.revenue - a.revenue);

  useEffect(() => {
    const handleExport = () => {
      const headers = ['Service', 'Leads', 'Projects', 'Quotations', 'Revenue'];
      const rows = [headers.join(',')];
      servicePerformance.forEach(s => {
        rows.push([`"${s.service}"`, s.leads, s.projects, s.quotations, s.revenue].join(','));
      });
      const csvContent = rows.join('\n');
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analytics_services_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    window.addEventListener('exportAnalytics', handleExport);
    return () => window.removeEventListener('exportAnalytics', handleExport);
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Services by Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" /> Projected Revenue by Service
          </h3>
          <div className="h-[300px] w-full">
            {servicePerformance.some(s => s.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicePerformance} layout="vertical" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} />
                  <YAxis type="category" dataKey="service" tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} width={120} />
                  <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} />
                  <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-400 font-bold text-sm">No revenue data</div>}
          </div>
        </div>

        {/* Top Services by Projects */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" /> Volume by Service
          </h3>
          <div className="h-[300px] w-full">
            {servicePerformance.some(s => s.projects > 0 || s.leads > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicePerformance} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="service" tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} />
                  <Bar dataKey="leads" name="Leads" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projects" name="Projects" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-400 font-bold text-sm">No volume data</div>}
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Service Performance Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Core Service</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Leads</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Quotations</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Projects</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Projected Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {servicePerformance.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{item.service}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600 text-center">{item.leads}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600 text-center">{item.quotations}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600 text-center">{item.projects}</td>
                  <td className="py-4 px-6 text-sm font-black text-green-600 text-right">{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
