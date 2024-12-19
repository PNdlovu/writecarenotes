import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DevicesPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Device Management</h2>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add DeviceManagement component here */}
      </Suspense>
    </div>
  );
}
