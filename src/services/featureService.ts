import { FeatureFlag } from '@/types/core';
import { API_CONFIG } from '@/config/app-config';

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/features`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch feature flags');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return [];
  }
}

export async function updateFeatureFlag(
  flagId: string,
  updates: Partial<FeatureFlag>
): Promise<FeatureFlag> {
  const response = await fetch(`${API_CONFIG.baseUrl}/features/${flagId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update feature flag');
  }

  return await response.json();
}

export async function createFeatureFlag(
  flag: Omit<FeatureFlag, 'id'>
): Promise<FeatureFlag> {
  const response = await fetch(`${API_CONFIG.baseUrl}/features`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(flag),
  });

  if (!response.ok) {
    throw new Error('Failed to create feature flag');
  }

  return await response.json();
}

export async function deleteFeatureFlag(flagId: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseUrl}/features/${flagId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete feature flag');
  }
}

export function evaluateFeatureFlag(
  flag: FeatureFlag,
  context: {
    tenantId?: string;
    userId?: string;
    region?: string;
  }
): boolean {
  if (!flag.enabled) return false;

  // Check tenant restrictions
  if (flag.tenantIds && context.tenantId) {
    if (!flag.tenantIds.includes(context.tenantId)) {
      return false;
    }
  }

  // Check region restrictions
  if (flag.regionIds && context.region) {
    if (!flag.regionIds.includes(context.region as any)) {
      return false;
    }
  }

  // Check date restrictions
  const now = new Date();
  if (flag.startDate && new Date(flag.startDate) > now) return false;
  if (flag.endDate && new Date(flag.endDate) < now) return false;

  // Check rules
  if (flag.rules) {
    switch (flag.rules.type) {
      case 'percentage':
        if (!context.tenantId) return false;
        const hash = hashString(context.tenantId);
        return (hash % 100) < flag.rules.value;
      
      case 'whitelist':
        if (!context.userId) return false;
        return (flag.rules.value as string[]).includes(context.userId);
      
      case 'blacklist':
        if (!context.userId) return false;
        return !(flag.rules.value as string[]).includes(context.userId);
    }
  }

  return true;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}


