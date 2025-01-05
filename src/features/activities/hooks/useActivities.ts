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
import { ActivitySyncService } from '../services/sync-service';
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

  const { organizationId } = useTenantContext();
  const { isOnline } = useNetworkStatus();
  const { t } = useLocalization();
  const { handleError } = useErrorHandler();
  const { showToast } = useToast();
  const { hasPermission } = usePermissions();

  const api = new ActivitiesAPI(organizationId, careHomeId);
  const syncService = new ActivitySyncService(organizationId);

  // Load activities and handle offline state
  const loadActivities = async () => {
    try {
      setLoading(true);
      const items = isOnline 
        ? await api.getActivities(filter)
        : await syncService.getOfflineActivities();
      
      setActivities(items);

      if (isOnline) {
        const stats = await api.getActivityStats();
        setStats(stats);
      }
    } catch (error) {
      handleError(error, 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  // Sync when online
  useEffect(() => {
    if (isOnline && autoSync) {
      syncService.syncPendingChanges()
        .then(loadActivities)
        .catch(handleError);
    }
  }, [isOnline, autoSync]);

  // Initial load
  useEffect(() => {
    loadActivities();
  }, [filter]);

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
      
      // Create optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticActivity = {
        ...activity,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setActivities(prev => [...prev, optimisticActivity]);

      // Handle offline state
      if (!isOnline) {
        await syncService.enqueuePendingChange('create', tempId, activity);
        setLoading(false);
        return optimisticActivity;
      }

      // Online state
      const newActivity = await api.createActivity(activity);
      setActivities(prev => 
        prev.map(a => a.id === tempId ? newActivity : a)
      );
      
      showToast({
        type: 'success',
        message: t('activities.created')
      });
      
      return newActivity;
    } catch (error) {
      // Rollback optimistic update
      setActivities(prev => prev.filter(a => a.id !== tempId));
      handleError(error, 'Failed to create activity');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api, isOnline]);

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

      // Optimistic update
      const previousActivity = activities.find(a => a.id === id);
      setActivities(prev => 
        prev.map(activity => 
          activity.id === id ? { ...activity, ...updates } : activity
        )
      );

      // Handle offline state
      if (!isOnline) {
        await syncService.enqueuePendingChange('update', id, updates);
        setLoading(false);
        return { ...previousActivity, ...updates };
      }

      // Online state
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
      // Rollback optimistic update
      if (previousActivity) {
        setActivities(prev => 
          prev.map(activity => 
            activity.id === id ? previousActivity : activity
          )
        );
      }
      handleError(error, 'Failed to update activity');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api, activities, isOnline]);

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

      // Optimistic update
      const previousActivity = activities.find(a => a.id === id);
      setActivities(prev => prev.filter(activity => activity.id !== id));

      // Handle offline state
      if (!isOnline) {
        await syncService.enqueuePendingChange('delete', id);
        setLoading(false);
        return;
      }

      // Online state
      await api.deleteActivity(id);
      showToast({
        type: 'success',
        message: t('activities.deleted')
      });
    } catch (error) {
      // Rollback optimistic update
      if (previousActivity) {
        setActivities(prev => [...prev, previousActivity]);
      }
      handleError(error, 'Failed to delete activity');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api, activities, isOnline]);

  return {
    activities,
    stats,
    loading,
    syncing,
    refresh: loadActivities,
    addActivity,
    updateActivity,
    deleteActivity,
    hasPermission: (action: string) => hasPermission(`activities.${action}`)
  };
}
