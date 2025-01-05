import { db } from '@/lib/db';
import { and, eq, sql, gte, lte } from 'drizzle-orm';
import {
  medications,
  medicationAdministrations,
  medicationIncidents,
  medicationInventoryAudits,
  medicationSignatures
} from '@/lib/db/schema/medication';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface ComplianceMetrics {
  administrationCompliance: {
    total: number;
    completed: number;
    missed: number;
    late: number;
    refused: number;
    complianceRate: number;
  };
  controlledSubstances: {
    total: number;
    withWitness: number;
    withoutWitness: number;
    complianceRate: number;
  };
  prnMedications: {
    total: number;
    withEffectiveness: number;
    withoutEffectiveness: number;
    effectivenessRate: number;
  };
  incidents: {
    total: number;
    severity: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    status: {
      reported: number;
      underReview: number;
      resolved: number;
    };
  };
  inventory: {
    total: number;
    discrepancies: number;
    resolved: number;
    discrepancyRate: number;
  };
}

export class ComplianceReporter {
  private async getAdministrationCompliance(startDate: Date, endDate: Date): Promise<ComplianceMetrics['administrationCompliance']> {
    const results = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`sum(case when status = 'COMPLETED' then 1 else 0 end)`,
        missed: sql<number>`sum(case when status = 'MISSED' then 1 else 0 end)`,
        late: sql<number>`sum(case when status = 'LATE' then 1 else 0 end)`,
        refused: sql<number>`sum(case when status = 'REFUSED' then 1 else 0 end)`,
      })
      .from(medicationAdministrations)
      .where(
        and(
          gte(medicationAdministrations.scheduledTime, startDate),
          lte(medicationAdministrations.scheduledTime, endDate)
        )
      );

    const { total, completed, missed, late, refused } = results[0];
    const complianceRate = (completed / total) * 100;

    return {
      total,
      completed,
      missed,
      late,
      refused,
      complianceRate
    };
  }

  private async getControlledSubstanceCompliance(startDate: Date, endDate: Date): Promise<ComplianceMetrics['controlledSubstances']> {
    const results = await db
      .select({
        total: sql<number>`count(*)`,
        withWitness: sql<number>`sum(case when witnessed_by is not null then 1 else 0 end)`,
        withoutWitness: sql<number>`sum(case when witnessed_by is null then 1 else 0 end)`,
      })
      .from(medicationAdministrations)
      .innerJoin(medications, eq(medicationAdministrations.medicationId, medications.id))
      .where(
        and(
          eq(medications.isControlled, true),
          gte(medicationAdministrations.scheduledTime, startDate),
          lte(medicationAdministrations.scheduledTime, endDate)
        )
      );

    const { total, withWitness, withoutWitness } = results[0];
    const complianceRate = (withWitness / total) * 100;

    return {
      total,
      withWitness,
      withoutWitness,
      complianceRate
    };
  }

  private async getPRNCompliance(startDate: Date, endDate: Date): Promise<ComplianceMetrics['prnMedications']> {
    const results = await db
      .select({
        total: sql<number>`count(*)`,
        withEffectiveness: sql<number>`sum(case when effectiveness is not null then 1 else 0 end)`,
        withoutEffectiveness: sql<number>`sum(case when effectiveness is null then 1 else 0 end)`,
      })
      .from(medicationAdministrations)
      .innerJoin(medications, eq(medicationAdministrations.medicationId, medications.id))
      .where(
        and(
          eq(medications.isPRN, true),
          gte(medicationAdministrations.scheduledTime, startDate),
          lte(medicationAdministrations.scheduledTime, endDate)
        )
      );

    const { total, withEffectiveness, withoutEffectiveness } = results[0];
    const effectivenessRate = (withEffectiveness / total) * 100;

    return {
      total,
      withEffectiveness,
      withoutEffectiveness,
      effectivenessRate
    };
  }

  private async getIncidentMetrics(startDate: Date, endDate: Date): Promise<ComplianceMetrics['incidents']> {
    const results = await db
      .select({
        total: sql<number>`count(*)`,
        lowSeverity: sql<number>`sum(case when severity = 'LOW' then 1 else 0 end)`,
        mediumSeverity: sql<number>`sum(case when severity = 'MEDIUM' then 1 else 0 end)`,
        highSeverity: sql<number>`sum(case when severity = 'HIGH' then 1 else 0 end)`,
        criticalSeverity: sql<number>`sum(case when severity = 'CRITICAL' then 1 else 0 end)`,
        reported: sql<number>`sum(case when status = 'REPORTED' then 1 else 0 end)`,
        underReview: sql<number>`sum(case when status = 'UNDER_REVIEW' then 1 else 0 end)`,
        resolved: sql<number>`sum(case when status = 'RESOLVED' then 1 else 0 end)`,
      })
      .from(medicationIncidents)
      .where(
        and(
          gte(medicationIncidents.createdAt, startDate),
          lte(medicationIncidents.createdAt, endDate)
        )
      );

    const {
      total,
      lowSeverity,
      mediumSeverity,
      highSeverity,
      criticalSeverity,
      reported,
      underReview,
      resolved
    } = results[0];

    return {
      total,
      severity: {
        low: lowSeverity,
        medium: mediumSeverity,
        high: highSeverity,
        critical: criticalSeverity
      },
      status: {
        reported,
        underReview,
        resolved
      }
    };
  }

  private async getInventoryMetrics(startDate: Date, endDate: Date): Promise<ComplianceMetrics['inventory']> {
    const results = await db
      .select({
        total: sql<number>`count(*)`,
        discrepancies: sql<number>`sum(case when has_discrepancy = true then 1 else 0 end)`,
        resolved: sql<number>`sum(case when has_discrepancy = true and resolved = true then 1 else 0 end)`,
      })
      .from(medicationInventoryAudits)
      .where(
        and(
          gte(medicationInventoryAudits.createdAt, startDate),
          lte(medicationInventoryAudits.createdAt, endDate)
        )
      );

    const { total, discrepancies, resolved } = results[0];
    const discrepancyRate = (discrepancies / total) * 100;

    return {
      total,
      discrepancies,
      resolved,
      discrepancyRate
    };
  }

  async generateMonthlyReport(date: Date = new Date()): Promise<ComplianceMetrics> {
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);

    const [
      administrationCompliance,
      controlledSubstances,
      prnMedications,
      incidents,
      inventory
    ] = await Promise.all([
      this.getAdministrationCompliance(startDate, endDate),
      this.getControlledSubstanceCompliance(startDate, endDate),
      this.getPRNCompliance(startDate, endDate),
      this.getIncidentMetrics(startDate, endDate),
      this.getInventoryMetrics(startDate, endDate)
    ]);

    return {
      administrationCompliance,
      controlledSubstances,
      prnMedications,
      incidents,
      inventory
    };
  }

  async generateTrendReport(months: number = 6): Promise<ComplianceMetrics[]> {
    const reports: ComplianceMetrics[] = [];
    
    for (let i = 0; i < months; i++) {
      const date = subMonths(new Date(), i);
      const report = await this.generateMonthlyReport(date);
      reports.unshift(report);
    }

    return reports;
  }

  async generateCustomReport(startDate: Date, endDate: Date): Promise<ComplianceMetrics> {
    return {
      administrationCompliance: await this.getAdministrationCompliance(startDate, endDate),
      controlledSubstances: await this.getControlledSubstanceCompliance(startDate, endDate),
      prnMedications: await this.getPRNCompliance(startDate, endDate),
      incidents: await this.getIncidentMetrics(startDate, endDate),
      inventory: await this.getInventoryMetrics(startDate, endDate)
    };
  }
}


