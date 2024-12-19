import { prisma } from '@/lib/db';
import {
  ComplianceFramework,
  ComplianceAudit,
  ComplianceEvidence,
  ComplianceSchedule,
  Region
} from '../types/compliance.types';

export class ComplianceRepository {
  async getFrameworks(region: Region): Promise<ComplianceFramework[]> {
    try {
      return await prisma.complianceFramework.findMany({
        where: { region },
        include: { requirements: true }
      });
    } catch (error) {
      console.error('Error fetching compliance frameworks:', error);
      throw new Error('Failed to fetch compliance frameworks');
    }
  }

  async getFramework(id: string): Promise<ComplianceFramework | null> {
    try {
      return await prisma.complianceFramework.findUnique({
        where: { id },
        include: { requirements: true }
      });
    } catch (error) {
      console.error('Error fetching compliance framework:', error);
      throw new Error('Failed to fetch compliance framework');
    }
  }

  async getAudits(
    organizationId: string,
    careHomeId?: string
  ): Promise<ComplianceAudit[]> {
    try {
      return await prisma.complianceAudit.findMany({
        where: {
          organizationId,
          ...(careHomeId && { careHomeId })
        },
        include: {
          findings: {
            include: {
              actionPlan: true
            }
          }
        },
        orderBy: { auditDate: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching compliance audits:', error);
      throw new Error('Failed to fetch compliance audits');
    }
  }

  async getAudit(id: string): Promise<ComplianceAudit | null> {
    try {
      return await prisma.complianceAudit.findUnique({
        where: { id },
        include: {
          findings: {
            include: {
              actionPlan: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching compliance audit:', error);
      throw new Error('Failed to fetch compliance audit');
    }
  }

  async createAudit(audit: Omit<ComplianceAudit, 'id'>): Promise<ComplianceAudit> {
    try {
      return await prisma.complianceAudit.create({
        data: audit,
        include: {
          findings: {
            include: {
              actionPlan: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating compliance audit:', error);
      throw new Error('Failed to create compliance audit');
    }
  }

  async updateAudit(
    id: string,
    audit: Partial<ComplianceAudit>
  ): Promise<ComplianceAudit> {
    try {
      return await prisma.complianceAudit.update({
        where: { id },
        data: audit,
        include: {
          findings: {
            include: {
              actionPlan: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error updating compliance audit:', error);
      throw new Error('Failed to update compliance audit');
    }
  }

  async getEvidence(requirementId: string): Promise<ComplianceEvidence[]> {
    try {
      return await prisma.complianceEvidence.findMany({
        where: { requirementId },
        orderBy: { uploadedAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching compliance evidence:', error);
      throw new Error('Failed to fetch compliance evidence');
    }
  }

  async addEvidence(evidence: Omit<ComplianceEvidence, 'id'>): Promise<ComplianceEvidence> {
    try {
      return await prisma.complianceEvidence.create({
        data: evidence
      });
    } catch (error) {
      console.error('Error adding compliance evidence:', error);
      throw new Error('Failed to add compliance evidence');
    }
  }

  async getSchedule(
    organizationId: string,
    careHomeId?: string
  ): Promise<ComplianceSchedule[]> {
    try {
      return await prisma.complianceSchedule.findMany({
        where: {
          organizationId,
          ...(careHomeId && { careHomeId }),
          status: 'ACTIVE'
        },
        orderBy: { nextAuditDue: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching compliance schedule:', error);
      throw new Error('Failed to fetch compliance schedule');
    }
  }

  async updateSchedule(
    id: string,
    schedule: Partial<ComplianceSchedule>
  ): Promise<ComplianceSchedule> {
    try {
      return await prisma.complianceSchedule.update({
        where: { id },
        data: schedule
      });
    } catch (error) {
      console.error('Error updating compliance schedule:', error);
      throw new Error('Failed to update compliance schedule');
    }
  }
}


