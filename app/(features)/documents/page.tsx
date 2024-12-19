import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DocumentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Documents Management</h1>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add DocumentsManagement component here */}
      </Suspense>
    </div>
  );
}
