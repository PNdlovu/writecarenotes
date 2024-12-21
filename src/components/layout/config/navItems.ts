import { type NavItem } from '@/types/navigation';

export const navItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: '📊',
    pattern: /^\/dashboard/
  },
  { 
    name: 'Care Homes', 
    href: '/carehomes', 
    icon: '🏥',
    pattern: /^\/carehomes/
  },
  { 
    name: 'Residents', 
    href: '/residents', 
    icon: '👥',
    pattern: /^\/residents/
  },
  { 
    name: 'Care Plans', 
    href: '/care-plans', 
    icon: '📋',
    pattern: /^\/care-plans/
  },
  { 
    name: 'Schedule', 
    href: '/schedule', 
    icon: '📅',
    pattern: /^\/schedule/
  },
  { 
    name: 'Documents', 
    href: '/documents', 
    icon: '📄',
    pattern: /^\/documents/
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: '⚙️',
    pattern: /^\/settings/
  }
];
