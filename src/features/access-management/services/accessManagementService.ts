import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { NotificationService } from '@/features/notifications/services/notificationService'
import {
    AccessPolicy,
    AccessRequest,
    AccessDecision,
    AccessContext,
    Role,
    ResourceType,
    PermissionAction,
    EmergencyAccess,
    AccessAudit,
    ComplianceReport,
    RiskAssessment,
    MonitoringAlert,
    SecurityIncident,
    ComplianceControl,
    ComplianceEvidence,
    PolicyDistribution,
    PolicyApproval,
    EmergencyAccessWorkflow
} from '../types'

export class AccessManagementService {
    private static instance: AccessManagementService
    private notificationService: NotificationService
    private policyCache: Map<string, AccessPolicy>
    private readonly POLICY_CACHE_TTL = 300 // 5 minutes
    private readonly EMERGENCY_ACCESS_MAX_DURATION = 4 * 60 * 60 * 1000 // 4 hours
    private readonly RISK_ASSESSMENT_THRESHOLD = 0.7
    private readonly ALERT_BATCH_SIZE = 100
    private readonly COMPLIANCE_CHECK_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours

    private constructor() {
        this.notificationService = new NotificationService()
        this.policyCache = new Map()
        this.setupPolicyChangeListener()
        this.setupComplianceChecker()
        this.setupAnomalyDetection()
    }

    public static getInstance(): AccessManagementService {
        if (!AccessManagementService.instance) {
            AccessManagementService.instance = new AccessManagementService()
        }
        return AccessManagementService.instance
    }

    // Core access control methods
    async checkAccess(request: AccessRequest): Promise<AccessDecision> {
        try {
            // Check emergency access first
            const emergencyAccess = await this.checkEmergencyAccess(request)
            if (emergencyAccess.granted) return emergencyAccess

            // Get applicable policies
            const policies = await this.getApplicablePolicies(request)
            
            // Evaluate policies
            const decision = await this.evaluatePolicies(policies, request)
            
            // Audit the decision
            await this.auditAccess({
                ...request,
                decision: decision.granted,
                policyId: decision.policy,
                reason: decision.reason,
                context: request.context
            })

            return decision
        } catch (error) {
            logger.error('Error checking access:', error)
            throw error
        }
    }

    async createPolicy(policy: Omit<AccessPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccessPolicy> {
        try {
            const newPolicy = await prisma.accessPolicy.create({
                data: {
                    ...policy,
                    version: 1
                }
            })

            await this.invalidatePolicyCache()
            await this.notifyPolicyChange(newPolicy.id)

            return newPolicy
        } catch (error) {
            logger.error('Error creating access policy:', error)
            throw error
        }
    }

    async updatePolicy(id: string, updates: Partial<AccessPolicy>): Promise<AccessPolicy> {
        try {
            const policy = await prisma.accessPolicy.update({
                where: { id },
                data: {
                    ...updates,
                    version: { increment: 1 },
                    updatedAt: new Date()
                }
            })

            await this.invalidatePolicyCache()
            await this.notifyPolicyChange(id)

            return policy
        } catch (error) {
            logger.error('Error updating access policy:', error)
            throw error
        }
    }

    // Emergency access management
    async requestEmergencyAccess(
        userId: string,
        resourceType: ResourceType,
        resourceId: string,
        reason: string
    ): Promise<EmergencyAccess> {
        try {
            const emergency = await prisma.emergencyAccess.create({
                data: {
                    userId,
                    resourceType,
                    resourceId,
                    reason,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + this.EMERGENCY_ACCESS_MAX_DURATION),
                    isActive: true,
                    auditTrail: {
                        create: {
                            action: 'GRANT',
                            performedBy: userId,
                            details: reason
                        }
                    }
                },
                include: {
                    auditTrail: true
                }
            })

            // Notify relevant parties
            await this.notificationService.notifyEmergencyAccess(emergency)

            return emergency
        } catch (error) {
            logger.error('Error requesting emergency access:', error)
            throw error
        }
    }

    async getActiveEmergencyAccesses(): Promise<EmergencyAccess[]> {
        try {
            return await prisma.emergencyAccess.findMany({
                where: {
                    isActive: true,
                    endTime: { gt: new Date() }
                },
                include: {
                    auditTrail: true
                },
                orderBy: {
                    startTime: 'desc'
                }
            })
        } catch (error) {
            logger.error('Error fetching active emergency accesses:', error)
            throw error
        }
    }

    async getPendingEmergencyApprovals(): Promise<EmergencyAccessWorkflow[]> {
        try {
            return await prisma.emergencyAccessWorkflow.findMany({
                where: {
                    status: 'PENDING',
                    expiresAt: { gt: new Date() }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
        } catch (error) {
            logger.error('Error fetching pending emergency approvals:', error)
            throw error
        }
    }

    async approveEmergencyAccess(emergencyId: string, reason: string): Promise<EmergencyAccessWorkflow> {
        try {
            const workflow = await prisma.emergencyAccessWorkflow.update({
                where: { id: emergencyId },
                data: {
                    status: 'APPROVED',
                    approvers: {
                        push: {
                            userId: 'SYSTEM', // Replace with actual user ID
                            role: 'ADMIN',
                            status: 'APPROVED',
                            timestamp: new Date(),
                            reason
                        }
                    }
                }
            })

            // Activate the emergency access if all approvals are received
            if (this.hasRequiredApprovals(workflow)) {
                await this.activateEmergencyAccess(workflow.emergencyAccessId)
            }

            return workflow
        } catch (error) {
            logger.error('Error approving emergency access:', error)
            throw error
        }
    }

    async rejectEmergencyAccess(emergencyId: string, reason: string): Promise<EmergencyAccessWorkflow> {
        try {
            const workflow = await prisma.emergencyAccessWorkflow.update({
                where: { id: emergencyId },
                data: {
                    status: 'REJECTED',
                    approvers: {
                        push: {
                            userId: 'SYSTEM', // Replace with actual user ID
                            role: 'ADMIN',
                            status: 'REJECTED',
                            timestamp: new Date(),
                            reason
                        }
                    }
                }
            })

            // Notify the requestor
            await this.notificationService.notifyEmergencyAccessRejected(workflow)

            return workflow
        } catch (error) {
            logger.error('Error rejecting emergency access:', error)
            throw error
        }
    }

    async revokeEmergencyAccess(emergencyId: string): Promise<EmergencyAccess> {
        try {
            const emergency = await prisma.emergencyAccess.update({
                where: { id: emergencyId },
                data: {
                    isActive: false,
                    endTime: new Date(),
                    auditTrail: {
                        create: {
                            action: 'REVOKE',
                            performedBy: 'SYSTEM', // Replace with actual user ID
                            details: 'Emergency access manually revoked'
                        }
                    }
                },
                include: {
                    auditTrail: true
                }
            })

            // Notify relevant parties
            await this.notificationService.notifyEmergencyAccessRevoked(emergency)

            return emergency
        } catch (error) {
            logger.error('Error revoking emergency access:', error)
            throw error
        }
    }

    async completeEmergencyAccessReview(emergencyId: string, reviewNotes: string): Promise<EmergencyAccessWorkflow> {
        try {
            const workflow = await prisma.emergencyAccessWorkflow.update({
                where: { id: emergencyId },
                data: {
                    reviewCompleted: true,
                    reviewNotes
                }
            })

            // Create an audit entry for the review
            await prisma.emergencyAccessAudit.create({
                data: {
                    emergencyAccessId: workflow.emergencyAccessId,
                    action: 'REVIEW',
                    performedBy: 'SYSTEM', // Replace with actual user ID
                    details: reviewNotes
                }
            })

            return workflow
        } catch (error) {
            logger.error('Error completing emergency access review:', error)
            throw error
        }
    }

    // Compliance and Audit Methods
    async generateComplianceReport(organizationId: string): Promise<ComplianceReport> {
        try {
            const [policies, audits, incidents] = await Promise.all([
                this.getOrganizationPolicies(organizationId),
                this.getAuditHistory(organizationId),
                this.getSecurityIncidents(organizationId)
            ])

            const report: ComplianceReport = {
                id: crypto.randomUUID(),
                frameworks: this.getApplicableFrameworks(organizationId),
                period: {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    end: new Date()
                },
                summary: this.generateComplianceSummary(policies, audits, incidents),
                controls: await this.evaluateComplianceControls(organizationId),
                status: 'DRAFT',
                createdAt: new Date(),
                updatedAt: new Date(),
                nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }

            await prisma.complianceReport.create({ data: report })
            return report
        } catch (error) {
            logger.error('Error generating compliance report:', error)
            throw error
        }
    }

    async assessRisk(controlId: string): Promise<RiskAssessment> {
        try {
            const control = await prisma.complianceControl.findUnique({
                where: { id: controlId }
            })

            const assessment: RiskAssessment = {
                id: crypto.randomUUID(),
                controlId,
                assessmentDate: new Date(),
                assessor: 'SYSTEM',
                threat: await this.analyzeThreat(control),
                vulnerabilities: await this.identifyVulnerabilities(control),
                existingControls: await this.evaluateExistingControls(control),
                residualRisk: await this.calculateResidualRisk(control),
                treatment: await this.determineTreatment(control),
                review: {
                    frequency: 'QUARTERLY',
                    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                }
            }

            await prisma.riskAssessment.create({ data: assessment })
            return assessment
        } catch (error) {
            logger.error('Error performing risk assessment:', error)
            throw error
        }
    }

    async distributePolicy(policyId: string, userIds: string[]): Promise<PolicyDistribution[]> {
        try {
            const distributions = await prisma.policyDistribution.createMany({
                data: userIds.map(userId => ({
                    id: crypto.randomUUID(),
                    policyId,
                    userId,
                    status: 'PENDING',
                    distributedAt: new Date()
                }))
            })

            await this.notificationService.notifyPolicyDistribution(policyId, userIds)
            return distributions
        } catch (error) {
            logger.error('Error distributing policy:', error)
            throw error
        }
    }

    async requestPolicyApproval(policyId: string, approvers: string[]): Promise<PolicyApproval[]> {
        try {
            const approvals = await prisma.policyApproval.createMany({
                data: approvers.map(approverId => ({
                    id: crypto.randomUUID(),
                    policyId,
                    approverId,
                    status: 'PENDING',
                    createdAt: new Date()
                }))
            })

            await this.notificationService.notifyPolicyApprovalRequest(policyId, approvers)
            return approvals
        } catch (error) {
            logger.error('Error requesting policy approval:', error)
            throw error
        }
    }

    // Private helper methods
    private async getApplicablePolicies(request: AccessRequest): Promise<AccessPolicy[]> {
        const cacheKey = this.getPolicyCacheKey(request)
        const cached = this.policyCache.get(cacheKey)
        if (cached) return [cached]

        const policies = await prisma.accessPolicy.findMany({
            where: {
                isActive: true,
                roles: { hasSome: request.userRoles },
                resources: { has: request.resourceType },
                actions: { has: request.action },
                OR: [
                    { organizationId: request.context.organizationId },
                    { organizationId: null }
                ]
            },
            orderBy: { priority: 'desc' }
        })

        // Cache the highest priority policy
        if (policies.length > 0) {
            this.policyCache.set(cacheKey, policies[0])
            setTimeout(() => this.policyCache.delete(cacheKey), this.POLICY_CACHE_TTL * 1000)
        }

        return policies
    }

    private async evaluatePolicies(policies: AccessPolicy[], request: AccessRequest): Promise<AccessDecision> {
        for (const policy of policies) {
            if (await this.evaluatePolicy(policy, request)) {
                return {
                    granted: true,
                    policy: policy.id,
                    audit: {
                        id: crypto.randomUUID(),
                        timestamp: new Date(),
                        requestId: crypto.randomUUID()
                    }
                }
            }
        }

        return {
            granted: false,
            reason: 'No matching policy found',
            audit: {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                requestId: crypto.randomUUID()
            }
        }
    }

    private async evaluatePolicy(policy: AccessPolicy, request: AccessRequest): Promise<boolean> {
        if (!policy.conditions) return true

        for (const condition of policy.conditions) {
            const value = await this.resolveConditionValue(condition, request)
            if (!this.matchCondition(condition, value)) {
                return false
            }
        }

        return true
    }

    private async checkEmergencyAccess(request: AccessRequest): Promise<AccessDecision> {
        const emergency = await prisma.emergencyAccess.findFirst({
            where: {
                userId: request.userId,
                resourceType: request.resourceType,
                resourceId: request.resourceId,
                isActive: true,
                endTime: { gt: new Date() }
            }
        })

        if (emergency) {
            return {
                granted: true,
                reason: 'Emergency access granted',
                expires: emergency.endTime,
                audit: {
                    id: crypto.randomUUID(),
                    timestamp: new Date(),
                    requestId: crypto.randomUUID()
                }
            }
        }

        return {
            granted: false,
            audit: {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                requestId: crypto.randomUUID()
            }
        }
    }

    private async auditAccess(audit: Omit<AccessAudit, 'id' | 'timestamp'>): Promise<void> {
        await prisma.accessAudit.create({
            data: {
                ...audit,
                timestamp: new Date()
            }
        })
    }

    private async setupPolicyChangeListener(): Promise<void> {
        const subscriber = redis.duplicate()
        await subscriber.connect()
        await subscriber.subscribe('policy-changes', (message) => {
            const policyId = message
            this.invalidatePolicyCache()
        })
    }

    private async notifyPolicyChange(policyId: string): Promise<void> {
        const publisher = redis.duplicate()
        await publisher.connect()
        await publisher.publish('policy-changes', policyId)
        await publisher.disconnect()
    }

    private async invalidatePolicyCache(): Promise<void> {
        this.policyCache.clear()
    }

    private getPolicyCacheKey(request: AccessRequest): string {
        return `${request.userRoles.join(',')}-${request.resourceType}-${request.action}-${request.context.organizationId}`
    }

    private async resolveConditionValue(condition: any, request: AccessRequest): Promise<any> {
        switch (condition.context) {
            case 'user':
                return request.userId
            case 'resource':
                return request.resourceId
            case 'environment':
                return request.context
            default:
                return null
        }
    }

    private matchCondition(condition: any, value: any): boolean {
        switch (condition.operator) {
            case 'equals':
                return value === condition.value
            case 'contains':
                return String(value).includes(String(condition.value))
            case 'startsWith':
                return String(value).startsWith(String(condition.value))
            case 'endsWith':
                return String(value).endsWith(String(condition.value))
            case 'regex':
                return new RegExp(String(condition.value)).test(String(value))
            default:
                return false
        }
    }

    private async setupComplianceChecker(): Promise<void> {
        setInterval(async () => {
            try {
                const organizations = await prisma.organization.findMany()
                for (const org of organizations) {
                    const report = await this.generateComplianceReport(org.id)
                    if (report.summary.criticalFindings > 0) {
                        await this.notificationService.notifyComplianceIssues(org.id, report)
                    }
                }
            } catch (error) {
                logger.error('Error in compliance checker:', error)
            }
        }, this.COMPLIANCE_CHECK_INTERVAL)
    }

    private async setupAnomalyDetection(): Promise<void> {
        setInterval(async () => {
            try {
                const recentAudits = await prisma.accessAudit.findMany({
                    where: {
                        timestamp: { gt: new Date(Date.now() - 60 * 60 * 1000) }
                    },
                    take: this.ALERT_BATCH_SIZE
                })

                const anomalies = await this.detectAnomalies(recentAudits)
                for (const anomaly of anomalies) {
                    await this.createMonitoringAlert(anomaly)
                }
            } catch (error) {
                logger.error('Error in anomaly detection:', error)
            }
        }, 5 * 60 * 1000) // Every 5 minutes
    }

    private async detectAnomalies(audits: AccessAudit[]): Promise<MonitoringAlert[]> {
        const anomalies: MonitoringAlert[] = []

        // Group audits by user and resource type
        const groupedAudits = this.groupAudits(audits)

        // Detect unusual patterns
        for (const [key, userAudits] of groupedAudits.entries()) {
            if (this.isAnomalous(userAudits)) {
                anomalies.push({
                    id: crypto.randomUUID(),
                    type: 'UNUSUAL_ACCESS',
                    severity: 'HIGH',
                    timestamp: new Date(),
                    details: {
                        userId: userAudits[0].userId,
                        resourceType: userAudits[0].resourceType,
                        description: 'Unusual access pattern detected'
                    },
                    status: 'NEW'
                })
            }
        }

        return anomalies
    }

    private async createMonitoringAlert(alert: MonitoringAlert): Promise<void> {
        await prisma.monitoringAlert.create({ data: alert })
        await this.notificationService.notifySecurityAlert(alert)
    }

    private groupAudits(audits: AccessAudit[]): Map<string, AccessAudit[]> {
        const grouped = new Map<string, AccessAudit[]>()
        for (const audit of audits) {
            const key = `${audit.userId}-${audit.resourceType}`
            const existing = grouped.get(key) || []
            grouped.set(key, [...existing, audit])
        }
        return grouped
    }

    private isAnomalous(audits: AccessAudit[]): boolean {
        // Implement anomaly detection logic here
        // Example: Check for frequency, time patterns, resource access patterns
        const frequency = audits.length
        const timeSpan = audits[audits.length - 1].timestamp.getTime() - audits[0].timestamp.getTime()
        const accessRate = frequency / (timeSpan / 1000) // accesses per second

        return accessRate > this.RISK_ASSESSMENT_THRESHOLD
    }

    // Private helper methods for emergency access
    private async activateEmergencyAccess(emergencyId: string): Promise<void> {
        try {
            await prisma.emergencyAccess.update({
                where: { id: emergencyId },
                data: {
                    isActive: true,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + this.EMERGENCY_ACCESS_MAX_DURATION),
                    auditTrail: {
                        create: {
                            action: 'ACTIVATE',
                            performedBy: 'SYSTEM',
                            details: 'Emergency access activated after approval'
                        }
                    }
                }
            })
        } catch (error) {
            logger.error('Error activating emergency access:', error)
            throw error
        }
    }

    private hasRequiredApprovals(workflow: EmergencyAccessWorkflow): boolean {
        const approvedCount = workflow.approvers.filter(a => a.status === 'APPROVED').length
        return approvedCount >= workflow.requiredApprovals
    }
}
