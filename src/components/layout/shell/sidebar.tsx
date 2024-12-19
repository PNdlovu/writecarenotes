'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
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
  translationKey: string;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    translationKey: 'dashboard',
  },
  {
    name: 'Residents',
    href: '/residents',
    icon: UsersIcon,
    translationKey: 'residents',
  },
  {
    name: 'Staff Scheduling',
    href: '/staff-scheduling',
    icon: CalendarIcon,
    translationKey: 'staffScheduling',
  },
  {
    name: 'Care Plans',
    href: '/care-plans',
    icon: ClipboardDocumentListIcon,
    translationKey: 'carePlans',
  },
  {
    name: 'Bed Management',
    href: '/bed-management',
    icon: BedIcon,
    translationKey: 'bedManagement',
  },
  {
    name: 'Medications',
    href: '/medications',
    icon: BeakerIcon,
    translationKey: 'medications',
  },
  {
    name: 'Clinical',
    href: '/clinical',
    icon: HeartIcon,
    translationKey: 'clinical',
  },
  {
    name: 'Assessments',
    href: '/assessments',
    icon: ClipboardDocumentCheckIcon,
    translationKey: 'assessments',
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FolderIcon,
    translationKey: 'documents',
  },
  {
    name: 'Incidents',
    href: '/incidents',
    icon: ExclamationTriangleIcon,
    translationKey: 'incidents',
  },
  {
    name: 'Activities',
    href: '/activities',
    icon: UserGroupIcon,
    translationKey: 'activities',
  },
  {
    name: 'Family Portal',
    href: '/family-portal',
    icon: UserGroupIcon,
    translationKey: 'familyPortal',
  },
];

export function Sidebar() {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <nav className="w-64 bg-white shadow-sm h-screen overflow-y-auto">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Care Home Manager
        </h1>
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = router.pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {t(item.translationKey)}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
