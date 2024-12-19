'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { StaffRole } from '@/types/models';

export default function StaffFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [role, setRole] = useState(searchParams.get('role') || 'ALL');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
    setSearch(term);
  }

  function handleRoleFilter(selectedRole: string) {
    const params = new URLSearchParams(searchParams);
    if (selectedRole && selectedRole !== 'ALL') {
      params.set('role', selectedRole);
    } else {
      params.delete('role');
    }
    replace(`${pathname}?${params.toString()}`);
    setRole(selectedRole);
  }

  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Filter Staff</h3>
          <p className="mt-1 text-sm text-gray-500">
            Use these filters to find specific staff members.
          </p>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search by name or email"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => handleRoleFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="ALL">All Roles</option>
                {Object.values(StaffRole).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


