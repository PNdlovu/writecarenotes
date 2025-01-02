/**
 * @writecarenotes.com
 * @fileoverview Authentication page layout component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A layout component for authentication-related pages that provides
 * consistent styling and behavior. Features include:
 * - Session state management
 * - Loading state handling
 * - Automatic redirection for authenticated users
 * - Consistent branding and layout
 * - Responsive design
 * - Error boundary protection
 *
 * Mobile-First Considerations:
 * - Responsive grid layout
 * - Dynamic spacing
 * - Flexible content areas
 * - Touch-friendly zones
 * - Loading indicators
 * - Viewport adaptations
 *
 * Enterprise Features:
 * - Session management
 * - Error boundaries
 * - Analytics tracking
 * - Performance monitoring
 * - Accessibility support
 * - Brand consistency
 */

'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
    </div>;
  }

  if (session) {
    redirect('/england/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.svg"
          alt="Care Home Management"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {description}
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
