import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function OrganizationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Organizations</h1>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add OrganizationsManagement component here */}
      </Suspense>
    </div>
  );
} 