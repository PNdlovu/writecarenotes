import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function StaffPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Staff Management</h1>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add StaffManagement component here */}
      </Suspense>
    </div>
  );
} 