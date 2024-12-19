import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DietaryPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dietary Management</h2>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add DietaryManagement component here */}
      </Suspense>
    </div>
  );
}
