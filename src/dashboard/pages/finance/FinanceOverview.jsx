import React, { useState, useEffect } from 'react';
import { 
  FileText, CreditCard, DollarSign, Clock, 
  AlertCircle, TrendingUp, Calendar, CheckCircle2, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function FinanceOverview() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load actual data from local storage
    const localInvoices = JSON.parse(localStorage.getItem('rkr_invoices') || '[]');
    const localPayments = JSON.parse(localStorage.getItem('rkr_payments') || '[]');
    
    setInvoices(localInvoices);
    setPayments(localPayments);
    setIsLoading(false);
  }, []);

  // Format Currency Helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Calculations
  const totalInvoices = invoices.length;
  const totalPayments = payments.length;

  // Amount Invoiced (excluding Cancelled/Void)
  const validInvoices = invoices.filter(i => i.status !== 'Cancelled' && i.status !== 'Void');
  const totalInvoiced = validInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

  // Amount Paid
  const totalPaid = payments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);

  // Total Pending / Outstanding
  const totalPending = totalInvoiced - totalPaid;

  // Overdue Amount
  const today = new Date();
  today.setHours(0,0,0,0);
  const overdueInvoices = validInvoices.filter(inv => {
    const dueDate = new Date(inv.due_date);
    return dueDate < today && inv.status !== 'Paid';
  });
  
  let overdueAmount = 0;
  overdueInvoices.forEach(inv => {
    const invPayments = payments.filter(p => p.invoice_id === inv.invoice_id);
    const paidSoFar = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    overdueAmount += (Number(inv.total) - paidSoFar);
  });

  // This Month Revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthPayments = payments.filter(pay => {
    const payDate = new Date(pay.payment_date);
    return payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear;
  });
  const thisMonthRevenue = thisMonthPayments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);

  // Pending Payments count (Invoices that are not Paid or Cancelled)
  const pendingInvoicesCount = validInvoices.filter(i => i.status !== 'Paid').length;

  // Chart 1: Monthly Revenue Data (Last 6 Months)
  const monthlyRevenueData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthLabel = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const month = d.getMonth();
    
    const monthSum = payments.filter(pay => {
      const pDate = new Date(pay.payment_date);
      return pDate.getMonth() === month && pDate.getFullYear() === year;
    }).reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
    
    monthlyRevenueData.push({ name: monthLabel, Revenue: monthSum });
  }

  // Chart 2: Invoice Status Distribution
  const statusCounts = validInvoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  const COLORS = {
    'Paid': '#10B981', // Green
    'Partially Paid': '#3B82F6', // Blue
    'Sent': '#F59E0B', // Yellow
    'Overdue': '#EF4444', // Red
    'Draft': '#9CA3AF' // Gray
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-bold">
        <Activity className="animate-spin mr-2" /> Loading Financial Data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoiced', value: formatCurrency(totalInvoiced), icon: FileText, c: 'blue' },
          { label: 'Total Paid', value: formatCurrency(totalPaid), icon: CheckCircle2, c: 'green' },
          { label: 'Total Pending', value: formatCurrency(totalPending), icon: Clock, c: 'orange' },
          { label: 'Overdue Amount', value: formatCurrency(overdueAmount), icon: AlertCircle, c: 'red' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:border-blue-200 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{kpi.label}</p>
              <div className={`p-2 rounded-xl bg-${kpi.c}-50 text-${kpi.c}-600 group-hover:scale-110 transition-transform`}>
                <kpi.icon size={18} strokeWidth={2.5}/>
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'This Month Revenue', value: formatCurrency(thisMonthRevenue), icon: TrendingUp, c: 'emerald' },
          { label: 'Pending Invoices', value: pendingInvoicesCount, icon: Calendar, c: 'indigo' },
          { label: 'Total Invoices (Count)', value: totalInvoices, icon: FileText, c: 'gray' },
          { label: 'Total Payments (Count)', value: totalPayments, icon: CreditCard, c: 'gray' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:border-blue-200 transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{kpi.label}</p>
              <div className={`p-2 rounded-xl bg-${kpi.c}-50 text-${kpi.c}-600 group-hover:scale-110 transition-transform`}>
                <kpi.icon size={18} strokeWidth={2.5}/>
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" /> Revenue Over Time (Last 6 Months)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#6B7280' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#6B7280' }}
                  tickFormatter={(val) => `₹${(val/1000)}k`}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontWeight: 'bold' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="Revenue" fill="#1E3A8A" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <FileText size={16} className="text-blue-600" /> Invoice Status
          </h3>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#9CA3AF'} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-bold text-gray-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400">
                <FileText size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm font-bold">No active invoices found.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
