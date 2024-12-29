/**
 * @fileoverview Higher-order component for protecting routes and components
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React from 'react';
import { useAccess } from '../hooks/useAccess';
import { useRouter } from 'next/navigation';

interface WithAccessOptions {
  resourceType: string;
  action: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function withAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  {
    resourceType,
    action,
    redirectTo = '/unauthorized',
    fallback,
    loadingComponent = <div>Loading...</div>
  }: WithAccessOptions
) {
  return function WithAccessWrapper(props: P & { resourceId: string }) {
    const router = useRouter();
    const { isAllowed, isLoading, error, requestEmergencyAccess } = useAccess({
      resourceType,
      resourceId: props.resourceId,
      action
    });

    if (isLoading) {
      return loadingComponent;
    }

    if (error) {
      console.error('Access check failed:', error);
      return (
        <div className="text-red-500">
          Error checking access permissions: {error.message}
        </div>
      );
    }

    if (!isAllowed) {
      if (fallback) {
        return fallback;
      }

      if (redirectTo) {
        router.push(redirectTo);
        return null;
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Access Denied
          </h2>
          <p className="text-red-600 mb-4">
            You do not have permission to access this resource.
          </p>
          <button
            onClick={() => requestEmergencyAccess()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Request Emergency Access
          </button>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAccess; 