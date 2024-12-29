import { z } from 'zod';
import { Region, getRegionalConfig } from '@/lib/regional/config';
import { Activity, ActivityParticipant } from '../types';
import { logger } from '@/lib/logger';

export interface ComplianceViolation {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  details?: Record<string, any>;
}

export interface ComplianceCheckResult {
  passed: boolean;
  violations: ComplianceViolation[];
}

export class ComplianceChecker {
  private region: Region;
  private config: Awaited<ReturnType<typeof getRegionalConfig>>;

  constructor(region: Region, config: Awaited<ReturnType<typeof getRegionalConfig>>) {
    this.region = region;
    this.config = config;
  }

  async checkActivity(activity: Activity): Promise<ComplianceCheckResult> {
    const violations: ComplianceViolation[] = [];

    // Check data retention
    const activityAge = this.getActivityAgeInDays(activity);
    if (activityAge > this.config.regulations.dataRetentionDays) {
      violations.push({
        code: 'DATA_RETENTION_VIOLATION',
        message: `Activity exceeds maximum retention period of ${this.config.regulations.dataRetentionDays} days`,
        severity: 'high',
        details: { activityAge, maxRetention: this.config.regulations.dataRetentionDays }
      });
    }

    // Check consent validity
    if (this.config.regulations.requiresConsent) {
      const consentViolations = await this.checkConsent(activity);
      violations.push(...consentViolations);
    }

    // Check data completeness
    const completenessViolations = this.checkDataCompleteness(activity);
    violations.push(...completenessViolations);

    // Check participant data
    const participantViolations = await this.checkParticipants(activity.participants);
    violations.push(...participantViolations);

    return {
      passed: violations.length === 0,
      violations
    };
  }

  private getActivityAgeInDays(activity: Activity): number {
    const now = new Date();
    const activityDate = new Date(activity.updatedAt || activity.createdAt);
    const diffTime = Math.abs(now.getTime() - activityDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async checkConsent(activity: Activity): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    
    if (!activity.consentDate) {
      violations.push({
        code: 'MISSING_CONSENT',
        message: 'Activity requires explicit consent',
        severity: 'high'
      });
      return violations;
    }

    const consentAge = this.getActivityAgeInDays(
      { ...activity, updatedAt: activity.consentDate }
    );

    if (consentAge > this.config.regulations.consentValidityDays) {
      violations.push({
        code: 'EXPIRED_CONSENT',
        message: `Consent has expired after ${this.config.regulations.consentValidityDays} days`,
        severity: 'high',
        details: { consentAge, maxValidity: this.config.regulations.consentValidityDays }
      });
    }

    return violations;
  }

  private checkDataCompleteness(activity: Activity): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    const requiredFields = [
      'title',
      'description',
      'type',
      'status',
      'startTime',
      'organizationId',
      'careHomeId'
    ];

    for (const field of requiredFields) {
      if (!activity[field]) {
        violations.push({
          code: 'MISSING_REQUIRED_FIELD',
          message: `Required field '${field}' is missing`,
          severity: 'medium',
          details: { field }
        });
      }
    }

    return violations;
  }

  private async checkParticipants(
    participants?: ActivityParticipant[]
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    if (!participants || participants.length === 0) {
      violations.push({
        code: 'NO_PARTICIPANTS',
        message: 'Activity must have at least one participant',
        severity: 'medium'
      });
      return violations;
    }

    for (const participant of participants) {
      if (!participant.consentDate && this.config.regulations.requiresConsent) {
        violations.push({
          code: 'PARTICIPANT_MISSING_CONSENT',
          message: `Participant ${participant.id} requires explicit consent`,
          severity: 'high',
          details: { participantId: participant.id }
        });
      }
    }

    return violations;
  }
}

// Factory function to create a compliance checker for a specific region
export async function createComplianceChecker(
  region: Region
): Promise<ComplianceChecker> {
  const config = await getRegionalConfig(region);
  return new ComplianceChecker(region, config);
}
