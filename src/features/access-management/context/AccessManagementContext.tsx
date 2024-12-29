/**
 * @fileoverview Access Management Context Provider
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React, { createContext, useEffect, useState } from 'react';
import { AccessManagementService } from '../services/AccessManagementService';
import { SecurityConfig, User } from '../types';

interface AccessManagementContextValue {
  accessService: AccessManagementService | null;
  currentUser: User | null;
  isInitializing: boolean;
  error: Error | null;
}

export const AccessManagementContext = createContext<AccessManagementContextValue>({
  accessService: null,
  currentUser: null,
  isInitializing: true,
  error: null
});

interface AccessManagementProviderProps {
  children: React.ReactNode;
  config: SecurityConfig;
}

export function AccessManagementProvider({
  children,
  config
}: AccessManagementProviderProps) {
  const [accessService, setAccessService] = useState<AccessManagementService | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeService = async () => {
      try {
        const service = new AccessManagementService(config);
        await service.initialize();

        // Try to authenticate with stored token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const user = await service.authenticate(token);
            setCurrentUser(user);
          } catch (err) {
            // Token is invalid, remove it
            localStorage.removeItem('token');
          }
        }

        setAccessService(service);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize access service');
        setError(error);
        console.error('Failed to initialize access service:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeService();
  }, [config]);

  const contextValue: AccessManagementContextValue = {
    accessService,
    currentUser,
    isInitializing,
    error
  };

  if (isInitializing) {
    return <div>Initializing access management...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error initializing access management: {error.message}
      </div>
    );
  }

  return (
    <AccessManagementContext.Provider value={contextValue}>
      {children}
    </AccessManagementContext.Provider>
  );
} 