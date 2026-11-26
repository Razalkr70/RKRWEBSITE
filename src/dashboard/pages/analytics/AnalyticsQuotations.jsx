import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { filterByDateRange } from './AnalyticsUtils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AnalyticsQuotations() {
  const { dateRange } = useOutletContext();
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    setQuotations(JSON.parse(localStorage.getItem('rkr_quotations') || '[]'));
  }, []);

  const filteredQuotations = filterByDateRange(quotations, 'date', dateRange);

  const totalQuotations = filteredQuotations.length;
  const acceptedQuotations = filteredQuotations.filter(q => q.status === 'Accepted').length;
  const rejectedQuotations = filteredQuotations.filter(q => q.status === 'Rejected').length;
  const pendingQuotations = filteredQuotations.filter(q => q.status === 'Draft' || q.status === 'Sent' || q.status === 'Viewed').length;

  const totalValue = filteredQuotations.reduce((sum, q) => sum + (Number(q.total) || 0), 0);
  const acceptedValue = filteredQuotations.filter(q => q.status === 'Accepted').reduce((sum, q) => sum + (Number(q.total) || 0), 0);

  useEffect(() => {
    const handleExport = () => {
      const csvContent = `KPI,Value\nTotal Quotations,${totalQuotations}\nAccepted,${acceptedQuotations}\nRejected,${rejectedQuotations}\nPending,${pendingQuotations}\nTotal Value,${totalValue}\nAccepted Value,${acceptedValue}\n\n`;
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analytics_quotations_${dateRange}.csv`);
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

  // Process Status Distribution
  const processStatus = () => {
    const statuses = {};
    filteredQuotations.forEach(q => {
      statuses[q.status] = (statuses[q.status] || 0) + 1;
    });
    return Object.keys(statuses).map(name => ({ name, value: statuses[name] }));
  };
  const statusData = processStatus();
  const COLORS = ['#94A3B8', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Quotations</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{totalQuotations}</h3>
          </div>
          <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center"><FileText size={20}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Accepted</p>
            <h3 className="text-3xl font-black text-green-600 mt-1">{acceptedQuotations}</h3>
          </div>
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle size={20}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
            <h3 className="text-3xl font-black text-orange-600 mt-1">{pendingQuotations}</h3>
          </div>
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Clock size={20}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Accepted Value</p>
            <h3 className="text-xl font-black text-blue-600 mt-1">{formatCurrency(acceptedValue)}</h3>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">₹</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-wider">Quotation Status Pipeline</h3>
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
