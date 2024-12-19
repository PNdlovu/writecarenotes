import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ActivitiesPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Activities Management</h2>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add ActivitiesManagement component here */}
      </Suspense>
    </div>
  );
}
