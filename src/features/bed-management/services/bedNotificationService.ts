import { prisma } from '@/lib/prisma'
import { UserContext } from '@/types/context'
import { NotificationType, NotificationPriority } from '../types/bed.types'
import { sendEmail } from '@/lib/email'
import { cache } from '@/lib/cache'

export class BedNotificationService {
  private static instance: BedNotificationService
  private constructor() {}

  public static getInstance(): BedNotificationService {
    if (!BedNotificationService.instance) {
      BedNotificationService.instance = new BedNotificationService()
    }
    return BedNotificationService.instance
  }

  async notifyTransferRequest(
    transferId: string,
    recipientId: string,
    context: UserContext
  ): Promise<void> {
    const transfer = await prisma.bedTransfer.findUnique({
      where: { id: transferId },
      include: {
        resident: true,
        sourceBed: true,
        targetBed: true,
        requestedBy: true
      }
    })

    if (!transfer) return

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId }
    })

    if (!recipient) return

    await this.createNotification({
      userId: recipientId,
      type: 'TRANSFER_REQUEST',
      priority: 'HIGH',
      title: 'New Transfer Request',
      message: `Transfer request for resident ${transfer.resident.name} from bed ${transfer.sourceBed.name} to ${transfer.targetBed.name}`,
      metadata: {
        transferId,
        residentId: transfer.residentId,
        sourceBedId: transfer.sourceBedId,
        targetBedId: transfer.targetBedId
      },
      context
    })

    // Send email notification
    await sendEmail({
      to: recipient.email,
      subject: 'New Transfer Request',
      template: 'transfer-request',
      data: {
        residentName: transfer.resident.name,
        sourceBed: transfer.sourceBed.name,
        targetBed: transfer.targetBed.name,
        requestedBy: transfer.requestedBy.name,
        reason: transfer.reason
      }
    })
  }

  async notifyMaintenanceDue(
    maintenanceId: string,
    context: UserContext
  ): Promise<void> {
    const maintenance = await prisma.bedMaintenance.findUnique({
      where: { id: maintenanceId },
      include: {
        bed: true,
        assignedTo: true
      }
    })

    if (!maintenance || !maintenance.assignedTo) return

    await this.createNotification({
      userId: maintenance.assignedTo.id,
      type: 'MAINTENANCE_DUE',
      priority: 'MEDIUM',
      title: 'Maintenance Due',
      message: `Maintenance is due for bed ${maintenance.bed.name}`,
      metadata: {
        maintenanceId,
        bedId: maintenance.bedId,
        type: maintenance.type
      },
      context
    })

    // Send email notification
    await sendEmail({
      to: maintenance.assignedTo.email,
      subject: 'Maintenance Due Reminder',
      template: 'maintenance-due',
      data: {
        bedName: maintenance.bed.name,
        maintenanceType: maintenance.type,
        dueDate: maintenance.nextDue
      }
    })
  }

  async notifyWaitlistMatch(
    waitlistEntryId: string,
    bedId: string,
    context: UserContext
  ): Promise<void> {
    const entry = await prisma.waitlistEntry.findUnique({
      where: { id: waitlistEntryId },
      include: {
        resident: true
      }
    })

    const bed = await prisma.bed.findUnique({
      where: { id: bedId }
    })

    if (!entry || !bed) return

    const careHomeStaff = await prisma.user.findMany({
      where: {
        careHomeId: context.careHomeId,
        role: {
          in: ['ADMIN', 'MANAGER', 'NURSE']
        }
      }
    })

    for (const staff of careHomeStaff) {
      await this.createNotification({
        userId: staff.id,
        type: 'WAITLIST_MATCH',
        priority: 'HIGH',
        title: 'Waitlist Match Found',
        message: `A suitable bed (${bed.name}) has been found for resident ${entry.resident.name}`,
        metadata: {
          waitlistEntryId,
          bedId,
          residentId: entry.residentId
        },
        context
      })

      // Send email notification
      await sendEmail({
        to: staff.email,
        subject: 'Waitlist Match Found',
        template: 'waitlist-match',
        data: {
          residentName: entry.resident.name,
          bedName: bed.name,
          waitingSince: entry.createdAt
        }
      })
    }
  }

  private async createNotification({
    userId,
    type,
    priority,
    title,
    message,
    metadata,
    context
  }: {
    userId: string
    type: NotificationType
    priority: NotificationPriority
    title: string
    message: string
    metadata: Record<string, any>
    context: UserContext
  }): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        type,
        priority,
        title,
        message,
        metadata,
        careHomeId: context.careHomeId,
        tenantId: context.tenantId
      }
    })

    // Invalidate user's notification cache
    await cache.del(`notifications-${userId}`)
  }
}


