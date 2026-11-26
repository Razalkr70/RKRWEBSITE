import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, RefreshCw, FileText, Calendar, Download, Clock, Archive, FileSpreadsheet, Eye, Trash2, Copy, Play } from 'lucide-react';
import { MOCK_REPORTS, MOCK_GENERATIONS } from './reportsData';

export default function ReportsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [reports, setReports] = useState(MOCK_REPORTS);

  // Stats
  const activeReports = reports.filter(r => r.status === 'Active').length;
  const scheduledReports = reports.filter(r => r.schedule?.status === 'Active').length;
  const generatedReports = MOCK_GENERATIONS.filter(g => g.status === 'Success').length;
  const recentReports = MOCK_GENERATIONS.filter(g => {
    const genDate = new Date(g.generated_at);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return genDate > lastWeek;
  }).length;

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          report.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'All' || report.report_type === filterType;
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleGenerate = (id) => {
    alert(`Generating report ${id}... (Mock)`);
  };

  return (
    <div className="dashboard-content reports-module">
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Reports</h2>
          <p className="dashboard-subtitle">Generate, manage, and export business reports</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/reports/create')}>
            <Plus size={18} />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Total Reports</h3>
            <div className="kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-color)' }}>
              <FileText size={20} />
            </div>
          </div>
          <p className="kpi-value">{activeReports}</p>
          <p className="kpi-trend">Saved configurations</p>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Generated Reports</h3>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
              <Download size={20} />
            </div>
          </div>
          <p className="kpi-value">{generatedReports}</p>
          <p className="kpi-trend">Total successfully generated</p>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Scheduled Reports</h3>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)' }}>
              <Clock size={20} />
            </div>
          </div>
          <p className="kpi-value">{scheduledReports}</p>
          <p className="kpi-trend">Active scheduled reports</p>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Recent Reports</h3>
            <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--purple-color)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <p className="kpi-value">{recentReports}</p>
          <p className="kpi-trend">Generated recently</p>
        </div>
      </div>

      <div className="content-card mt-6">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3>Saved Reports</h3>
          <div className="filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search reports..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="form-select" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: '150px' }}>
              <option value="All">All Types</option>
              <option value="Leads">Leads</option>
              <option value="Clients">Clients</option>
              <option value="Projects">Projects</option>
              <option value="Revenue">Revenue</option>
              <option value="Finance">Finance</option>
            </select>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '130px' }}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Report Type</th>
                <th>Data Range</th>
                <th>Last Generated</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.report_id}>
                    <td>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted">{report.tags.map(t => `#${t}`).join(' ')}</div>
                    </td>
                    <td><span className="badge badge-outline">{report.report_type}</span></td>
                    <td>{report.configuration.date_range}</td>
                    <td>{new Date(report.last_generated_at).toLocaleDateString()}</td>
                    <td>
                      {report.schedule ? (
                        <span className="badge badge-warning">{report.schedule.frequency}</span>
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${report.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn" title="View Details" onClick={() => navigate(`/dashboard/reports/${report.report_id}`)}>
                          <Eye size={18} />
                        </button>
                        <button className="icon-btn primary-text" title="Generate" onClick={() => handleGenerate(report.report_id)}>
                          <Play size={18} />
                        </button>
                        <button className="icon-btn" title="Duplicate">
                          <Copy size={18} />
                        </button>
                        <button className="icon-btn text-danger" title="Archive">
                          <Archive size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="empty-state">
                      <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
                      <h3>No Reports Found</h3>
                      <p className="text-muted">No saved reports match your search criteria.</p>
                      <button className="btn btn-primary mt-4" onClick={() => navigate('/dashboard/reports/create')}>
                        Create Report
                      </button>
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
