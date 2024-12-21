/**
 * @fileoverview Organizations API client with offline support and enterprise-grade features
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Organization, CreateOrganizationInput, UpdateOrganizationInput } from '../types';
import { APIError } from '@/lib/errors';
import { withOffline } from '@/lib/offline';
import { validateRequest } from '@/lib/api';
import { useI18n } from '@/features/i18n/lib/config';

/**
 * Fetches all organizations with pagination
 */
export const getOrganizations = withOffline(async (params?: { page?: number; limit?: number }): Promise<Organization[]> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  
  const response = await fetch(`/api/organizations?${searchParams.toString()}`);
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.organizations.fetchFailed'), response.status);
  }
  return response.json();
}, 'organizations');

/**
 * Fetches a single organization by ID
 */
export const getOrganization = withOffline(async (id: string): Promise<Organization> => {
  const response = await fetch(`/api/organizations?id=${id}`);
  if (!response.ok) {
    throw new APIError(
      response.status === 404 
        ? useI18n().t('errors.organizations.notFound') 
        : useI18n().t('errors.organizations.fetchFailed'),
      response.status
    );
  }
  return response.json();
}, 'organization');

/**
 * Creates a new organization
 */
export const createOrganization = withOffline(async (data: CreateOrganizationInput): Promise<Organization> => {
  await validateRequest(data);
  
  const response = await fetch('/api/organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.organizations.createFailed'), response.status);
  }
  return response.json();
}, 'organization');

/**
 * Updates an existing organization
 */
export const updateOrganization = withOffline(async (
  id: string,
  data: UpdateOrganizationInput
): Promise<Organization> => {
  await validateRequest(data);
  
  const response = await fetch(`/api/organizations?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.organizations.updateFailed'), response.status);
  }
  return response.json();
}, 'organization');

/**
 * Deletes an organization
 */
export const deleteOrganization = withOffline(async (id: string): Promise<void> => {
  const response = await fetch(`/api/organizations?id=${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.organizations.deleteFailed'), response.status);
  }
}, 'organization');

/**
 * Adds a care home to an organization
 */
export const addCareHome = withOffline(async (
  organizationId: string,
  careHomeId: string
): Promise<Organization> => {
  const response = await fetch(`/api/organizations/care-homes?organizationId=${organizationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ careHomeId }),
  });
  
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.organizations.addCareHomeFailed'), response.status);
  }
  return response.json();
}, 'organization');

/**
 * Removes a care home from an organization
 */
export const removeCareHome = withOffline(async (
  organizationId: string,
  careHomeId: string
): Promise<Organization> => {
  const response = await fetch(
    `/api/organizations/care-homes?organizationId=${organizationId}&careHomeId=${careHomeId}`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.organizations.removeCareHomeFailed'), response.status);
  }
  return response.json();
}, 'organization');

/**
 * Gets analytics for an organization
 */
export const getAnalytics = withOffline(async (organizationId: string) => {
  const response = await fetch(`/api/organizations/analytics?id=${organizationId}`);
  if (!response.ok) {
    throw new APIError(useI18n().t('errors.organizations.analyticsFailed'), response.status);
  }
  return response.json();
}, 'organization-analytics'); 