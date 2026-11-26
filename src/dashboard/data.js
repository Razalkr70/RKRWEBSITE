export const MOCK_DATA = {
  kpis: {
    leads: { value: 128, trend: '+18.4%' },
    activeProjects: { value: 12, trend: '+3 this month' },
    clients: { value: 36, trend: '+5 this month' },
    pendingTasks: { value: 24, trend: '-8.2%' },
    openEnquiries: { value: 17, trend: '+4 today' },
    monthlyRevenue: { value: '₹2,48,500', trend: '+12.6%' }
  },
  recentLeads: [
    { id: 1, name: 'Arun', company: 'ABC Traders', service: 'Website', status: 'New', date: 'Oct 24, 2026' },
    { id: 2, name: 'Fahad', company: 'XYZ Business', service: 'Dashboard', status: 'Contacted', date: 'Oct 23, 2026' },
    { id: 3, name: 'Nihal', company: 'Startup Labs', service: 'AI Solution', status: 'Qualified', date: 'Oct 22, 2026' },
    { id: 4, name: 'Meera', company: 'Retail Group', service: 'Automation', status: 'Proposal', date: 'Oct 21, 2026' },
  ],
  activeProjects: [
    { id: 1, name: 'KNEXT', client: 'Knext Inc', progress: 82, deadline: 'Nov 15, 2026', team: 4, status: 'Development' },
    { id: 2, name: 'SAFIVESTAR', client: 'Safivestar LLC', progress: 68, deadline: 'Dec 01, 2026', team: 3, status: 'Testing' },
    { id: 3, name: 'BUSINESS CRM', client: 'Retail Group', progress: 45, deadline: 'Dec 20, 2026', team: 5, status: 'Development' },
  ],
  tasks: [
    { id: 1, title: 'Finalize Knext dashboard', project: 'KNEXT', priority: 'High', deadline: 'Today', assignee: 'RKR Admin', status: 'In Progress' },
    { id: 2, title: 'Prepare SafiVestar report', project: 'SAFIVESTAR', priority: 'Medium', deadline: 'Tomorrow', assignee: 'Sarah', status: 'To Do' },
    { id: 3, title: 'Client meeting', project: 'Internal', priority: 'High', deadline: 'Oct 25', assignee: 'RKR Admin', status: 'To Do' },
    { id: 4, title: 'Deploy website', project: 'ABC Traders', priority: 'High', deadline: 'Oct 26', assignee: 'Mike', status: 'Review' },
    { id: 5, title: 'Prepare proposal', project: 'Retail Group', priority: 'Low', deadline: 'Oct 28', assignee: 'Sarah', status: 'To Do' },
  ],
  activityFeed: [
    { id: 1, title: 'New lead received', desc: 'Arun from ABC Traders', time: '2 hours ago' },
    { id: 2, title: 'Project status updated', desc: 'SAFIVESTAR moved to Testing', time: '4 hours ago' },
    { id: 3, title: 'Client added', desc: 'Startup Labs signed up', time: '1 day ago' },
    { id: 4, title: 'Proposal sent', desc: 'Retail Group Automation', time: '2 days ago' },
    { id: 5, title: 'Payment received', desc: '₹45,000 from XYZ Business', time: '2 days ago' },
    { id: 6, title: 'Task completed', desc: 'Wireframes for Startup Labs', time: '3 days ago' },
  ],
  revenueData: [
    { name: 'Jan', revenue: 150000, project: 120000 },
    { name: 'Feb', revenue: 165000, project: 130000 },
    { name: 'Mar', revenue: 180000, project: 150000 },
    { name: 'Apr', revenue: 175000, project: 140000 },
    { name: 'May', revenue: 210000, project: 170000 },
    { name: 'Jun', revenue: 248500, project: 195000 },
  ],
  leadsData: [
    { name: 'Week 1', new: 12, qualified: 8, converted: 4 },
    { name: 'Week 2', new: 18, qualified: 10, converted: 5 },
    { name: 'Week 3', new: 24, qualified: 15, converted: 8 },
    { name: 'Week 4', new: 30, qualified: 18, converted: 12 },
  ],
  servicesPerformance: [
    { name: 'AI Solutions', enquiries: 45 },
    { name: 'Web Development', enquiries: 82 },
    { name: 'Dashboards', enquiries: 65 },
    { name: 'Automation', enquiries: 38 },
    { name: 'Business Software', enquiries: 55 },
  ],
  projectStatus: [
    { name: 'Planning', value: 3, color: '#64748B' },
    { name: 'Development', value: 6, color: '#2563EB' },
    { name: 'Testing', value: 2, color: '#F59E0B' },
    { name: 'Completed', value: 1, color: '#10B981' },
  ]
};
