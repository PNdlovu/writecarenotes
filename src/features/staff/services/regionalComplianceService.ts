/**
 * @writecarenotes.com
 * @fileoverview Service for managing regional compliance requirements
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { prisma } from '@/lib/prisma';
import { Region } from '@prisma/client';

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  documentType: string;
  validityPeriod: number; // in months
  isRequired: boolean;
  regulatoryBody: string;
}

interface RegionalSettings {
  language: string;
  currency: string;
  timeZone: string;
  dateFormat: string;
  regulatoryBodies: string[];
  documentTypes: string[];
}

const REGIONAL_SETTINGS: Record<Region, RegionalSettings> = {
  ENGLAND: {
    language: 'en-GB',
    currency: 'GBP',
    timeZone: 'Europe/London',
    dateFormat: 'dd/MM/yyyy',
    regulatoryBodies: ['CQC', 'OFSTED'],
    documentTypes: ['DBS_CHECK', 'TRAINING_CERTIFICATE', 'INSURANCE']
  },
  WALES: {
    language: 'cy-GB',
    currency: 'GBP',
    timeZone: 'Europe/London',
    dateFormat: 'dd/MM/yyyy',
    regulatoryBodies: ['CIW'],
    documentTypes: ['DBS_CHECK', 'TRAINING_CERTIFICATE', 'INSURANCE']
  },
  SCOTLAND: {
    language: 'gd-GB',
    currency: 'GBP',
    timeZone: 'Europe/London',
    dateFormat: 'dd/MM/yyyy',
    regulatoryBodies: ['CARE_INSPECTORATE'],
    documentTypes: ['DBS_CHECK', 'TRAINING_CERTIFICATE', 'INSURANCE']
  },
  NORTHERN_IRELAND: {
    language: 'en-GB',
    currency: 'GBP',
    timeZone: 'Europe/London',
    dateFormat: 'dd/MM/yyyy',
    regulatoryBodies: ['RQIA'],
    documentTypes: ['DBS_CHECK', 'TRAINING_CERTIFICATE', 'INSURANCE']
  },
  IRELAND: {
    language: 'ga-IE',
    currency: 'EUR',
    timeZone: 'Europe/Dublin',
    dateFormat: 'dd/MM/yyyy',
    regulatoryBodies: ['HIQA'],
    documentTypes: ['GARDA_VETTING', 'TRAINING_CERTIFICATE', 'INSURANCE']
  }
};

export class RegionalComplianceService {
  /**
   * Get compliance requirements for a specific region
   */
  static async getRequirements(region: Region): Promise<ComplianceRequirement[]> {
    const compliance = await prisma.regionalCompliance.findUnique({
      where: { region }
    });

    if (!compliance) {
      throw new Error(`No compliance requirements found for region: ${region}`);
    }

    return compliance.requirements as ComplianceRequirement[];
  }

  /**
   * Get regional settings
   */
  static getRegionalSettings(region: Region): RegionalSettings {
    return REGIONAL_SETTINGS[region];
  }

  /**
   * Validate staff compliance for a specific region
   */
  static async validateStaffCompliance(staffId: string): Promise<{
    isCompliant: boolean;
    missingRequirements: ComplianceRequirement[];
  }> {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        documents: true
      }
    });

    if (!staff) {
      throw new Error(`Staff not found: ${staffId}`);
    }

    const requirements = await this.getRequirements(staff.region);
    const missingRequirements: ComplianceRequirement[] = [];

    for (const requirement of requirements) {
      const hasValidDocument = staff.documents.some(doc => 
        doc.type === requirement.documentType &&
        doc.isVerified &&
        (!doc.expiryDate || new Date(doc.expiryDate) > new Date())
      );

      if (!hasValidDocument && requirement.isRequired) {
        missingRequirements.push(requirement);
      }
    }

    return {
      isCompliant: missingRequirements.length === 0,
      missingRequirements
    };
  }

  /**
   * Get language support requirements for a region
   */
  static getLanguageRequirements(region: Region): string[] {
    switch (region) {
      case 'WALES':
        return ['en-GB', 'cy-GB']; // English and Welsh
      case 'SCOTLAND':
        return ['en-GB', 'gd-GB']; // English and Scottish Gaelic
      case 'IRELAND':
      case 'NORTHERN_IRELAND':
        return ['en-GB', 'ga-IE']; // English and Irish
      default:
        return ['en-GB']; // English only
    }
  }

  /**
   * Update regional compliance requirements
   */
  static async updateRequirements(
    region: Region,
    requirements: ComplianceRequirement[]
  ): Promise<void> {
    await prisma.regionalCompliance.upsert({
      where: { region },
      create: {
        region,
        requirements,
        version: 1
      },
      update: {
        requirements,
        version: { increment: 1 }
      }
    });
  }

  /**
   * Get regulatory body for a region
   */
  static getRegulatoryBody(region: Region): string[] {
    return REGIONAL_SETTINGS[region].regulatoryBodies;
  }

  /**
   * Get required document types for a region
   */
  static getRequiredDocuments(region: Region): string[] {
    return REGIONAL_SETTINGS[region].documentTypes;
  }

  /**
   * Format date according to regional settings
   */
  static formatDate(date: Date, region: Region): string {
    const settings = REGIONAL_SETTINGS[region];
    return new Intl.DateTimeFormat(settings.language, {
      dateStyle: 'short',
      timeZone: settings.timeZone
    }).format(date);
  }

  /**
   * Format currency according to regional settings
   */
  static formatCurrency(amount: number, region: Region): string {
    const settings = REGIONAL_SETTINGS[region];
    return new Intl.NumberFormat(settings.language, {
      style: 'currency',
      currency: settings.currency
    }).format(amount);
  }
} 