import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth/config';

export default async function Dashboard() {
  const session = await getServerSession(authConfig);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <DashboardOverview />
    </div>
  );
}
