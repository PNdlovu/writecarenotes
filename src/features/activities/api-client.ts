import { Activity, ActivityFilter, ActivityStats } from '../types';
import { APIError } from '../../lib/errors';
import { withOffline } from '../../lib/offline';
import { withRegional } from '../../lib/regional';
import { withRetry } from '../../lib/retry';
import { withCache } from '../../lib/cache';

const BASE_URL = '/api/organizations';

export class ActivitiesAPI {
  private organizationId: string;
  private careHomeId: string;

  constructor(organizationId: string, careHomeId: string) {
    this.organizationId = organizationId;
    this.careHomeId = careHomeId;
  }

  private get baseUrl() {
    return `${BASE_URL}/${this.organizationId}/care-homes/${this.careHomeId}/activities`;
  }

  @withOffline('activities')
  @withRegional()
  @withCache({ ttl: 300 }) // 5 minutes cache
  async getActivities(filter?: ActivityFilter): Promise<Activity[]> {
    const queryParams = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value) queryParams.append(key, JSON.stringify(value));
      });
    }

    const response = await fetch(
      `${this.baseUrl}?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      throw new APIError('Failed to fetch activities', response.status);
    }
    
    return response.json();
  }

  @withOffline('activity')
  @withRegional()
  @withCache({ ttl: 300 })
  async getActivityById(activityId: string): Promise<Activity> {
    const response = await fetch(
      `${this.baseUrl}/${activityId}`
    );
    
    if (!response.ok) {
      throw new APIError(
        response.status === 404 ? 'Activity not found' : 'Failed to fetch activity',
        response.status
      );
    }
    
    return response.json();
  }

  @withOffline('activity')
  @withRegional()
  @withRetry({ maxAttempts: 3 })
  async createActivity(data: Omit<Activity, 'id'>): Promise<Activity> {
    const response = await fetch(
      this.baseUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      throw new APIError('Failed to create activity', response.status);
    }
    
    return response.json();
  }

  @withOffline('activity')
  @withRegional()
  @withRetry({ maxAttempts: 3 })
  async updateActivity(
    activityId: string,
    data: Partial<Activity>
  ): Promise<Activity> {
    const response = await fetch(
      `${this.baseUrl}/${activityId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      throw new APIError('Failed to update activity', response.status);
    }
    
    return response.json();
  }

  @withOffline('activity')
  @withRegional()
  @withRetry({ maxAttempts: 3 })
  async deleteActivity(activityId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/${activityId}`,
      { method: 'DELETE' }
    );
    
    if (!response.ok) {
      throw new APIError('Failed to delete activity', response.status);
    }
  }

  @withCache({ ttl: 60 }) // 1 minute cache
  async getActivityStats(): Promise<ActivityStats> {
    const response = await fetch(
      `${this.baseUrl}/stats`
    );
    
    if (!response.ok) {
      throw new APIError('Failed to fetch activity stats', response.status);
    }
    
    return response.json();
  }
}
