import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, LayoutTemplate, Filter, Columns, BarChart2, CheckCircle2, Eye, FileText, Settings, AlignLeft, PieChart, TrendingUp, CheckSquare, Briefcase, Users, DollarSign, Image } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'leads', name: 'Leads', icon: <Users size={24} />, desc: 'Lead pipeline, conversion, sources' },
  { id: 'clients', name: 'Clients', icon: <Briefcase size={24} />, desc: 'Client list, acquisition, revenue' },
  { id: 'projects', name: 'Projects', icon: <LayoutTemplate size={24} />, desc: 'Project status, progress, deadlines' },
  { id: 'tasks', name: 'Tasks', icon: <CheckSquare size={24} />, desc: 'Task status, completion, overdue' },
  { id: 'services', name: 'Services', icon: <Settings size={24} />, desc: 'Service usage, projects, revenue' },
  { id: 'quotations', name: 'Quotations', icon: <FileText size={24} />, desc: 'Quotation volume, value, status' },
  { id: 'invoices', name: 'Invoices', icon: <DollarSign size={24} />, desc: 'Invoices issued, paid, outstanding' },
  { id: 'payments', name: 'Payments', icon: <DollarSign size={24} />, desc: 'Payments received, methods, status' },
  { id: 'revenue', name: 'Revenue', icon: <TrendingUp size={24} />, desc: 'Revenue trends and payment performance' },
  { id: 'communications', name: 'Communications', icon: <AlignLeft size={24} />, desc: 'Calls, WhatsApp, emails, enquiries' },
  { id: 'client_assets', name: 'Client Assets', icon: <Image size={24} />, desc: 'Assets by category, client, project' },
  { id: 'business_overview', name: 'Business Overview', icon: <PieChart size={24} />, desc: 'Combined high-level report' }
];

export default function ReportBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState({
    type: '',
    dateRange: 'This Month',
    filters: {},
    columns: [],
    grouping: '',
    visualizations: [],
    layout: { title: '', description: '', showHeader: true, pageSize: 'A4' }
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 8));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSave = () => {
    // Mock save
    alert('Report saved successfully!');
    navigate('/dashboard/reports');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="report-type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {REPORT_TYPES.map(type => (
              <div 
                key={type.id}
                className={`type-card ${config.type === type.id ? 'selected' : ''}`}
                style={{ 
                  padding: '1.5rem', 
                  border: `2px solid ${config.type === type.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: config.type === type.id ? 'rgba(37, 99, 235, 0.05)' : 'white'
                }}
                onClick={() => setConfig({ ...config, type: type.id })}
              >
                <div style={{ color: config.type === type.id ? 'var(--primary-color)' : 'var(--text-color)', marginBottom: '1rem' }}>
                  {type.icon}
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{type.name}</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>{type.desc}</p>
              </div>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h4 style={{ marginBottom: '1rem' }}>Data Range & Filters</h4>
            <div className="form-group">
              <label className="form-label">Date Range</label>
              <select 
                className="form-input" 
                value={config.dateRange} 
                onChange={(e) => setConfig({ ...config, dateRange: e.target.value })}
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="This Quarter">This Quarter</option>
                <option value="This Year">This Year</option>
                <option value="Custom">Custom Range</option>
              </select>
            </div>
            
            {config.type && (
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Additional Filters</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {config.type === 'leads' && (
                    <>
                      <select className="form-input"><option>Any Status</option><option>New</option><option>Qualified</option></select>
                      <select className="form-input"><option>Any Source</option><option>Website</option><option>Instagram</option></select>
                    </>
                  )}
                  {config.type === 'projects' && (
                    <>
                      <select className="form-input"><option>Any Status</option><option>In Progress</option><option>Completed</option></select>
                      <select className="form-input"><option>Any Client</option></select>
                    </>
                  )}
                  {['revenue', 'payments', 'invoices'].includes(config.type) && (
                    <>
                      <select className="form-input"><option>Any Status</option><option>Completed</option><option>Pending</option></select>
                      <select className="form-input"><option>Any Method</option><option>Bank Transfer</option><option>Cash</option></select>
                    </>
                  )}
                  {!['leads', 'projects', 'revenue', 'payments', 'invoices'].includes(config.type) && (
                    <div style={{ gridColumn: '1 / -1', padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No additional filters available for this report type.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h4 style={{ marginBottom: '1rem' }}>Select Columns</h4>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Choose which data columns to include in your report table.</p>
            <div style={{ padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {config.type ? `Available columns for ${config.type} would appear here with checkboxes.` : 'Please select a report type first.'}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-content">
            <h4 style={{ marginBottom: '1rem' }}>Grouping & Sorting</h4>
            <div className="form-group">
              <label className="form-label">Group By</label>
              <select className="form-input">
                <option value="">None</option>
                <option value="status">Status</option>
                <option value="month">Month</option>
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Sort By</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select className="form-input" style={{ flex: 1 }}>
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                </select>
                <select className="form-input" style={{ width: '150px' }}>
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="step-content">
            <h4 style={{ marginBottom: '1rem' }}>Visualization Options</h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['Table', 'Bar Chart', 'Line Chart', 'Pie Chart', 'KPI Summary'].map(v => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', flex: '1 1 200px' }}>
                  <input type="checkbox" />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="step-content">
            <h4 style={{ marginBottom: '1rem' }}>Report Layout</h4>
            <div className="form-group">
              <label className="form-label">Report Title</label>
              <input type="text" className="form-input" placeholder="e.g. Monthly Revenue Report" />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Description (Optional)</label>
              <textarea className="form-input" rows={3} placeholder="Add a brief summary or description..."></textarea>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Page Size</label>
              <select className="form-input">
                <option value="A4">A4 (Portrait)</option>
                <option value="A4-Landscape">A4 (Landscape)</option>
              </select>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="step-content">
            <h4 style={{ marginBottom: '1rem' }}>Report Preview</h4>
            <div style={{ 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              padding: '2rem',
              minHeight: '400px',
              backgroundColor: '#fff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>{config.type ? `${config.type.toUpperCase()} REPORT` : 'REPORT PREVIEW'}</h2>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>RKR Solutions — Building Intelligent Digital Solutions</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>{config.dateRange}</p>
              </div>
              
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                <Eye size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>A realistic preview based on selected data and visualizations will render here.</p>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="step-content">
            <h4 style={{ marginBottom: '1rem' }}>Save Report</h4>
            <div className="form-group">
              <label className="form-label">Report Name</label>
              <input type="text" className="form-input" placeholder="Final Report Name" />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Tags (Comma separated)</label>
              <input type="text" className="form-input" placeholder="finance, monthly, sales..." />
            </div>
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--success-color)' }}>Ready to Save</h5>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>This report configuration will be saved and can be generated or scheduled at any time.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const steps = ['Type', 'Data & Filters', 'Columns', 'Grouping', 'Visualization', 'Layout', 'Preview', 'Save'];

  return (
    <div className="dashboard-content report-builder">
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="icon-btn" onClick={() => navigate('/dashboard/reports')} style={{ border: '1px solid var(--border-color)' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2>Create Report</h2>
            <p className="dashboard-subtitle">Step {currentStep} of {steps.length}: {steps[currentStep - 1]}</p>
          </div>
        </div>
      </div>

      <div className="content-card">
        {/* Progress Bar */}
        <div className="builder-progress" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: 'var(--border-color)', zIndex: 0, transform: 'translateY(-50%)' }}></div>
          <div style={{ position: 'absolute', top: '50%', left: 0, width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, height: '2px', backgroundColor: 'var(--primary-color)', zIndex: 0, transform: 'translateY(-50%)', transition: 'width 0.3s ease' }}></div>
          
          {steps.map((step, index) => {
            const isActive = currentStep === index + 1;
            const isCompleted = currentStep > index + 1;
            return (
              <div key={index} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0 0.5rem' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isActive || isCompleted ? 'var(--primary-color)' : 'var(--background-color)',
                  color: isActive || isCompleted ? 'white' : 'var(--text-muted)',
                  border: `2px solid ${isActive || isCompleted ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {isCompleted ? <CheckCircle2 size={16} /> : (index + 1)}
                </div>
                <span style={{ fontSize: '0.75rem', color: isActive ? 'var(--text-color)' : 'var(--text-muted)', fontWeight: isActive ? '600' : 'normal' }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div className="builder-content" style={{ minHeight: '400px' }}>
          {renderStepContent()}
        </div>

        <div className="builder-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary" onClick={prevStep} disabled={currentStep === 1}>
            <ArrowLeft size={18} /> Back
          </button>
          
          {currentStep < 8 ? (
            <button className="btn btn-primary" onClick={nextStep} disabled={currentStep === 1 && !config.type}>
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={18} /> Save Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
