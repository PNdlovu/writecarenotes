import { EmergencyAccessDashboard } from '@/features/access-management/components/EmergencyAccessDashboard';

export default function AccessManagement() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Access Management</h1>
      <EmergencyAccessDashboard />
    </div>
  );
} 
