import { useQuery } from '@tanstack/react-query';
import type { RecentActivity } from '../types';
import { useOrganization } from '@/hooks/useOrganization';

export function useRecentActivity() {
  const { organization } = useOrganization();

  const { 
    data: activities,
    isLoading,
    error
  } = useQuery({
    queryKey: ['medicationActivity', organization?.id],
    queryFn: async () => {
      const response = await fetch(`/api/medications/activity?organizationId=${organization?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
      }
      return response.json();
    },
    enabled: !!organization?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Filter activities by type
  const filterActivities = (type: string) => {
    if (!activities) return [];
    return activities.filter((activity: RecentActivity) => activity.type === type);
  };

  // Get activities for a specific medication
  const getMedicationActivities = (medicationId: string) => {
    if (!activities) return [];
    return activities.filter((activity: RecentActivity) => 
      activity.metadata?.medicationId === medicationId
    );
  };

  // Get activities for a specific resident
  const getResidentActivities = (residentId: string) => {
    if (!activities) return [];
    return activities.filter((activity: RecentActivity) => 
      activity.metadata?.residentId === residentId
    );
  };

  // Get activities by user
  const getUserActivities = (userId: string) => {
    if (!activities) return [];
    return activities.filter((activity: RecentActivity) => 
      activity.metadata?.userId === userId
    );
  };

  // Get activities within a time range
  const getActivitiesInRange = (startDate: Date, endDate: Date) => {
    if (!activities) return [];
    return activities.filter((activity: RecentActivity) => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
  };

  return {
    // Data
    activities,
    
    // Loading states
    isLoading,
    
    // Error states
    error,
    
    // Utility functions
    filterActivities,
    getMedicationActivities,
    getResidentActivities,
    getUserActivities,
    getActivitiesInRange,
  };
} 