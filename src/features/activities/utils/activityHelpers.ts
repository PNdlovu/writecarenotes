/**
 * @fileoverview Activity utility functions
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Activity, ActivityStatus } from '../types';

/**
 * Check if an activity is currently active
 */
export function isActivityActive(activity: Activity): boolean {
  const now = new Date();
  const start = new Date(activity.startTime);
  const end = new Date(activity.endTime);
  return now >= start && now <= end && activity.status === 'IN_PROGRESS';
}

/**
 * Check if an activity is upcoming
 */
export function isUpcoming(activity: Activity): boolean {
  const now = new Date();
  const start = new Date(activity.startTime);
  return now < start && activity.status === 'SCHEDULED';
}

/**
 * Format activity duration in a human-readable format
 */
export function formatActivityDuration(activity: Activity): string {
  const start = new Date(activity.startTime);
  const end = new Date(activity.endTime);
  const durationMs = end.getTime() - start.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes} minutes`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Sort activities by date
 */
export function sortActivities(activities: Activity[], order: 'asc' | 'desc' = 'asc'): Activity[] {
  return [...activities].sort((a, b) => {
    const dateA = new Date(a.startTime).getTime();
    const dateB = new Date(b.startTime).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Filter activities by status
 */
export function filterActivitiesByStatus(activities: Activity[], status: ActivityStatus): Activity[] {
  return activities.filter(activity => activity.status === status);
}

/**
 * Group activities by date
 */
export function groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
  return activities.reduce((groups, activity) => {
    const date = new Date(activity.startTime).toISOString().split('T')[0];
    return {
      ...groups,
      [date]: [...(groups[date] || []), activity],
    };
  }, {} as Record<string, Activity[]>);
}


