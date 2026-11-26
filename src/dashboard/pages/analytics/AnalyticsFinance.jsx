import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { IndianRupee, CreditCard, TrendingUp } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { filterByDateRange } from './AnalyticsUtils';

export default function AnalyticsFinance() {
  const { dateRange } = useOutletContext();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    setPayments(JSON.parse(localStorage.getItem('rkr_payments') || '[]'));
    setInvoices(JSON.parse(localStorage.getItem('rkr_invoices') || '[]'));
  }, []);

  const filteredPayments = filterByDateRange(payments, 'payment_date', dateRange);
  const filteredInvoices = filterByDateRange(invoices, 'issue_date', dateRange);

  const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalPaid = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const outstandingAmount = totalInvoiced - totalPaid;

  useEffect(() => {
    const handleExport = () => {
      const csvContent = `KPI,Value\nTotal Invoiced,${totalInvoiced}\nTotal Paid,${totalPaid}\nOutstanding Amount,${outstandingAmount}\n\n`;
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `analytics_finance_${dateRange}.csv`);
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

  // Process Revenue Over Time
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{formatCurrency(totalPaid)}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><IndianRupee size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Outstanding Amount</p>
            <h3 className="text-3xl font-black text-orange-600 mt-1">{formatCurrency(outstandingAmount)}</h3>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><CreditCard size={24}/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Invoiced</p>
            <h3 className="text-3xl font-black text-blue-600 mt-1">{formatCurrency(totalInvoiced)}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><TrendingUp size={24}/></div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-wider">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevFin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevFin)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-400">No data</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
