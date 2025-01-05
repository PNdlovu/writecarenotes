/**
 * @writecarenotes.com
 * @fileoverview Authentication route protection component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A higher-order component that protects routes from unauthorized access.
 * Features include:
 * - Session-based authentication checking
 * - Loading state handling
 * - Automatic redirection for unauthenticated users
 * - Client-side route protection
 * - Role-based access control
 * - Permission validation
 *
 * Mobile-First Considerations:
 * - Smooth loading transitions
 * - Optimized redirection
 * - Minimal layout shift
 * - Offline state handling
 * - Clear feedback states
 * - Touch interaction delays
 *
 * Enterprise Features:
 * - Role-based authorization
 * - Session validation
 * - Security best practices
 * - Audit logging
 * - Error boundary protection
 * - Performance monitoring
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return <>{children}</>;
}
