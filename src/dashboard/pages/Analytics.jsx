import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, Users, Eye, MousePointerClick, 
  DollarSign, BarChart2, Calendar, Download, FileText, Settings, Clock, CheckCircle
} from 'lucide-react';

export default function Analytics() {
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    totalClients: 0,
    activeProjects: 0,
    totalRevenue: 0,
    conversionRate: 0,
    totalComms: 0
  });

  const [activeTab, setActiveTab] = useState('overview'); // overview, report_builder

  // Report Builder State
  const [reportType, setReportType] = useState('financials');
  const [dateRange, setDateRange] = useState('last_30');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ frequency: 'Weekly', email: '' });
  const [scheduledReports, setScheduledReports] = useState([]);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    // Calculate actual metrics from local storage
    const leads = JSON.parse(localStorage.getItem('rkr_leads') || '[]');
    const clients = JSON.parse(localStorage.getItem('rkr_clients') || '[]');
    const projects = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
    const invoices = JSON.parse(localStorage.getItem('rkr_invoices') || '[]');
    const schedules = JSON.parse(localStorage.getItem('rkr_scheduled_reports') || '[]');

    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => l.status === 'Converted').length;
    const conversionRate = totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
    
    const totalClients = clients.length;
    const activeProjects = projects.filter(p => p.status !== 'Completed' && p.status !== 'Cancelled').length;
    
    const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + Number(inv.total), 0);
    
    const comms = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
    const totalComms = comms.length;

    setMetrics({ totalLeads, totalClients, activeProjects, totalRevenue, conversionRate, totalComms });
    setScheduledReports(schedules);
  }, []);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Mock data fetching based on type
      let data = [];
      if (reportType === 'financials') {
        const invoices = JSON.parse(localStorage.getItem('rkr_invoices') || '[]');
        data = invoices.map(i => ({ ID: i.invoice_id, Client: i.client_id, Amount: i.total, Status: i.status }));
      } else if (reportType === 'leads') {
        const leads = JSON.parse(localStorage.getItem('rkr_leads') || '[]');
        data = leads.map(l => ({ Name: l.name, Company: l.company, Status: l.status, Value: l.value }));
      } else if (reportType === 'projects') {
        const projects = JSON.parse(localStorage.getItem('rkr_projects') || '[]');
        data = projects.map(p => ({ Name: p.name, Client: p.client_name, Status: p.status, Progress: `${p.progress}%` }));
      } else if (reportType === 'communications') {
        const comms = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
        data = comms.map(c => ({ Entity: c.entity_type, Contact: c.contact_name, Channel: c.channel, Subject: c.subject, Date: new Date(c.communication_date).toLocaleDateString() }));
      }
      setReportData(data);
      setIsGenerating(false);
    }, 800);
  };

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const headers = Object.keys(reportData[0]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + reportData.map(row => headers.map(h => `"${row[h]}"`).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rkr_report_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const syncWithBackend = async (schedules) => {
    setSyncStatus('Syncing to backend database...');
    try {
      const payload = {
        leads: JSON.parse(localStorage.getItem('rkr_leads') || '[]'),
        projects: JSON.parse(localStorage.getItem('rkr_projects') || '[]'),
        invoices: JSON.parse(localStorage.getItem('rkr_invoices') || '[]'),
        schedules: schedules
      };

      const response = await fetch('http://localhost:3001/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setSyncStatus('Auto-mailing scheduled and data synced to backend!');
        setTimeout(() => setSyncStatus(''), 4000);
      }
    } catch (error) {
      console.error(error);
      setSyncStatus('Error syncing with backend.');
    }
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    const newSchedule = {
      id: Date.now(),
      type: reportType,
      frequency: scheduleForm.frequency,
      email: scheduleForm.email,
      created_at: new Date().toISOString()
    };
    const newSchedules = [newSchedule, ...scheduledReports];
    setScheduledReports(newSchedules);
    localStorage.setItem('rkr_scheduled_reports', JSON.stringify(newSchedules));
    setShowScheduleModal(false);
    setScheduleForm({ frequency: 'Weekly', email: '' });
    
    // Call backend
    syncWithBackend(newSchedules);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BarChart2 className="text-blue-600" size={32} />
            Analytics & Reports
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Real-time business intelligence and automated reporting.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('report_builder')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'report_builder' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Report Builder
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Real Data KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={24} /></div>
                <span className="flex items-center text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                  <ArrowUpRight size={14} className="mr-1"/> Live
                </span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">{formatCurrency(metrics.totalRevenue)}</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Revenue (Paid)</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users size={24} /></div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">{metrics.totalClients}</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Clients</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><MousePointerClick size={24} /></div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">{metrics.totalLeads} <span className="text-lg text-gray-400 font-medium ml-1">({metrics.conversionRate}% win)</span></h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Leads</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle size={24} /></div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">{metrics.activeProjects}</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Projects</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">{metrics.totalComms}</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Comms</p>
            </div>
          </div>

          {/* Simple Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 mb-6">Revenue Growth (Simulated)</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {[40, 65, 55, 80, 75, 100].map((height, i) => (
                  <div key={i} className="flex flex-col items-center w-full group cursor-pointer">
                    <div className="w-full bg-blue-100 hover:bg-blue-600 transition-colors rounded-t-lg relative" style={{ height: `${height}%` }}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded transition-opacity">
                        ${(height * 842).toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-bold mt-3">M{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative">
              {syncStatus && (
                <div className="absolute top-4 right-4 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                  {syncStatus}
                </div>
              )}
              <h3 className="text-lg font-black text-gray-900 mb-6">Scheduled Reports</h3>
              <div className="space-y-4">
                {scheduledReports.length > 0 ? scheduledReports.map(sr => (
                  <div key={sr.id} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-blue-600"><Clock size={20}/></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 capitalize">{sr.type} Report</p>
                        <p className="text-xs text-gray-500 font-medium">To: {sr.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded uppercase tracking-wider">{sr.frequency}</span>
                  </div>
                )) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm font-bold text-gray-500">No scheduled reports</p>
                    <button onClick={() => setActiveTab('report_builder')} className="text-xs text-blue-600 font-bold mt-2 hover:underline">Create one in Report Builder</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'report_builder' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-black text-gray-900 mb-6">Advanced Report Builder</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Data Module</label>
                <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-sm">
                  <option value="financials">Financials & Invoices</option>
                  <option value="leads">Leads & Pipeline</option>
                  <option value="projects">Projects & Progress</option>
                  <option value="communications">Communications Log</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Date Range</label>
                <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-sm">
                  <option value="last_7">Last 7 Days</option>
                  <option value="last_30">Last 30 Days</option>
                  <option value="this_quarter">This Quarter</option>
                  <option value="this_year">This Year</option>
                  <option value="all_time">All Time</option>
                </select>
              </div>
              
              <div className="flex items-end gap-3">
                <button 
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="flex-1 bg-blue-600 text-white font-bold text-sm px-4 py-3 rounded-xl shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Run Report'}
                </button>
                <button onClick={() => setShowScheduleModal(true)} className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition-colors cursor-pointer" title="Schedule this report">
                  <Clock size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 min-h-[400px]">
            {!reportData ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-bold text-gray-500">Configure parameters and run the report to preview data.</p>
              </div>
            ) : reportData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="text-sm font-bold text-gray-500">No data found for the selected parameters.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-900">Previewing {reportData.length} records</h3>
                  <button onClick={handleExportCSV} className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm cursor-pointer">
                    <Download size={14} /> Export CSV
                  </button>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {Object.keys(reportData[0]).map(key => (
                          <th key={key} className="py-3 px-4 text-xs font-black text-gray-500 uppercase tracking-wider">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="py-3 px-4 text-sm font-medium text-gray-800">{val || '-'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-black text-gray-900">Schedule Report</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer"><X size={20}/></button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-1">Configuration to schedule:</p>
                <p className="text-sm font-bold text-blue-900 capitalize">{reportType} ({dateRange.replace('_', ' ')})</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Delivery Frequency</label>
                <select value={scheduleForm.frequency} onChange={e => setScheduleForm({...scheduleForm, frequency: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-600">
                  <option>Daily</option>
                  <option>Weekly (Mondays)</option>
                  <option>Monthly (1st of Month)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Delivery Email</label>
                <input required type="email" value={scheduleForm.email} onChange={e => setScheduleForm({...scheduleForm, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-600" placeholder="admin@rkrsolutions.com" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold text-sm px-4 py-3 rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
                Save Schedule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
