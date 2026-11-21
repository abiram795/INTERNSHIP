// Initial realistic seed data for TaskFlow Pro
// Stored in localStorage on first run

export const INITIAL_USER = {
  id: 'usr_premium_01',
  name: 'Alex Morgan',
  email: 'alex.morgan@taskflow.io',
  role: 'Senior Product Lead',
  department: 'Product & Engineering',
  workspace: 'Acme SaaS Ventures',
  phone: '+1 (555) 234-8900',
  bio: 'Specializing in agile product delivery, distributed system design, and high-velocity engineering workflows.',
  timezone: 'America/New_York (EST)',
  avatar: null, // Will generate initials AM
  memberSince: 'March 2024'
};

export const INITIAL_SETTINGS = {
  theme: 'light', // 'light' | 'dark'
  defaultPriority: 'Medium',
  defaultStatus: 'To Do',
  autoArchiveCompleted: false,
  emailReminders: true,
  dailySummary: true,
  soundAlerts: false,
  compactView: false,
};

// Helper to get dates relative to today
const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS = [
  {
    id: 'task-101',
    title: 'Finalize Q3 Product Roadmap & OKRs',
    description: 'Synthesize feedback from enterprise design partners, align engineering capacity with executive goals, and publish finalized roadmap document.',
    status: 'In Progress',
    priority: 'Urgent',
    category: 'Product',
    dueDate: getRelativeDate(1), // Tomorrow
    createdAt: getRelativeDate(-4),
    subtasks: [
      { id: 'sub-1', title: 'Compile feedback from 12 key accounts', completed: true },
      { id: 'sub-2', title: 'Schedule engineering estimation sync', completed: true },
      { id: 'sub-3', title: 'Review milestone budgets with VP Finance', completed: false },
    ],
  },
  {
    id: 'task-102',
    title: 'Migrate Core Dashboard to Modern Grid Layout',
    description: 'Refactor widget rendering pipeline to use responsive grid breakpoints, optimize paint cycles, and enforce zero layout shifts.',
    status: 'In Review',
    priority: 'High',
    category: 'Engineering',
    dueDate: getRelativeDate(2),
    createdAt: getRelativeDate(-6),
    subtasks: [
      { id: 'sub-4', title: 'CSS Grid responsive tokens benchmark', completed: true },
      { id: 'sub-5', title: 'Cross-browser rendering tests (Chrome, Safari, Firefox)', completed: true },
      { id: 'sub-6', title: 'Accessibility audit for screen readers', completed: false },
    ],
  },
  {
    id: 'task-103',
    title: 'Design System Typography & Elevation Tokens',
    description: 'Harmonize font hierarchies, line heights, and shadow elevation tokens across web components in accordance with Figma master specs.',
    status: 'Completed',
    priority: 'Medium',
    category: 'Design',
    dueDate: getRelativeDate(-1),
    createdAt: getRelativeDate(-8),
    subtasks: [
      { id: 'sub-7', title: 'Audit legacy text styles', completed: true },
      { id: 'sub-8', title: 'Define semantic token variables', completed: true },
      { id: 'sub-9', title: 'Export token configuration package', completed: true },
    ],
  },
  {
    id: 'task-104',
    title: 'Implement Multi-Factor Authentication Flow',
    description: 'Build secure client-side TOTP input verification, recovery key generation UI, and intuitive error feedback modals.',
    status: 'In Progress',
    priority: 'High',
    category: 'Security',
    dueDate: getRelativeDate(0), // Today!
    createdAt: getRelativeDate(-3),
    subtasks: [
      { id: 'sub-10', title: 'Design TOTP 6-digit pin input component', completed: true },
      { id: 'sub-11', title: 'Add backup recovery key copy & download modal', completed: false },
    ],
  },
  {
    id: 'task-105',
    title: 'Prepare Enterprise Customer Onboarding Deck',
    description: 'Curate high-impact interactive onboarding slides demonstrating workflow automation, member provisioning, and SLA guarantees.',
    status: 'To Do',
    priority: 'Medium',
    category: 'Marketing',
    dueDate: getRelativeDate(4),
    createdAt: getRelativeDate(-1),
    subtasks: [
      { id: 'sub-12', title: 'Draft value proposition highlights', completed: false },
      { id: 'sub-13', title: 'Include customer case study metrics', completed: false },
    ],
  },
  {
    id: 'task-106',
    title: 'Setup Automated Workspace Backup & Data Export',
    description: 'Provide frictionless JSON workspace snapshot exports and deterministic client-side schema validation for self-hosted backup storage.',
    status: 'Completed',
    priority: 'Low',
    category: 'Engineering',
    dueDate: getRelativeDate(-3),
    createdAt: getRelativeDate(-10),
    subtasks: [
      { id: 'sub-14', title: 'JSON serialization format schema', completed: true },
      { id: 'sub-15', title: 'Client-side blob file generator', completed: true },
    ],
  },
  {
    id: 'task-107',
    title: 'Quarterly Team Performance Calibration Review',
    description: 'Conduct 1-on-1 career progression check-ins, record development achievements, and prepare promotion recommendations.',
    status: 'To Do',
    priority: 'High',
    category: 'Management',
    dueDate: getRelativeDate(5),
    createdAt: getRelativeDate(-2),
    subtasks: [
      { id: 'sub-16', title: 'Gather peer review submissions', completed: false },
      { id: 'sub-17', title: 'Review sprint velocity benchmarks', completed: false },
    ],
  },
  {
    id: 'task-108',
    title: 'Refactor Notification Center & Unread Counter',
    description: 'Optimize notification state persistence in localStorage and add real-time badge count synchronization across tabs.',
    status: 'In Review',
    priority: 'Medium',
    category: 'Engineering',
    dueDate: getRelativeDate(3),
    createdAt: getRelativeDate(-5),
    subtasks: [
      { id: 'sub-18', title: 'Implement unread badge filter', completed: true },
      { id: 'sub-19', title: 'Add clear-all confirmation modal', completed: true },
    ],
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Task Due Today',
    message: 'Implement Multi-Factor Authentication Flow is scheduled for completion today.',
    type: 'warning',
    timestamp: '2 hours ago',
    read: false,
    taskId: 'task-104',
  },
  {
    id: 'notif-2',
    title: 'Milestone Completed',
    message: 'Setup Automated Workspace Backup & Data Export was marked as completed.',
    type: 'success',
    timestamp: 'Yesterday at 4:30 PM',
    read: false,
    taskId: 'task-106',
  },
  {
    id: 'notif-3',
    title: 'Roadmap Review Approaching',
    message: 'Finalize Q3 Product Roadmap & OKRs is due tomorrow. 1 subtask remains pending.',
    type: 'info',
    timestamp: '1 day ago',
    read: true,
    taskId: 'task-101',
  },
  {
    id: 'notif-4',
    title: 'Workspace Initialized',
    message: 'TaskFlow Pro workspace successfully configured with enterprise productivity defaults.',
    type: 'info',
    timestamp: '3 days ago',
    read: true,
  },
];

export const CATEGORIES = [
  'Product',
  'Engineering',
  'Design',
  'Marketing',
  'Security',
  'Management',
  'Operations',
  'Personal'
];

