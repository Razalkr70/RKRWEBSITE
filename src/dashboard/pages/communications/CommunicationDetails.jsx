import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, CheckCircle, CalendarClock, Phone, Mail, MessageSquare, Paperclip, Activity, FileText } from 'lucide-react';
import { logAuditAction } from '../../services/auditLogger';

export default function CommunicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
    const found = all.find(c => c.communication_id === id);
    if (found) {
      setData(found);
    }
  }, [id]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  const markCompleted = () => {
    const all = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
    const updated = all.map(c => c.communication_id === id ? { ...c, status: 'Completed', updated_at: new Date().toISOString() } : c);
    localStorage.setItem('rkr_communications', JSON.stringify(updated));
    setData({ ...data, status: 'Completed' });
    logAuditAction('Communications', id, 'Update', 'Marked communication as completed');
  };

  const getChannelIcon = (ch) => {
    const lower = ch?.toLowerCase() || '';
    if (lower.includes('whatsapp')) return <MessageSquare size={16} className="text-green-500" />;
    if (lower.includes('email')) return <Mail size={16} className="text-blue-500" />;
    if (lower.includes('phone') || lower.includes('call')) return <Phone size={16} className="text-gray-500" />;
    return <MessageSquare size={16} className="text-gray-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button className="icon-btn" onClick={() => navigate('/dashboard/communications')}><ArrowLeft size={20} /></button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-black text-gray-900">{data.communication_id}</h2>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                data.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {data.status || 'Pending'}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">{new Date(data.communication_date).toLocaleDateString()} at {data.communication_time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.status !== 'Completed' && (
            <button className="btn btn-outline text-green-600 border-green-200 hover:bg-green-50" onClick={markCompleted}>
              <CheckCircle size={16} /> Mark Completed
            </button>
          )}
          <button className="btn btn-primary bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/dashboard/communications/${id}/edit`)}>
            <Edit size={16} /> Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Communication Record</h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                {getChannelIcon(data.channel)}
                <span className="text-xs font-bold text-gray-700">{data.channel}</span>
                <span className="text-gray-300 mx-1">•</span>
                <span className="text-xs font-bold text-gray-700">{data.direction}</span>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-black text-gray-900 mb-2">{data.subject}</h4>
              <div className="inline-block px-2.5 py-1 rounded bg-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider mb-6">
                {data.communication_type}
              </div>
              
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {data.notes || <span className="text-gray-400 italic">No detailed notes provided.</span>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Activity size={18} className="text-blue-600"/> Activity Timeline</h3>
            </div>
            <div className="p-6">
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                  <p className="text-sm font-bold text-gray-900">Record Created</p>
                  <p className="text-xs text-gray-500">{new Date(data.created_at || data.communication_date).toLocaleString()}</p>
                </div>
                {data.updated_at && (
                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-gray-400 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <p className="text-sm font-bold text-gray-900">Record Updated</p>
                    <p className="text-xs text-gray-500">{new Date(data.updated_at).toLocaleString()}</p>
                  </div>
                )}
                {data.status === 'Completed' && (
                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    <p className="text-sm font-bold text-gray-900">Communication Completed</p>
                    <p className="text-xs text-gray-500">Marked as resolved</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Contact Information</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">{data.entity_type}</p>
                <p className="text-sm font-bold text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/dashboard/${data.entity_type.toLowerCase()}s/${data.entity_id}`)}>
                  {data.contact_name}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-blue-600 transition-colors">
                  <Phone size={16} className="mb-1" />
                  <span className="text-[10px] font-bold">Call</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-green-600 transition-colors">
                  <MessageSquare size={16} className="mb-1" />
                  <span className="text-[10px] font-bold">WhatsApp</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors">
                  <Mail size={16} className="mb-1" />
                  <span className="text-[10px] font-bold">Email</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-orange-50">
              <h3 className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-2"><CalendarClock size={14}/> Follow-up</h3>
            </div>
            <div className="p-4">
              {data.follow_up_required ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Scheduled Date</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(data.follow_up_date).toLocaleDateString()} at {data.follow_up_time || 'Anytime'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Priority</p>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      data.follow_up_priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                      data.follow_up_priority === 'High' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {data.follow_up_priority}
                    </span>
                  </div>
                  {data.follow_up_note && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mt-2">
                      <p className="text-xs font-medium text-gray-600">{data.follow_up_note}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No follow-up required.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2"><Paperclip size={14}/> Attachments</h3>
              <span className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">Add</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 italic text-center py-4">No attachments linked.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
