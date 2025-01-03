import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <Suspense fallback={<LoadingSpinner />}>
        {/* Add SettingsManagement component here */}
      </Suspense>
    </div>
  );
} 
