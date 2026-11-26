import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Send, Trash2, Edit, CreditCard } from 'lucide-react';

export default function FinanceInvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const allInvoices = JSON.parse(localStorage.getItem('rkr_invoices') || '[]');
    const foundInvoice = allInvoices.find(i => i.id.toString() === id.toString());
    
    if (foundInvoice) {
      setInvoice(foundInvoice);
      const allClients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
      setClient(allClients.find(c => c.id.toString() === foundInvoice.client_id.toString()));
      
      const allPayments = JSON.parse(localStorage.getItem('rkr_payments') || '[]');
      setPayments(allPayments.filter(p => p.invoice_id === foundInvoice.invoice_number));
    }
  }, [id]);

  if (!invoice) return <div className="p-10 text-center font-bold text-gray-500">Loading Invoice...</div>;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency, maximumFractionDigits: 0 }).format(amount || 0);
  };

  const amountPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const amountDue = invoice.total - amountPaid;
  
  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    if (amountPaid > 0) {
      alert("Cannot delete an invoice that has payments recorded. Please cancel or void the payments first.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      const allInvoices = JSON.parse(localStorage.getItem('rkr_invoices') || '[]');
      const filtered = allInvoices.filter(i => i.id.toString() !== id.toString());
      localStorage.setItem('rkr_invoices', JSON.stringify(filtered));
      navigate('/dashboard/finance/invoices');
    }
  };

  const numberToWordsINR = (num) => {
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; 
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : '';
    return str === '' ? 'Zero Only' : str;
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-20 relative print:max-w-none print:m-0 print:p-0 print:bg-white">
      
      {/* SUCCESS TOAST */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold">Invoice Sent</h4>
            <p className="text-xs text-gray-300">Client has been notified via WhatsApp.</p>
          </div>
        </div>
      )}

      {/* TOP ACTION BAR (Hidden in print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden no-print">
        <button onClick={() => navigate('/dashboard/finance/invoices')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
          <ArrowLeft size={16} /> Back to Invoices
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-sm font-bold text-red-600 hover:bg-red-100 transition-colors shadow-sm cursor-pointer">
            <Trash2 size={16} /> Delete
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <Printer size={16} /> Print / PDF
          </button>
          {amountDue > 0 && (
            <button onClick={() => navigate('/dashboard/finance/payments')} className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-bold text-green-700 hover:bg-green-100 transition-colors shadow-sm cursor-pointer">
              <CreditCard size={16} /> Record Payment
            </button>
          )}
          <button onClick={() => setShowToast(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
            <Send size={16} /> Send to Client
          </button>
        </div>
      </div>

      {/* INVOICE PAPER CONTAINER */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 md:p-12 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          
          {/* LEFT: Invoice Details */}
          <div className="text-left">
            <h1 className="text-4xl font-black text-gray-200 uppercase tracking-tighter">Invoice</h1>
            <p className="text-xl font-bold text-gray-900 mt-1">{invoice.invoice_number}</p>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p><span className="font-bold text-gray-400">Date:</span> <span className="font-semibold text-gray-900">{new Date(invoice.issue_date).toLocaleDateString()}</span></p>
              <p><span className="font-bold text-gray-400">Due:</span> <span className="font-semibold text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</span></p>
            </div>
          </div>

          {/* RIGHT: Company Details & Logo */}
          <div className="flex flex-col items-end text-right">
            <img src="/logo.png" alt="RKR Solutions Logo" className="h-16 w-auto object-contain mb-3" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">RKR Solutions</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Building Intelligent Digital Solutions</p>
            <div className="mt-2 text-xs font-medium text-gray-500 space-y-0.5">
              <p>razalkrdeveloper@gmail.com</p>
              <p>+91 8606230949</p>
              <p>www.rkrsolutions.com</p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-10 p-5 bg-gray-50 rounded-xl border border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Billed To</h3>
          <p className="text-lg font-black text-gray-900">{client?.company || client?.name || 'Unknown Client'}</p>
          {client?.email && <p className="text-sm text-gray-600 mt-1 font-medium">{client.email}</p>}
          {client?.phone && <p className="text-sm text-gray-600 font-medium">{client.phone}</p>}
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">Qty</th>
                <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Price</th>
                <th className="py-3 px-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900">{item.description}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-600 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-600 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="py-4 px-4 text-sm font-black text-gray-900 text-right">{formatCurrency(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
          <div className="w-full md:w-1/2 space-y-6">
            {invoice.payment_terms && (
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Payment Terms</h3>
                <p className="text-sm font-medium text-gray-700">{invoice.payment_terms}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Terms & Conditions</h3>
                <p className="text-xs font-medium text-gray-500 whitespace-pre-line leading-relaxed">{invoice.terms}</p>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-1/2 bg-gray-50 p-6 rounded-xl border border-gray-200 ml-auto">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm font-bold text-red-500">
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm font-bold text-gray-600">
                  <span>Tax Amount:</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-xl font-black text-gray-900 border-t border-gray-300 pt-4 mt-4">
                <span>Total Amount:</span>
                <div className="text-right">
                  <div>{formatCurrency(invoice.total)}</div>
                  <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest whitespace-nowrap">{numberToWordsINR(invoice.total)}</div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm font-bold text-green-600">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(amountPaid)}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(amountDue)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-lg font-black text-gray-900 tracking-tight">Thank you for your business!</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">RKR Solutions</p>
        </div>

      </div>
    </div>
  );
}
