import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '@/lib/auth/config';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default async function SignUpPage() {
  const session = await getServerSession(authConfig);
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SignUpForm />
    </div>
  );
}
