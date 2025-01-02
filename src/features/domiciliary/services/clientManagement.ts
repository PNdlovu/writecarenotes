/**
 * @writecarenotes.com
 * @fileoverview Service for managing domiciliary care clients
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles client management operations for domiciliary care including
 * profiles, assessments, home environment, and emergency contacts.
 */

import { prisma } from '@/lib/prisma';
import { 
  DomiciliaryClientProfile,
  HomeEnvironment,
  EmergencyContact,
  DomiciliaryAssessment
} from '@prisma/client';

export interface ClientProfileData {
  organizationId: string;
  clientId: string;
  preferredTitle?: string;
  preferredName?: string;
  preferredLanguage?: string;
  communicationNeeds?: string[];
  culturalPreferences?: string[];
  dietaryRequirements?: string[];
  mobilityNeeds?: string[];
}

export interface HomeEnvironmentData {
  organizationId: string;
  clientId: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    county: string;
    postcode: string;
  };
  accessInstructions?: string;
  keySafeCode?: string;
  keySafeLocation?: string;
  parkingInformation?: string;
  nearestBusStop?: string;
  propertyType?: string;
  floorLevel?: string;
  hasLift?: boolean;
  hasStairs?: boolean;
  numberOfSteps?: number;
  hasRamp?: boolean;
  utilities?: {
    heating?: string;
    water?: string;
    electricity?: string;
    gas?: string;
  };
  equipmentAvailable?: string[];
  hazards?: string[];
  petInformation?: string;
}

export interface EmergencyContactData {
  organizationId: string;
  clientId: string;
  name: string;
  relationship: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    county: string;
    postcode: string;
  };
  hasKeyAccess?: boolean;
  isNextOfKin?: boolean;
  isEmergencyContact?: boolean;
  canDiscussHealth?: boolean;
  canDiscussFinance?: boolean;
  notes?: string;
}

export interface AssessmentData {
  organizationId: string;
  clientId: string;
  assessmentType: string;
  assessmentDate: Date;
  assessedBy: string;
  personalCare?: Record<string, any>;
  mobility?: Record<string, any>;
  nutrition?: Record<string, any>;
  medication?: Record<string, any>;
  communication?: Record<string, any>;
  mentalHealth?: Record<string, any>;
  socialNeeds?: Record<string, any>;
  risks?: Record<string, any>;
  recommendations?: string[];
  outcome?: string;
  nextReviewDate?: Date;
}

export class DomiciliaryClientManagement {
  /**
   * Creates or updates a client profile
   */
  async upsertClientProfile(
    data: ClientProfileData,
    userId: string
  ): Promise<DomiciliaryClientProfile> {
    return await prisma.$transaction(async (tx) => {
      // Validate client exists
      const client = await tx.client.findFirst({
        where: {
          id: data.clientId,
          organizationId: data.organizationId
        }
      });

      if (!client) {
        throw new Error('Client not found');
      }

      // Upsert profile
      return await tx.domiciliaryClientProfile.upsert({
        where: {
          clientId: data.clientId
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
   * Creates or updates home environment details
   */
  async upsertHomeEnvironment(
    data: HomeEnvironmentData,
    userId: string
  ): Promise<HomeEnvironment> {
    return await prisma.$transaction(async (tx) => {
      // Validate client exists
      const client = await tx.client.findFirst({
        where: {
          id: data.clientId,
          organizationId: data.organizationId
        }
      });

      if (!client) {
        throw new Error('Client not found');
      }

      // Upsert home environment
      return await tx.homeEnvironment.upsert({
        where: {
          clientId: data.clientId
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
   * Creates a new emergency contact
   */
  async createEmergencyContact(
    data: EmergencyContactData,
    userId: string
  ): Promise<EmergencyContact> {
    return await prisma.$transaction(async (tx) => {
      // Validate client exists
      const client = await tx.client.findFirst({
        where: {
          id: data.clientId,
          organizationId: data.organizationId
        }
      });

      if (!client) {
        throw new Error('Client not found');
      }

      // Create emergency contact
      return await tx.emergencyContact.create({
        data: {
          ...data,
          createdBy: userId,
          updatedBy: userId
        }
      });
    });
  }

  /**
   * Updates an emergency contact
   */
  async updateEmergencyContact(
    id: string,
    data: Partial<EmergencyContactData>,
    userId: string
  ): Promise<EmergencyContact> {
    return await prisma.emergencyContact.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId
      }
    });
  }

  /**
   * Creates a new assessment
   */
  async createAssessment(
    data: AssessmentData,
    userId: string
  ): Promise<DomiciliaryAssessment> {
    return await prisma.$transaction(async (tx) => {
      // Validate client exists
      const client = await tx.client.findFirst({
        where: {
          id: data.clientId,
          organizationId: data.organizationId
        }
      });

      if (!client) {
        throw new Error('Client not found');
      }

      // Create assessment
      return await tx.domiciliaryAssessment.create({
        data: {
          ...data,
          createdBy: userId,
          updatedBy: userId
        }
      });
    });
  }

  /**
   * Updates an assessment
   */
  async updateAssessment(
    id: string,
    data: Partial<AssessmentData>,
    userId: string
  ): Promise<DomiciliaryAssessment> {
    return await prisma.domiciliaryAssessment.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId
      }
    });
  }

  /**
   * Retrieves a client's full profile including all related data
   */
  async getClientFullProfile(organizationId: string, clientId: string) {
    return await prisma.$transaction(async (tx) => {
      const [
        profile,
        homeEnvironment,
        emergencyContacts,
        assessments
      ] = await Promise.all([
        tx.domiciliaryClientProfile.findUnique({
          where: { clientId }
        }),
        tx.homeEnvironment.findUnique({
          where: { clientId }
        }),
        tx.emergencyContact.findMany({
          where: {
            organizationId,
            clientId
          }
        }),
        tx.domiciliaryAssessment.findMany({
          where: {
            organizationId,
            clientId
          },
          orderBy: {
            assessmentDate: 'desc'
          }
        })
      ]);

      return {
        profile,
        homeEnvironment,
        emergencyContacts,
        assessments
      };
    });
  }

  /**
   * Retrieves assessments by type
   */
  async getAssessmentsByType(
    organizationId: string,
    clientId: string,
    assessmentType: string
  ) {
    return await prisma.domiciliaryAssessment.findMany({
      where: {
        organizationId,
        clientId,
        assessmentType
      },
      orderBy: {
        assessmentDate: 'desc'
      }
    });
  }

  /**
   * Retrieves assessments due for review
   */
  async getAssessmentsDueForReview(
    organizationId: string,
    daysThreshold: number = 30
  ) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return await prisma.domiciliaryAssessment.findMany({
      where: {
        organizationId,
        nextReviewDate: {
          lte: thresholdDate
        }
      },
      include: {
        Client: true
      },
      orderBy: {
        nextReviewDate: 'asc'
      }
    });
  }
} 