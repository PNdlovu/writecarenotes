'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Care Homes',
    href: '/carehomes',
    icon: Building2,
  },
  {
    name: 'Residents',
    href: '/residents',
    icon: Users,
  },
  {
    name: 'Care Plans',
    href: '/care-plans',
    icon: ClipboardList,
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: Calendar,
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 flex-shrink-0 items-center px-4">
            <img
              className="h-8 w-auto"
              src="/logo.svg"
              alt="Write Care Notes"
            />
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    pathname === item.href
                      ? 'text-gray-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
