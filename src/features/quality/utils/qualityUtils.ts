/**
 * WriteCareNotes.com
 * @fileoverview Quality Module Utilities
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { 
  QualityAudit, 
  AuditSection, 
  ComplianceLevel,
  ImpactLevel,
  QualityStats
} from '../types';

/**
 * Calculates the overall score for an audit based on section scores
 */
export function calculateOverallScore(audit: QualityAudit): number {
  if (!audit.sections.length) return 0;

  const totalScore = audit.sections.reduce((sum, section) => {
    return sum + (section.score || 0);
  }, 0);

  return Math.round((totalScore / audit.sections.length) * 100) / 100;
}

/**
 * Calculates the score for a single audit section
 */
export function calculateSectionScore(section: AuditSection): number {
  if (!section.criteria.length) return 0;

  const weights: Record<ComplianceLevel, number> = {
    COMPLIANT: 1,
    PARTIAL: 0.5,
    NON_COMPLIANT: 0,
    NOT_APPLICABLE: 0
  };

  const applicableCriteria = section.criteria.filter(
    c => c.compliance !== 'NOT_APPLICABLE'
  );

  if (!applicableCriteria.length) return 0;

  const totalScore = applicableCriteria.reduce((sum, criterion) => {
    return sum + weights[criterion.compliance];
  }, 0);

  return Math.round((totalScore / applicableCriteria.length) * 100) / 100;
}

/**
 * Determines the risk level for an audit based on findings
 */
export function determineRiskLevel(audit: QualityAudit): ImpactLevel {
  const criticalFindings = audit.sections.flatMap(s => 
    s.criteria.filter(c => 
      c.compliance === 'NON_COMPLIANT' && c.impact === 'CRITICAL'
    )
  );

  if (criticalFindings.length > 0) return 'CRITICAL';

  const highRiskFindings = audit.sections.flatMap(s => 
    s.criteria.filter(c => 
      c.compliance === 'NON_COMPLIANT' && c.impact === 'HIGH'
    )
  );

  if (highRiskFindings.length > 0) return 'HIGH';

  const mediumRiskFindings = audit.sections.flatMap(s => 
    s.criteria.filter(c => 
      (c.compliance === 'NON_COMPLIANT' || c.compliance === 'PARTIAL') && 
      c.impact === 'MEDIUM'
    )
  );

  if (mediumRiskFindings.length > 0) return 'MEDIUM';

  return 'LOW';
}

/**
 * Formats a date string according to the application's standard format
 */
export function formatAuditDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Calculates the completion percentage of an action plan
 */
export function calculateActionPlanProgress(audit: QualityAudit): number {
  if (!audit.actionPlan?.actions.length) return 0;

  const completedActions = audit.actionPlan.actions.filter(
    action => action.status === 'COMPLETED'
  );

  return Math.round((completedActions.length / audit.actionPlan.actions.length) * 100);
}

/**
 * Generates a summary of critical and high-risk findings
 */
export function generatePriorityFindingsSummary(audit: QualityAudit): string[] {
  const priorityFindings = audit.sections.flatMap(section => 
    section.criteria
      .filter(c => 
        c.compliance === 'NON_COMPLIANT' && 
        (c.impact === 'CRITICAL' || c.impact === 'HIGH')
      )
      .map(c => ({
        section: section.title,
        description: c.description,
        impact: c.impact
      }))
  );

  return priorityFindings.map(finding => 
    `[${finding.impact}] ${finding.section}: ${finding.description}`
  );
}

/**
 * Calculates trend metrics by comparing current stats with previous period
 */
export function calculateTrends(
  current: QualityStats,
  previous: QualityStats
): { improvement: number; decline: number; unchanged: number } {
  return {
    improvement: Math.max(0, current.overallCompliance - previous.overallCompliance),
    decline: Math.max(0, previous.overallCompliance - current.overallCompliance),
    unchanged: current.overallCompliance === previous.overallCompliance ? 1 : 0
  };
}

/**
 * Validates an audit object for completeness and data integrity
 */
export function validateAudit(audit: QualityAudit): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  if (!audit.careHomeId) errors.push('Care home ID is required');
  if (!audit.type) errors.push('Audit type is required');
  if (!audit.status) errors.push('Audit status is required');
  if (!audit.scheduledDate) errors.push('Scheduled date is required');
  if (!audit.auditor) errors.push('Auditor information is required');
  if (!audit.sections || audit.sections.length === 0) {
    errors.push('At least one audit section is required');
  }

  // Sections validation
  audit.sections?.forEach((section, index) => {
    if (!section.title) {
      errors.push(`Section ${index + 1}: Title is required`);
    }
    if (!section.criteria || section.criteria.length === 0) {
      errors.push(`Section ${index + 1}: At least one criterion is required`);
    }
    section.criteria?.forEach((criterion, cIndex) => {
      if (!criterion.description) {
        errors.push(`Section ${index + 1}, Criterion ${cIndex + 1}: Description is required`);
      }
      if (!criterion.compliance) {
        errors.push(`Section ${index + 1}, Criterion ${cIndex + 1}: Compliance level is required`);
      }
      if (!criterion.impact) {
        errors.push(`Section ${index + 1}, Criterion ${cIndex + 1}: Impact level is required`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
} 