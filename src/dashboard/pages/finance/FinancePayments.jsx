import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Eye, CreditCard, X, Receipt, Download } from 'lucide-react';

export default function FinancePayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receiptToPrint, setReceiptToPrint] = useState(null);
  const [form, setForm] = useState({
    invoice_number: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Bank Transfer',
    reference: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const p = JSON.parse(localStorage.getItem('rkr_payments') || '[]');
    setPayments(p.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    
    setInvoices(JSON.parse(localStorage.getItem('rkr_invoices') || '[]'));
    setClients(JSON.parse(localStorage.getItem('rkr_clients') || '[]'));
  };

  const generatePaymentId = () => {
    const p = JSON.parse(localStorage.getItem('rkr_payments') || '[]');
    return `RKR-PAY-${(p.length + 1).toString().padStart(4, '0')}`;
  };

  const getAmountDue = (invNum) => {
    const inv = invoices.find(i => i.invoice_number === invNum);
    if (!inv) return 0;
    
    const paid = payments.filter(p => p.invoice_id === invNum).reduce((sum, p) => sum + Number(p.amount), 0);
    return inv.total - paid;
  };

  const handleInvoiceSelect = (invNum) => {
    const due = getAmountDue(invNum);
    setForm({ ...form, invoice_number: invNum, amount: due });
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!form.invoice_number) return alert("Please select an invoice.");
    if (Number(form.amount) <= 0) return alert("Amount must be greater than zero.");
    
    const due = getAmountDue(form.invoice_number);
    if (Number(form.amount) > due) {
      alert(`Payment exceeds the balance due (₹${due}).`);
      return;
    }

    const targetInvoice = invoices.find(i => i.invoice_number === form.invoice_number);

    const newPayment = {
      id: Date.now(),
      payment_id: generatePaymentId(),
      invoice_id: form.invoice_number,
      client_id: targetInvoice?.client_id,
      amount: Number(form.amount),
      payment_date: form.payment_date,
      payment_method: form.payment_method,
      reference: form.reference,
      created_by: 'Admin',
      created_at: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('rkr_payments') || '[]');
    localStorage.setItem('rkr_payments', JSON.stringify([newPayment, ...existing]));
    
    setShowPaymentModal(false);
    setForm({ invoice_number: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'Bank Transfer', reference: '' });
    loadData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(pay => {
      const client = clients.find(c => c.id.toString() === pay.client_id?.toString());
      const cName = client ? (client.company || client.name) : '';
      return pay.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
             pay.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
             cName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [payments, searchTerm, clients]);

  const handleExportCSV = () => {
    if (payments.length === 0) return alert("No data to export");
    const headers = ['Payment Ref', 'Date', 'Client', 'Invoice', 'Method', 'Reference', 'Amount'];
    const csvRows = [headers.join(',')];
    
    payments.forEach(pay => {
      const client = clients.find(c => c.id.toString() === pay.client_id?.toString());
      const cName = client ? (client.company || client.name) : 'Unknown';
      const row = [
        pay.payment_id,
        pay.payment_date,
        `"${cName}"`,
        pay.invoice_id,
        pay.payment_method,
        `"${pay.reference || ''}"`,
        pay.amount
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search payment ID, invoice, or client..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button onClick={handleExportCSV} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowPaymentModal(true)} className="bg-green-600 text-white hover:bg-green-700 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center">
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Payment Ref</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Client & Invoice</th>
                <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-wider">Method</th>
                <th className="py-4 px-6 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map(pay => {
                const client = clients.find(c => c.id.toString() === pay.client_id?.toString());
                
                return (
                  <tr key={pay.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-black text-gray-900">{pay.payment_id}</div>
                      {pay.reference && <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">Ref: {pay.reference}</div>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-700">{new Date(pay.payment_date).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 mb-1">{client ? (client.company || client.name) : 'Unknown'}</div>
                      <div className="text-xs font-medium text-blue-600">{pay.invoice_id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                        {pay.payment_method}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-black text-green-600 text-lg">{formatCurrency(pay.amount)}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => setReceiptToPrint(pay)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer" title="View Receipt">
                        <Receipt size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center bg-white border border-gray-100 rounded-b-xl">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CreditCard size={48} className="mb-4 text-gray-300" />
                      <p className="text-sm font-medium">No payments recorded.</p>
                      <button onClick={() => setShowPaymentModal(true)} className="mt-4 text-green-600 font-bold hover:underline cursor-pointer">Record a payment</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-black text-gray-900 text-lg flex items-center gap-2"><CreditCard className="text-green-600" size={20}/> Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer p-1"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSavePayment} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Allocate to Invoice *</label>
                <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm transition-all bg-gray-50 cursor-pointer font-semibold text-gray-900" value={form.invoice_number} onChange={e => handleInvoiceSelect(e.target.value)}>
                  <option value="">-- Select Pending Invoice --</option>
                  {invoices.filter(i => i.status !== 'Cancelled' && i.status !== 'Void' && getAmountDue(i.invoice_number) > 0).map(i => (
                    <option key={i.id} value={i.invoice_number}>
                      {i.invoice_number} (Due: ₹{getAmountDue(i.invoice_number).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Amount Received *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                  <input required type="number" min="1" step="0.01" className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-lg font-black text-gray-900 transition-all" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
                {form.invoice_number && (
                  <p className="text-xs font-bold text-gray-500 mt-2">Maximum allowed: ₹{getAmountDue(form.invoice_number).toLocaleString()}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Date</label>
                  <input required type="date" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-green-500 outline-none text-sm transition-all" value={form.payment_date} onChange={e => setForm({...form, payment_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-green-500 outline-none text-sm transition-all" value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})}>
                    <option>Bank Transfer</option>
                    <option>Credit Card</option>
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Cheque</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Transaction Reference (Optional)</label>
                <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-green-500 outline-none text-sm transition-all" placeholder="TXN ID, Cheque No, UTR..." value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm shadow cursor-pointer hover:bg-green-700">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT PRINT MODAL */}
      {receiptToPrint && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 md:p-8 animate-in fade-in backdrop-blur-sm print:bg-white print:p-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-full overflow-hidden print:shadow-none print:border-none print:rounded-none">
            
            {/* Modal Actions */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 no-print">
              <h3 className="font-black text-gray-900 text-lg">Payment Receipt</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-sm cursor-pointer flex items-center gap-2">
                  <Receipt size={16}/> Print Receipt
                </button>
                <button onClick={() => setReceiptToPrint(null)} className="text-gray-400 hover:text-gray-900 cursor-pointer p-1"><X size={24}/></button>
              </div>
            </div>

            {/* Printable Receipt Content */}
            <div className="p-8 md:p-12 overflow-y-auto print:p-0 print:overflow-visible">
              
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                <div className="text-left">
                  <h1 className="text-4xl font-black text-gray-200 uppercase tracking-tighter">Receipt</h1>
                  <p className="text-xl font-bold text-gray-900 mt-1">{receiptToPrint.payment_id}</p>
                  <p className="text-sm font-bold text-gray-500 mt-2">Date: {new Date(receiptToPrint.payment_date).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end text-right">
                  <img src="/logo.png" alt="RKR Solutions Logo" className="h-16 w-auto object-contain mb-3" />
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">RKR Solutions</h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Building Intelligent Digital Solutions</p>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="space-y-8">
                
                {/* Amount Box */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-sm font-bold text-green-700 uppercase tracking-wider">Amount Received</p>
                    <h2 className="text-4xl font-black text-green-700 mt-1">{formatCurrency(receiptToPrint.amount)}</h2>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-green-100">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-green-700 text-sm">Payment Successful</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-8 border-b border-gray-100 pb-8">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Received From</h4>
                    <p className="font-bold text-gray-900 text-lg">
                      {(() => {
                        const client = clients.find(c => c.id.toString() === receiptToPrint.client_id?.toString());
                        return client ? (client.company || client.name) : 'Unknown Client';
                      })()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Details</h4>
                    <div className="space-y-2 text-sm text-gray-700 font-medium">
                      <p><span className="text-gray-400 font-bold w-24 inline-block">Invoice No:</span> {receiptToPrint.invoice_id}</p>
                      <p><span className="text-gray-400 font-bold w-24 inline-block">Method:</span> {receiptToPrint.payment_method}</p>
                      {receiptToPrint.reference && (
                        <p><span className="text-gray-400 font-bold w-24 inline-block">Ref No:</span> {receiptToPrint.reference}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="text-center pt-8">
                  <p className="text-sm font-bold text-gray-900">Thank you for your business!</p>
                  <p className="text-xs font-medium text-gray-500 mt-1">This is a computer generated receipt and does not require a physical signature.</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
