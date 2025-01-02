/**
 * WriteCareNotes.com
 * @fileoverview Waitlist Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import type { 
  WaitlistEntry,
  WaitlistFilter,
  WaitlistStats,
  WaitlistStatus
} from '../types';
import { ApiError } from '@/lib/errors';
import { auditService } from '@/lib/audit';
import { validateWaitlistEntry } from '../utils/validation';
import { WaitlistRepository } from './repositories/waitlistRepository';

export class WaitlistService {
  private static instance: WaitlistService;
  private repository: WaitlistRepository;

  private constructor() {
    this.repository = new WaitlistRepository();
  }

  public static getInstance(): WaitlistService {
    if (!WaitlistService.instance) {
      WaitlistService.instance = new WaitlistService();
    }
    return WaitlistService.instance;
  }

  async createWaitlistEntry(
    careHomeId: string,
    residentId: string,
    data: Omit<WaitlistEntry, 'id' | 'metadata' | 'careHomeId' | 'residentId' | 'status'>
  ): Promise<WaitlistEntry> {
    try {
      // Validate data
      const validation = validateWaitlistEntry({
        ...data,
        careHomeId,
        residentId,
        status: 'PENDING'
      });
      if (!validation.valid) {
        throw new ApiError('ValidationError', validation.errors.join(', '));
      }

      // Create entry
      const entry = await this.repository.create({
        ...data,
        careHomeId,
        residentId,
        status: 'PENDING',
        requestDate: new Date().toISOString(),
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system', // TODO: Get from context
          updatedBy: 'system',
          version: 1
        }
      });

      // Audit trail
      await auditService.log({
        action: 'WAITLIST_ENTRY_CREATED',
        resourceId: entry.id,
        details: {
          careHomeId,
          residentId,
          priority: entry.priority
        }
      });

      return entry;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to create waitlist entry');
    }
  }

  async getWaitlistEntry(id: string): Promise<WaitlistEntry> {
    try {
      const entry = await this.repository.findById(id);
      if (!entry) {
        throw new ApiError('NotFoundError', 'Waitlist entry not found');
      }
      return entry;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to fetch waitlist entry');
    }
  }

  async updateWaitlistEntry(
    id: string,
    updates: Partial<WaitlistEntry>
  ): Promise<WaitlistEntry> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new ApiError('NotFoundError', 'Waitlist entry not found');
      }

      // Validate updates
      const validation = validateWaitlistEntry({
        ...existing,
        ...updates
      });
      if (!validation.valid) {
        throw new ApiError('ValidationError', validation.errors.join(', '));
      }

      // Update entry
      const entry = await this.repository.update(id, {
        ...updates,
        metadata: {
          ...existing.metadata,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system', // TODO: Get from context
          version: existing.metadata.version + 1
        }
      });

      // Audit trail
      await auditService.log({
        action: 'WAITLIST_ENTRY_UPDATED',
        resourceId: entry.id,
        details: {
          updates: Object.keys(updates)
        }
      });

      return entry;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to update waitlist entry');
    }
  }

  async updateWaitlistStatus(
    id: string,
    status: WaitlistStatus,
    notes?: string
  ): Promise<WaitlistEntry> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new ApiError('NotFoundError', 'Waitlist entry not found');
      }

      // Update status
      const entry = await this.repository.update(id, {
        status,
        notes: notes ? `${existing.notes ? existing.notes + '\n' : ''}${notes}` : existing.notes,
        metadata: {
          ...existing.metadata,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system', // TODO: Get from context
          version: existing.metadata.version + 1
        }
      });

      // Audit trail
      await auditService.log({
        action: 'WAITLIST_STATUS_UPDATED',
        resourceId: entry.id,
        details: {
          oldStatus: existing.status,
          newStatus: status,
          notes
        }
      });

      return entry;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to update waitlist status');
    }
  }

  async searchWaitlist(filter: WaitlistFilter): Promise<WaitlistEntry[]> {
    try {
      return this.repository.search(filter);
    } catch (error) {
      throw new ApiError('InternalError', 'Failed to search waitlist');
    }
  }

  async getWaitlistStats(careHomeId: string): Promise<WaitlistStats> {
    try {
      return this.repository.getStats(careHomeId);
    } catch (error) {
      throw new ApiError('InternalError', 'Failed to fetch waitlist statistics');
    }
  }

  async getPositionInWaitlist(id: string): Promise<number> {
    try {
      const entry = await this.repository.findById(id);
      if (!entry) {
        throw new ApiError('NotFoundError', 'Waitlist entry not found');
      }

      return this.repository.getPosition(id, entry.careHomeId);
    } catch (error) {
      throw new ApiError('InternalError', 'Failed to get waitlist position');
    }
  }
} 