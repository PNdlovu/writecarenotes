'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  BedIcon,
  BeakerIcon,
  HeartIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: typeof HomeIcon;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Residents',
    href: '/residents',
    icon: UsersIcon,
  },
  {
    name: 'Staff Scheduling',
    href: '/staff-scheduling',
    icon: CalendarIcon,
  },
  {
    name: 'Care Plans',
    href: '/care-plans',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Family Portal',
    href: '/family-portal',
    icon: UserGroupIcon,
  },
];

export function Sidebar() {
  const router = useRouter();

  return (
    <nav className="w-64 bg-white shadow-sm h-screen overflow-y-auto">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Care Home Manager
        </h1>
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
