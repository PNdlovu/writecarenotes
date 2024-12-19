'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { ErrorBoundary } from '@/error/components/ErrorBoundary';

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicLanding = pathname === '/';
  const isAuthenticated = status === 'authenticated';

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <ErrorBoundary componentName="Header">
      <header className="bg-white shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Write Care Notes"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-xl font-semibold">Write Care Notes</span>
              </Link>
            </div>

            <div className="flex items-center">
              {!isPublicLanding && (
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      pathname.includes('/dashboard')
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                </div>
              )}

              <div className="flex items-center">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      {session?.user?.name || session?.user?.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  !isPublicLanding && (
                    <Link
                      href="/auth/signin"
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Sign in
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
    </ErrorBoundary>
  );
};

export default Header;


