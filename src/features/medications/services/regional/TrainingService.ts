/**
 * @writecarenotes.com
 * @fileoverview Regional Medication Training Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Handles regional training requirements for medication management,
 * ensuring staff competency across all supported regions.
 */

import { Region } from '@/features/compliance/types/compliance.types';
import { RegionalConfigService } from './RegionalConfigService';
import { LocalizationService } from './LocalizationService';

interface TrainingRequirement {
  id: string;
  title: string;
  description: string;
  frequency: 'ONCE' | 'ANNUAL' | 'BIANNUAL' | 'QUARTERLY';
  validityPeriod: number; // in months
  mandatoryRoles: string[];
  assessmentRequired: boolean;
  certificateRequired: boolean;
}

interface TrainingRecord {
  id: string;
  staffId: string;
  requirementId: string;
  completionDate: Date;
  expiryDate: Date;
  score?: number;
  certificateNumber?: string;
  assessor?: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
}

export class TrainingService {
  private regionalConfig: RegionalConfigService;
  private localization: LocalizationService;

  constructor(private readonly region: Region) {
    this.regionalConfig = new RegionalConfigService(region);
    this.localization = new LocalizationService(region);
  }

  private readonly trainingRequirements: Record<Region, TrainingRequirement[]> = {
    [Region.ENGLAND]: [
      {
        id: 'MED_ADMIN_BASIC',
        title: 'Basic Medication Administration',
        description: 'Core principles of safe medication administration',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['CARE_WORKER', 'SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'CD_HANDLING',
        title: 'Controlled Drugs Management',
        description: 'Safe handling and management of controlled drugs',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'EMERGENCY_MEDS',
        title: 'Emergency Medications',
        description: 'Administration and management of emergency medications',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'MED_ERROR_HANDLING',
        title: 'Medication Error Management',
        description: 'Identification, reporting, and prevention of medication errors',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['CARE_WORKER', 'SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'CLINICAL_OBS',
        title: 'Clinical Observations',
        description: 'Recording and monitoring clinical observations',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      }
    ],
    [Region.WALES]: [
      {
        id: 'MED_ADMIN_BASIC_WALES',
        title: 'Basic Medication Administration',
        description: 'Core principles of safe medication administration (Bilingual)',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['CARE_WORKER', 'SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'CD_HANDLING_WALES',
        title: 'Controlled Drugs Management',
        description: 'Safe handling and management of controlled drugs (Bilingual)',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'EMERGENCY_MEDS_WALES',
        title: 'Emergency Medications',
        description: 'Administration and management of emergency medications (Bilingual)',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'MED_ERROR_WALES',
        title: 'Medication Error Management',
        description: 'Identification, reporting, and prevention of medication errors (Bilingual)',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['CARE_WORKER', 'SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      }
    ],
    [Region.SCOTLAND]: [
      {
        id: 'MED_ADMIN_BASIC_SCOT',
        title: 'Basic Medication Administration',
        description: 'Core principles of safe medication administration',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['CARE_WORKER', 'SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'CD_HANDLING_SCOT',
        title: 'Controlled Drugs Management',
        description: 'Safe handling and management of controlled drugs',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'EMERGENCY_MEDS_SCOT',
        title: 'Emergency Medications',
        description: 'Administration and management of emergency medications',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'COVERT_MEDS_SCOT',
        title: 'Covert Medication Administration',
        description: 'Safe and legal administration of covert medications',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      }
    ],
    [Region.NORTHERN_IRELAND]: [
      {
        id: 'MED_ADMIN_BASIC_NI',
        title: 'Basic Medication Administration',
        description: 'Core principles of safe medication administration',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['CARE_WORKER', 'SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'CD_HANDLING_NI',
        title: 'Controlled Drugs Management',
        description: 'Safe handling and management of controlled drugs',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'EMERGENCY_MEDS_NI',
        title: 'Emergency Medications',
        description: 'Administration and management of emergency medications',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'MED_COMPETENCY_NI',
        title: 'Medication Competency Assessment',
        description: 'Comprehensive medication management competency',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      }
    ],
    [Region.IRELAND]: [
      {
        id: 'MED_ADMIN_BASIC_ROI',
        title: 'Basic Medication Administration',
        description: 'Core principles of safe medication administration',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['CARE_WORKER', 'SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'CD_HANDLING_ROI',
        title: 'Controlled Drugs Management',
        description: 'Safe handling and management of controlled drugs',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'EMERGENCY_MEDS_ROI',
        title: 'Emergency Medications',
        description: 'Administration and management of emergency medications',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      },
      {
        id: 'HIQA_MED_MGMT',
        title: 'HIQA Medication Management',
        description: 'Medication management according to HIQA standards',
        frequency: 'ANNUAL',
        validityPeriod: 12,
        mandatoryRoles: ['SENIOR_CARE_WORKER', 'NURSE'],
        assessmentRequired: true,
        certificateRequired: true
      }
    ]
  };

  getTrainingRequirements(role: string): TrainingRequirement[] {
    return this.trainingRequirements[this.region].filter(req =>
      req.mandatoryRoles.includes(role)
    );
  }

  async getTrainingRecord(staffId: string): Promise<TrainingRecord[]> {
    try {
      const response = await fetch(`/api/training/${staffId}/records`);
      if (!response.ok) {
        throw new Error('Failed to fetch training records');
      }
      return response.json();
    } catch (error) {
      throw new Error('Failed to retrieve training records');
    }
  }

  async recordTrainingCompletion(
    staffId: string,
    requirementId: string,
    completionData: {
      completionDate: Date;
      score?: number;
      certificateNumber?: string;
      assessor?: string;
    }
  ): Promise<TrainingRecord> {
    try {
      const requirement = this.trainingRequirements[this.region].find(
        req => req.id === requirementId
      );

      if (!requirement) {
        throw new Error('Invalid training requirement');
      }

      const expiryDate = new Date(completionData.completionDate);
      expiryDate.setMonth(expiryDate.getMonth() + requirement.validityPeriod);

      const record: Omit<TrainingRecord, 'id'> = {
        staffId,
        requirementId,
        completionDate: completionData.completionDate,
        expiryDate,
        score: completionData.score,
        certificateNumber: completionData.certificateNumber,
        assessor: completionData.assessor,
        status: 'VALID'
      };

      const response = await fetch('/api/training/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        throw new Error('Failed to record training completion');
      }

      return response.json();
    } catch (error) {
      throw new Error('Failed to record training completion');
    }
  }

  async getExpiringTraining(daysNotice: number = 30): Promise<TrainingRecord[]> {
    try {
      const response = await fetch(`/api/training/expiring?days=${daysNotice}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expiring training records');
      }
      return response.json();
    } catch (error) {
      throw new Error('Failed to retrieve expiring training records');
    }
  }

  async validateTrainingCompliance(staffId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/training/${staffId}/compliance`);
      if (!response.ok) {
        throw new Error('Failed to validate training compliance');
      }
      const result = await response.json();
      return result.compliant;
    } catch (error) {
      throw new Error('Failed to validate training compliance');
    }
  }

  getTrainingCategories(): string[] {
    return [
      'Basic Medication Administration',
      'Controlled Drugs',
      'Emergency Medications',
      'Medication Storage',
      'Documentation',
      'Error Reporting',
      'Clinical Observations'
    ];
  }

  async scheduleTraining(
    staffId: string,
    requirementId: string,
    date: Date
  ): Promise<void> {
    try {
      const response = await fetch('/api/training/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          staffId,
          requirementId,
          scheduledDate: date.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule training');
      }
    } catch (error) {
      throw new Error('Failed to schedule training');
    }
  }
} 