'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Staff, StaffRole } from '@/types/models';

const roleColors = {
  DOCTOR: 'bg-purple-100 text-purple-800',
  NURSE: 'bg-blue-100 text-blue-800',
  CAREGIVER: 'bg-green-100 text-green-800',
  ADMIN: 'bg-gray-100 text-gray-800',
};

async function fetchStaff(organizationId: string): Promise<Staff[]> {
  const response = await fetch(`/api/staff?organizationId=${organizationId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch staff');
  }
  return response.json();
}

export default function StaffList() {
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId;

  const { data: staff, isLoading, error } = useQuery({
    queryKey: ['staff', organizationId],
    queryFn: () => fetchStaff(organizationId as string),
    enabled: !!organizationId,
  });

  if (isLoading) {
    return <div>Loading staff...</div>;
  }

  if (error) {
    return <div>Error loading staff</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {staff?.map((member) => (
          <li key={member.id}>
            <Link
              href={`/staff/${member.id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {member.firstName[0]}{member.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[member.role]}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <span>
                        {member.shifts?.length || 0} upcoming shifts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


