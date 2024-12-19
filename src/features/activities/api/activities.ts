/**
 * @fileoverview Activities API client with offline support and enterprise-grade features
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Activity, ActivityStatus } from '../types';
import { APIError } from '@/lib/errors';
import { withOffline } from '@/lib/offline';
import { validateRequest } from '@/lib/api';
import { useI18n } from '@/features/i18n/lib/config';

interface CreateActivityDTO {
  name: string;
  startTime: string | Date;
  endTime: string | Date;
  description?: string;
  location?: string;
  participants?: string[];
  organizerId: string;
  organizationId: string;
}

interface UpdateActivityDTO extends Partial<CreateActivityDTO> {
  status?: ActivityStatus;
}

/**
 * Fetches all activities for an organization
 * @param organizationId - The organization ID
 * @returns Promise<Activity[]> List of activities
 * @throws {APIError} If the request fails
 */
export const getActivities = withOffline(async (organizationId: string): Promise<Activity[]> => {
  const response = await fetch(`/api/organizations/${organizationId}/activities`);
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.activities.fetchFailed'), response.status);
  }
  return response.json();
}, 'activities');

/**
 * Fetches a single activity by ID
 * @param organizationId - The organization ID
 * @param activityId - The activity ID
 * @returns Promise<Activity> The activity
 * @throws {APIError} If the request fails or activity not found
 */
export const getActivityById = withOffline(async (organizationId: string, activityId: string): Promise<Activity> => {
  const response = await fetch(`/api/organizations/${organizationId}/activities/${activityId}`);
  if (!response.ok) {
    throw new APIError(
      response.status === 404 
        ? useI18n().t('errors.activities.notFound') 
        : useI18n().t('errors.activities.fetchFailed'),
      response.status
    );
  }
  return response.json();
}, 'activity');

/**
 * Creates a new activity
 * @param organizationId - The organization ID
 * @param data - The activity data
 * @returns Promise<Activity> The created activity
 * @throws {APIError} If the request fails or validation fails
 */
export const createActivity = withOffline(async (organizationId: string, data: CreateActivityDTO): Promise<Activity> => {
  await validateRequest(data);
  
  const response = await fetch(`/api/organizations/${organizationId}/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.activities.createFailed'), response.status);
  }
  return response.json();
}, 'activity');

/**
 * Updates an existing activity
 * @param organizationId - The organization ID
 * @param activityId - The activity ID
 * @param data - The activity data to update
 * @returns Promise<Activity> The updated activity
 * @throws {APIError} If the request fails or validation fails
 */
export const updateActivity = withOffline(async (
  organizationId: string, 
  activityId: string, 
  data: UpdateActivityDTO
): Promise<Activity> => {
  await validateRequest(data);
  
  const response = await fetch(`/api/organizations/${organizationId}/activities/${activityId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.activities.updateFailed'), response.status);
  }
  return response.json();
}, 'activity');

/**
 * Deletes an activity
 * @param organizationId - The organization ID
 * @param activityId - The activity ID
 * @throws {APIError} If the request fails
 */
export const deleteActivity = withOffline(async (organizationId: string, activityId: string): Promise<void> => {
  const response = await fetch(`/api/organizations/${organizationId}/activities/${activityId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.activities.deleteFailed'), response.status);
  }
}, 'activity');

/**
 * Updates the status of an activity
 * @param organizationId - The organization ID
 * @param activityId - The activity ID
 * @param status - The new activity status
 * @returns Promise<Activity> The updated activity
 * @throws {APIError} If the request fails
 */
export const updateActivityStatus = withOffline(async (
  organizationId: string,
  activityId: string,
  status: ActivityStatus
): Promise<Activity> => {
  return updateActivity(organizationId, activityId, { status });
}, 'activity');


