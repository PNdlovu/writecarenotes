import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AccountingPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Accounting</h2>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add AccountingDashboard component here */}
      </Suspense>
    </div>
  );
}
