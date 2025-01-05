/**
 * @fileoverview Advanced Scheduling Service for Telehealth
 * @version 1.0.0
 * @created 2024-12-14
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { TelehealthServiceError } from './enhancedTelehealth';

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface ProviderAvailability {
  providerId: string;
  availableSlots: TimeSlot[];
  recurringSchedule?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    excludeDates?: string[];
  }[];
}

interface WaitlistEntry {
  id: string;
  residentId: string;
  urgency: 'ROUTINE' | 'URGENT';
  type: 'GP' | 'PHARMACIST' | 'SPECIALIST';
  requestedDate: string;
  status: 'WAITING' | 'SCHEDULED' | 'CANCELLED';
  notes?: string;
}

export class SchedulingService {
  async setProviderAvailability(
    providerId: string,
    availability: Omit<ProviderAvailability, 'providerId'>
  ): Promise<ProviderAvailability> {
    try {
      const providerAvailability = await db.providerAvailability.upsert({
        where: { providerId },
        update: {
          availableSlots: availability.availableSlots,
          recurringSchedule: availability.recurringSchedule,
        },
        create: {
          providerId,
          availableSlots: availability.availableSlots,
          recurringSchedule: availability.recurringSchedule,
        },
      });

      return providerAvailability;
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to set provider availability',
        'AVAILABILITY_UPDATE_FAILED',
        error
      );
    }
  }

  async findAvailableSlots(
    type: 'GP' | 'PHARMACIST' | 'SPECIALIST',
    startDate: string,
    endDate: string,
    duration: number = 30 // duration in minutes
  ): Promise<{ providerId: string; slots: TimeSlot[] }[]> {
    try {
      const providers = await db.provider.findMany({
        where: { type },
        include: {
          availability: true,
        },
      });

      const availableSlots = providers.map(provider => {
        const slots = this.calculateAvailableSlots(
          provider.availability,
          startDate,
          endDate,
          duration
        );

        return {
          providerId: provider.id,
          slots,
        };
      });

      return availableSlots;
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to find available slots',
        'SLOT_SEARCH_FAILED',
        error
      );
    }
  }

  private calculateAvailableSlots(
    availability: ProviderAvailability,
    startDate: string,
    endDate: string,
    duration: number
  ): TimeSlot[] {
    // Implementation would split available time ranges into slots
    // Consider recurring schedule and excluded dates
    // This is a placeholder for the actual implementation
    return [];
  }

  async addToWaitlist(
    residentId: string,
    type: 'GP' | 'PHARMACIST' | 'SPECIALIST',
    urgency: 'ROUTINE' | 'URGENT',
    requestedDate: string,
    notes?: string
  ): Promise<WaitlistEntry> {
    try {
      const entry = await db.waitlist.create({
        data: {
          id: uuidv4(),
          residentId,
          type,
          urgency,
          requestedDate,
          status: 'WAITING',
          notes,
        },
      });

      if (urgency === 'URGENT') {
        await this.processUrgentWaitlistEntry(entry);
      }

      return entry;
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to add to waitlist',
        'WAITLIST_ADD_FAILED',
        error
      );
    }
  }

  private async processUrgentWaitlistEntry(entry: WaitlistEntry): Promise<void> {
    try {
      // Find next available slot for urgent consultation
      const nextSlot = await this.findNextUrgentSlot(entry.type);
      
      if (nextSlot) {
        await this.scheduleConsultation({
          residentId: entry.residentId,
          providerId: nextSlot.providerId,
          startTime: nextSlot.start,
          endTime: nextSlot.end,
          type: entry.type,
          urgency: entry.urgency,
        });

        await db.waitlist.update({
          where: { id: entry.id },
          data: { status: 'SCHEDULED' },
        });
      }
    } catch (error) {
      console.error('Failed to process urgent waitlist entry:', error);
      // Don't throw here to prevent blocking the waitlist addition
    }
  }

  private async findNextUrgentSlot(
    type: 'GP' | 'PHARMACIST' | 'SPECIALIST'
  ): Promise<TimeSlot & { providerId: string } | null> {
    // Implementation would find the next available slot
    // considering provider availability and existing schedules
    // This is a placeholder for the actual implementation
    return null;
  }

  async scheduleConsultation(consultation: {
    residentId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    type: 'GP' | 'PHARMACIST' | 'SPECIALIST';
    urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  }): Promise<void> {
    try {
      // Check for scheduling conflicts
      const conflicts = await this.checkSchedulingConflicts(
        consultation.providerId,
        consultation.startTime,
        consultation.endTime
      );

      if (conflicts.length > 0) {
        throw new TelehealthServiceError(
          'Scheduling conflict detected',
          'SCHEDULING_CONFLICT',
          { conflicts }
        );
      }

      // Create the consultation
      await db.consultationRequest.create({
        data: {
          id: uuidv4(),
          ...consultation,
          status: 'SCHEDULED',
        },
      });
    } catch (error) {
      if (error instanceof TelehealthServiceError) {
        throw error;
      }
      throw new TelehealthServiceError(
        'Failed to schedule consultation',
        'SCHEDULING_FAILED',
        error
      );
    }
  }

  private async checkSchedulingConflicts(
    providerId: string,
    startTime: string,
    endTime: string
  ): Promise<any[]> {
    try {
      return await db.consultationRequest.findMany({
        where: {
          providerId,
          startTime: { lte: endTime },
          endTime: { gte: startTime },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        },
      });
    } catch (error) {
      throw new TelehealthServiceError(
        'Failed to check scheduling conflicts',
        'CONFLICT_CHECK_FAILED',
        error
      );
    }
  }
}


