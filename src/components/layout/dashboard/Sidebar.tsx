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
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

type NavSection = {
  category: string;
  items: NavItem[];
};

const sidebarItems: NavSection[] = [
  // Core Modules
  {
    category: 'Core',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Overview and analytics',
      },
      {
        name: 'Care Homes',
        href: '/carehomes',
        icon: Building2,
        description: 'Manage care home properties',
      },
    ],
  },
  // Resident Care
  {
    category: 'Resident Care',
    items: [
      {
        name: 'Residents',
        href: '/residents',
        icon: Users,
        description: 'Resident management',
      },
      {
        name: 'Care Plans',
        href: '/care-plans',
        icon: ClipboardList,
        description: 'Care planning and assessments',
      },
      {
        name: 'Medical Records',
        href: '/medical-records',
        icon: Stethoscope,
        description: 'Health records and history',
      },
      {
        name: 'Medications',
        href: '/medications',
        icon: Pill,
        description: 'Medication management',
      },
    ],
  },
  // Staff Management
  {
    category: 'Staff Management',
    items: [
      {
        name: 'Staff Directory',
        href: '/staff',
        icon: UserCog,
        description: 'Staff records and roles',
      },
      {
        name: 'Schedule',
        href: '/schedule',
        icon: Calendar,
        description: 'Staff scheduling and rotas',
      },
      {
        name: 'Training',
        href: '/training',
        icon: GraduationCap,
        description: 'Staff training and development',
      },
    ],
  },
  // Operations
  {
    category: 'Operations',
    items: [
      {
        name: 'Incidents',
        href: '/incidents',
        icon: Bell,
        description: 'Incident reporting and tracking',
      },
      {
        name: 'Tasks',
        href: '/tasks',
        icon: ClipboardCheck,
        description: 'Task management',
      },
      {
        name: 'Documents',
        href: '/documents',
        icon: FileText,
        description: 'Document management',
      },
      {
        name: 'Communications',
        href: '/communications',
        icon: MessageSquare,
        description: 'Internal messaging',
      },
    ],
  },
  // Compliance & Reports
  {
    category: 'Compliance & Reports',
    items: [
      {
        name: 'Compliance',
        href: '/compliance',
        icon: ShieldCheck,
        description: 'Regulatory compliance',
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: FileBarChart,
        description: 'Analytics and reporting',
      },
      {
        name: 'Audits',
        href: '/audits',
        icon: BarChart3,
        description: 'Quality audits',
      },
      {
        name: 'Policies',
        href: '/policies',
        icon: BookOpen,
        description: 'Policies and procedures',
      },
    ],
  },
  // Settings
  {
    category: 'Settings',
    items: [
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'System configuration',
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
          "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r lg:static",
          "transform transition-transform duration-200 ease-in-out lg:transform-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex h-14 items-center justify-end px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Sidebar content */}
        <ScrollArea className="h-[calc(100vh-3.5rem)] pb-10">
          <div className="space-y-6 p-4">
            {sidebarItems.map((section) => (
              <div key={section.category} className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase px-3">
                  {section.category}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const href = `/${region}${item.href}`;
                    const isActive = pathname === href;

                    return (
                      <SidebarItem
                        key={item.href}
                        name={item.name}
                        href={href}
                        icon={item.icon}
                        isActive={isActive}
                      />
                    );
                  })}
                </div>
                {section.category !== 'Settings' && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
