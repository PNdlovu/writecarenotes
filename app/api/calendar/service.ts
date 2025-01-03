/**
 * @fileoverview Calendar service for managing calendar events
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import prisma from '@/lib/prisma';
import type { User } from '@/types';
import type { CalendarEvent, CreateEventData } from './types';
import { NotificationService } from '@/lib/notifications';
import { AuditService } from '@/lib/audit';
import { OfflineSync } from '@/lib/offline-sync';
import { TranslationService } from '@/lib/translations';
import { RegulatoryService } from '@/lib/regulatory';
import { AttachmentService } from '@/lib/attachments';
import { performance } from '@/lib/performance';
import { ApiError } from '@/lib/errors';

interface ConflictCheckOptions {
  eventId?: string;
  startDate: Date;
  endDate: Date;
  residentId?: string;
  staffId?: string;
  facilityId: string;
}

export const calendarService = {
  async checkConflicts({
    eventId,
    startDate,
    endDate,
    residentId,
    staffId,
    facilityId,
  }: ConflictCheckOptions): Promise<CalendarEvent[]> {
    const where = {
      facilityId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: 'cancelled',
      },
      ...(eventId ? { NOT: { id: eventId } } : {}),
      OR: [
        ...(residentId ? [{ residentId }] : []),
        ...(staffId ? [{ staffId }] : []),
      ],
    };

    const conflicts = await prisma.event.findMany({
      where,
      include: {
        resident: {
          select: {
            id: true,
            name: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return conflicts.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date.toISOString(),
      type: event.type,
      residentId: event.residentId,
      residentName: event.resident?.name,
      staffId: event.staffId,
      staffName: event.staff?.name,
      status: event.status,
    }));
  },

  async getEvents({ startDate, endDate }: { startDate?: string | null; endDate?: string | null }, user?: User): Promise<CalendarEvent[]> {
    const perfTimer = performance.start('calendar.getEvents');
    
    try {
      const where = {
        organizationId: user?.organizationId,
        facilityId: user?.facilityId,
        ...(startDate && endDate
          ? {
              date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }
          : {}),
      };

      // Get offline events first
      const offlineEvents = await OfflineSync.getOfflineEvents(where);

      // Get online events
      const onlineEvents = await prisma.event.findMany({
        where,
        include: {
          resident: {
            select: {
              id: true,
              name: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
            },
          },
          translations: true,
          attachments: true,
          notifications: true,
          audit: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Merge and format events
      const events = [...offlineEvents, ...onlineEvents].map(event => ({
        id: event.id,
        title: event.title,
        titleTranslations: event.translations?.title || {},
        date: event.date.toISOString(),
        type: event.type,
        description: event.description,
        descriptionTranslations: event.translations?.description || {},
        residentId: event.residentId,
        residentName: event.resident?.name,
        staffId: event.staffId,
        staffName: event.staff?.name,
        status: event.status,
        region: event.region,
        regulatoryBody: event.regulatoryBody,
        regulatoryRequirements: event.regulatoryRequirements,
        recurrence: event.recurrence,
        category: event.category,
        priority: event.priority,
        offline: {
          synced: event.synced || true,
          lastSyncedAt: event.lastSyncedAt?.toISOString(),
          localUpdates: event.localUpdates,
        },
        attachments: event.attachments?.map(attachment => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          url: attachment.url,
          uploadedAt: attachment.uploadedAt.toISOString(),
          uploadedBy: attachment.uploadedBy,
        })),
        audit: {
          createdAt: event.createdAt.toISOString(),
          createdBy: event.createdBy,
          updatedAt: event.updatedAt.toISOString(),
          updatedBy: event.updatedBy,
          version: event.version,
          changes: event.audit?.changes || [],
        },
        notifications: event.notifications?.map(notification => ({
          type: notification.type,
          recipients: notification.recipients,
          scheduledFor: notification.scheduledFor.toISOString(),
          sent: notification.sent,
          sentAt: notification.sentAt?.toISOString(),
        })),
        organizationId: event.organizationId,
        facilityId: event.facilityId,
        departmentId: event.departmentId,
        metadata: event.metadata,
      }));

      // Apply regional and language preferences
      const translatedEvents = await TranslationService.applyPreferences(events, user?.language);

      perfTimer.end();
      return translatedEvents;
    } catch (error) {
      perfTimer.end({ error });
      throw error;
    }
  },

  async createEvent(data: CreateEventData, user: User): Promise<CalendarEvent> {
    const perfTimer = performance.start('calendar.createEvent');
    
    try {
      // Handle offline creation
      if (!navigator.onLine) {
        return OfflineSync.createEvent(data, user);
      }

      // Check for conflicts
      const conflicts = await this.checkConflicts({
        startDate: new Date(data.date),
        endDate: new Date(data.date),
        residentId: data.residentId,
        staffId: data.staffId,
        facilityId: user.facilityId,
      });

      if (conflicts.length > 0) {
        throw new ApiError(409, 'Event conflicts detected', { conflicts });
      }

      // Validate regulatory requirements
      await RegulatoryService.validateEvent(data, user);

      // Process attachments
      const processedAttachments = data.attachments 
        ? await AttachmentService.processAttachments(data.attachments, user)
        : undefined;

      // Create event
      const event = await prisma.event.create({
        data: {
          organizationId: user.organizationId,
          facilityId: user.facilityId,
          title: data.title,
          translations: {
            create: {
              title: data.titleTranslations,
              description: data.descriptionTranslations,
            },
          },
          date: new Date(data.date),
          type: data.type,
          description: data.description,
          residentId: data.residentId,
          staffId: data.staffId,
          status: 'scheduled',
          region: data.region,
          regulatoryBody: data.regulatoryBody,
          regulatoryRequirements: data.regulatoryRequirements,
          recurrence: data.recurrence,
          category: data.category,
          priority: data.priority,
          attachments: {
            create: processedAttachments,
          },
          notifications: {
            create: data.notifications,
          },
          departmentId: data.departmentId,
          metadata: data.metadata,
          audit: {
            create: {
              createdBy: user.id,
              updatedBy: user.id,
              version: 1,
              changes: [],
            },
          },
        },
        include: {
          resident: {
            select: {
              id: true,
              name: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
            },
          },
          translations: true,
          attachments: true,
          notifications: true,
          audit: true,
        },
      });

      // Schedule notifications
      if (data.notifications) {
        await NotificationService.scheduleNotifications(event.id, data.notifications);
      }

      // Log audit
      await AuditService.logCreation(event, user);

      // Format response
      const formattedEvent = {
        id: event.id,
        title: event.title,
        titleTranslations: event.translations?.title || {},
        date: event.date.toISOString(),
        type: event.type,
        description: event.description,
        descriptionTranslations: event.translations?.description || {},
        residentId: event.residentId,
        residentName: event.resident?.name,
        staffId: event.staffId,
        staffName: event.staff?.name,
        status: event.status,
        region: event.region,
        regulatoryBody: event.regulatoryBody,
        regulatoryRequirements: event.regulatoryRequirements,
        recurrence: event.recurrence,
        category: event.category,
        priority: event.priority,
        offline: {
          synced: true,
          lastSyncedAt: new Date().toISOString(),
        },
        attachments: event.attachments?.map(attachment => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          url: attachment.url,
          uploadedAt: attachment.uploadedAt.toISOString(),
          uploadedBy: attachment.uploadedBy,
        })),
        audit: {
          createdAt: event.createdAt.toISOString(),
          createdBy: event.createdBy,
          updatedAt: event.updatedAt.toISOString(),
          updatedBy: event.updatedBy,
          version: event.version,
          changes: event.audit?.changes || [],
        },
        notifications: event.notifications?.map(notification => ({
          type: notification.type,
          recipients: notification.recipients,
          scheduledFor: notification.scheduledFor.toISOString(),
          sent: notification.sent,
          sentAt: notification.sentAt?.toISOString(),
        })),
        organizationId: event.organizationId,
        facilityId: event.facilityId,
        departmentId: event.departmentId,
        metadata: event.metadata,
      };

      perfTimer.end();
      return formattedEvent;
    } catch (error) {
      perfTimer.end({ error });
      throw error;
    }
  },

  async updateEvent(id: string, data: Partial<CalendarEvent>, user: User): Promise<CalendarEvent> {
    // Handle offline update
    if (!navigator.onLine) {
      return OfflineSync.updateEvent(id, data, user);
    }

    // Validate regulatory requirements if changed
    if (data.regulatoryRequirements) {
      await RegulatoryService.validateEvent({ ...data, id }, user);
    }

    // Process new attachments if any
    const processedAttachments = data.attachments 
      ? await AttachmentService.processAttachments(data.attachments, user)
      : undefined;

    // Get current event for audit
    const currentEvent = await prisma.event.findUnique({
      where: { id, organizationId: user.organizationId },
      include: { audit: true },
    });

    if (!currentEvent) {
      throw new Error('Event not found');
    }

    // Update event
    const event = await prisma.event.update({
      where: { id, organizationId: user.organizationId },
      data: {
        title: data.title,
        translations: data.titleTranslations || data.descriptionTranslations ? {
          update: {
            title: data.titleTranslations,
            description: data.descriptionTranslations,
          },
        } : undefined,
        date: data.date ? new Date(data.date) : undefined,
        type: data.type,
        description: data.description,
        residentId: data.residentId,
        staffId: data.staffId,
        status: data.status,
        region: data.region,
        regulatoryBody: data.regulatoryBody,
        regulatoryRequirements: data.regulatoryRequirements,
        recurrence: data.recurrence,
        category: data.category,
        priority: data.priority,
        attachments: processedAttachments ? {
          deleteMany: {},
          create: processedAttachments,
        } : undefined,
        notifications: data.notifications ? {
          deleteMany: {},
          create: data.notifications,
        } : undefined,
        departmentId: data.departmentId,
        metadata: data.metadata,
        audit: {
          update: {
            updatedBy: user.id,
            version: { increment: 1 },
            changes: {
              push: AuditService.generateChanges(currentEvent, data, user),
            },
          },
        },
      },
      include: {
        resident: {
          select: {
            id: true,
            name: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
        translations: true,
        attachments: true,
        notifications: true,
        audit: true,
      },
    });

    // Update notifications if changed
    if (data.notifications) {
      await NotificationService.updateNotifications(event.id, data.notifications);
    }

    // Log audit
    await AuditService.logUpdate(event, currentEvent, user);

    // Format response
    const formattedEvent = {
      id: event.id,
      title: event.title,
      titleTranslations: event.translations?.title || {},
      date: event.date.toISOString(),
      type: event.type,
      description: event.description,
      descriptionTranslations: event.translations?.description || {},
      residentId: event.residentId,
      residentName: event.resident?.name,
      staffId: event.staffId,
      staffName: event.staff?.name,
      status: event.status,
      region: event.region,
      regulatoryBody: event.regulatoryBody,
      regulatoryRequirements: event.regulatoryRequirements,
      recurrence: event.recurrence,
      category: event.category,
      priority: event.priority,
      offline: {
        synced: true,
        lastSyncedAt: new Date().toISOString(),
      },
      attachments: event.attachments?.map(attachment => ({
        id: attachment.id,
        name: attachment.name,
        type: attachment.type,
        url: attachment.url,
        uploadedAt: attachment.uploadedAt.toISOString(),
        uploadedBy: attachment.uploadedBy,
      })),
      audit: {
        createdAt: event.createdAt.toISOString(),
        createdBy: event.createdBy,
        updatedAt: event.updatedAt.toISOString(),
        updatedBy: event.updatedBy,
        version: event.version,
        changes: event.audit?.changes || [],
      },
      notifications: event.notifications?.map(notification => ({
        type: notification.type,
        recipients: notification.recipients,
        scheduledFor: notification.scheduledFor.toISOString(),
        sent: notification.sent,
        sentAt: notification.sentAt?.toISOString(),
      })),
      organizationId: event.organizationId,
      facilityId: event.facilityId,
      departmentId: event.departmentId,
      metadata: event.metadata,
    };

    return TranslationService.applyPreferences(formattedEvent, user.language);
  },

  async deleteEvent(id: string, user: User): Promise<void> {
    // Handle offline deletion
    if (!navigator.onLine) {
      return OfflineSync.deleteEvent(id, user);
    }

    // Get event for audit
    const event = await prisma.event.findUnique({
      where: { id, organizationId: user.organizationId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Delete event
    await prisma.event.delete({
      where: { id, organizationId: user.organizationId },
    });

    // Cancel notifications
    await NotificationService.cancelNotifications(id);

    // Log audit
    await AuditService.logDeletion(event, user);
  },
}; 
