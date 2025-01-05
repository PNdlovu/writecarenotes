/**
 * @writecarenotes.com
 * @fileoverview Hook for managing staff activity feed
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

export interface ActivityItem {
  id: string;
  type: 'PROFILE_UPDATE' | 'DOCUMENT_UPDATE' | 'AVAILABILITY_UPDATE' | 'VEHICLE_UPDATE';
  staffId: string;
  staffName: string;
  description: string;
  timestamp: string;
}

export function useStaffActivity(organizationId: string) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/staff/domiciliary/activity?organizationId=${organizationId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff activities');
      }

      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching staff activities:', error);
      showToast('error', 'Failed to fetch staff activities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [organizationId]);

  return {
    activities,
    isLoading,
    refetch: fetchActivities
  };
} 