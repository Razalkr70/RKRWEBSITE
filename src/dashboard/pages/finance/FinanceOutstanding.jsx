import React, { useState, useEffect, useMemo } from 'react';
import { Search, Clock, AlertCircle, FileText, Download, Send } from 'lucide-react';

export default function FinanceOutstanding() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setInvoices(JSON.parse(localStorage.getItem('rkr_invoices') || '[]'));
    setPayments(JSON.parse(localStorage.getItem('rkr_payments') || '[]'));
    setClients(JSON.parse(localStorage.getItem('rkr_clients') || '[]'));
  }, []);

  const getAmountPaid = (invNum) => {
    return payments.filter(p => p.invoice_id === invNum && p.status === 'Completed').reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const getDaysOverdue = (dueDateStr) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(dueDateStr);
    if (dueDate >= today) return 0;
    const diffTime = Math.abs(today - dueDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const outstandingInvoices = useMemo(() => {
    return invoices.map(inv => {
      const paid = getAmountPaid(inv.invoice_number);
      const due = inv.total - paid;
      const daysOverdue = getDaysOverdue(inv.due_date);
      const client = clients.find(c => c.id.toString() === inv.client_id?.toString());
      
      let status = inv.status;
      if (status !== 'Cancelled' && status !== 'Void') {
        if (due <= 0) status = 'Paid';
        else if (daysOverdue > 0) status = 'Overdue';
        else if (paid > 0) status = 'Partially Paid';
      }

      return {
        ...inv,
        amount_paid: paid,
        amount_due: due,
        days_overdue: daysOverdue,
        dynamic_status: status,
        client_name: client ? (client.company || client.name) : 'Unknown',
        client_phone: client?.phone || ''
      };
    }).filter(inv => inv.amount_due > 0 && inv.status !== 'Cancelled' && inv.status !== 'Void')
      .filter(inv => 
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inv.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.days_overdue - a.days_overdue); // Most overdue first
  }, [invoices, payments, clients, searchTerm]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const handleSendReminder = (inv) => {
    if (!inv.client_phone) {
      alert("Client does not have a phone number on record.");
      return;
    }
    const text = `Hi ${inv.client_name},\n\nThis is a friendly reminder that your invoice *${inv.invoice_number}* with an outstanding balance of *${formatCurrency(inv.amount_due)}* is ${inv.days_overdue > 0 ? `overdue by ${inv.days_overdue} days` : 'pending'}.\n\nPlease arrange the payment at your earliest convenience.\n\nThank you,\nRKR Solutions`;
    const phone = inv.client_phone.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.amount_due, 0);
  const totalOverdue = outstandingInvoices.filter(i => i.days_overdue > 0).reduce((sum, inv) => sum + inv.amount_due, 0);

  return (
    <div className="space-y-6">
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Outstanding</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{formatCurrency(totalOutstanding)}</h3>
          </div>
          <div className="p-4 rounded-xl bg-orange-50 text-orange-600">
            <Clock size={28} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Overdue (Past Due Date)</p>
            <h3 className="text-3xl font-black text-red-600 mt-1">{formatCurrency(totalOverdue)}</h3>
          </div>
          <div className="p-4 rounded-xl bg-red-50 text-red-600">
            <AlertCircle size={28} />
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search pending invoice or client..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Client & Invoice</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Invoice Total</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Amount Paid</th>
                <th className="py-4 px-6 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Balance Due</th>
                <th className="py-4 px-6 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {outstandingInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{inv.client_name}</div>
                    <div className="text-xs font-medium text-blue-600">{inv.invoice_number}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-700">{new Date(inv.due_date).toLocaleDateString()}</div>
                    {inv.days_overdue > 0 ? (
                      <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1">{inv.days_overdue} Days Overdue</div>
                    ) : (
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Pending</div>
                    )}
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-700">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="py-4 px-6 font-bold text-green-600">
                    {formatCurrency(inv.amount_paid)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="font-black text-orange-600 text-lg">{formatCurrency(inv.amount_due)}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleSendReminder(inv)} className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ml-auto cursor-pointer">
                      <Send size={14} /> Reminder
                    </button>
                  </td>
                </tr>
              ))}
              {outstandingInvoices.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center bg-white border border-gray-100 rounded-b-xl">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Clock size={48} className="mb-4 text-green-300" />
                      <p className="text-sm font-bold text-gray-700">No outstanding payments!</p>
                      <p className="text-xs text-gray-500 mt-1">All your clients are caught up.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
