import React, { useState } from 'react';
import { Search, Book, HelpCircle, Briefcase, DollarSign, Folder, BarChart2, Settings, MessageSquare, ExternalLink, Send, AlertTriangle, Monitor, Info, CheckCircle } from 'lucide-react';

const HELP_CATEGORIES = [
  { id: 'start', title: 'Getting Started', icon: Book, items: ['Understanding the Dashboard', 'Managing Leads', 'Managing Clients', 'Creating Projects', 'Managing Tasks'] },
  { id: 'sales', title: 'Sales & Business', icon: Briefcase, items: ['Services', 'Quotations', 'Communications', 'Follow-ups'] },
  { id: 'finance', title: 'Finance', icon: DollarSign, items: ['Invoices', 'Payments', 'Outstanding Payments', 'Financial Reports'] },
  { id: 'files', title: 'Files & Documents', icon: Folder, items: ['Client Assets', 'Uploading Files', 'Asset Versions', 'Asset Search'] },
  { id: 'analytics', title: 'Analytics & Reports', icon: BarChart2, items: ['Analytics', 'Dashboard Widgets', 'Reports', 'Exporting Reports'] },
  { id: 'system', title: 'System', icon: Settings, items: ['Settings', 'Notifications', 'Audit Logs', 'Global Search', 'User Profile'] },
];

const FAQS = [
  { q: 'How do I create a lead?', a: 'Open Leads → Add Lead → enter the required information → Save.' },
  { q: 'How do I convert a lead into a client?', a: 'Open the Lead → verify the information → Convert to Client.' },
  { q: 'How do I create a quotation?', a: 'Open Quotations → Create Quotation → select the client and services → add line items → save.' },
  { q: 'How do I record a payment?', a: 'Open Payments → Record Payment → select the invoice/client → enter payment information → save.' },
  { q: 'Where are client files stored?', a: 'Use Client Assets.' },
  { q: 'Where can I see communication history?', a: 'Open Communications or the Communications tab inside the relevant Lead, Client, or Project.' },
  { q: 'Where can I view business analytics?', a: 'Open Analytics.' },
  { q: 'Where can I generate business reports?', a: 'Open Reports.' },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('center'); // center, report
  const [reportForm, setReportForm] = useState({ title: '', module: 'Dashboard', description: '', priority: 'Low' });
  const [reportSuccess, setReportSuccess] = useState(false);

  const filteredCategories = HELP_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.items.length > 0 || cat.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredFaqs = FAQS.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportSubmit = (e) => {
    e.preventDefault();
    // Simulate backend submission for support ticket
    const audits = JSON.parse(localStorage.getItem('rkr_audit_logs') || '[]');
    audits.unshift({
      id: Date.now(),
      action: 'Support Ticket Created',
      module: 'System',
      user: 'Admin',
      details: `Reported issue in ${reportForm.module}: ${reportForm.title}`,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('rkr_audit_logs', JSON.stringify(audits));
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportForm({ title: '', module: 'Dashboard', description: '', priority: 'Low' });
      setActiveTab('center');
    }, 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto pb-20 space-y-6">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <HelpCircle size={32} /> Help & Support
          </h1>
          <p className="text-blue-100 max-w-xl">Find answers, learn how to use the system, or report a problem.</p>
        </div>
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-3 top-3 text-blue-300" size={20} />
          <input 
            type="text" 
            placeholder="Search help articles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('center')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'center' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Help Center
        </button>
        <button 
          onClick={() => setActiveTab('report')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'report' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Report a Problem
        </button>
      </div>

      {activeTab === 'center' && (
        <div className="space-y-8">
          
          {/* QUICK HELP CARDS */}
          {!searchQuery && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <Book className="text-blue-500 mb-2" size={24} />
                <h3 className="font-bold text-gray-900 text-sm">Getting Started</h3>
                <p className="text-xs text-gray-500 mt-1">Learn the basic workflow.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <Briefcase className="text-purple-500 mb-2" size={24} />
                <h3 className="font-bold text-gray-900 text-sm">Leads & Clients</h3>
                <p className="text-xs text-gray-500 mt-1">Manage enquiries and customers.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <DollarSign className="text-green-500 mb-2" size={24} />
                <h3 className="font-bold text-gray-900 text-sm">Finance</h3>
                <p className="text-xs text-gray-500 mt-1">Manage invoices and payments.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <BarChart2 className="text-orange-500 mb-2" size={24} />
                <h3 className="font-bold text-gray-900 text-sm">Analytics</h3>
                <p className="text-xs text-gray-500 mt-1">Understand business data.</p>
              </div>
            </div>
          )}

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* CATEGORIES */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Documentation</h2>
                {filteredCategories.length === 0 ? (
                  <div className="p-8 bg-gray-50 rounded-xl text-center border border-gray-100">
                    <p className="text-gray-500">No articles found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCategories.map(cat => (
                      <div key={cat.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                          <cat.icon size={18} className="text-blue-600" /> {cat.title}
                        </h3>
                        <ul className="space-y-2">
                          {cat.items.map((item, i) => (
                            <li key={i}>
                              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 hover:underline flex items-center gap-1">
                                <ExternalLink size={12} /> {item}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FAQ */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                {filteredFaqs.length === 0 ? (
                  <div className="p-8 bg-gray-50 rounded-xl text-center border border-gray-100">
                    <p className="text-gray-500">No FAQs found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFaqs.map((faq, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{faq.q}</h4>
                        <p className="text-sm text-gray-600">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-6">
              
              {/* CONTACT SUPPORT */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-600" /> Contact Support
                </h3>
                <div className="space-y-3">
                  <a href="mailto:support@rkrsolutions.com" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                    Email Support
                  </a>
                  <a href="tel:+1234567890" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                    Call Support
                  </a>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">Support hours: Mon-Fri, 9AM-6PM</p>
              </div>

              {/* SYSTEM INFORMATION */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Monitor size={18} className="text-gray-500" /> System Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Application</span>
                    <span className="font-semibold text-gray-900">RKR Admin Platform</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Version</span>
                    <span className="font-semibold text-gray-900">v1.1.0</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Environment</span>
                    <span className="font-semibold text-gray-900">Production</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="font-semibold text-gray-900">Oct 2026</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-gray-500">Status</span>
                    <span className="font-semibold text-green-600 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Operational</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6 border-b border-gray-100 pb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={24} className="text-orange-500" /> Report a Problem
            </h2>
            <p className="text-gray-500 text-sm mt-1">Describe the issue you're facing. Our technical team will review the logs.</p>
          </div>
          
          {reportSuccess ? (
            <div className="p-8 text-center bg-green-50 rounded-xl border border-green-100">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Problem Reported Successfully</h3>
              <p className="text-sm text-green-600">Your issue has been logged. Thank you for helping us improve the system.</p>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Issue Title</label>
                <input 
                  type="text" 
                  required
                  value={reportForm.title}
                  onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm" 
                  placeholder="E.g., Cannot upload PDF file"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Module</label>
                  <select 
                    value={reportForm.module}
                    onChange={(e) => setReportForm({...reportForm, module: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                  >
                    <option>Dashboard</option>
                    <option>Leads</option>
                    <option>Clients</option>
                    <option>Projects</option>
                    <option>Finance</option>
                    <option>Client Assets</option>
                    <option>Communications</option>
                    <option>Settings</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Priority</label>
                  <select 
                    value={reportForm.priority}
                    onChange={(e) => setReportForm({...reportForm, priority: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="Low">Low (Minor issue, workaround exists)</option>
                    <option value="Medium">Medium (Functionality impaired)</option>
                    <option value="High">High (Important feature broken)</option>
                    <option value="Critical">Critical (System crash/Data loss)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea 
                  required
                  rows="5"
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm resize-none" 
                  placeholder="Please provide details on how to reproduce the issue..."
                ></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Send size={16} /> Submit Report
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
