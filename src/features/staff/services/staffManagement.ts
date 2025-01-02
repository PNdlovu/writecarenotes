/**
 * @writecarenotes.com
 * @fileoverview Core staff management service for all care types
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Provides core staff management functionality that can be used across
 * all care types. Handles staff profiles, qualifications, training,
 * documents, shifts, and leave management.
 */

import { prisma } from '@/lib/prisma';
import type { Staff, StaffQualification, StaffTraining, StaffDocument, StaffShift, StaffLeave } from '@prisma/client';

export interface StaffProfileData {
  organizationId: string;
  userId: string;
  role: string;
  startDate?: Date;
  contractType?: string;
  contractHours?: number;
  dbsCheckDate?: Date;
  dbsNumber?: string;
  trainingCompleted?: string[];
  notes?: string;
  // Domiciliary specific fields
  maxTravelDistance?: number;
  preferredAreas?: string[];
  specialties?: string[];
  languages?: string[];
  drivingLicense?: boolean;
  hasVehicle?: boolean;
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: number;
    registration?: string;
    insurance?: {
      provider: string;
      policyNumber: string;
      expiryDate: Date;
      businessUseIncluded: boolean;
    };
  };
  clientPreferences?: {
    genderPreference?: string;
    languageRequirements?: string[];
    specialNeeds?: string[];
    culturalRequirements?: string[];
  };
}

export interface QualificationData {
  organizationId: string;
  staffId: string;
  type: string;
  name: string;
  issuedBy: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationStatus: string;
  verifiedBy?: string;
  verificationDate?: Date;
  attachmentUrl?: string;
  notes?: string;
}

export interface TrainingData {
  organizationId: string;
  staffId: string;
  name: string;
  type: string;
  completionDate: Date;
  expiryDate?: Date;
  provider: string;
  score?: number;
  certificateUrl?: string;
  notes?: string;
}

export interface DocumentData {
  organizationId: string;
  staffId: string;
  type: string;
  name: string;
  url: string;
  expiryDate?: Date;
  notes?: string;
}

export interface ShiftData {
  organizationId: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
  type: string;
  location?: string;
  notes?: string;
}

export interface LeaveData {
  organizationId: string;
  staffId: string;
  startDate: Date;
  endDate: Date;
  type: string;
  status: string;
  notes?: string;
}

export class StaffManagement {
  /**
   * Creates or updates a staff profile
   */
  async upsertStaffProfile(
    data: StaffProfileData,
    userId: string
  ): Promise<Staff> {
    return await prisma.$transaction(async (tx) => {
      // Validate user exists
      const user = await tx.user.findFirst({
        where: {
          id: data.userId,
          organizationId: data.organizationId
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Upsert profile
      return await tx.staff.upsert({
        where: {
          userId: data.userId
        },
        create: {
          ...data,
          createdBy: userId,
          updatedBy: userId
        },
        update: {
          ...data,
          updatedBy: userId
        }
      });
    });
  }

  /**
   * Creates a new qualification record
   */
  async createQualification(
    data: QualificationData,
    userId: string
  ): Promise<StaffQualification> {
    return await prisma.$transaction(async (tx) => {
      // Validate staff exists
      const staff = await tx.staff.findFirst({
        where: {
          id: data.staffId,
          organizationId: data.organizationId
        }
      });

      if (!staff) {
        throw new Error('Staff not found');
      }

      // Create qualification
      return await tx.staffQualification.create({
        data: {
          ...data,
          createdBy: userId,
          updatedBy: userId
        }
      });
    });
  }

  /**
   * Creates a new training record
   */
  async createTraining(
    data: TrainingData,
    userId: string
  ): Promise<StaffTraining> {
    return await prisma.$transaction(async (tx) => {
      // Validate staff exists
      const staff = await tx.staff.findFirst({
        where: {
          id: data.staffId,
          organizationId: data.organizationId
        }
      });

      if (!staff) {
        throw new Error('Staff not found');
      }

      // Create training record
      return await tx.staffTraining.create({
        data: {
          ...data,
          createdBy: userId,
          updatedBy: userId
        }
      });
    });
  }

  /**
   * Creates a new document record
   */
  async createDocument(
    data: DocumentData,
    userId: string
  ): Promise<StaffDocument> {
    return await prisma.$transaction(async (tx) => {
      // Validate staff exists
      const staff = await tx.staff.findFirst({
        where: {
          id: data.staffId,
          organizationId: data.organizationId
        }
      });

      if (!staff) {
        throw new Error('Staff not found');
      }

      // Create document record
      return await tx.staffDocument.create({
        data: {
          ...data,
          createdBy: userId,
          updatedBy: userId
        }
      });
    });
  }

  /**
   * Creates a new shift record
   */
  async createShift(
    data: ShiftData,
    userId: string
  ): Promise<StaffShift> {
    return await prisma.$transaction(async (tx) => {
      // Validate staff exists
      const staff = await tx.staff.findFirst({
        where: {
          id: data.staffId,
          organizationId: data.organizationId
        }
      });

      if (!staff) {
        throw new Error('Staff not found');
      }

      // Create shift record
      return await tx.staffShift.create({
        data: {
          ...data,
          createdBy: userId,
          updatedBy: userId
        }
      });
    });
  }

  /**
   * Creates a new leave record
   */
  async createLeave(
    data: LeaveData,
    userId: string
  ): Promise<StaffLeave> {
    return await prisma.$transaction(async (tx) => {
      // Validate staff exists
      const staff = await tx.staff.findFirst({
        where: {
          id: data.staffId,
          organizationId: data.organizationId
        }
      });

      if (!staff) {
        throw new Error('Staff not found');
      }

      // Create leave record
      return await tx.staffLeave.create({
        data: {
          ...data,
          createdBy: userId,
          updatedBy: userId
        }
      });
    });
  }

  /**
   * Retrieves a staff member's full profile including all related records
   */
  async getStaffFullProfile(organizationId: string, staffId: string) {
    return await prisma.staff.findFirst({
      where: {
        id: staffId,
        organizationId
      },
      include: {
        User: true,
        StaffQualification: true,
        StaffTraining: true,
        StaffDocument: true,
        StaffShift: true,
        StaffLeave: true
      }
    });
  }

  /**
   * Retrieves available staff for a given time slot and area
   */
  async getAvailableStaff(
    organizationId: string,
    startTime: Date,
    endTime: Date,
    area?: string,
    requirements?: {
      maxTravelDistance?: number;
      specialties?: string[];
      languages?: string[];
      genderPreference?: string;
      culturalRequirements?: string[];
    }
  ) {
    const dayOfWeek = startTime.getDay();
    const timeStart = startTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const timeEnd = endTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return await prisma.staff.findMany({
      where: {
        organizationId,
        AND: [
          {
            ...(area && {
              preferredAreas: {
                has: area
              }
            })
          },
          {
            ...(requirements?.maxTravelDistance && {
              maxTravelDistance: {
                gte: requirements.maxTravelDistance
              }
            })
          },
          {
            ...(requirements?.specialties && {
              specialties: {
                hasEvery: requirements.specialties
              }
            })
          },
          {
            ...(requirements?.languages && {
              languages: {
                hasEvery: requirements.languages
              }
            })
          },
          {
            ...(requirements?.genderPreference && {
              clientPreferences: {
                path: ['genderPreference'],
                equals: requirements.genderPreference
              }
            })
          },
          {
            ...(requirements?.culturalRequirements && {
              clientPreferences: {
                path: ['culturalRequirements'],
                array_contains: requirements.culturalRequirements
              }
            })
          }
        ],
        StaffAvailability: {
          some: {
            dayOfWeek,
            startTime: {
              lte: timeStart
            },
            endTime: {
              gte: timeEnd
            },
            OR: [
              { effectiveTo: null },
              {
                effectiveTo: {
                  gte: endTime
                }
              }
            ]
          }
        },
        StaffAssignment: {
          none: {
            OR: [
              {
                startTime: {
                  lte: endTime,
                  gte: startTime
                }
              },
              {
                endTime: {
                  lte: endTime,
                  gte: startTime
                }
              }
            ]
          }
        }
      },
      include: {
        User: true,
        StaffQualification: {
          where: {
            expiryDate: {
              gte: new Date()
            }
          }
        },
        StaffTraining: {
          where: {
            expiryDate: {
              gte: new Date()
            }
          }
        }
      }
    });
  }

  /**
   * Retrieves staff with expiring vehicle documents
   */
  async getStaffWithExpiringVehicleDocuments(
    organizationId: string,
    daysThreshold: number = 30
  ) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return await prisma.staff.findMany({
      where: {
        organizationId,
        hasVehicle: true,
        vehicleDetails: {
          path: ['insurance', 'expiryDate'],
          lte: thresholdDate
        }
      },
      include: {
        User: true
      },
      orderBy: {
        vehicleDetails: {
          path: ['insurance', 'expiryDate']
        }
      }
    });
  }
} 