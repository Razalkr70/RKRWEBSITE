import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CheckCircle, Clock, CalendarDays, ExternalLink, MessageSquare } from 'lucide-react';
import { logAuditAction } from '../../services/auditLogger';

export default function FollowUpsList() {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState({
    today: [],
    upcoming: [],
    overdue: [],
    completed: []
  });

  useEffect(() => {
    loadFollowUps();
  }, []);

  const loadFollowUps = () => {
    const all = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
    const withFollowUps = all.filter(c => c.follow_up_required);
    
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    
    const today = [];
    const upcoming = [];
    const overdue = [];
    const completed = [];

    withFollowUps.forEach(c => {
      if (c.status === 'Completed') {
        completed.push(c);
        return;
      }

      if (c.follow_up_date === todayStr) {
        today.push(c);
      } else if (c.follow_up_date < todayStr) {
        overdue.push(c);
      } else {
        upcoming.push(c);
      }
    });

    // Sort by date
    today.sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));
    overdue.sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));
    upcoming.sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));
    completed.sort((a, b) => new Date(b.updated_at || b.follow_up_date) - new Date(a.updated_at || a.follow_up_date));

    setFollowUps({ today, upcoming, overdue, completed });
  };

  const markCompleted = (id) => {
    const all = JSON.parse(localStorage.getItem('rkr_communications') || '[]');
    const updated = all.map(c => c.communication_id === id ? { ...c, status: 'Completed', updated_at: new Date().toISOString() } : c);
    localStorage.setItem('rkr_communications', JSON.stringify(updated));
    logAuditAction('Communications', id, 'Update', 'Marked follow-up as completed');
    loadFollowUps();
  };

  const RenderSection = ({ title, icon, items, colorClass }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${colorClass}`}>
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          {icon} {title}
          <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{items.length}</span>
        </h3>
      </div>
      <div className="p-0">
        {items.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <tbody>
              {items.map((item) => (
                <tr key={item.communication_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 w-1/4">
                    <div className="font-semibold text-gray-900">{new Date(item.follow_up_date).toLocaleDateString()} {item.follow_up_time}</div>
                    <div className="text-xs text-gray-500">Priority: 
                      <span className={`ml-1 font-bold ${
                        item.follow_up_priority === 'Urgent' ? 'text-red-600' :
                        item.follow_up_priority === 'High' ? 'text-orange-600' : 'text-blue-600'
                      }`}>{item.follow_up_priority}</span>
                    </div>
                  </td>
                  <td className="p-4 w-1/4">
                    <div className="font-bold text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/dashboard/${item.entity_type.toLowerCase()}s/${item.entity_id}`)}>
                      {item.contact_name}
                    </div>
                    <div className="text-xs text-gray-500">{item.entity_type}</div>
                  </td>
                  <td className="p-4 w-1/3">
                    <div className="text-sm font-medium text-gray-800">{item.follow_up_note || item.subject}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="icon-btn" title="View Communication" onClick={() => navigate(`/dashboard/communications/${item.communication_id}`)}>
                        <ExternalLink size={16} />
                      </button>
                      {item.status !== 'Completed' && (
                        <button className="icon-btn text-green-600 hover:bg-green-50" title="Mark Completed" onClick={() => markCompleted(item.communication_id)}>
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm">
            No follow-ups in this category.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <RenderSection title="Overdue Follow-ups" icon={<Clock size={18} className="text-red-600" />} items={followUps.overdue} colorClass="bg-red-50/50" />
      <RenderSection title="Today's Follow-ups" icon={<CalendarClock size={18} className="text-blue-600" />} items={followUps.today} colorClass="bg-blue-50/30" />
      <RenderSection title="Upcoming Follow-ups" icon={<CalendarDays size={18} className="text-purple-600" />} items={followUps.upcoming} colorClass="bg-purple-50/30" />
      <RenderSection title="Completed Follow-ups" icon={<CheckCircle size={18} className="text-green-600" />} items={followUps.completed} colorClass="bg-green-50/30" />
    </div>
  );
}
