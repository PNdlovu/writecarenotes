/**
 * @writecarenotes.com
 * @fileoverview Medication Regulatory Reporting Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles regulatory reporting requirements for medications across all regions,
 * including CQC, CIW, Care Inspectorate, RQIA, and HIQA compliance reporting.
 */

import { Region } from '@/features/compliance/types/compliance.types';
import { RegionalConfigService } from './RegionalConfigService';
import { LocalizationService } from './LocalizationService';

interface IncidentReport {
  id: string;
  date: Date;
  type: string;
  severity: string;
  description: string;
  actions: string[];
  witnesses: string[];
  notifiedAuthorities: string[];
}

interface MedicationError {
  id: string;
  date: Date;
  type: string;
  medication: string;
  resident: string;
  description: string;
  outcome: string;
  preventiveMeasures: string[];
}

interface ControlledDrugsReport {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  discrepancies: {
    date: Date;
    drug: string;
    expected: number;
    actual: number;
    investigation: string;
    outcome: string;
  }[];
  inspections: {
    date: Date;
    inspector: string;
    findings: string[];
  }[];
}

// Add new interfaces for analytics
interface ComplianceAnalytics {
  region: Region;
  complianceRate: number;
  incidentCount: number;
  errorCount: number;
  controlledDrugsDiscrepancies: number;
  lastAuditDate: Date;
  nextAuditDue: Date;
  criticalFindings: number;
}

interface CrossRegionalAnalytics {
  overallComplianceRate: number;
  regionComparison: Record<Region, ComplianceAnalytics>;
  trends: {
    period: string;
    metrics: Record<Region, ComplianceAnalytics>;
  }[];
}

export class RegulatoryReportingService {
  private regionalConfig: RegionalConfigService;
  private localization: LocalizationService;

  constructor(private readonly region: Region) {
    this.regionalConfig = new RegionalConfigService(region);
    this.localization = new LocalizationService(region);
  }

  async generateIncidentReport(incident: IncidentReport): Promise<string> {
    try {
      const regulatoryBody = this.regionalConfig.getRegulatoryBody();
      const formattedDate = this.localization.formatDate(incident.date);

      // Generate report based on regulatory body requirements
      const report = {
        regulatoryBody,
        reportType: 'MEDICATION_INCIDENT',
        reference: incident.id,
        dateOfIncident: formattedDate,
        details: {
          ...incident,
          date: formattedDate,
          regulatoryFramework: this.getRegionalFramework(),
          reportingRequirements: this.getReportingRequirements()
        }
      };

      // Store report in compliance records
      await this.storeReport(report);

      // Return report reference
      return incident.id;
    } catch (error) {
      throw new Error('Failed to generate incident report');
    }
  }

  async generateErrorReport(error: MedicationError): Promise<string> {
    try {
      const regulatoryBody = this.regionalConfig.getRegulatoryBody();
      const formattedDate = this.localization.formatDate(error.date);

      // Generate report based on regulatory body requirements
      const report = {
        regulatoryBody,
        reportType: 'MEDICATION_ERROR',
        reference: error.id,
        dateOfError: formattedDate,
        details: {
          ...error,
          date: formattedDate,
          regulatoryFramework: this.getRegionalFramework(),
          reportingRequirements: this.getReportingRequirements()
        }
      };

      // Store report in compliance records
      await this.storeReport(report);

      // Return report reference
      return error.id;
    } catch (error) {
      throw new Error('Failed to generate error report');
    }
  }

  async generateControlledDrugsReport(report: ControlledDrugsReport): Promise<string> {
    try {
      const regulatoryBody = this.regionalConfig.getRegulatoryBody();
      const formattedStartDate = this.localization.formatDate(report.period.start);
      const formattedEndDate = this.localization.formatDate(report.period.end);

      // Generate report based on regulatory body requirements
      const formattedReport = {
        regulatoryBody,
        reportType: 'CONTROLLED_DRUGS_AUDIT',
        reference: report.id,
        period: {
          start: formattedStartDate,
          end: formattedEndDate
        },
        details: {
          ...report,
          period: {
            start: formattedStartDate,
            end: formattedEndDate
          },
          regulatoryFramework: this.getRegionalFramework(),
          reportingRequirements: this.getReportingRequirements()
        }
      };

      // Store report in compliance records
      await this.storeReport(formattedReport);

      // Return report reference
      return report.id;
    } catch (error) {
      throw new Error('Failed to generate controlled drugs report');
    }
  }

  async getCrossRegionalAnalytics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CrossRegionalAnalytics> {
    try {
      const regions = Object.values(Region);
      const regionAnalytics = await Promise.all(
        regions.map(region => this.getRegionalAnalytics(organizationId, region, startDate, endDate))
      );

      const regionComparison = regions.reduce((acc, region, index) => {
        acc[region] = regionAnalytics[index];
        return acc;
      }, {} as Record<Region, ComplianceAnalytics>);

      const overallComplianceRate = this.calculateOverallCompliance(regionAnalytics);
      const trends = await this.getComplianceTrends(organizationId, startDate, endDate);

      return {
        overallComplianceRate,
        regionComparison,
        trends
      };
    } catch (error) {
      throw new Error('Failed to generate cross-regional analytics');
    }
  }

  private async getRegionalAnalytics(
    organizationId: string,
    region: Region,
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceAnalytics> {
    try {
      const [incidents, errors, audits] = await Promise.all([
        this.fetchIncidents(organizationId, region, startDate, endDate),
        this.fetchErrors(organizationId, region, startDate, endDate),
        this.fetchAudits(organizationId, region, startDate, endDate)
      ]);

      const lastAudit = audits[0] || null;
      const criticalFindings = this.countCriticalFindings(audits);
      const complianceRate = this.calculateComplianceRate(audits);

      return {
        region,
        complianceRate,
        incidentCount: incidents.length,
        errorCount: errors.length,
        controlledDrugsDiscrepancies: this.countCDDiscrepancies(audits),
        lastAuditDate: lastAudit?.auditDate || new Date(),
        nextAuditDue: this.calculateNextAuditDate(lastAudit),
        criticalFindings
      };
    } catch (error) {
      throw new Error(`Failed to generate analytics for region: ${region}`);
    }
  }

  private async getComplianceTrends(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ period: string; metrics: Record<Region, ComplianceAnalytics> }[]> {
    // Split the date range into months
    const months = this.getMonthsBetweenDates(startDate, endDate);
    
    // Get analytics for each month
    const trends = await Promise.all(
      months.map(async ([start, end]) => {
        const regions = Object.values(Region);
        const metrics = await Promise.all(
          regions.map(region => 
            this.getRegionalAnalytics(organizationId, region, start, end)
          )
        );

        return {
          period: start.toISOString().slice(0, 7), // YYYY-MM
          metrics: regions.reduce((acc, region, index) => {
            acc[region] = metrics[index];
            return acc;
          }, {} as Record<Region, ComplianceAnalytics>)
        };
      })
    );

    return trends;
  }

  private calculateOverallCompliance(analytics: ComplianceAnalytics[]): number {
    const total = analytics.reduce((sum, curr) => sum + curr.complianceRate, 0);
    return total / analytics.length;
  }

  private countCriticalFindings(audits: any[]): number {
    return audits.reduce((count, audit) => {
      return count + (audit.findings || [])
        .filter((f: any) => f.priority === 'HIGH' && f.status === 'NON_COMPLIANT')
        .length;
    }, 0);
  }

  private countCDDiscrepancies(audits: any[]): number {
    return audits.reduce((count, audit) => {
      return count + (audit.controlledDrugsAudit?.discrepancies || 0);
    }, 0);
  }

  private calculateNextAuditDate(lastAudit: any): Date {
    if (!lastAudit) {
      return new Date();
    }
    const nextDate = new Date(lastAudit.auditDate);
    nextDate.setMonth(nextDate.getMonth() + 3); // Quarterly audits
    return nextDate;
  }

  private getMonthsBetweenDates(start: Date, end: Date): [Date, Date][] {
    const months: [Date, Date][] = [];
    let current = new Date(start);
    
    while (current < end) {
      const monthStart = new Date(current);
      const monthEnd = new Date(current);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0); // Last day of month
      
      months.push([monthStart, monthEnd]);
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }

  private async fetchIncidents(
    organizationId: string,
    region: Region,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `/api/compliance/incidents?organizationId=${organizationId}&region=${region}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      return response.json();
    } catch (error) {
      return [];
    }
  }

  private async fetchErrors(
    organizationId: string,
    region: Region,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `/api/compliance/errors?organizationId=${organizationId}&region=${region}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch errors');
      }
      return response.json();
    } catch (error) {
      return [];
    }
  }

  private async fetchAudits(
    organizationId: string,
    region: Region,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `/api/compliance/audits?organizationId=${organizationId}&region=${region}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch audits');
      }
      return response.json();
    } catch (error) {
      return [];
    }
  }

  private calculateComplianceRate(audits: any[]): number {
    if (!audits.length) return 0;
    
    const compliantFindings = audits.reduce((count, audit) => {
      return count + (audit.findings || [])
        .filter((f: any) => f.status === 'COMPLIANT')
        .length;
    }, 0);
    
    const totalFindings = audits.reduce((count, audit) => {
      return count + (audit.findings || []).length;
    }, 0);
    
    return totalFindings ? (compliantFindings / totalFindings) * 100 : 0;
  }

  private getRegionalFramework(): string {
    switch (this.region) {
      case Region.ENGLAND:
        return 'CQC Fundamental Standards';
      case Region.WALES:
        return 'CIW Regulatory Framework';
      case Region.SCOTLAND:
        return 'Care Inspectorate Health and Social Care Standards';
      case Region.NORTHERN_IRELAND:
        return 'RQIA Standards';
      case Region.IRELAND:
        return 'HIQA National Standards';
      default:
        throw new Error('Unsupported region');
    }
  }

  private getReportingRequirements(): string[] {
    switch (this.region) {
      case Region.ENGLAND:
        return [
          'Regulation 12: Safe Care and Treatment',
          'Regulation 17: Good Governance'
        ];
      case Region.WALES:
        return [
          'Regulation 58: Medicines',
          'Regulation 60: Records'
        ];
      case Region.SCOTLAND:
        return [
          'Standard 4.27: Medication Management',
          'Standard 4.23: Record Keeping'
        ];
      case Region.NORTHERN_IRELAND:
        return [
          'Standard 28: Medicines Management',
          'Standard 37: Record Keeping'
        ];
      case Region.IRELAND:
        return [
          'Standard 2.6: Medication Management',
          'Standard 2.8: Record Keeping'
        ];
      default:
        throw new Error('Unsupported region');
    }
  }

  private async storeReport(report: any): Promise<void> {
    // Implementation for storing report in compliance records
    // This would typically involve saving to a database
    try {
      await fetch('/api/compliance/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      throw new Error('Failed to store report');
    }
  }
} 