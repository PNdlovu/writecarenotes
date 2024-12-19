import { Region } from '../types/compliance.types';
import { ComplianceRepository } from '../repositories/complianceRepository';
import {
  ComplianceFramework,
  ComplianceAudit,
  ComplianceEvidence,
  ComplianceSchedule,
  ComplianceFinding
} from '../types/compliance.types';

export class ComplianceService {
  constructor(
    private region: Region,
    private repository: ComplianceRepository = new ComplianceRepository()
  ) {}

  async getFrameworks(): Promise<ComplianceFramework[]> {
    return this.repository.getFrameworks(this.region);
  }

  private validateAuditInput(organizationId: string, careHomeId: string, frameworkId: string) {
    if (!organizationId) throw new Error('Organization ID is required');
    if (!careHomeId) throw new Error('Care Home ID is required');
    if (!frameworkId) throw new Error('Framework ID is required');
  }

  async validateCompliance(
    organizationId: string,
    careHomeId: string,
    frameworkId: string
  ): Promise<ComplianceAudit> {
    this.validateAuditInput(organizationId, careHomeId, frameworkId);

    // Get the framework and its requirements
    const framework = await this.repository.getFramework(frameworkId);
    if (!framework) {
      throw new Error('Compliance framework not found');
    }

    // Get existing evidence for requirements
    const evidencePromises = framework.requirements.map(req =>
      this.repository.getEvidence(req.id)
    );
    const allEvidence = await Promise.all(evidencePromises);

    // Evaluate each requirement
    const findings: Omit<ComplianceFinding, 'id'>[] = framework.requirements.map(
      (req, index) => {
        const evidence = allEvidence[index];
        const validEvidence = evidence.filter(
          e => !e.validUntil || new Date(e.validUntil) > new Date()
        );

        let status: ComplianceFinding['status'];
        let actionRequired = false;

        if (validEvidence.length === 0) {
          status = 'NON_COMPLIANT';
          actionRequired = true;
        } else if (validEvidence.length < req.evidenceRequired.length) {
          status = 'PARTIALLY_COMPLIANT';
          actionRequired = true;
        } else {
          status = 'COMPLIANT';
        }

        return {
          requirementId: req.id,
          status,
          evidence: validEvidence.map(e => e.id),
          notes: '',
          actionRequired,
          ...(actionRequired && {
            actionPlan: {
              description: `Gather required evidence for ${req.code}`,
              assignedTo: '',
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              priority: req.riskLevel,
              status: 'PENDING'
            }
          })
        };
      }
    );

    // Calculate overall score
    const score = this.calculateComplianceScore(findings);

    // Create and return audit
    const audit: Omit<ComplianceAudit, 'id'> = {
      frameworkId,
      organizationId,
      careHomeId,
      auditedBy: 'SYSTEM',
      auditDate: new Date(),
      findings: findings as ComplianceFinding[],
      score,
      nextAuditDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      status: 'SUBMITTED'
    };

    return this.repository.createAudit(audit);
  }

  private validateGetAuditsInput(organizationId: string) {
    if (!organizationId) throw new Error('Organization ID is required');
  }

  async getAudits(
    organizationId: string,
    careHomeId?: string
  ): Promise<ComplianceAudit[]> {
    this.validateGetAuditsInput(organizationId);
    return this.repository.getAudits(organizationId, careHomeId);
  }

  private validateGetAuditInput(id: string) {
    if (!id) throw new Error('Audit ID is required');
  }

  async getAudit(id: string): Promise<ComplianceAudit | null> {
    this.validateGetAuditInput(id);
    return this.repository.getAudit(id);
  }

  private validateUpdateAuditInput(id: string, audit: Partial<ComplianceAudit>) {
    if (!id) throw new Error('Audit ID is required');
    if (!audit) throw new Error('Audit data is required');
  }

  async updateAudit(
    id: string,
    audit: Partial<ComplianceAudit>
  ): Promise<ComplianceAudit> {
    this.validateUpdateAuditInput(id, audit);
    return this.repository.updateAudit(id, audit);
  }

  private validateAddEvidenceInput(evidence: Omit<ComplianceEvidence, 'id'>) {
    if (!evidence) throw new Error('Evidence data is required');
  }

  async addEvidence(evidence: Omit<ComplianceEvidence, 'id'>): Promise<ComplianceEvidence> {
    this.validateAddEvidenceInput(evidence);
    return this.repository.addEvidence(evidence);
  }

  private validateGetScheduleInput(organizationId: string) {
    if (!organizationId) throw new Error('Organization ID is required');
  }

  async getSchedule(
    organizationId: string,
    careHomeId?: string
  ): Promise<ComplianceSchedule[]> {
    this.validateGetScheduleInput(organizationId);
    return this.repository.getSchedule(organizationId, careHomeId);
  }

  private validateUpdateScheduleInput(id: string, schedule: Partial<ComplianceSchedule>) {
    if (!id) throw new Error('Schedule ID is required');
    if (!schedule) throw new Error('Schedule data is required');
  }

  async updateSchedule(
    id: string,
    schedule: Partial<ComplianceSchedule>
  ): Promise<ComplianceSchedule> {
    this.validateUpdateScheduleInput(id, schedule);
    return this.repository.updateSchedule(id, schedule);
  }

  private calculateComplianceScore(findings: Omit<ComplianceFinding, 'id'>[]): number {
    const weights = {
      COMPLIANT: 1,
      PARTIALLY_COMPLIANT: 0.5,
      NON_COMPLIANT: 0
    };

    const totalScore = findings.reduce(
      (sum, finding) => sum + weights[finding.status],
      0
    );

    return (totalScore / findings.length) * 100;
  }
}


