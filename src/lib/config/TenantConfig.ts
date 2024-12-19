import { PrismaClient } from '@prisma/client';
import { cache } from 'react';

export interface TenantConfig {
  id: string;
  name: string;
  features: Record<string, boolean>;
  settings: {
    language: string;
    timezone: string;
    currency: string;
    measurementSystem: string;
    dateFormat: string;
  };
  customDomain?: string;
  maxUsers: number;
  maxFacilities: number;
}

const prisma = new PrismaClient();

/**
 * Cache tenant configuration for better performance
 * Using React's cache() utility for server components
 */
export const getTenantConfig = cache(async (tenantId: string): Promise<TenantConfig> => {
  const org = await prisma.organization.findUnique({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      features: true,
      settings: true,
      defaultLanguage: true,
      defaultTimezone: true,
      defaultCurrency: true,
      measurementSystem: true,
      customDomain: true,
      maxUsers: true,
      maxFacilities: true,
    },
  });

  if (!org) {
    throw new Error(`Tenant ${tenantId} not found`);
  }

  return {
    id: org.id,
    name: org.name,
    features: org.features as Record<string, boolean>,
    settings: {
      language: org.defaultLanguage,
      timezone: org.defaultTimezone,
      currency: org.defaultCurrency,
      measurementSystem: org.measurementSystem,
      dateFormat: (org.settings as any).dateFormat || 'DD/MM/YYYY',
    },
    customDomain: org.customDomain || undefined,
    maxUsers: org.maxUsers,
    maxFacilities: org.maxFacilities,
  };
});

/**
 * Get tenant ID from request
 * This checks both custom domain and subdomain
 */
export const getTenantIdFromRequest = (req: Request): string => {
  const host = req.headers.get('host') || '';
  const url = new URL(req.url);
  
  // Check for custom domain mapping
  const customDomain = host.split(':')[0];
  if (customDomain) {
    // TODO: Implement custom domain lookup from database
    // return await lookupTenantByCustomDomain(customDomain);
  }

  // Check for subdomain
  const subdomain = host.split('.')[0];
  if (subdomain && subdomain !== 'www') {
    return subdomain;
  }

  // Check for tenant ID in query params (development/testing)
  const tenantId = url.searchParams.get('tenantId');
  if (tenantId) {
    return tenantId;
  }

  throw new Error('Unable to determine tenant ID');
};

/**
 * Middleware to validate tenant access and subscription
 */
export const validateTenantAccess = async (tenantId: string) => {
  const org = await prisma.organization.findUnique({
    where: { tenantId },
    select: {
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });

  if (!org) {
    throw new Error('Invalid tenant');
  }

  if (org.subscriptionStatus === 'EXPIRED' || 
      (org.trialEndsAt && org.trialEndsAt < new Date())) {
    throw new Error('Subscription expired');
  }

  return true;
};

/**
 * Get regional settings for a tenant and region
 */
export const getRegionalSettings = cache(async (tenantId: string, region: string) => {
  const settings = await prisma.regionalSetting.findMany({
    where: {
      organization: { tenantId },
      region: region as any,
    },
  });

  return settings.reduce((acc, setting) => {
    acc[setting.setting] = setting.value;
    return acc;
  }, {} as Record<string, string>);
});


