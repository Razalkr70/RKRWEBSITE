import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, CalendarClock, Phone, Mail, FileText, Search, Plus, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { logAuditAction } from '../../services/auditLogger';

export default function CommunicationsList() {
  const navigate = useNavigate();
  const [communications, setCommunications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const raw = localStorage.getItem('rkr_communications');
    if (raw) {
      try {
        setCommunications(JSON.parse(raw));
      } catch (e) { console.error(e); }
    }
  }, []);

  const kpis = {
    total: communications.length,
    whatsapp: communications.filter(c => c.channel?.toLowerCase().includes('whatsapp')).length,
    emails: communications.filter(c => c.channel?.toLowerCase().includes('email')).length,
    calls: communications.filter(c => c.channel?.toLowerCase().includes('phone') || c.channel?.toLowerCase().includes('call')).length,
    meetings: communications.filter(c => c.channel?.toLowerCase().includes('meeting')).length,
    followUps: communications.filter(c => c.follow_up_required).length,
    pendingFollowUps: communications.filter(c => c.follow_up_required && c.status !== 'Completed').length,
  };

  const filteredData = communications.filter(c => 
    (c.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contact_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.communication_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this communication record?")) {
      const updated = communications.filter(c => c.communication_id !== id);
      setCommunications(updated);
      localStorage.setItem('rkr_communications', JSON.stringify(updated));
      logAuditAction('Communications', id, 'Delete', 'Communication record deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Total Records</h3>
            <div className="kpi-icon bg-blue-50 text-blue-600"><MessageSquare size={20} /></div>
          </div>
          <p className="kpi-value">{kpis.total}</p>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Pending Follow-ups</h3>
            <div className="kpi-icon bg-orange-50 text-orange-600"><CalendarClock size={20} /></div>
          </div>
          <p className="kpi-value">{kpis.pendingFollowUps}</p>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">WhatsApp / Calls</h3>
            <div className="kpi-icon bg-green-50 text-green-600"><Phone size={20} /></div>
          </div>
          <p className="kpi-value">{kpis.whatsapp} / {kpis.calls}</p>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Emails</h3>
            <div className="kpi-icon bg-purple-50 text-purple-600"><Mail size={20} /></div>
          </div>
          <p className="kpi-value">{kpis.emails}</p>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header flex-col md:flex-row gap-4">
          <h2 className="card-title">Communication History</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="search-box flex-1 md:w-64">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="search-input w-full"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-outline flex-shrink-0">
              <Filter size={18} />
            </button>
            <button className="btn btn-primary flex-shrink-0" onClick={() => navigate('/dashboard/communications/add')}>
              <Plus size={18} /> Add Log
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date / ID</th>
                <th>Contact</th>
                <th>Channel / Type</th>
                <th>Subject</th>
                <th>Direction</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((c) => (
                <tr key={c.communication_id}>
                  <td>
                    <div className="font-semibold text-gray-900">{new Date(c.communication_date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{c.communication_id}</div>
                  </td>
                  <td>
                    <div className="font-semibold text-gray-900">{c.contact_name}</div>
                    <div className="text-xs text-gray-500">{c.entity_type}</div>
                  </td>
                  <td>
                    <div className="font-medium text-gray-800 flex items-center gap-1">
                      {c.channel?.toLowerCase().includes('whatsapp') && <MessageSquare size={12} className="text-green-500"/>}
                      {c.channel?.toLowerCase().includes('email') && <Mail size={12} className="text-blue-500"/>}
                      {c.channel?.toLowerCase().includes('phone') && <Phone size={12} className="text-gray-500"/>}
                      {c.channel}
                    </div>
                    <div className="text-xs text-gray-500">{c.communication_type}</div>
                  </td>
                  <td>
                    <div className="font-medium text-gray-900 max-w-[200px] truncate">{c.subject}</div>
                    {c.follow_up_required && c.follow_up_date && (
                      <div className="text-xs text-orange-600 flex items-center gap-1 mt-0.5">
                        <CalendarClock size={10} /> {new Date(c.follow_up_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c.direction === 'Incoming' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                      {c.direction || 'Outgoing'}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      c.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      c.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {c.status || 'Completed'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons justify-end">
                      <button className="icon-btn" title="View" onClick={() => navigate(`/dashboard/communications/${c.communication_id}`)}>
                        <Eye size={16} />
                      </button>
                      <button className="icon-btn" title="Edit" onClick={() => navigate(`/dashboard/communications/${c.communication_id}/edit`)}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn text-red-500 hover:bg-red-50" title="Delete" onClick={() => handleDelete(c.communication_id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-1">No Communications Yet</h3>
                      <p className="text-sm text-gray-500 mb-4">Log your first call, email or meeting to build your history.</p>
                      <button className="btn btn-primary" onClick={() => navigate('/dashboard/communications/add')}>
                        <Plus size={18} /> Add Communication
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
