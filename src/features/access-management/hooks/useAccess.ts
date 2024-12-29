/**
 * @fileoverview React hook for managing access control
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { AccessDecision, AccessRequest, EmergencyAccess } from '../types';
import { AccessManagementContext } from '../context/AccessManagementContext';

interface UseAccessParams {
  resourceType: string;
  resourceId: string;
  action: string;
}

interface UseAccessResult {
  isAllowed: boolean;
  isLoading: boolean;
  error: Error | null;
  checkAccess: () => Promise<boolean>;
  requestEmergencyAccess: () => Promise<EmergencyAccess>;
  hasRole: (role: string) => boolean;
  decision: AccessDecision | null;
}

export function useAccess({
  resourceType,
  resourceId,
  action
}: UseAccessParams): UseAccessResult {
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [decision, setDecision] = useState<AccessDecision | null>(null);

  const { accessService, currentUser } = useContext(AccessManagementContext);

  const checkAccess = useCallback(async () => {
    if (!accessService || !currentUser) {
      setIsAllowed(false);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const request: AccessRequest = {
        userId: currentUser.id,
        resourceType,
        resourceId,
        action,
        context: {
          tenantId: currentUser.tenantId,
          timestamp: new Date(),
          deviceInfo: navigator.userAgent
        }
      };

      const accessDecision = await accessService.checkAccess(request);
      setDecision(accessDecision);
      setIsAllowed(accessDecision.allowed);
      return accessDecision.allowed;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check access');
      setError(error);
      setIsAllowed(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [accessService, currentUser, resourceType, resourceId, action]);

  const requestEmergencyAccess = useCallback(async () => {
    if (!accessService || !currentUser) {
      throw new Error('Access service or user not available');
    }

    try {
      setIsLoading(true);
      setError(null);

      const emergencyAccess = await accessService.requestEmergencyAccess(
        currentUser.id,
        resourceType,
        resourceId
      );

      // Recheck access after emergency access is granted
      await checkAccess();

      return emergencyAccess;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to request emergency access');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [accessService, currentUser, resourceType, resourceId, checkAccess]);

  const hasRole = useCallback((role: string): boolean => {
    if (!currentUser) return false;
    return currentUser.roles.includes(role);
  }, [currentUser]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    isAllowed,
    isLoading,
    error,
    checkAccess,
    requestEmergencyAccess,
    hasRole,
    decision
  };
}

export default useAccess;
