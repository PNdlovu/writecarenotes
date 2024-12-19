import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AssessmentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Assessments</h1>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add AssessmentsManagement component here */}
      </Suspense>
    </div>
  );
}
