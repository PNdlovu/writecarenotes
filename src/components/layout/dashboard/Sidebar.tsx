/**
 * @writecarenotes.com
 * @fileoverview Main sidebar navigation component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  Settings,
  X,
  Bell,
  UserCog,
  Stethoscope,
  Pill,
  Activity,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  FileBarChart,
  BookOpen,
  GraduationCap,
  Heart,
  Briefcase,
  BadgeHelp,
  Scale,
  Phone,
  Users2,
  Calculator,
  AlertTriangle,
  Droplets,
  BedDouble,
  Brain,
  HeartPulse,
  UserPlus,
  Receipt,
  PoundSterling,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Separator } from '@/components/ui/Separator';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
  color?: string;
  bgColor?: string;
}

interface NavSection {
  category: string;
  description: string;
  items: NavItem[];
}

const sidebarItems: NavSection[] = [
  // Core Modules
  {
    category: 'Overview',
    description: 'Core system features',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Key metrics and analytics',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        name: 'Care Homes',
        href: '/care-homes',
        icon: Building2,
        description: 'Manage care home properties',
        color: 'text-violet-600',
        bgColor: 'bg-violet-50'
      },
      {
        name: 'Smart Alerts',
        href: '/alerts',
        icon: Bell,
        description: 'Critical care alerts and notifications',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
      },
    ],
  },
  // Resident Care
  {
    category: 'Resident Care',
    description: 'Primary resident care management',
    items: [
      {
        name: 'Residents',
        href: '/residents',
        icon: Users,
        description: 'Resident profiles and records',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50'
      },
      {
        name: 'Care Plans',
        href: '/care-plans',
        icon: ClipboardList,
        description: 'Individual care planning',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        name: 'Pain Management',
        href: '/pain-management',
        icon: Brain,
        description: 'Pain assessment and management',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      },
      {
        name: 'Nutrition & Fluids',
        href: '/nutrition',
        icon: Droplets,
        description: 'Liquid and nutrition tracking',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
      },
      {
        name: 'Bed Management',
        href: '/bed-management',
        icon: BedDouble,
        description: 'Bed allocation and transfers',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      },
    ],
  },
  // Clinical Management
  {
    category: 'Clinical Care',
    description: 'Medical and clinical operations',
    items: [
      {
        name: 'Medical Records',
        href: '/medical-records',
        icon: Stethoscope,
        description: 'Health records and history',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50'
      },
      {
        name: 'Medications',
        href: '/medications',
        icon: Pill,
        description: 'Medication management',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        name: 'On-Call',
        href: '/oncall',
        icon: HeartPulse,
        description: 'On-call staff and emergency care',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      },
      {
        name: 'Incidents',
        href: '/incidents',
        icon: AlertTriangle,
        description: 'Incident reporting and tracking',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      },
      {
        name: 'Telehealth',
        href: '/telehealth',
        icon: Phone,
        description: 'Remote healthcare services',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
    ],
  },
  // Family & External
  {
    category: 'Family Portal',
    description: 'Family communication and access',
    items: [
      {
        name: 'Family Access',
        href: '/family-portal',
        icon: Users2,
        description: 'Family portal and communications',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        name: 'Access Management',
        href: '/access-management',
        icon: UserPlus,
        description: 'Portal access and permissions',
        color: 'text-violet-600',
        bgColor: 'bg-violet-50'
      },
      {
        name: 'Blog',
        href: '/blog',
        icon: BookOpen,
        description: 'News and updates',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
    ],
  },
  // Staff Management
  {
    category: 'Workforce',
    description: 'Staff and workforce management',
    items: [
      {
        name: 'Staff Directory',
        href: '/staff',
        icon: UserCog,
        description: 'Staff profiles and records',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50'
      },
      {
        name: 'Scheduling',
        href: '/scheduling',
        icon: Calendar,
        description: 'Rotas and shift management',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      },
      {
        name: 'Training',
        href: '/training',
        icon: GraduationCap,
        description: 'Staff development and training',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      },
      {
        name: 'HR Management',
        href: '/hr',
        icon: Briefcase,
        description: 'Human resources and policies',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50'
      },
    ],
  },
  // Finance
  {
    category: 'Finance',
    description: 'Financial operations and management',
    items: [
      {
        name: 'Accounting',
        href: '/accounting',
        icon: Calculator,
        description: 'General accounting and books',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
      },
      {
        name: 'Payroll',
        href: '/payroll',
        icon: PoundSterling,
        description: 'Staff payroll management',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        name: 'Billing',
        href: '/billing',
        icon: Receipt,
        description: 'Invoicing and payments',
        color: 'text-violet-600',
        bgColor: 'bg-violet-50'
      },
      {
        name: 'Financial Reports',
        href: '/financial-reports',
        icon: FileBarChart,
        description: 'Financial analytics and reporting',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50'
      },
    ],
  },
  // Reports & Documentation
  {
    category: 'Intelligence',
    description: 'Reports and documentation',
    items: [
      {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'Business analytics',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
      },
      {
        name: 'Documents',
        href: '/documents',
        icon: FileText,
        description: 'Document management',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        name: 'Compliance',
        href: '/compliance',
        icon: ShieldCheck,
        description: 'Regulatory compliance',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
    ],
  },
  // Support
  {
    category: 'Support',
    description: 'Help and system settings',
    items: [
      {
        name: 'Help Center',
        href: '/help',
        icon: BadgeHelp,
        description: 'Support and documentation',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        name: 'Messages',
        href: '/messages',
        icon: MessageSquare,
        description: 'Internal communications',
        color: 'text-violet-600',
        bgColor: 'bg-violet-50'
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'System configuration',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50'
      },
    ],
  },
];

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const region = pathname.split('/')[1];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 transform bg-card shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close sidebar</span>
        </Button>

        {/* Sidebar content */}
        <ScrollArea className="h-full py-6">
          <div className="space-y-6 px-4">
            {sidebarItems.map((section) => (
              <div key={section.category} className="space-y-3">
                <div className="px-2">
                  <h4 className="text-sm font-semibold tracking-tight">
                    {section.category}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarItem
                      key={item.href}
                      name={item.name}
                      href={`/${region}${item.href}`}
                      icon={item.icon}
                      description={item.description}
                      isActive={pathname === `/${region}${item.href}`}
                      color={item.color}
                      bgColor={item.bgColor}
                    />
                  ))}
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
