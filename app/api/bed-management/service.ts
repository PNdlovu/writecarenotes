/**
 * @fileoverview Bed Management service for managing beds, allocations, transfers, and maintenance
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import {
  bedSchema,
  bedCleaningSchema,
  bedRiskAssessmentSchema,
  bedAuditSchema,
  waitlistSchema,
  type BedRequest,
  type BedCleaningRequest,
  type BedRiskAssessmentRequest,
  type BedAuditRequest,
  type WaitlistRequest,
  successResponse,
  errorResponse
} from './validation';

export class BedManagementService {
  // Bed operations
  async getAllBeds(organizationId: string) {
    const beds = await prisma.bed.findMany({
      where: { organizationId },
      include: {
        currentOccupant: true,
        cleaningHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        riskAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    return successResponse(beds);
  }

  async getBed(id: string, organizationId: string) {
    const bed = await prisma.bed.findFirst({
      where: { id, organizationId },
      include: {
        currentOccupant: true,
        cleaningHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        riskAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        audits: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!bed) {
      return errorResponse('Bed not found', 'NOT_FOUND');
    }

    return successResponse(bed);
  }

  async createBed(data: BedRequest, organizationId: string, userId: string) {
    const validatedData = bedSchema.parse(data);

    const bed = await prisma.bed.create({
      data: {
        ...validatedData,
        organizationId,
        createdById: userId
      }
    });

    return successResponse(bed);
  }

  async updateBed(id: string, data: Partial<BedRequest>, organizationId: string) {
    const validatedData = bedSchema.partial().parse(data);

    const bed = await prisma.bed.findFirst({
      where: { id, organizationId }
    });

    if (!bed) {
      return errorResponse('Bed not found', 'NOT_FOUND');
    }

    const updatedBed = await prisma.bed.update({
      where: { id },
      data: validatedData
    });

    return successResponse(updatedBed);
  }

  async deleteBed(id: string, organizationId: string) {
    const bed = await prisma.bed.findFirst({
      where: { id, organizationId }
    });

    if (!bed) {
      return errorResponse('Bed not found', 'NOT_FOUND');
    }

    await prisma.bed.delete({
      where: { id }
    });

    return successResponse({ message: 'Bed deleted successfully' });
  }

  // Cleaning operations
  async createCleaning(data: BedCleaningRequest, organizationId: string, userId: string) {
    const validatedData = bedCleaningSchema.parse(data);

    const cleaning = await prisma.bedCleaning.create({
      data: {
        ...validatedData,
        organizationId,
        cleanedById: userId,
        status: 'PENDING'
      }
    });

    return successResponse(cleaning);
  }

  async updateCleaning(id: string, data: Partial<BedCleaningRequest>, organizationId: string) {
    const validatedData = bedCleaningSchema.partial().parse(data);

    const cleaning = await prisma.bedCleaning.findFirst({
      where: { id, organizationId }
    });

    if (!cleaning) {
      return errorResponse('Cleaning record not found', 'NOT_FOUND');
    }

    const updatedCleaning = await prisma.bedCleaning.update({
      where: { id },
      data: validatedData
    });

    return successResponse(updatedCleaning);
  }

  // Risk assessment operations
  async createRiskAssessment(data: BedRiskAssessmentRequest, organizationId: string, userId: string) {
    const validatedData = bedRiskAssessmentSchema.parse(data);

    const assessment = await prisma.bedRiskAssessment.create({
      data: {
        ...validatedData,
        organizationId,
        assessedById: userId
      }
    });

    return successResponse(assessment);
  }

  async updateRiskAssessment(id: string, data: Partial<BedRiskAssessmentRequest>, organizationId: string) {
    const validatedData = bedRiskAssessmentSchema.partial().parse(data);

    const assessment = await prisma.bedRiskAssessment.findFirst({
      where: { id, organizationId }
    });

    if (!assessment) {
      return errorResponse('Risk assessment not found', 'NOT_FOUND');
    }

    const updatedAssessment = await prisma.bedRiskAssessment.update({
      where: { id },
      data: validatedData
    });

    return successResponse(updatedAssessment);
  }

  // Audit operations
  async createAudit(data: BedAuditRequest, organizationId: string, userId: string) {
    const validatedData = bedAuditSchema.parse(data);

    const audit = await prisma.bedAudit.create({
      data: {
        ...validatedData,
        organizationId,
        auditorId: userId
      }
    });

    return successResponse(audit);
  }

  async updateAudit(id: string, data: Partial<BedAuditRequest>, organizationId: string) {
    const validatedData = bedAuditSchema.partial().parse(data);

    const audit = await prisma.bedAudit.findFirst({
      where: { id, organizationId }
    });

    if (!audit) {
      return errorResponse('Audit not found', 'NOT_FOUND');
    }

    const updatedAudit = await prisma.bedAudit.update({
      where: { id },
      data: validatedData
    });

    return successResponse(updatedAudit);
  }

  // Waitlist operations
  async createWaitlistEntry(data: WaitlistRequest, organizationId: string, userId: string) {
    const validatedData = waitlistSchema.parse(data);

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        ...validatedData,
        organizationId,
        createdById: userId,
        status: 'ACTIVE'
      }
    });

    return successResponse(waitlistEntry);
  }

  async updateWaitlistEntry(id: string, data: Partial<WaitlistRequest>, organizationId: string) {
    const validatedData = waitlistSchema.partial().parse(data);

    const waitlistEntry = await prisma.waitlist.findFirst({
      where: { id, organizationId }
    });

    if (!waitlistEntry) {
      return errorResponse('Waitlist entry not found', 'NOT_FOUND');
    }

    const updatedEntry = await prisma.waitlist.update({
      where: { id },
      data: validatedData
    });

    return successResponse(updatedEntry);
  }
} 