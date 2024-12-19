/**
 * @fileoverview Activity service with business logic
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Activity, ActivityStatus, ActivityParticipant, activitySchema } from '../types/models';
import { ActivityRepository } from '../repositories/activityRepository';
import { NotificationService } from '@/lib/notifications';
import { TenantContext } from '@/lib/multi-tenant/context';
import { logger } from '@/lib/logger';
import { LocalizationService } from '@/lib/i18n';
import { ValidationError } from '@/lib/errors';
import { EventEmitter } from '@/lib/events';

export class ActivityService {
  private repository: ActivityRepository;
  private notifications: NotificationService;
  private i18n: LocalizationService;
  private events: EventEmitter;

  constructor(private tenantContext: TenantContext) {
    this.repository = new ActivityRepository(tenantContext);
    this.notifications = new NotificationService(tenantContext);
    this.i18n = new LocalizationService(tenantContext.locale);
    this.events = new EventEmitter();
  }

  /**
   * Create a new activity with validation
   */
  async createActivity(data: Omit<Activity, 'id'>): Promise<Activity> {
    try {
      // Validate input data
      const validated = activitySchema.parse(data);

      // Business logic validations
      if (validated.endTime <= validated.startTime) {
        throw new ValidationError(
          this.i18n.t('activities.errors.endTimeBeforeStart')
        );
      }

      // Create activity
      const activity = await this.repository.create({
        ...validated,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
      });

      // Notify participants
      if (activity.participants?.length) {
        await this.notifyParticipants(activity);
      }

      // Emit event for integrations
      this.events.emit('activity.created', activity);

      return activity;
    } catch (error) {
      logger.error('Failed to create activity', { error, data });
      throw error;
    }
  }

  /**
   * Update activity with validation and notifications
   */
  async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error(this.i18n.t('activities.errors.notFound'));
      }

      // Validate update data
      if (data.startTime || data.endTime) {
        const startTime = data.startTime || existing.startTime;
        const endTime = data.endTime || existing.endTime;
        if (endTime <= startTime) {
          throw new ValidationError(
            this.i18n.t('activities.errors.endTimeBeforeStart')
          );
        }
      }

      // Update activity
      const updated = await this.repository.update(id, data);

      // Notify participants of changes
      if (this.shouldNotifyParticipants(existing, updated)) {
        await this.notifyParticipants(updated, 'update');
      }

      // Emit event for integrations
      this.events.emit('activity.updated', updated);

      return updated;
    } catch (error) {
      logger.error('Failed to update activity', { error, id, data });
      throw error;
    }
  }

  /**
   * Record participant attendance
   */
  async recordAttendance(
    activityId: string,
    participantId: string,
    attended: boolean,
    notes?: string
  ): Promise<ActivityParticipant> {
    try {
      const activity = await this.repository.findById(activityId);
      if (!activity) {
        throw new Error(this.i18n.t('activities.errors.notFound'));
      }

      const participant = activity.participants?.find(p => p.id === participantId);
      if (!participant) {
        throw new Error(this.i18n.t('activities.errors.participantNotFound'));
      }

      const updatedParticipant = {
        ...participant,
        status: attended ? 'ATTENDED' : 'DECLINED',
        notes,
        attendanceRecorded: new Date(),
      };

      // Update activity with new participant data
      await this.repository.update(activityId, {
        participants: activity.participants?.map(p =>
          p.id === participantId ? updatedParticipant : p
        ),
      });

      return updatedParticipant;
    } catch (error) {
      logger.error('Failed to record attendance', {
        error,
        activityId,
        participantId,
      });
      throw error;
    }
  }

  /**
   * Cancel activity with notifications
   */
  async cancelActivity(id: string, reason?: string): Promise<Activity> {
    try {
      const activity = await this.repository.findById(id);
      if (!activity) {
        throw new Error(this.i18n.t('activities.errors.notFound'));
      }

      const updated = await this.repository.update(id, {
        status: ActivityStatus.CANCELLED,
        metadata: { ...activity.metadata, cancellationReason: reason },
      });

      // Notify participants
      await this.notifyParticipants(updated, 'cancellation');

      // Emit event
      this.events.emit('activity.cancelled', updated);

      return updated;
    } catch (error) {
      logger.error('Failed to cancel activity', { error, id });
      throw error;
    }
  }

  /**
   * Query activities with filters
   */
  async queryActivities(params: {
    status?: ActivityStatus[];
    category?: string[];
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.repository.query(params);
  }

  /**
   * Helper to determine if participants should be notified
   */
  private shouldNotifyParticipants(
    old: Activity,
    updated: Activity
  ): boolean {
    return (
      old.startTime !== updated.startTime ||
      old.endTime !== updated.endTime ||
      old.location !== updated.location ||
      old.status !== updated.status
    );
  }

  /**
   * Helper to send notifications to participants
   */
  private async notifyParticipants(
    activity: Activity,
    type: 'create' | 'update' | 'cancellation' = 'create'
  ) {
    const participants = activity.participants || [];
    const notifications = participants.map((participant) => {
      const message = this.i18n.t(`activities.notifications.${type}`, {
        activityName: activity.name,
        startTime: this.i18n.formatDate(activity.startTime),
        location: activity.location,
      });

      return this.notifications.send({
        userId: participant.userId,
        title: this.i18n.t('activities.notifications.title'),
        message,
        type: 'ACTIVITY_UPDATE',
        metadata: {
          activityId: activity.id,
          type,
        },
      });
    });

    await Promise.all(notifications);
  }
}


