export const getAuditLogs = () => {
  const safeParse = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  
  let existingLogs = safeParse('rkr_audit_logs');
  
  if (existingLogs.length === 0) {
    // Generate initial logs from existing data to avoid fake data but have real history
    const generated = [];
    
    safeParse('rkr_leads').forEach(l => {
      generated.push({ id: `al_l_${l.id}`, timestamp: l.created_at || l.date || new Date().toISOString(), user: 'Admin', module: 'Leads', record: l.name, action: 'Create', description: `Lead created via ${l.source}`, status: 'Success' });
      if (l.updated_at) generated.push({ id: `al_lu_${l.id}`, timestamp: l.updated_at, user: 'Admin', module: 'Leads', record: l.name, action: 'Update', description: `Lead updated`, status: 'Success' });
    });

    safeParse('rkr_projects').forEach(p => {
      generated.push({ id: `al_p_${p.id}`, timestamp: p.created_at || new Date().toISOString(), user: 'Admin', module: 'Projects', record: p.name, action: 'Create', description: `Project created for ${p.client_name}`, status: 'Success' });
    });

    safeParse('rkr_invoices').forEach(inv => {
      generated.push({ id: `al_i_${inv.id}`, timestamp: inv.created_at || inv.issue_date || new Date().toISOString(), user: 'Admin', module: 'Finance', record: inv.invoice_id, action: 'Create', description: `Invoice generated`, status: 'Success' });
    });

    // Sort by timestamp desc
    generated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    localStorage.setItem('rkr_audit_logs', JSON.stringify(generated));
    existingLogs = generated;
  }
  
  return existingLogs;
};

export const logAuditAction = (module, record, action, description, status = 'Success') => {
  const logs = getAuditLogs();
  const newLog = {
    id: `al_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    user: 'Admin',
    module,
    record,
    action,
    description,
    status
  };
  const updatedLogs = [newLog, ...logs];
  localStorage.setItem('rkr_audit_logs', JSON.stringify(updatedLogs));
  return updatedLogs;
};
