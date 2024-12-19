'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarPlusIcon } from '@heroicons/react/24/outline';
import { AppProviders } from '@/components/providers/AppProviders';

export function ActivitiesManagement() {
  const { data: session } = useSession();
  const [showAddActivity, setShowAddActivity] = useState(false);
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
    { label: 'Calendar', href: '/activities' },
    { label: 'Upcoming', href: '/activities/upcoming' },
    { label: 'Past Activities', href: '/activities/past' },
    { label: 'Templates', href: '/activities/templates' },
  ];

  return (
    <AppProviders>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Activities</h1>
          <Button 
            className="gap-2" 
            onClick={() => setShowAddActivity(true)}
          >
            <CalendarPlusIcon className="h-5 w-5" />
            Schedule Activity
          </Button>
        </div>

        <nav className="mb-8">
          <ul className="flex space-x-8 border-b">
            {tabs.map((tab) => (
              <li key={tab.href}>
                <a
                  href={tab.href}
                  className={`inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium ${
                    pathname === tab.href
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6">
          {/* Calendar/Activities will go here */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
            <div className="p-6">
              <p className="text-gray-500 text-center">Loading activities calendar...</p>
            </div>
          </div>
        </div>

        {/* Add Activity Modal will go here */}
      </div>
    </AppProviders>
  );
} 


