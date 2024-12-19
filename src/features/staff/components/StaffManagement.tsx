'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { StaffOnboardingForm } from './StaffOnboardingForm';
import { Button } from '@/components/ui/button';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { AppProviders } from '../providers/AppProviders';
import { cn } from '@/lib/utils';

export function StaffManagement() {
  const { data: session } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (!session?.user?.organizationId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">No Organization Found</h2>
          <p className="mt-2 text-gray-600">Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { label: 'Overview', href: '/staff' },
    { label: 'Schedules', href: '/staff/schedules' },
    { label: 'Performance', href: '/staff/performance' },
    { label: 'Training', href: '/staff/training' },
    { label: 'Documents', href: '/staff/documents' },
  ];

  return (
    <AppProviders>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Staff Management</h1>
          <Button 
            className="gap-2" 
            onClick={() => setShowOnboarding(true)}
          >
            <UserPlusIcon className="h-5 w-5" />
            Add Staff Member
          </Button>
        </div>

        {showOnboarding ? (
          <div className="mb-8">
            <StaffOnboardingForm
              facilityId={session.user.organizationId}
              onComplete={() => setShowOnboarding(false)}
            />
          </div>
        ) : (
          <>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      pathname === tab.href
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                      'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                    )}
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>
            </div>
          </>
        )}
      </div>
    </AppProviders>
  );
}


