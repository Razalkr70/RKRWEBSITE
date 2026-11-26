import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Edit, Copy, Download, Archive, Clock, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { MOCK_REPORTS, MOCK_GENERATIONS } from './reportsData';

export default function ReportViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('configuration');
  
  const report = MOCK_REPORTS.find(r => r.report_id === id) || MOCK_REPORTS[0];
  const generations = MOCK_GENERATIONS.filter(g => g.report_id === id) || [];

  return (
    <div className="dashboard-content report-viewer">
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="icon-btn" onClick={() => navigate('/dashboard/reports')} style={{ border: '1px solid var(--border-color)' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2>{report.name}</h2>
              <span className={`badge ${report.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                {report.status}
              </span>
            </div>
            <p className="dashboard-subtitle">{report.description}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" title="Edit">
            <Edit size={18} />
            <span>Edit</span>
          </button>
          <button className="btn btn-primary" title="Generate Report">
            <Play size={18} />
            <span>Generate Now</span>
          </button>
        </div>
      </div>

      <div className="content-card" style={{ padding: 0 }}>
        <div className="tabs-header" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 1.5rem' }}>
          <button 
            className={`tab-btn ${activeTab === 'configuration' ? 'active' : ''}`}
            onClick={() => setActiveTab('configuration')}
            style={{ padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'configuration' ? '2px solid var(--primary-color)' : '2px solid transparent', color: activeTab === 'configuration' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'configuration' ? '600' : 'normal', cursor: 'pointer' }}
          >
            Configuration
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{ padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'history' ? '2px solid var(--primary-color)' : '2px solid transparent', color: activeTab === 'history' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'history' ? '600' : 'normal', cursor: 'pointer' }}
          >
            Generation History
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
            style={{ padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'schedule' ? '2px solid var(--primary-color)' : '2px solid transparent', color: activeTab === 'schedule' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'schedule' ? '600' : 'normal', cursor: 'pointer' }}
          >
            Schedule
          </button>
        </div>

        <div className="tab-content" style={{ padding: '1.5rem' }}>
          {activeTab === 'configuration' && (
            <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div className="config-section">
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <FileText size={16} /> Basic Info
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div><strong style={{ display: 'block', fontSize: '0.875rem' }}>Report Type:</strong> {report.report_type}</div>
                  <div><strong style={{ display: 'block', fontSize: '0.875rem' }}>Tags:</strong> {report.tags.map(t => `#${t}`).join(' ')}</div>
                  <div><strong style={{ display: 'block', fontSize: '0.875rem' }}>Created:</strong> {new Date(report.created_at).toLocaleString()}</div>
                  <div><strong style={{ display: 'block', fontSize: '0.875rem' }}>Last Generated:</strong> {report.last_generated_at ? new Date(report.last_generated_at).toLocaleString() : 'Never'}</div>
                </div>
              </div>
              
              <div className="config-section">
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Clock size={16} /> Data Settings
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div><strong style={{ display: 'block', fontSize: '0.875rem' }}>Date Range:</strong> {report.configuration.date_range}</div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem' }}>Columns:</strong> 
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {report.configuration.columns.map(col => <span key={col} className="badge badge-outline">{col}</span>)}
                    </div>
                  </div>
                  <div><strong style={{ display: 'block', fontSize: '0.875rem' }}>Grouping:</strong> {report.configuration.grouping || 'None'}</div>
                </div>
              </div>

              <div className="config-section">
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Archive size={16} /> Output
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem' }}>Visualizations:</strong> 
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {report.configuration.visualizations.map(v => <span key={v} className="badge badge-outline">{v}</span>)}
                    </div>
                  </div>
                  <div><strong style={{ display: 'block', fontSize: '0.875rem' }}>Page Size:</strong> {report.configuration.layout.pageSize}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Format</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {generations.length > 0 ? (
                    generations.map(gen => (
                      <tr key={gen.generation_id}>
                        <td>{new Date(gen.generated_at).toLocaleString()}</td>
                        <td><span className="badge badge-outline">{gen.format}</span></td>
                        <td>
                          {gen.status === 'Success' ? (
                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <CheckCircle2 size={14} /> Success
                            </span>
                          ) : (
                            <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <XCircle size={14} /> Failed
                            </span>
                          )}
                        </td>
                        <td>
                          {gen.status === 'Success' ? (
                            <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                              <Download size={14} style={{ marginRight: '0.25rem' }} /> Download
                            </button>
                          ) : (
                            <span className="text-muted text-sm">{gen.error_message || 'Unknown error'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                        No generation history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div style={{ maxWidth: '500px' }}>
              {report.schedule ? (
                <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0 }}>Active Schedule</h4>
                    <span className="badge badge-success">Active</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div><strong style={{ display: 'block', fontSize: '0.875rem' }}>Frequency:</strong> {report.schedule.frequency}</div>
                    <div><strong style={{ display: 'block', fontSize: '0.875rem' }}>Next Run (Estimated):</strong> {new Date().toLocaleDateString()}</div>
                  </div>
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary">Edit Schedule</button>
                    <button className="btn btn-danger">Pause</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  <Clock size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h4 style={{ marginBottom: '0.5rem' }}>No Schedule Configured</h4>
                  <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Automate generation by setting up a schedule for this report.</p>
                  <button className="btn btn-primary">Setup Schedule</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
