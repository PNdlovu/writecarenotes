import { Suspense } from 'react';
import ResidentList from '@/features/resident/components/ResidentList';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ResidentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Resident Management</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <ResidentList />
      </Suspense>
    </div>
  );
}
