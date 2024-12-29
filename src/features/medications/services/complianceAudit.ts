/**
 * @fileoverview Medication Compliance Audit Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AccessManagementService } from '@/features/access-management/services/AccessManagementService';
import { SecurityConfig } from '@/features/access-management/types';

interface ComplianceAudit {
  id: string;
  medicationId: string;
  auditedBy: string;
  auditedAt: Date;
  findings: ComplianceFinding[];
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW';
  notes?: string;
}

interface ComplianceFinding {
  id: string;
  category: 'STORAGE' | 'DOCUMENTATION' | 'ADMINISTRATION' | 'DISPOSAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  recommendation?: string;
  dueDate?: Date;
  assignedTo?: string;
}

export class ComplianceAuditService {
  private static instance: ComplianceAuditService;
  private accessService: AccessManagementService;

  private constructor() {
    const config: SecurityConfig = {
      algorithm: 'aes-256-gcm',
      ivLength: 16,
      encryptionKey: Buffer.from(process.env.ENCRYPTION_KEY || '', 'base64'),
      tokenSecret: process.env.JWT_SECRET || '',
      tokenExpiry: 24 * 60 * 60,
      mfaEnabled: true,
      passwordPolicy: {
        minLength: 12,
        requireNumbers: true,
        requireSpecialChars: true,
        requireUppercase: true,
        requireLowercase: true,
        expiryDays: 90,
        preventReuse: 5
      }
    };

    this.accessService = new AccessManagementService(config);
  }

  public static getInstance(): ComplianceAuditService {
    if (!ComplianceAuditService.instance) {
      ComplianceAuditService.instance = new ComplianceAuditService();
    }
    return ComplianceAuditService.instance;
  }

  async initialize() {
    await this.accessService.initialize();
  }

  async createAudit(
    medicationId: string,
    userId: string,
    findings: ComplianceFinding[],
    notes?: string
  ): Promise<ComplianceAudit> {
    try {
      // Check if user has permission to create audits
      const accessDecision = await this.accessService.checkAccess({
        userId,
        resourceType: 'medication_audit',
        resourceId: medicationId,
        action: 'create'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to create medication audits');
      }

      // Calculate overall status based on findings
      const status = this.calculateAuditStatus(findings);

      // Create audit record
      const audit: ComplianceAudit = {
        id: crypto.randomUUID(),
        medicationId,
        auditedBy: userId,
        auditedAt: new Date(),
        findings,
        status,
        notes
      };

      // Store audit in database
      await fetch('/api/medication-audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audit)
      });

      // Log the audit creation
      await this.accessService.auditLog({
        action: 'MEDICATION_AUDIT_CREATED',
        description: `Medication compliance audit created for ${medicationId}`,
        userId,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date(),
        metadata: {
          medicationId,
          status,
          findingsCount: findings.length
        }
      });

      return audit;
    } catch (error) {
      console.error('Failed to create medication audit:', error);
      throw error;
    }
  }

  async getAuditHistory(medicationId: string, userId: string): Promise<ComplianceAudit[]> {
    try {
      // Check if user has permission to view audit history
      const accessDecision = await this.accessService.checkAccess({
        userId,
        resourceType: 'medication_audit',
        resourceId: medicationId,
        action: 'view'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to view audit history');
      }

      // Get audit history from database
      const response = await fetch(`/api/medication-audits?medicationId=${medicationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit history');
      }

      // Log the access
      await this.accessService.auditLog({
        action: 'AUDIT_HISTORY_VIEWED',
        description: `Audit history viewed for medication ${medicationId}`,
        userId,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date(),
        metadata: { medicationId }
      });

      return response.json();
    } catch (error) {
      console.error('Failed to get audit history:', error);
      throw error;
    }
  }

  private calculateAuditStatus(findings: ComplianceFinding[]): ComplianceAudit['status'] {
    const hasCritical = findings.some(f => f.severity === 'CRITICAL');
    const hasHigh = findings.some(f => f.severity === 'HIGH');
    const hasMedium = findings.some(f => f.severity === 'MEDIUM');

    if (hasCritical) {
      return 'NON_COMPLIANT';
    } else if (hasHigh) {
      return 'NEEDS_REVIEW';
    } else if (hasMedium) {
      return 'NEEDS_REVIEW';
    } else {
      return 'COMPLIANT';
    }
  }
} 


