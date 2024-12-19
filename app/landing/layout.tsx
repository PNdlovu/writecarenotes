import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authConfig } from '@/lib/auth/config';

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
