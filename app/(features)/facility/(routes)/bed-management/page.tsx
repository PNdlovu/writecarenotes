import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function BedManagementPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Bed Management</h2>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add BedManagement component here */}
      </Suspense>
    </div>
  );
}
