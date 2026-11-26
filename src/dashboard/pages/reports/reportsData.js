export const MOCK_REPORTS = [
  {
    report_id: 'rep-1',
    name: 'Monthly Revenue Report',
    description: 'Overview of revenue performance',
    report_type: 'Revenue',
    status: 'Active',
    tags: ['finance', 'monthly'],
    configuration: {
      date_range: 'This Month',
      filters: {},
      columns: ['Month', 'Service', 'Client', 'Amount'],
      grouping: 'Month',
      sorting: { column: 'Amount', direction: 'desc' },
      visualizations: ['KPI Summary', 'Line Chart', 'Table'],
      layout: { title: 'Monthly Revenue Report', showHeader: true, pageSize: 'A4' }
    },
    created_by: 'Admin',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
    last_generated_at: '2026-10-05T08:00:00Z',
    schedule: { frequency: 'Monthly', status: 'Active' }
  },
  {
    report_id: 'rep-2',
    name: 'Lead Pipeline Report',
    description: 'Current status of all active leads',
    report_type: 'Leads',
    status: 'Active',
    tags: ['sales', 'leads'],
    configuration: {
      date_range: 'Last 30 Days',
      filters: { status: ['New', 'Contacted', 'Qualified', 'Proposal Sent'] },
      columns: ['Lead Name', 'Company', 'Service', 'Status', 'Created Date'],
      grouping: 'Status',
      sorting: { column: 'Created Date', direction: 'desc' },
      visualizations: ['Bar Chart', 'Table'],
      layout: { title: 'Lead Pipeline Report', showHeader: true, pageSize: 'A4' }
    },
    created_by: 'Admin',
    created_at: '2026-09-15T14:30:00Z',
    updated_at: '2026-09-15T14:30:00Z',
    last_generated_at: '2026-10-04T16:45:00Z',
    schedule: null
  }
];

export const MOCK_GENERATIONS = [
  {
    generation_id: 'gen-1',
    report_id: 'rep-1',
    generated_at: '2026-10-05T08:00:00Z',
    format: 'PDF',
    status: 'Success',
    file_url: '#',
    error_message: null
  },
  {
    generation_id: 'gen-2',
    report_id: 'rep-2',
    generated_at: '2026-10-04T16:45:00Z',
    format: 'XLSX',
    status: 'Success',
    file_url: '#',
    error_message: null
  }
];

export const PREBUILT_TEMPLATES = [
  { id: 'tpl-1', name: 'Lead Pipeline Report', type: 'Leads', tags: ['Sales'] },
  { id: 'tpl-2', name: 'Client Overview Report', type: 'Clients', tags: ['Clients'] },
  { id: 'tpl-3', name: 'Project Status Report', type: 'Projects', tags: ['Projects'] },
  { id: 'tpl-4', name: 'Task Completion Report', type: 'Tasks', tags: ['Tasks'] },
  { id: 'tpl-5', name: 'Service Performance Report', type: 'Services', tags: ['Services'] },
  { id: 'tpl-6', name: 'Monthly Revenue Report', type: 'Revenue', tags: ['Finance'] },
  { id: 'tpl-7', name: 'Business Overview Report', type: 'Business Overview', tags: ['Management'] },
  { id: 'tpl-8', name: 'Communication Activity', type: 'Communications', tags: ['Communications'] }
];
