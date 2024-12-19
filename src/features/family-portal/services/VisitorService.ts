import { db } from '@/lib/db';
import { Visit, VisitStatus } from '@prisma/client';
import { FamilyMember } from '../types';

export class VisitorService {
  async createVisit(data: {
    visitorId: string;
    date: Date;
    duration: number;
    purpose: string;
    notes?: string;
  }): Promise<Visit> {
    return db.visit.create({
      data: {
        ...data,
        status: 'scheduled' as VisitStatus,
      },
    });
  }

  async updateVisitStatus(visitId: string, status: VisitStatus): Promise<Visit> {
    return db.visit.update({
      where: { id: visitId },
      data: { status },
    });
  }

  async getVisitHistory(visitorId: string): Promise<Visit[]> {
    return db.visit.findMany({
      where: { visitorId },
      orderBy: { date: 'desc' },
    });
  }

  async getUpcomingVisits(visitorId: string): Promise<Visit[]> {
    return db.visit.findMany({
      where: {
        visitorId,
        date: { gte: new Date() },
        status: 'scheduled',
      },
      orderBy: { date: 'asc' },
    });
  }

  async getFamilyMembers(residentId: string): Promise<FamilyMember[]> {
    const familyMembers = await db.familyMember.findMany({
      where: { residentId },
      include: {
        contactInfo: true,
        preferences: true,
        permissions: true,
      },
    });

    return familyMembers.map(member => ({
      ...member,
      contactInfo: member.contactInfo,
      preferences: member.preferences,
      permissions: member.permissions,
    }));
  }
}


