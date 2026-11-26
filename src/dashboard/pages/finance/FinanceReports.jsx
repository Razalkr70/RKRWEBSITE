import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { BarChart2, PieChart, TrendingUp } from 'lucide-react';

export default function FinanceReports() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    setPayments(JSON.parse(localStorage.getItem('rkr_payments') || '[]'));
    setInvoices(JSON.parse(localStorage.getItem('rkr_invoices') || '[]'));
    setClients(JSON.parse(localStorage.getItem('rkr_clients') || '[]'));
  }, []);

  // Prepare Client Revenue Data
  const clientRevenue = clients.map(client => {
    const clientPayments = payments.filter(p => p.client_id?.toString() === client.id.toString());
    const total = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    return { name: client.company || client.name, Revenue: total };
  }).filter(c => c.Revenue > 0).sort((a,b) => b.Revenue - a.Revenue).slice(0, 5); // Top 5 clients

  // Prepare Daily Cashflow (Last 14 days)
  const cashflowData = [];
  for(let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    
    const daySum = payments.filter(pay => {
      const pDate = new Date(pay.payment_date);
      pDate.setHours(0,0,0,0);
      return pDate.getTime() === d.getTime();
    }).reduce((sum, pay) => sum + Number(pay.amount), 0);
    
    cashflowData.push({ 
      name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      Amount: daySum 
    });
  }

  const formatYAxis = (val) => `₹${val >= 1000 ? (val/1000) + 'k' : val}`;

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Clients by Revenue */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <PieChart size={16} className="text-blue-600" /> Top Clients by Revenue
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientRevenue} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#111827', fontWeight: 'bold' }} width={100} />
                <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="Revenue" fill="#10B981" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 14 Day Cashflow */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" /> Cashflow (Last 14 Days)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => [`₹${val.toLocaleString()}`, 'Received']} />
                <Area type="monotone" dataKey="Amount" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
