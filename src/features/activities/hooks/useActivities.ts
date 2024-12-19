/**
 * @fileoverview Activities hook with offline support and multi-tenant capabilities
 * @version 2.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState, useCallback, useEffect } from 'react';
import { Activity, ActivityStatus } from '../types/models';
import { ActivityService } from '../services/activityService';
import { useTenantContext } from '@/lib/multi-tenant/context';
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';
import { useLocalization } from '@/lib/hooks/useLocalization';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import { useToast } from '@/components/ui/toast';

interface UseActivitiesProps {
  initialActivities?: Activity[];
  autoSync?: boolean;
}

export function useActivities({ 
  initialActivities = [], 
  autoSync = true 
}: UseActivitiesProps = {}) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const tenantContext = useTenantContext();
  const { isOnline } = useNetworkStatus();
  const { t } = useLocalization();
  const { handleError } = useErrorHandler();
  const { showToast } = useToast();

  const activityService = new ActivityService(tenantContext);

  // Sync activities when coming back online
  useEffect(() => {
    if (isOnline && autoSync) {
      syncActivities();
    }
  }, [isOnline, autoSync]);

  const syncActivities = async () => {
    if (!isOnline) {
      showToast({
        type: 'warning',
        message: t('activities.offline.syncUnavailable')
      });
      return;
    }

    try {
      setSyncing(true);
      const { items } = await activityService.queryActivities({});
      setActivities(items);
      setLastSynced(new Date());
      showToast({
        type: 'success',
        message: t('activities.offline.syncComplete')
      });
    } catch (error) {
      handleError(error, 'Failed to sync activities');
    } finally {
      setSyncing(false);
    }
  };

  const addActivity = useCallback(async (activity: Omit<Activity, 'id'>) => {
    try {
      setLoading(true);
      const newActivity = await activityService.createActivity(activity);
      setActivities(prev => [...prev, newActivity]);
      showToast({
        type: 'success',
        message: t('activities.created')
      });
      return newActivity;
    } catch (error) {
      handleError(error, 'Failed to create activity');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [activityService, t]);

  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>) => {
    try {
      setLoading(true);
      const updated = await activityService.updateActivity(id, updates);
      setActivities(prev => 
        prev.map(activity => 
          activity.id === id ? updated : activity
        )
      );
      showToast({
        type: 'success',
        message: t('activities.updated')
      });
      return updated;
    } catch (error) {
      handleError(error, 'Failed to update activity');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [activityService, t]);

  const updateActivityStatus = useCallback(async (id: string, status: ActivityStatus) => {
    return updateActivity(id, { status });
  }, [updateActivity]);

  const cancelActivity = useCallback(async (id: string, reason?: string) => {
    try {
      setLoading(true);
      const cancelled = await activityService.cancelActivity(id, reason);
      setActivities(prev => 
        prev.map(activity => 
          activity.id === id ? cancelled : activity
        )
      );
      showToast({
        type: 'success',
        message: t('activities.cancelled')
      });
      return cancelled;
    } catch (error) {
      handleError(error, 'Failed to cancel activity');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [activityService, t]);

  const getActivityById = useCallback((id: string) => {
    return activities.find(activity => activity.id === id);
  }, [activities]);

  const queryActivities = useCallback(async (params: {
    status?: ActivityStatus[];
    category?: string[];
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      const result = await activityService.queryActivities(params);
      setActivities(result.items);
      return result;
    } catch (error) {
      handleError(error, 'Failed to query activities');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [activityService]);

  return {
    activities,
    loading,
    syncing,
    lastSynced,
    isOnline,
    addActivity,
    updateActivity,
    updateActivityStatus,
    cancelActivity,
    getActivityById,
    queryActivities,
    syncActivities,
  };
}


