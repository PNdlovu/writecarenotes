import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AuditPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Audit Management</h2>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add AuditDashboard component here */}
      </Suspense>
    </div>
  );
}
