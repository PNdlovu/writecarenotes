import { BedStatus, CareLevel, Wing, Room } from '../types'
import { OCCUPANCY_THRESHOLDS, CARE_LEVEL_REQUIREMENTS } from '../constants/careHomeConfig'
import bedManagementRepository from '../repositories/bedManagementRepository'

export enum NotificationPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum NotificationType {
    OCCUPANCY = 'OCCUPANCY',
    MAINTENANCE = 'MAINTENANCE',
    STAFFING = 'STAFFING',
    INCIDENT = 'INCIDENT',
    COMPLIANCE = 'COMPLIANCE'
}

interface Notification {
    id: string
    type: NotificationType
    priority: NotificationPriority
    message: string
    details?: any
    timestamp: Date
    acknowledgedBy?: string
    acknowledgedAt?: Date
    actions?: Array<{
        label: string
        handler: string
        params?: any
    }>
}

export class NotificationService {
    private async checkOccupancy(wing: Wing) {
        const stats = await bedManagementRepository.getWingCapacityStats(wing.id)
        const occupancyRate = (stats.occupied / stats.total) * 100

        if (occupancyRate >= OCCUPANCY_THRESHOLDS.CRITICAL) {
            return this.createNotification({
                type: NotificationType.OCCUPANCY,
                priority: NotificationPriority.CRITICAL,
                message: `Critical occupancy level in ${wing.name}`,
                details: { occupancyRate, stats }
            })
        }

        if (occupancyRate >= OCCUPANCY_THRESHOLDS.WARNING) {
            return this.createNotification({
                type: NotificationType.OCCUPANCY,
                priority: NotificationPriority.HIGH,
                message: `High occupancy level in ${wing.name}`,
                details: { occupancyRate, stats }
            })
        }
    }

    private async checkStaffingRatios(wing: Wing) {
        const currentStaffing = await bedManagementRepository.getCurrentStaffing(wing.id)
        const residents = await bedManagementRepository.getWingResidents(wing.id)

        const staffingAlerts = Object.entries(CARE_LEVEL_REQUIREMENTS).map(([level, requirements]) => {
            const residentsOfLevel = residents.filter(r => r.careLevel === level)
            const requiredStaff = Math.ceil(residentsOfLevel.length * requirements.minimumStaffRatio)
            const actualStaff = currentStaffing.filter(s => s.qualifiedFor.includes(level)).length

            if (actualStaff < requiredStaff) {
                return this.createNotification({
                    type: NotificationType.STAFFING,
                    priority: NotificationPriority.HIGH,
                    message: `Insufficient staffing for ${level} care in ${wing.name}`,
                    details: { required: requiredStaff, actual: actualStaff }
                })
            }
        })

        return staffingAlerts.filter(Boolean)
    }

    private async checkMaintenanceNeeds() {
        const maintenanceDue = await bedManagementRepository.getMaintenanceDue()
        
        return maintenanceDue.map(item => 
            this.createNotification({
                type: NotificationType.MAINTENANCE,
                priority: NotificationPriority.MEDIUM,
                message: `Maintenance due for ${item.type}`,
                details: item
            })
        )
    }

    async generateNotifications() {
        const wings = await bedManagementRepository.getAllWings()
        
        const notifications = await Promise.all([
            ...wings.map(wing => this.checkOccupancy(wing)),
            ...wings.map(wing => this.checkStaffingRatios(wing)),
            this.checkMaintenanceNeeds()
        ])

        return notifications.flat().filter(Boolean)
    }

    private createNotification(params: Omit<Notification, 'id' | 'timestamp'>): Notification {
        return {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            ...params
        }
    }

    async acknowledgeNotification(notificationId: string, userId: string) {
        return bedManagementRepository.acknowledgeNotification(notificationId, userId)
    }

    async getActiveNotifications() {
        return bedManagementRepository.getActiveNotifications()
    }

    async getNotificationHistory(dateRange: { start: Date; end: Date }) {
        return bedManagementRepository.getNotificationHistory(dateRange)
    }
}

export default new NotificationService()


