import { prisma } from '@/lib/db'

export enum NotificationType {
    NEW_ADMISSION = 'NEW_ADMISSION',
    DISCHARGE = 'DISCHARGE',
    SERIOUS_INCIDENT = 'SERIOUS_INCIDENT',
    CARE_LEVEL_CHANGE = 'CARE_LEVEL_CHANGE',
    MEDICATION_DUE = 'MEDICATION_DUE',
    TASK_DUE = 'TASK_DUE',
    MAINTENANCE_REQUIRED = 'MAINTENANCE_REQUIRED',
    STAFF_SHORTAGE = 'STAFF_SHORTAGE',
    COMPLIANCE_ALERT = 'COMPLIANCE_ALERT',
    VISITOR_ARRIVED = 'VISITOR_ARRIVED'
}

export enum NotificationPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum NotificationChannel {
    IN_APP = 'IN_APP',
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    PUSH = 'PUSH'
}

interface NotificationTemplate {
    title: string;
    body: string;
    priority: NotificationPriority;
    channels: NotificationChannel[];
}

export class NotificationService {
    private templates: Record<NotificationType, NotificationTemplate> = {
        [NotificationType.NEW_ADMISSION]: {
            title: 'New Resident Admission',
            body: 'New resident {{residentName}} has been admitted',
            priority: NotificationPriority.HIGH,
            channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
        },
        [NotificationType.DISCHARGE]: {
            title: 'Resident Discharged',
            body: 'Resident {{residentName}} has been discharged: {{reason}}',
            priority: NotificationPriority.MEDIUM,
            channels: [NotificationChannel.IN_APP]
        },
        [NotificationType.SERIOUS_INCIDENT]: {
            title: 'Serious Incident Reported',
            body: 'Serious incident reported for resident {{residentName}}: {{description}}',
            priority: NotificationPriority.URGENT,
            channels: [NotificationChannel.IN_APP, NotificationChannel.SMS, NotificationChannel.EMAIL]
        },
        [NotificationType.CARE_LEVEL_CHANGE]: {
            title: 'Care Level Change',
            body: 'Care level changed for {{residentName}} from {{previousLevel}} to {{newLevel}}',
            priority: NotificationPriority.HIGH,
            channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
        },
        [NotificationType.MEDICATION_DUE]: {
            title: 'Medication Due',
            body: 'Medication due for {{residentName}}: {{medicationDetails}}',
            priority: NotificationPriority.HIGH,
            channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH]
        },
        [NotificationType.TASK_DUE]: {
            title: 'Task Due',
            body: '{{taskType}} due for {{residentName}}',
            priority: NotificationPriority.MEDIUM,
            channels: [NotificationChannel.IN_APP]
        },
        [NotificationType.MAINTENANCE_REQUIRED]: {
            title: 'Maintenance Required',
            body: 'Maintenance required: {{details}}',
            priority: NotificationPriority.MEDIUM,
            channels: [NotificationChannel.IN_APP]
        },
        [NotificationType.STAFF_SHORTAGE]: {
            title: 'Staff Shortage Alert',
            body: 'Staff shortage detected in {{department}}',
            priority: NotificationPriority.HIGH,
            channels: [NotificationChannel.IN_APP, NotificationChannel.SMS]
        },
        [NotificationType.COMPLIANCE_ALERT]: {
            title: 'Compliance Alert',
            body: 'Compliance issue detected: {{details}}',
            priority: NotificationPriority.HIGH,
            channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
        },
        [NotificationType.VISITOR_ARRIVED]: {
            title: 'Visitor Arrived',
            body: 'Visitor {{visitorName}} has arrived for {{residentName}}',
            priority: NotificationPriority.LOW,
            channels: [NotificationChannel.IN_APP]
        }
    }

    async notifyStaff(
        type: NotificationType,
        data: Record<string, any>,
        recipients?: string[]
    ) {
        const template = this.templates[type]
        const notification = this.formatNotification(template, data)

        // Create notification record
        const notificationRecord = await prisma.notification.create({
            data: {
                type,
                title: notification.title,
                body: notification.body,
                priority: template.priority,
                data: data,
                recipients: recipients
            }
        })

        // Send through appropriate channels
        await Promise.all(template.channels.map(channel => 
            this.sendThroughChannel(channel, notification, recipients)
        ))

        return notificationRecord
    }

    async markAsRead(notificationId: string, userId: string) {
        return prisma.notification.update({
            where: { id: notificationId },
            data: {
                readBy: {
                    connect: { id: userId }
                }
            }
        })
    }

    async getUnreadNotifications(userId: string) {
        return prisma.notification.findMany({
            where: {
                OR: [
                    { recipients: { has: userId } },
                    { recipients: { isEmpty: true } }
                ],
                NOT: {
                    readBy: {
                        some: { id: userId }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }

    private formatNotification(
        template: NotificationTemplate,
        data: Record<string, any>
    ) {
        let title = template.title
        let body = template.body

        // Replace placeholders with actual data
        Object.entries(data).forEach(([key, value]) => {
            const placeholder = new RegExp(`{{${key}}}`, 'g')
            title = title.replace(placeholder, value)
            body = body.replace(placeholder, value)
        })

        return { title, body }
    }

    private async sendThroughChannel(
        channel: NotificationChannel,
        notification: { title: string; body: string },
        recipients?: string[]
    ) {
        switch (channel) {
            case NotificationChannel.EMAIL:
                // Implement email sending
                break
            case NotificationChannel.SMS:
                // Implement SMS sending
                break
            case NotificationChannel.PUSH:
                // Implement push notification
                break
            case NotificationChannel.IN_APP:
                // In-app notifications are handled by the notification record
                break
        }
    }
}

export default new NotificationService()


