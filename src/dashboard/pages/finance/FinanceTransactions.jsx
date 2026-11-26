import React, { useState, useEffect } from 'react';
import { Activity, FileText, CreditCard, Search } from 'lucide-react';

export default function FinanceTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const invoices = JSON.parse(localStorage.getItem('rkr_invoices') || '[]');
    const payments = JSON.parse(localStorage.getItem('rkr_payments') || '[]');
    const clients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');

    const getClientName = (id) => {
      const c = clients.find(c => c.id.toString() === id?.toString());
      return c ? (c.company || c.name) : 'Unknown Client';
    };

    let allActivity = [];

    invoices.forEach(inv => {
      allActivity.push({
        id: `inv-${inv.id}`,
        date: new Date(inv.created_at),
        type: 'Invoice Created',
        reference: inv.invoice_number,
        client: getClientName(inv.client_id),
        amount: inv.total,
        status: inv.status,
        icon: FileText,
        color: 'blue'
      });
    });

    payments.forEach(pay => {
      allActivity.push({
        id: `pay-${pay.id}`,
        date: new Date(pay.created_at),
        type: 'Payment Received',
        reference: pay.payment_id,
        invoice_ref: pay.invoice_id,
        client: getClientName(pay.client_id),
        amount: pay.amount,
        status: 'Successful',
        method: pay.payment_method,
        icon: CreditCard,
        color: 'green'
      });
    });

    allActivity.sort((a, b) => b.date - a.date);
    setTransactions(allActivity);
  }, []);

  const filtered = transactions.filter(t => 
    t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 relative">
        <div className="absolute left-[47px] md:left-[59px] top-8 bottom-8 w-px bg-gray-200"></div>
        
        <div className="space-y-8 relative z-10">
          {filtered.map(txn => (
            <div key={txn.id} className="flex items-start gap-4 md:gap-6">
              <div className={`w-12 h-12 rounded-full bg-${txn.color}-100 border-4 border-white shadow-sm flex items-center justify-center shrink-0 z-10`}>
                <txn.icon size={18} className={`text-${txn.color}-600`} />
              </div>
              <div className="flex-1 bg-gray-50 p-4 md:p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{txn.type}</h4>
                    <p className="text-sm font-medium text-gray-600 mt-0.5">{txn.client}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={`font-black text-lg text-${txn.color}-600`}>
                      {txn.type === 'Invoice Created' ? '' : '+'} {formatCurrency(txn.amount)}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{txn.date.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">Ref: {txn.reference}</span>
                  {txn.invoice_ref && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">Inv: {txn.invoice_ref}</span>}
                  {txn.method && <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{txn.method}</span>}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No transactions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
