/**
 * @fileoverview Activities hook with offline support, multi-tenant capabilities, and enterprise features
 * @version 3.0.0
 * @created 2024-12-29
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { useState, useCallback, useEffect } from 'react';
import { Activity, ActivityFilter, ActivityStats } from '../../types';
import { ActivitiesAPI } from '../../api-client';
import { useTenantContext } from '../../lib/multi-tenant/context';
import { useNetworkStatus } from '../../lib/hooks/useNetworkStatus';
import { useLocalization } from '../../lib/hooks/useLocalization';
import { useErrorHandler } from '../../lib/hooks/useErrorHandler';
import { useToast } from '../../components/ui/toast';
import { usePermissions } from '../../lib/hooks/usePermissions';

interface UseActivitiesProps {
  initialActivities?: Activity[];
  autoSync?: boolean;
  filter?: ActivityFilter;
  careHomeId: string;
}

export function useActivities({ 
  initialActivities = [], 
  autoSync = true,
  filter,
  careHomeId
}: UseActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const { organizationId } = useTenantContext();
  const { isOnline } = useNetworkStatus();
  const { t } = useLocalization();
  const { handleError } = useErrorHandler();
  const { showToast } = useToast();
  const { hasPermission } = usePermissions();

  const api = new ActivitiesAPI(organizationId, careHomeId);

  // Sync activities when coming back online
  useEffect(() => {
    if (isOnline && autoSync) {
      syncActivities();
    }
  }, [isOnline, autoSync, filter]);

  const syncActivities = async () => {
    if (!isOnline) {
      showToast({
        type: 'warning',
        message: t('activities.offline.syncUnavailable')
      });
      return;
    }

    if (!hasPermission('activities.view')) {
      showToast({
        type: 'error',
        message: t('common.errors.permissionDenied')
      });
      return;
    }

    try {
      setSyncing(true);
      const [items, activityStats] = await Promise.all([
        api.getActivities(filter),
        api.getActivityStats()
      ]);
      setActivities(items);
      setStats(activityStats);
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
    if (!hasPermission('activities.create')) {
      showToast({
        type: 'error',
        message: t('common.errors.permissionDenied')
      });
      throw new Error('Permission denied');
    }

    try {
      setLoading(true);
      const newActivity = await api.createActivity(activity);
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
  }, [api, t]);

  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>) => {
    if (!hasPermission('activities.edit')) {
      showToast({
        type: 'error',
        message: t('common.errors.permissionDenied')
      });
      throw new Error('Permission denied');
    }

    try {
      setLoading(true);
      const updated = await api.updateActivity(id, updates);
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
  }, [api, t]);

  const deleteActivity = useCallback(async (id: string) => {
    if (!hasPermission('activities.delete')) {
      showToast({
        type: 'error',
        message: t('common.errors.permissionDenied')
      });
      throw new Error('Permission denied');
    }

    try {
      setLoading(true);
      await api.deleteActivity(id);
      setActivities(prev => prev.filter(activity => activity.id !== id));
      showToast({
        type: 'success',
        message: t('activities.deleted')
      });
    } catch (error) {
      handleError(error, 'Failed to delete activity');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api, t]);

  return {
    activities,
    stats,
    loading,
    syncing,
    lastSynced,
    syncActivities,
    addActivity,
    updateActivity,
    deleteActivity,
    hasPermission: (action: string) => hasPermission(`activities.${action}`)
  };
}
