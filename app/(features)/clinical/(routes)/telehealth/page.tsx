import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function TelehealthPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Telehealth Services</h2>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add TelehealthDashboard component here */}
      </Suspense>
    </div>
  );
}
