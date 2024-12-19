import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { NotificationService } from '@/features/notifications/services/notificationService'
import {
    MonitoringAlert,
    AccessAudit,
    ResourceType
} from '../types'

export class MonitoringService {
    private static instance: MonitoringService
    private notificationService: NotificationService
    private readonly ALERT_CACHE_TTL = 300 // 5 minutes
    private readonly ANOMALY_THRESHOLD = 3 // Standard deviations for anomaly detection

    private constructor() {
        this.notificationService = new NotificationService()
    }

    static getInstance(): MonitoringService {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService()
        }
        return MonitoringService.instance
    }

    async createAlert(alert: Omit<MonitoringAlert, 'id' | 'timestamp' | 'status'>): Promise<MonitoringAlert> {
        try {
            const newAlert = await prisma.monitoringAlert.create({
                data: {
                    ...alert,
                    status: 'NEW',
                    timestamp: new Date()
                }
            })

            // Cache alert for quick access
            const cacheKey = `alert:${newAlert.id}`
            await redis.setex(cacheKey, this.ALERT_CACHE_TTL, JSON.stringify(newAlert))

            // Notify relevant parties based on severity
            await this.notifyAlert(newAlert)

            return newAlert
        } catch (error) {
            logger.error('Error creating monitoring alert:', error)
            throw error
        }
    }

    async updateAlert(
        query: {
            type: MonitoringAlert['type'];
            details: Partial<MonitoringAlert['details']>;
        },
        updates: Partial<MonitoringAlert>
    ): Promise<MonitoringAlert> {
        try {
            const alert = await prisma.monitoringAlert.update({
                where: {
                    type: query.type,
                    details: {
                        path: Object.keys(query.details)[0],
                        equals: Object.values(query.details)[0]
                    }
                },
                data: updates
            })

            // Update cache
            const cacheKey = `alert:${alert.id}`
            await redis.setex(cacheKey, this.ALERT_CACHE_TTL, JSON.stringify(alert))

            return alert
        } catch (error) {
            logger.error('Error updating monitoring alert:', error)
            throw error
        }
    }

    async monitorAccessPatterns(): Promise<void> {
        try {
            // Get recent access patterns
            const recentAccesses = await prisma.accessAudit.findMany({
                where: {
                    timestamp: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                },
                orderBy: {
                    timestamp: 'desc'
                }
            })

            // Check for unusual patterns
            await this.detectUnusualAccess(recentAccesses)
            await this.detectGeographicalAnomalies(recentAccesses)
            await this.detectPolicyViolations(recentAccesses)

        } catch (error) {
            logger.error('Error monitoring access patterns:', error)
            throw error
        }
    }

    async getMetrics(startTime: Date, endTime: Date) {
        try {
            const [accessPatterns, responseTime, cacheHitRate] = await Promise.all([
                this.getAccessPatternMetrics(startTime, endTime),
                this.getResponseTimeMetrics(startTime, endTime),
                this.getCacheHitRateMetrics(startTime, endTime)
            ])

            return {
                accessPatterns,
                responseTime,
                cacheHitRate
            }
        } catch (error) {
            logger.error('Error getting monitoring metrics:', error)
            throw error
        }
    }

    private async detectUnusualAccess(accesses: AccessAudit[]): Promise<void> {
        // Group accesses by user
        const accessesByUser = new Map<string, AccessAudit[]>()
        accesses.forEach(access => {
            const userAccesses = accessesByUser.get(access.userId) || []
            userAccesses.push(access)
            accessesByUser.set(access.userId, userAccesses)
        })

        // Check for unusual patterns
        for (const [userId, userAccesses] of accessesByUser) {
            // Calculate average accesses per hour for this user
            const accessesPerHour = this.calculateAccessesPerHour(userAccesses)
            const avgAccessesPerHour = await this.getAverageAccessesPerHour(userId)

            if (accessesPerHour > avgAccessesPerHour * this.ANOMALY_THRESHOLD) {
                await this.createAlert({
                    type: 'UNUSUAL_ACCESS',
                    severity: 'MEDIUM',
                    details: {
                        userId,
                        description: `Unusual number of access attempts: ${accessesPerHour} per hour (avg: ${avgAccessesPerHour})`
                    }
                })
            }
        }
    }

    private async detectGeographicalAnomalies(accesses: AccessAudit[]): Promise<void> {
        // Group accesses by user and location
        const accessesByUserLocation = new Map<string, Set<string>>()
        accesses.forEach(access => {
            const locations = accessesByUserLocation.get(access.userId) || new Set()
            if (access.context.location) {
                locations.add(access.context.location.country)
            }
            accessesByUserLocation.set(access.userId, locations)
        })

        // Check for unusual locations
        for (const [userId, locations] of accessesByUserLocation) {
            if (locations.size > 2) { // If accessing from more than 2 countries in 24 hours
                await this.createAlert({
                    type: 'GEO_ANOMALY',
                    severity: 'HIGH',
                    details: {
                        userId,
                        description: `Access from multiple countries: ${Array.from(locations).join(', ')}`
                    }
                })
            }
        }
    }

    private async detectPolicyViolations(accesses: AccessAudit[]): Promise<void> {
        const violations = accesses.filter(access => !access.decision)
        
        // Group violations by policy
        const violationsByPolicy = new Map<string, AccessAudit[]>()
        violations.forEach(violation => {
            if (violation.policyId) {
                const policyViolations = violationsByPolicy.get(violation.policyId) || []
                policyViolations.push(violation)
                violationsByPolicy.set(violation.policyId, policyViolations)
            }
        })

        // Create alerts for significant violations
        for (const [policyId, policyViolations] of violationsByPolicy) {
            if (policyViolations.length > 5) { // More than 5 violations of the same policy
                await this.createAlert({
                    type: 'POLICY_VIOLATION',
                    severity: 'HIGH',
                    details: {
                        policyId,
                        description: `Multiple violations (${policyViolations.length}) of policy ${policyId}`
                    }
                })
            }
        }
    }

    private calculateAccessesPerHour(accesses: AccessAudit[]): number {
        const hoursDiff = (accesses[0].timestamp.getTime() - accesses[accesses.length - 1].timestamp.getTime()) / (1000 * 60 * 60)
        return accesses.length / hoursDiff
    }

    private async getAverageAccessesPerHour(userId: string): Promise<number> {
        // Get historical average from cache or calculate
        const cacheKey = `avg:accesses:${userId}`
        const cached = await redis.get(cacheKey)
        if (cached) return parseFloat(cached)

        const historicalAccesses = await prisma.accessAudit.findMany({
            where: {
                userId,
                timestamp: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            }
        })

        const avg = this.calculateAccessesPerHour(historicalAccesses)
        await redis.setex(cacheKey, 3600, avg.toString()) // Cache for 1 hour

        return avg
    }

    private async notifyAlert(alert: MonitoringAlert): Promise<void> {
        // Determine notification targets based on severity
        const targets = await this.getAlertTargets(alert.severity)

        // Send notifications
        const notifications = targets.map(target =>
            this.notificationService.notifySecurityAlert({
                alertId: alert.id,
                severity: alert.severity,
                description: alert.details.description,
                recipient: target
            })
        )

        await Promise.all(notifications)
    }

    private async getAlertTargets(severity: MonitoringAlert['severity']): Promise<string[]> {
        // Implement logic to determine who should be notified based on severity
        switch (severity) {
            case 'HIGH':
                return await this.getSecurityTeam()
            case 'MEDIUM':
                return await this.getSecurityAnalysts()
            case 'LOW':
                return await this.getSystemAdmins()
            default:
                return []
        }
    }

    private async getSecurityTeam(): Promise<string[]> {
        // Implement security team retrieval
        return []
    }

    private async getSecurityAnalysts(): Promise<string[]> {
        // Implement security analysts retrieval
        return []
    }

    private async getSystemAdmins(): Promise<string[]> {
        // Implement system admins retrieval
        return []
    }

    private async getAccessPatternMetrics(startTime: Date, endTime: Date) {
        // Implement access pattern metrics calculation
        return {}
    }

    private async getResponseTimeMetrics(startTime: Date, endTime: Date) {
        // Implement response time metrics calculation
        return {}
    }

    private async getCacheHitRateMetrics(startTime: Date, endTime: Date) {
        // Implement cache hit rate metrics calculation
        return {}
    }
}
