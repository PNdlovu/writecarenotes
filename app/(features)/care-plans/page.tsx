import { Suspense } from 'react';
import { CarePlansManagement } from '@/features/careplans/components/CarePlansManagement';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function CarePlansPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Care Plans</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <CarePlansManagement />
      </Suspense>
    </div>
  );
}
