import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PayrollPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Payroll Management</h2>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add PayrollDashboard component here */}
      </Suspense>
    </div>
  );
}
