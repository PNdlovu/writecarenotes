import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { NotificationService } from '@/features/notifications/services/notificationService'
import { ComplianceService } from './complianceService'
import { MonitoringService } from './monitoringService'
import {
    EmergencyAccess,
    EmergencyAccessWorkflow,
    Role,
    ResourceType,
    TenantConfig
} from '../types'

export class EmergencyAccessService {
    private static instance: EmergencyAccessService
    private notificationService: NotificationService
    private complianceService: ComplianceService
    private monitoringService: MonitoringService
    private readonly WORKFLOW_EXPIRY = 30 * 60 * 1000 // 30 minutes

    private constructor() {
        this.notificationService = new NotificationService()
        this.complianceService = new ComplianceService()
        this.monitoringService = new MonitoringService()
    }

    static getInstance(): EmergencyAccessService {
        if (!EmergencyAccessService.instance) {
            EmergencyAccessService.instance = new EmergencyAccessService()
        }
        return EmergencyAccessService.instance
    }

    async requestEmergencyAccess(
        userId: string,
        resourceType: ResourceType,
        resourceId: string,
        reason: string,
        tenantConfig: TenantConfig
    ): Promise<EmergencyAccessWorkflow> {
        try {
            // Calculate risk level based on resource type and user history
            const riskLevel = await this.calculateRiskLevel(userId, resourceType, resourceId)

            // Create emergency access workflow
            const workflow = await prisma.emergencyAccessWorkflow.create({
                data: {
                    emergencyAccess: {
                        create: {
                            userId,
                            resourceType,
                            resourceId,
                            reason,
                            startTime: new Date(),
                            endTime: new Date(Date.now() + tenantConfig.settings.maxEmergencyDuration),
                            isActive: false // Will be activated after approval
                        }
                    },
                    requiredApprovals: tenantConfig.compliance.requiredApprovals,
                    status: 'PENDING',
                    expiresAt: new Date(Date.now() + this.WORKFLOW_EXPIRY),
                    riskLevel,
                    notifications: {
                        channels: ['EMAIL', 'SLACK'],
                        escalation: riskLevel === 'HIGH',
                        escalationLevel: 0
                    },
                    postAccessReview: riskLevel !== 'LOW'
                }
            })

            // Get eligible approvers based on tenant config
            const approvers = await this.getEligibleApprovers(tenantConfig.settings.allowedApprovers)
            
            // Add approvers to workflow
            await prisma.emergencyAccessWorkflow.update({
                where: { id: workflow.id },
                data: {
                    approvers: {
                        create: approvers.map(approver => ({
                            userId: approver.id,
                            role: approver.role,
                            status: 'PENDING'
                        }))
                    }
                }
            })

            // Notify approvers
            await this.notifyApprovers(workflow, approvers)

            // Create monitoring alert
            await this.monitoringService.createAlert({
                type: 'EMERGENCY_ACCESS',
                severity: riskLevel,
                details: {
                    userId,
                    resourceType,
                    resourceId,
                    description: `Emergency access requested: ${reason}`
                }
            })

            // Log for compliance
            await this.complianceService.logEvidence({
                control: 'EMERGENCY_ACCESS_REQUEST',
                evidence: JSON.stringify(workflow),
                timestamp: new Date()
            })

            return workflow
        } catch (error) {
            logger.error('Error requesting emergency access:', error)
            throw error
        }
    }

    async approveEmergencyAccess(
        workflowId: string,
        approverId: string,
        approved: boolean,
        reason?: string
    ): Promise<EmergencyAccessWorkflow> {
        try {
            // Update approver status
            const workflow = await prisma.emergencyAccessWorkflow.update({
                where: { id: workflowId },
                data: {
                    approvers: {
                        update: {
                            where: { userId: approverId },
                            data: {
                                status: approved ? 'APPROVED' : 'REJECTED',
                                timestamp: new Date(),
                                reason
                            }
                        }
                    }
                },
                include: { approvers: true, emergencyAccess: true }
            })

            // Check if we have enough approvals
            const approvedCount = workflow.approvers.filter(a => a.status === 'APPROVED').length
            const rejectedCount = workflow.approvers.filter(a => a.status === 'REJECTED').length

            let newStatus = workflow.status
            if (approvedCount >= workflow.requiredApprovals) {
                newStatus = 'APPROVED'
            } else if (rejectedCount > workflow.approvers.length - workflow.requiredApprovals) {
                newStatus = 'REJECTED'
            }

            // Update workflow status
            const updatedWorkflow = await prisma.emergencyAccessWorkflow.update({
                where: { id: workflowId },
                data: {
                    status: newStatus,
                    emergencyAccess: {
                        update: {
                            isActive: newStatus === 'APPROVED'
                        }
                    }
                }
            })

            // Notify requestor
            await this.notificationService.notifyEmergencyAccessUpdate(updatedWorkflow)

            // Update monitoring alert
            await this.monitoringService.updateAlert({
                type: 'EMERGENCY_ACCESS',
                details: {
                    userId: workflow.emergencyAccess.userId,
                    resourceType: workflow.emergencyAccess.resourceType,
                    resourceId: workflow.emergencyAccess.resourceId
                },
                status: newStatus === 'APPROVED' ? 'RESOLVED' : 'FALSE_POSITIVE'
            })

            return updatedWorkflow
        } catch (error) {
            logger.error('Error approving emergency access:', error)
            throw error
        }
    }

    async submitPostAccessReview(
        workflowId: string,
        userId: string,
        notes: string
    ): Promise<EmergencyAccessWorkflow> {
        try {
            const workflow = await prisma.emergencyAccessWorkflow.update({
                where: { id: workflowId },
                data: {
                    reviewCompleted: true,
                    reviewNotes: notes
                }
            })

            // Log for compliance
            await this.complianceService.logEvidence({
                control: 'EMERGENCY_ACCESS_REVIEW',
                evidence: notes,
                timestamp: new Date()
            })

            return workflow
        } catch (error) {
            logger.error('Error submitting post-access review:', error)
            throw error
        }
    }

    private async calculateRiskLevel(
        userId: string,
        resourceType: ResourceType,
        resourceId: string
    ): Promise<'LOW' | 'MEDIUM' | 'HIGH'> {
        // Get user's emergency access history
        const history = await prisma.emergencyAccess.findMany({
            where: {
                userId,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            }
        })

        // Get resource sensitivity level
        const sensitivity = await this.getResourceSensitivity(resourceType, resourceId)

        // Calculate risk based on history and sensitivity
        if (history.length > 5 || sensitivity === 'HIGH') {
            return 'HIGH'
        } else if (history.length > 2 || sensitivity === 'MEDIUM') {
            return 'MEDIUM'
        }
        return 'LOW'
    }

    private async getResourceSensitivity(
        resourceType: ResourceType,
        resourceId: string
    ): Promise<'LOW' | 'MEDIUM' | 'HIGH'> {
        // Implement resource sensitivity calculation based on your business rules
        // This is a placeholder implementation
        const sensitiveTypes = ['MEDICAL_RECORD', 'FINANCIAL_DATA']
        if (sensitiveTypes.includes(resourceType)) {
            return 'HIGH'
        }
        return 'LOW'
    }

    private async getEligibleApprovers(allowedRoles: Role[]): Promise<Array<{ id: string; role: Role }>> {
        return await prisma.user.findMany({
            where: {
                role: { in: allowedRoles },
                status: 'ACTIVE'
            },
            select: {
                id: true,
                role: true
            }
        })
    }

    private async notifyApprovers(
        workflow: EmergencyAccessWorkflow,
        approvers: Array<{ id: string; role: Role }>
    ): Promise<void> {
        const notifications = approvers.map(approver =>
            this.notificationService.notifyEmergencyAccessApproval({
                workflowId: workflow.id,
                approverId: approver.id,
                riskLevel: workflow.riskLevel,
                expiresAt: workflow.expiresAt
            })
        )

        await Promise.all(notifications)
    }
}
