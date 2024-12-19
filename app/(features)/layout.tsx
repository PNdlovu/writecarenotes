import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authConfig } from '@/lib/auth/config';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default async function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/auth/signin');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
