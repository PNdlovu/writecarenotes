import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function QualityPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Quality Management</h2>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add QualityDashboard component here */}
      </Suspense>
    </div>
  );
}
