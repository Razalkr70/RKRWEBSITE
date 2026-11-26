export const checkAndGenerateNotifications = () => {
  const safeParse = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  
  const existingNotifications = safeParse('rkr_notifications');
  let newNotifications = [];

  const addNotification = (notif) => {
    // Check if already exists to prevent duplicates (by related_entity_id + type)
    const exists = existingNotifications.find(n => n.related_entity_id === notif.related_entity_id && n.type === notif.type);
    if (!exists) {
      newNotifications.push({
        notification_id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        priority: notif.priority || 'Informational',
        related_entity_type: notif.related_entity_type,
        related_entity_id: notif.related_entity_id,
        url: notif.url,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  };

  const now = new Date();
  
  // Leads: Follow-ups
  const leads = safeParse('rkr_leads');
  leads.forEach(l => {
    if (l.followUp) {
      const followUpDate = new Date(l.followUp);
      if (followUpDate < now && l.status !== 'Converted' && l.status !== 'Lost') {
        addNotification({
          title: `Lead Follow-up Overdue`,
          message: `Follow up with ${l.name} (${l.company || 'No Company'}) was due on ${followUpDate.toLocaleDateString()}`,
          type: 'lead_follow_up_overdue',
          priority: 'Warning',
          related_entity_type: 'Lead',
          related_entity_id: l.id,
          url: `/dashboard/leads/${l.id}`
        });
      } else if (followUpDate.toDateString() === now.toDateString()) {
        addNotification({
          title: `Lead Follow-up Today`,
          message: `Follow up with ${l.name} today`,
          type: 'lead_follow_up_today',
          priority: 'Important',
          related_entity_type: 'Lead',
          related_entity_id: l.id,
          url: `/dashboard/leads/${l.id}`
        });
      }
    }
  });

  // Projects: Deadlines
  const projects = safeParse('rkr_projects');
  projects.forEach(p => {
    if (p.deadline && p.status !== 'Completed' && p.status !== 'Cancelled') {
      const deadline = new Date(p.deadline);
      if (deadline < now) {
        addNotification({
          title: `Project Overdue`,
          message: `Project ${p.name} for ${p.client_name} is past its deadline`,
          type: 'project_overdue',
          priority: 'Warning',
          related_entity_type: 'Project',
          related_entity_id: p.id,
          url: `/dashboard/projects/${p.id}`
        });
      }
    }
  });

  // Tasks: Due Dates
  const tasks = safeParse('rkr_tasks');
  tasks.forEach(t => {
    if (t.dueDate && t.status !== 'Completed' && t.status !== 'Cancelled') {
      const due = new Date(t.dueDate);
      if (due < now) {
        addNotification({
          title: `Task Overdue`,
          message: `Task "${t.title}" is overdue`,
          type: 'task_overdue',
          priority: 'Warning',
          related_entity_type: 'Task',
          related_entity_id: t.id,
          url: `/dashboard/tasks`
        });
      }
    }
  });

  // Invoices: Overdue
  const invoices = safeParse('rkr_invoices');
  invoices.forEach(inv => {
    if (inv.due_date && inv.status !== 'Paid' && inv.status !== 'Cancelled') {
      const due = new Date(inv.due_date);
      if (due < now) {
        addNotification({
          title: `Invoice Overdue`,
          message: `Invoice ${inv.invoice_id} for ${inv.client_name} is overdue`,
          type: 'invoice_overdue',
          priority: 'Critical',
          related_entity_type: 'Invoice',
          related_entity_id: inv.id,
          url: `/dashboard/finance/invoices/${inv.id}`
        });
      }
    }
  });

  // Communications: Follow-ups
  const comms = safeParse('rkr_communications');
  comms.forEach(c => {
    if (c.follow_up_required && c.status !== 'Completed' && c.follow_up_date) {
      const followUpDate = new Date(c.follow_up_date);
      if (followUpDate < now) {
        addNotification({
          title: `Communication Follow-up Overdue`,
          message: `Follow up with ${c.contact_name} is overdue`,
          type: 'comm_follow_up_overdue',
          priority: c.follow_up_priority === 'Urgent' ? 'Critical' : 'Warning',
          related_entity_type: 'Communication',
          related_entity_id: c.communication_id,
          url: `/dashboard/communications/${c.communication_id}`
        });
      } else if (followUpDate.toDateString() === now.toDateString()) {
        addNotification({
          title: `Communication Follow-up Today`,
          message: `Follow up with ${c.contact_name} is scheduled for today`,
          type: 'comm_follow_up_today',
          priority: 'Important',
          related_entity_type: 'Communication',
          related_entity_id: c.communication_id,
          url: `/dashboard/communications/${c.communication_id}`
        });
      }
    }
  });

  if (newNotifications.length > 0) {
    const updatedNotifications = [...newNotifications, ...existingNotifications];
    localStorage.setItem('rkr_notifications', JSON.stringify(updatedNotifications));
    return updatedNotifications;
  }
  
  return existingNotifications;
};
