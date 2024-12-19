import { PrismaClient } from '@prisma/client';
import { logger } from '../../../utils/logger';
import { NotificationService } from '../../../services/notificationService';
import { 
  Policy,
  PolicyVersion,
  PolicyApproval,
  PolicyDistribution,
  ComplianceFramework,
  RiskLevel
} from '../types';

export class PolicyManagementService {
  private prisma: PrismaClient;
  private notificationService: NotificationService;

  constructor(prisma: PrismaClient, notificationService: NotificationService) {
    this.prisma = prisma;
    this.notificationService = notificationService;
  }

  async createPolicy(policy: Omit<Policy, 'id'>): Promise<Policy> {
    try {
      const newPolicy = await this.prisma.policy.create({
        data: {
          ...policy,
          status: 'DRAFT',
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            riskLevel: policy.riskLevel || RiskLevel.HIGH,
            frameworks: [
              ComplianceFramework.ISO_27001,
              ComplianceFramework.ISO_27002,
              ComplianceFramework.HIPAA,
              ComplianceFramework.GDPR
            ],
            requiresAnnualReview: true,
            requiresTraining: true
          }
        }
      });

      await this.logPolicyAction(newPolicy.id, 'CREATED', 'Policy created');
      return newPolicy;
    } catch (error) {
      logger.error('Error creating policy:', error);
      throw new Error('Failed to create policy');
    }
  }

  async updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy> {
    try {
      const currentPolicy = await this.prisma.policy.findUnique({ where: { id } });
      if (!currentPolicy) throw new Error('Policy not found');

      // Create new version
      await this.createPolicyVersion(currentPolicy);

      const updatedPolicy = await this.prisma.policy.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),
          version: currentPolicy.version + 1
        }
      });

      await this.logPolicyAction(id, 'UPDATED', 'Policy updated');
      return updatedPolicy;
    } catch (error) {
      logger.error('Error updating policy:', error);
      throw new Error('Failed to update policy');
    }
  }

  async submitForApproval(id: string, approvers: string[]): Promise<void> {
    try {
      await this.prisma.policy.update({
        where: { id },
        data: { status: 'PENDING_APPROVAL' }
      });

      // Create approval workflow
      await this.createApprovalWorkflow(id, approvers);

      // Notify approvers
      await Promise.all(
        approvers.map(approver =>
          this.notificationService.sendNotification({
            userId: approver,
            type: 'POLICY_APPROVAL_REQUIRED',
            message: `Your approval is required for policy ${id}`,
            priority: 'HIGH'
          })
        )
      );

      await this.logPolicyAction(id, 'SUBMITTED_FOR_APPROVAL', 'Policy submitted for approval');
    } catch (error) {
      logger.error('Error submitting policy for approval:', error);
      throw new Error('Failed to submit policy for approval');
    }
  }

  async approvePolicy(id: string, approverId: string, comments?: string): Promise<void> {
    try {
      const approval = await this.prisma.policyApproval.findFirst({
        where: { policyId: id, approverId, status: 'PENDING' }
      });

      if (!approval) throw new Error('No pending approval found');

      await this.prisma.policyApproval.update({
        where: { id: approval.id },
        data: {
          status: 'APPROVED',
          comments,
          approvedAt: new Date()
        }
      });

      // Check if all approvals are complete
      const pendingApprovals = await this.prisma.policyApproval.count({
        where: { policyId: id, status: 'PENDING' }
      });

      if (pendingApprovals === 0) {
        await this.publishPolicy(id);
      }

      await this.logPolicyAction(id, 'APPROVED', `Policy approved by ${approverId}`);
    } catch (error) {
      logger.error('Error approving policy:', error);
      throw new Error('Failed to approve policy');
    }
  }

  private async publishPolicy(id: string): Promise<void> {
    try {
      await this.prisma.policy.update({
        where: { id },
        data: { 
          status: 'ACTIVE',
          publishedAt: new Date()
        }
      });

      // Create distribution records
      await this.createDistributionRecords(id);

      await this.logPolicyAction(id, 'PUBLISHED', 'Policy published');
    } catch (error) {
      logger.error('Error publishing policy:', error);
      throw new Error('Failed to publish policy');
    }
  }

  private async createPolicyVersion(policy: Policy): Promise<PolicyVersion> {
    return await this.prisma.policyVersion.create({
      data: {
        policyId: policy.id,
        version: policy.version,
        content: policy.content,
        metadata: policy.metadata,
        createdAt: new Date()
      }
    });
  }

  private async createApprovalWorkflow(policyId: string, approvers: string[]): Promise<void> {
    await this.prisma.policyApproval.createMany({
      data: approvers.map(approverId => ({
        policyId,
        approverId,
        status: 'PENDING',
        createdAt: new Date()
      }))
    });
  }

  private async createDistributionRecords(policyId: string): Promise<void> {
    const affectedUsers = await this.getAffectedUsers(policyId);
    
    await this.prisma.policyDistribution.createMany({
      data: affectedUsers.map(userId => ({
        policyId,
        userId,
        status: 'PENDING',
        distributedAt: new Date()
      }))
    });

    // Send notifications to affected users
    await Promise.all(
      affectedUsers.map(userId =>
        this.notificationService.sendNotification({
          userId,
          type: 'NEW_POLICY_AVAILABLE',
          message: `A new policy requires your acknowledgment`,
          priority: 'HIGH'
        })
      )
    );
  }

  private async getAffectedUsers(policyId: string): Promise<string[]> {
    // Implementation to determine which users are affected by the policy
    // This could be based on roles, departments, or other criteria
    return []; // Placeholder
  }

  private async logPolicyAction(
    policyId: string,
    action: string,
    description: string
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'POLICY',
        entityId: policyId,
        action,
        description,
        timestamp: new Date()
      }
    });
  }
}
