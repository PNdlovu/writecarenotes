import { useState, useCallback } from 'react';
import { useFloorPlan } from './useFloorPlan';
import { useOfflineSupport } from './useOfflineSupport';
import { useAuth } from '@/lib/auth';
import { useMedicationAdmin } from './useMedicationAdmin';
import { CareLevelTransitionService } from '@/services/careLevelTransition';
import { CareLevel, Room } from '@/types/floorPlan';
import { useToast } from '@/hooks/useToast';

interface CareTransition {
  residentId: string;
  fromLevel: CareLevel;
  toLevel: CareLevel;
  reason: string;
  requiredDate: Date;
  specialRequirements?: string[];
  facilityId: string;
}

export function useCareLevelTransition(facilityId: string) {
  const { floorPlan } = useFloorPlan({ facilityId });
  const { isOnline, queueOfflineAction } = useOfflineSupport();
  const { user, isLoading: authLoading, getAuthHeaders } = useAuth();
  const { handleMedicationAdmin } = useMedicationAdmin();
  const { showToast } = useToast();
  
  const [pendingTransitions, setPendingTransitions] = useState<CareTransition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPendingTransitions = useCallback(async () => {
    if (!user?.facility) return;
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/facilities/${facilityId}/care-transitions`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch care transitions');
      }

      const data = await response.json();
      setPendingTransitions(data);
    } catch (error) {
      console.error('Failed to load care transitions:', error);
      showToast('Failed to load care transitions', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, user?.facility, getAuthHeaders, showToast]);

  const planTransition = useCallback(async (
    transition: Omit<CareTransition, 'facilityId'>,
    currentRoom: Room
  ) => {
    if (!floorPlan || !user?.facility) return null;

    const fullTransition = {
      ...transition,
      facilityId: user.facility
    };

    // Validate transition path
    const pathValidation = CareLevelTransitionService.validateTransitionPath(
      transition.fromLevel,
      transition.toLevel
    );
    if (!pathValidation.isValid) {
      showToast(pathValidation.reason || 'Invalid transition path', 'error');
      throw new Error(pathValidation.reason);
    }

    try {
      const plan = await CareLevelTransitionService.planTransition(
        fullTransition,
        currentRoom,
        floorPlan
      );

      if (!isOnline) {
        await queueOfflineAction('care-transition', {
          transition: fullTransition,
          plan,
          facilityId
        });
        showToast('Care transition will be planned when back online', 'info');
        return plan;
      }

      const headers = await getAuthHeaders();
      const response = await fetch(`/api/facilities/${facilityId}/care-transitions`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transition: fullTransition,
          plan
        })
      });

      if (!response.ok) {
        throw new Error('Failed to plan care transition');
      }

      const result = await response.json();
      
      // Update medication schedules for the new care level
      if (result.success) {
        await handleMedicationAdmin({
          medicationId: 'CARE_LEVEL_UPDATE',
          status: 'COMPLETED',
          notes: `Care level transition from ${transition.fromLevel} to ${transition.toLevel}`,
        });
        showToast('Care transition planned successfully', 'success');
      }

      return result;
    } catch (error) {
      console.error('Failed to plan care transition:', error);
      showToast('Failed to plan care transition', 'error');
      return null;
    }
  }, [facilityId, floorPlan, isOnline, queueOfflineAction, user?.facility, handleMedicationAdmin, getAuthHeaders, showToast]);

  const executeTransition = useCallback(async (
    transitionId: string,
    approvedBy: string
  ) => {
    if (!isOnline) {
      await queueOfflineAction('execute-transition', {
        transitionId,
        approvedBy,
        facilityId
      });
      showToast('Care transition will be executed when back online', 'info');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/facilities/${facilityId}/care-transitions/${transitionId}/execute`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ approvedBy })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to execute care transition');
      }

      showToast('Care transition executed successfully', 'success');
      // Refresh pending transitions
      await loadPendingTransitions();
    } catch (error) {
      console.error('Failed to execute care transition:', error);
      showToast('Failed to execute care transition', 'error');
    }
  }, [facilityId, isOnline, queueOfflineAction, loadPendingTransitions, getAuthHeaders, showToast]);

  const cancelTransition = useCallback(async (
    transitionId: string,
    reason: string
  ) => {
    if (!isOnline) {
      await queueOfflineAction('cancel-transition', {
        transitionId,
        reason,
        facilityId
      });
      showToast('Care transition will be cancelled when back online', 'info');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `/api/facilities/${facilityId}/care-transitions/${transitionId}`,
        {
          method: 'DELETE',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel care transition');
      }

      showToast('Care transition cancelled successfully', 'success');
      // Refresh pending transitions
      await loadPendingTransitions();
    } catch (error) {
      console.error('Failed to cancel care transition:', error);
      showToast('Failed to cancel care transition', 'error');
    }
  }, [facilityId, isOnline, queueOfflineAction, loadPendingTransitions, getAuthHeaders, showToast]);

  return {
    pendingTransitions,
    loadPendingTransitions,
    planTransition,
    executeTransition,
    cancelTransition,
    isLoading: isLoading || authLoading
  };
}


