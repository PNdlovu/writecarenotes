/**
 * WriteCareNotes.com
 * @fileoverview Organization Analytics Metrics
 * @version 1.0.0
 */

import { organizationService } from '../services/organizationService';
import { tenantContext } from '@/lib/tenant';
import { compliance } from '@/lib/compliance';

export interface OrganizationMetrics {
  overview: {
    totalCareHomes: number;
    totalCapacity: number;
    occupancyRate: number;
    staffCount: number;
    complianceRate: number;
  };
  compliance: {
    frameworkName: string;
    totalRequirements: number;
    passedRequirements: number;
    criticalIssues: number;
    nextAuditDate?: Date;
  };
  subscription: {
    plan: string;
    usagePercentages: {
      users: number;
      storage: number;
      careHomes: number;
    };
    daysUntilRenewal?: number;
  };
  performance: {
    apiLatency: number;
    errorRate: number;
    uptime: number;
    syncStatus: {
      pending: number;
      failed: number;
      lastSync: Date;
    };
  };
}

export async function collectOrganizationMetrics(
  organizationId: string
): Promise<OrganizationMetrics> {
  const [org, stats] = await Promise.all([
    organizationService.getOrganization(organizationId),
    organizationService.getStatistics(organizationId),
  ]);

  const context = tenantContext.getContext();
  const complianceReport = await compliance.validateAndReport(org);

  // Calculate subscription usage percentages
  const usagePercentages = {
    users: (stats.staffCount / org.subscription.limits.users) * 100,
    storage: (org.subscription.limits.storage / org.subscription.limits.storage) * 100,
    careHomes: (stats.totalCareHomes / org.subscription.limits.careHomes) * 100,
  };

  // Calculate days until subscription renewal
  const daysUntilRenewal = org.subscription.expiry 
    ? Math.ceil((new Date(org.subscription.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : undefined;

  return {
    overview: {
      totalCareHomes: stats.totalCareHomes,
      totalCapacity: stats.totalCapacity,
      occupancyRate: stats.occupancyRate,
      staffCount: stats.staffCount,
      complianceRate: stats.complianceRate,
    },
    compliance: {
      frameworkName: context.compliance.framework,
      totalRequirements: complianceReport.results.length,
      passedRequirements: complianceReport.results.filter(r => r.passed).length,
      criticalIssues: complianceReport.results.filter(
        r => !r.passed && r.severity === 'CRITICAL'
      ).length,
      nextAuditDate: org.compliance.nextAudit,
    },
    subscription: {
      plan: org.subscription.plan,
      usagePercentages,
      daysUntilRenewal,
    },
    performance: {
      apiLatency: 0, // Implement actual latency tracking
      errorRate: 0, // Implement error rate tracking
      uptime: 100, // Implement uptime tracking
      syncStatus: {
        pending: 0,
        failed: 0,
        lastSync: new Date(),
      },
    },
  };
}

export async function generateOrganizationReport(
  organizationId: string,
  options: {
    includeMetrics?: boolean;
    includeCompliance?: boolean;
    includePerformance?: boolean;
  } = {}
): Promise<{
  metrics: Partial<OrganizationMetrics>;
  recommendations: string[];
  warnings: string[];
}> {
  const metrics = await collectOrganizationMetrics(organizationId);
  const recommendations: string[] = [];
  const warnings: string[] = [];

  // Analyze metrics and generate recommendations
  if (metrics.subscription.usagePercentages.users > 80) {
    warnings.push('Approaching user limit');
    recommendations.push('Consider upgrading subscription plan');
  }

  if (metrics.compliance.criticalIssues > 0) {
    warnings.push(`${metrics.compliance.criticalIssues} critical compliance issues`);
    recommendations.push('Address critical compliance issues immediately');
  }

  if (metrics.overview.occupancyRate < 70) {
    recommendations.push('Review occupancy optimization strategies');
  }

  if (metrics.performance.syncStatus.failed > 0) {
    warnings.push('Failed sync operations detected');
    recommendations.push('Check offline sync status');
  }

  // Filter metrics based on options
  const filteredMetrics: Partial<OrganizationMetrics> = {};
  
  if (options.includeMetrics) {
    filteredMetrics.overview = metrics.overview;
    filteredMetrics.subscription = metrics.subscription;
  }
  
  if (options.includeCompliance) {
    filteredMetrics.compliance = metrics.compliance;
  }
  
  if (options.includePerformance) {
    filteredMetrics.performance = metrics.performance;
  }

  return {
    metrics: filteredMetrics,
    recommendations,
    warnings,
  };
} 