import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function SchedulePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Schedule Management</h1>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add ScheduleManagement component here */}
      </Suspense>
    </div>
  );
} 
