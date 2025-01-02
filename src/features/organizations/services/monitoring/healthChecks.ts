/**
 * WriteCareNotes.com
 * @fileoverview Organization Health Checks
 * @version 1.0.0
 */

import { organizationService } from '../services/organizationService';
import { offlineSync } from '@/lib/offline';
import { tenantContext } from '@/lib/tenant';
import { compliance } from '@/lib/compliance';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    [key: string]: {
      status: 'pass' | 'warn' | 'fail';
      message?: string;
      timestamp: Date;
      latency?: number;
    };
  };
  timestamp: Date;
}

export async function checkOrganizationHealth(organizationId: string): Promise<HealthStatus> {
  const checks: HealthStatus['checks'] = {};
  const startTime = Date.now();

  // Check organization service
  try {
    const org = await organizationService.getOrganization(organizationId);
    checks.organization = {
      status: org ? 'pass' : 'fail',
      message: org ? 'Organization service is healthy' : 'Failed to fetch organization',
      timestamp: new Date(),
      latency: Date.now() - startTime,
    };
  } catch (error) {
    checks.organization = {
      status: 'fail',
      message: `Organization service error: ${error.message}`,
      timestamp: new Date(),
      latency: Date.now() - startTime,
    };
  }

  // Check offline sync
  try {
    const syncStatus = offlineSync.getQueueStatus();
    const hasPendingSync = syncStatus.pendingCount > 0;
    const hasFailedSync = syncStatus.failedCount > 0;

    checks.offlineSync = {
      status: hasFailedSync ? 'fail' : hasPendingSync ? 'warn' : 'pass',
      message: `Pending: ${syncStatus.pendingCount}, Failed: ${syncStatus.failedCount}`,
      timestamp: syncStatus.lastSync,
    };
  } catch (error) {
    checks.offlineSync = {
      status: 'fail',
      message: `Offline sync error: ${error.message}`,
      timestamp: new Date(),
    };
  }

  // Check tenant context
  try {
    const context = tenantContext.getContext();
    checks.tenant = {
      status: context ? 'pass' : 'fail',
      message: context ? 'Tenant context is active' : 'No tenant context',
      timestamp: new Date(),
    };
  } catch (error) {
    checks.tenant = {
      status: 'fail',
      message: `Tenant context error: ${error.message}`,
      timestamp: new Date(),
    };
  }

  // Check compliance
  try {
    const org = await organizationService.getOrganization(organizationId);
    const complianceReport = await compliance.validateAndReport(org);

    checks.compliance = {
      status: complianceReport.valid ? 'pass' : 'warn',
      message: `Compliance rate: ${
        complianceReport.results.filter(r => r.passed).length
      }/${complianceReport.results.length}`,
      timestamp: complianceReport.timestamp,
    };
  } catch (error) {
    checks.compliance = {
      status: 'fail',
      message: `Compliance check error: ${error.message}`,
      timestamp: new Date(),
    };
  }

  // Calculate overall status
  const failedChecks = Object.values(checks).filter(c => c.status === 'fail').length;
  const warningChecks = Object.values(checks).filter(c => c.status === 'warn').length;

  const status: HealthStatus['status'] = 
    failedChecks > 0 ? 'unhealthy' :
    warningChecks > 0 ? 'degraded' :
    'healthy';

  return {
    status,
    checks,
    timestamp: new Date(),
  };
}

export async function checkOrganizationMetrics(organizationId: string): Promise<{
  metrics: Record<string, number>;
  timestamp: Date;
}> {
  const startTime = Date.now();

  try {
    const [org, stats] = await Promise.all([
      organizationService.getOrganization(organizationId),
      organizationService.getStatistics(organizationId),
    ]);

    const syncStatus = offlineSync.getQueueStatus();

    return {
      metrics: {
        careHomes: stats.totalCareHomes,
        totalCapacity: stats.totalCapacity,
        occupancyRate: stats.occupancyRate,
        staffCount: stats.staffCount,
        complianceRate: stats.complianceRate,
        pendingSyncs: syncStatus.pendingCount,
        failedSyncs: syncStatus.failedCount,
        subscriptionUsage: org.subscription.limits.users,
        responseTime: Date.now() - startTime,
      },
      timestamp: new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to collect organization metrics: ${error.message}`);
  }
} 