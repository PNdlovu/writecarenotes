/**
 * @fileoverview Family Portal Repository
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Data access layer for Family Portal with audit logging and caching
 */

import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';
import { audit } from '@/lib/audit';
import { DomainError } from '@/lib/errors';
import {
  FamilyMember,
  CareNote,
  Visit,
  Document,
  Memory,
  EmergencyContact,
  CareTeamMember
} from '../types';

export class FamilyPortalRepository {
  private readonly CACHE_TTL = 300; // 5 minutes

  // Family Members
  async getFamilyMembers(residentId: string, organizationId: string): Promise<FamilyMember[]> {
    const cacheKey = `family_members:${organizationId}:${residentId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const members = await prisma.familyMember.findMany({
      where: { residentId, organizationId },
      include: {
        contactInfo: true,
        preferences: true,
        permissions: true
      }
    });

    await cache.set(cacheKey, JSON.stringify(members), this.CACHE_TTL);
    await audit.log('getFamilyMembers', { residentId, organizationId });

    return members;
  }

  // Care Notes
  async getCareNotes(
    residentId: string,
    organizationId: string,
    options: {
      category?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<CareNote[]> {
    const cacheKey = `care_notes:${organizationId}:${residentId}:${JSON.stringify(options)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const notes = await prisma.careNote.findMany({
      where: {
        residentId,
        organizationId,
        ...(options.category && { category: options.category }),
        ...(options.startDate && options.endDate && {
          timestamp: {
            gte: options.startDate,
            lte: options.endDate
          }
        })
      },
      take: options.limit || 20,
      skip: options.offset || 0,
      orderBy: { timestamp: 'desc' }
    });

    await cache.set(cacheKey, JSON.stringify(notes), this.CACHE_TTL);
    await audit.log('getCareNotes', { residentId, organizationId, options });

    return notes;
  }

  // Visits
  async getVisits(
    residentId: string,
    organizationId: string,
    options: {
      status?: 'scheduled' | 'completed' | 'cancelled';
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<Visit[]> {
    const cacheKey = `visits:${organizationId}:${residentId}:${JSON.stringify(options)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const visits = await prisma.visit.findMany({
      where: {
        residentId,
        organizationId,
        ...(options.status && { status: options.status }),
        ...(options.startDate && options.endDate && {
          date: {
            gte: options.startDate,
            lte: options.endDate
          }
        })
      },
      include: {
        visitor: {
          include: {
            contactInfo: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    await cache.set(cacheKey, JSON.stringify(visits), this.CACHE_TTL);
    await audit.log('getVisits', { residentId, organizationId, options });

    return visits;
  }

  // Documents
  async getDocuments(
    residentId: string,
    organizationId: string,
    options: {
      type?: string;
      status?: 'draft' | 'pending' | 'approved';
      tags?: string[];
    } = {}
  ): Promise<Document[]> {
    const cacheKey = `documents:${organizationId}:${residentId}:${JSON.stringify(options)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const documents = await prisma.document.findMany({
      where: {
        residentId,
        organizationId,
        ...(options.type && { type: options.type }),
        ...(options.status && { status: options.status }),
        ...(options.tags && { tags: { hasEvery: options.tags } })
      },
      orderBy: { uploadDate: 'desc' }
    });

    await cache.set(cacheKey, JSON.stringify(documents), this.CACHE_TTL);
    await audit.log('getDocuments', { residentId, organizationId, options });

    return documents;
  }

  // Emergency Contacts
  async getEmergencyContacts(residentId: string, organizationId: string): Promise<EmergencyContact[]> {
    const cacheKey = `emergency_contacts:${organizationId}:${residentId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const contacts = await prisma.emergencyContact.findMany({
      where: { residentId, organizationId },
      include: {
        contactInfo: true
      },
      orderBy: { priority: 'asc' }
    });

    await cache.set(cacheKey, JSON.stringify(contacts), this.CACHE_TTL);
    await audit.log('getEmergencyContacts', { residentId, organizationId });

    return contacts;
  }

  // Care Team
  async getCareTeam(residentId: string, organizationId: string): Promise<CareTeamMember[]> {
    const cacheKey = `care_team:${organizationId}:${residentId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const team = await prisma.careTeamMember.findMany({
      where: { residentId, organizationId },
      include: {
        contactInfo: true,
        qualifications: true
      }
    });

    await cache.set(cacheKey, JSON.stringify(team), this.CACHE_TTL);
    await audit.log('getCareTeam', { residentId, organizationId });

    return team;
  }

  // Clear cache for a resident
  async clearResidentCache(residentId: string, organizationId: string): Promise<void> {
    const patterns = [
      `family_members:${organizationId}:${residentId}`,
      `care_notes:${organizationId}:${residentId}:*`,
      `visits:${organizationId}:${residentId}:*`,
      `documents:${organizationId}:${residentId}:*`,
      `emergency_contacts:${organizationId}:${residentId}`,
      `care_team:${organizationId}:${residentId}`
    ];

    await Promise.all(patterns.map(pattern => cache.deletePattern(pattern)));
    await audit.log('clearResidentCache', { residentId, organizationId });
  }
}


