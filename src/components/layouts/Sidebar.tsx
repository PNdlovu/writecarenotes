'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  Settings,
  DollarSign,
  Calculator,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const sidebarItems = [
  { name: 'Dashboard', href: '/england/dashboard', icon: LayoutDashboard },
  { name: 'Residents', href: '/england/features/resident', icon: Users },
  { name: 'Assessments', href: '/england/features/assessments', icon: ClipboardList },
  { name: 'Calendar', href: '/england/features/calendar', icon: Calendar },
  { name: 'Documents', href: '/england/features/documents', icon: FileText },
  { name: 'Care Plans', href: '/england/features/careplans', icon: FileText },
  { name: 'Medications', href: '/england/features/medications', icon: FileText },
  { name: 'Activities', href: '/england/features/activities', icon: Calendar },
  { name: 'Clinical', href: '/england/features/clinical', icon: FileText },
  { name: 'Incidents', href: '/england/features/incidents', icon: FileText },
  { name: 'Bed Management', href: '/england/features/bed-management', icon: Users },
  { name: 'Staff', href: '/england/features/staff', icon: Users },
  { name: 'Communications', href: '/england/features/communications', icon: FileText },
  { name: 'Family Portal', href: '/england/features/family-portal', icon: Users },
  { name: 'Financial', href: '/england/features/financial', icon: DollarSign },
  { name: 'Accounting & Payroll', href: '/england/features/accounting', icon: Calculator },
  { name: 'Operations', href: '/england/features/operations', icon: FileText },
  { name: 'Analytics', href: '/england/features/analytics', icon: FileText },
  { name: 'Compliance', href: '/england/features/compliance', icon: FileText },
  { name: 'Audit', href: '/england/features/audit', icon: FileText },
  { name: 'Settings', href: '/england/features/settings', icon: Settings },
];

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('pb-12 min-h-screen', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href ? 'bg-accent' : 'transparent'
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
