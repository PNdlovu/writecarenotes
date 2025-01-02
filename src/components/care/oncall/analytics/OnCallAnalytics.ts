/**
 * @writecarenotes.com
 * @fileoverview On-Call Analytics Service
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import OnCallAPI from '../../../../api/OnCallAPI';
import { OnCallStorage } from '../storage/OnCallStorage';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';
import { OnCallRecord, Staff } from '../types/OnCallTypes';

interface AnalyticsMetrics {
    activeCalls: number;
    averageResponseTime: string;
    staffCoverage: string;
    complianceRate: string;
    callTrends: any[];
    responseTrends: any[];
    coverageTrends: any[];
    complianceTrends: any[];
    careHomes: Array<{
        id: string;
        name: string;
        activeCalls: number;
        responseTime: string;
        staffCoverage: string;
        compliance: string;
        status: 'normal' | 'warning' | 'critical';
    }>;
    staffing: {
        available: number;
        total: number;
        schedule: any[];
        coverage: any[];
    };
}

interface ComplianceReport {
    overall: {
        rate: string;
        issues: number;
        critical: number;
    };
    byCategory: Array<{
        category: string;
        rate: string;
        issues: number;
    }>;
    recentIssues: Array<{
        id: string;
        timestamp: Date;
        category: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
        status: 'open' | 'resolved';
    }>;
    trends: {
        daily: any[];
        weekly: any[];
        monthly: any[];
    };
}

export class OnCallAnalytics {
    private static instance: OnCallAnalytics;
    private api: OnCallAPI;
    private storage: OnCallStorage;

    private constructor() {
        this.api = OnCallAPI.getInstance();
        this.storage = OnCallStorage.getInstance();
    }

    public static getInstance(): OnCallAnalytics {
        if (!OnCallAnalytics.instance) {
            OnCallAnalytics.instance = new OnCallAnalytics();
        }
        return OnCallAnalytics.instance;
    }

    public async getOrganizationAnalytics(organizationId: string): Promise<AnalyticsMetrics> {
        const metricId = performanceMonitor.startMetric('analytics-fetch', { organizationId });
        try {
            // Get data from API
            const [
                records,
                staff,
                trends
            ] = await Promise.all([
                this.api.getOrganizationRecords(organizationId),
                this.api.getOrganizationStaff(organizationId),
                this.api.getOrganizationTrends(organizationId)
            ]);

            // Calculate metrics
            const metrics = this.calculateMetrics(records, staff, trends);
            performanceMonitor.endMetric(metricId, true);
            return metrics;
        } catch (error) {
            performanceMonitor.endMetric(metricId, false);
            throw error;
        }
    }

    public async getComplianceReport(organizationId: string): Promise<ComplianceReport> {
        const metricId = performanceMonitor.startMetric('compliance-report', { organizationId });
        try {
            const [
                records,
                issues,
                trends
            ] = await Promise.all([
                this.api.getOrganizationRecords(organizationId),
                this.api.getComplianceIssues(organizationId),
                this.api.getComplianceTrends(organizationId)
            ]);

            // Generate report
            const report = this.generateComplianceReport(records, issues, trends);
            performanceMonitor.endMetric(metricId, true);
            return report;
        } catch (error) {
            performanceMonitor.endMetric(metricId, false);
            throw error;
        }
    }

    private calculateMetrics(
        records: OnCallRecord[],
        staff: Staff[],
        trends: any
    ): AnalyticsMetrics {
        const activeCalls = records.filter(r => r.status === 'active').length;
        
        // Calculate response times
        const responseTimes = records.map(r => {
            const created = new Date(r.timestamp);
            const responded = r.actions?.find(a => a.action === 'responded')?.timestamp;
            return responded ? new Date(responded).getTime() - created.getTime() : null;
        }).filter(Boolean) as number[];

        const avgResponseTime = responseTimes.length > 0
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000 / 60)
            : 0;

        // Calculate staff coverage
        const availableStaff = staff.filter(s => 
            s.availability.some(a => 
                new Date(a.start) <= new Date() && new Date(a.end) >= new Date()
            )
        ).length;

        const staffCoverage = Math.round((availableStaff / staff.length) * 100);

        // Calculate compliance
        const compliantRecords = records.filter(r => 
            r.compliance?.standardsMet && !r.compliance?.regulatoryRequirements.length
        ).length;

        const complianceRate = Math.round((compliantRecords / records.length) * 100);

        // Group by care home
        const careHomes = this.groupByCareHome(records, staff);

        return {
            activeCalls,
            averageResponseTime: `${avgResponseTime}m`,
            staffCoverage: `${staffCoverage}%`,
            complianceRate: `${complianceRate}%`,
            callTrends: trends.calls,
            responseTrends: trends.response,
            coverageTrends: trends.coverage,
            complianceTrends: trends.compliance,
            careHomes,
            staffing: {
                available: availableStaff,
                total: staff.length,
                schedule: trends.staffing,
                coverage: trends.coverage
            }
        };
    }

    private generateComplianceReport(
        records: OnCallRecord[],
        issues: any[],
        trends: any
    ): ComplianceReport {
        // Calculate overall compliance
        const compliantRecords = records.filter(r => 
            r.compliance?.standardsMet && !r.compliance?.regulatoryRequirements.length
        ).length;

        const complianceRate = Math.round((compliantRecords / records.length) * 100);

        // Group issues by category
        const categories = issues.reduce((acc: any, issue) => {
            const cat = acc[issue.category] || { issues: 0, compliant: 0, total: 0 };
            cat.issues += 1;
            cat.total += 1;
            if (issue.resolved) cat.compliant += 1;
            acc[issue.category] = cat;
            return acc;
        }, {});

        return {
            overall: {
                rate: `${complianceRate}%`,
                issues: issues.length,
                critical: issues.filter(i => i.severity === 'high').length
            },
            byCategory: Object.entries(categories).map(([category, data]: [string, any]) => ({
                category,
                rate: `${Math.round((data.compliant / data.total) * 100)}%`,
                issues: data.issues
            })),
            recentIssues: issues
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10),
            trends: {
                daily: trends.daily,
                weekly: trends.weekly,
                monthly: trends.monthly
            }
        };
    }

    private groupByCareHome(records: OnCallRecord[], staff: Staff[]) {
        const homes = new Map<string, any>();

        records.forEach(record => {
            const home = homes.get(record.careHomeId) || {
                id: record.careHomeId,
                name: '', // Will be populated from API
                records: [],
                staff: []
            };
            home.records.push(record);
            homes.set(record.careHomeId, home);
        });

        staff.forEach(member => {
            member.regions.forEach(region => {
                const home = Array.from(homes.values())
                    .find(h => h.id.startsWith(region));
                if (home) {
                    home.staff.push(member);
                }
            });
        });

        return Array.from(homes.values()).map(home => {
            const activeCalls = home.records.filter(r => r.status === 'active').length;
            const responseTimes = home.records
                .map(r => {
                    const created = new Date(r.timestamp);
                    const responded = r.actions?.find(a => a.action === 'responded')?.timestamp;
                    return responded ? new Date(responded).getTime() - created.getTime() : null;
                })
                .filter(Boolean);
            
            const avgResponseTime = responseTimes.length > 0
                ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000 / 60)
                : 0;

            const availableStaff = home.staff.filter(s => 
                s.availability.some(a => 
                    new Date(a.start) <= new Date() && new Date(a.end) >= new Date()
                )
            ).length;

            const staffCoverage = Math.round((availableStaff / home.staff.length) * 100);

            const compliantRecords = home.records.filter(r => 
                r.compliance?.standardsMet && !r.compliance?.regulatoryRequirements.length
            ).length;

            const complianceRate = Math.round((compliantRecords / home.records.length) * 100);

            return {
                id: home.id,
                name: home.name,
                activeCalls,
                responseTime: `${avgResponseTime}m`,
                staffCoverage: `${staffCoverage}%`,
                compliance: `${complianceRate}%`,
                status: this.determineStatus(activeCalls, avgResponseTime, staffCoverage, complianceRate)
            };
        });
    }

    private determineStatus(
        activeCalls: number,
        responseTime: number,
        staffCoverage: number,
        compliance: number
    ): 'normal' | 'warning' | 'critical' {
        if (
            staffCoverage < 50 ||
            compliance < 70 ||
            responseTime > 30 ||
            activeCalls > 10
        ) {
            return 'critical';
        }

        if (
            staffCoverage < 70 ||
            compliance < 85 ||
            responseTime > 15 ||
            activeCalls > 5
        ) {
            return 'warning';
        }

        return 'normal';
    }
}
