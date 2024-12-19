import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function IncidentsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Incident Reports</h2>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add IncidentManagement component here */}
      </Suspense>
    </div>
  );
}
