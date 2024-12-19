import { type NavItem } from '@/types/navigation';

export const navItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: 'dashboard', 
    icon: '📊',
    pattern: /^\/[^/]+\/dashboard/
  },
  { 
    name: 'Facility', 
    href: 'facility', 
    icon: '🏥',
    pattern: /^\/[^/]+\/facility/
  },
  { 
    name: 'Staff', 
    href: 'staff', 
    icon: '👥',
    pattern: /^\/[^/]+\/staff/
  },
  { 
    name: 'Residents', 
    href: 'residents', 
    icon: '👴',
    pattern: /^\/[^/]+\/residents/
  },
  { 
    name: 'Schedule', 
    href: 'schedule', 
    icon: '📅',
    pattern: /^\/[^/]+\/schedule/
  },
  { 
    name: 'Reports', 
    href: 'reports', 
    icon: '📈',
    pattern: /^\/[^/]+\/reports/
  },
  { 
    name: 'Settings', 
    href: 'settings', 
    icon: '⚙️',
    pattern: /^\/[^/]+\/settings/
  }
];

export const adminNavItems: NavItem[] = [
  ...navItems,
  { 
    name: 'Admin', 
    href: 'admin', 
    icon: '🔑',
    pattern: /^\/[^/]+\/admin/,
    roles: ['ADMIN']
  }
];

export const organizationNavItems: NavItem[] = [
  { 
    name: 'Organization', 
    href: 'organization', 
    icon: '🏢',
    pattern: /^\/organization/
  },
  { 
    name: 'Care Homes', 
    href: 'carehomes', 
    icon: '🏥',
    pattern: /^\/carehomes/
  },
  { 
    name: 'Analytics', 
    href: 'analytics', 
    icon: '📊',
    pattern: /^\/analytics/
  }
];


