import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function MedicationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Medications Management</h1>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add MedicationsManagement component here */}
      </Suspense>
    </div>
  );
}
