import { Region } from '@/types/region';
import { CareHomeType } from '../types/compliance';
import { ConsentType, ParentalConsent } from '../types/consent';

interface RegionalRequirement {
  minimumAge: number;
  maximumDuration: number; // in days
  requiresWitness: boolean;
  requiresHealthcarePlan: boolean;
  requiresGPApproval: boolean;
  requiresPharmacistReview: boolean;
  notificationPeriod: number; // in days
  renewalPeriod: number; // in days
  allowedConsentTypes: ConsentType[];
  additionalDocumentation: string[];
}

const REGIONAL_REQUIREMENTS: Record<Region, Record<CareHomeType, RegionalRequirement>> = {
  'GB-ENG': {
    'CHILDRENS': {
      minimumAge: 16,
      maximumDuration: 365, // 1 year
      requiresWitness: true,
      requiresHealthcarePlan: true,
      requiresGPApproval: true,
      requiresPharmacistReview: true,
      notificationPeriod: 30, // 30 days notice
      renewalPeriod: 30, // 30 days before expiry
      allowedConsentTypes: [
        'REGULAR_MEDICATION',
        'PRN_MEDICATION',
        'EMERGENCY_MEDICATION',
        'CONTROLLED_DRUG',
        'OVER_THE_COUNTER'
      ],
      additionalDocumentation: [
        'INDIVIDUAL_HEALTHCARE_PLAN',
        'GP_APPROVAL',
        'RISK_ASSESSMENT'
      ]
    },
    'RESIDENTIAL': {
      minimumAge: 18,
      maximumDuration: 0, // No expiry
      requiresWitness: false,
      requiresHealthcarePlan: false,
      requiresGPApproval: false,
      requiresPharmacistReview: true,
      notificationPeriod: 0,
      renewalPeriod: 0,
      allowedConsentTypes: [
        'CONTROLLED_DRUG',
        'EMERGENCY_MEDICATION'
      ],
      additionalDocumentation: [
        'CAPACITY_ASSESSMENT'
      ]
    },
    'NURSING': {
      minimumAge: 18,
      maximumDuration: 0,
      requiresWitness: true,
      requiresHealthcarePlan: false,
      requiresGPApproval: false,
      requiresPharmacistReview: true,
      notificationPeriod: 0,
      renewalPeriod: 0,
      allowedConsentTypes: [
        'CONTROLLED_DRUG',
        'EMERGENCY_MEDICATION'
      ],
      additionalDocumentation: [
        'CAPACITY_ASSESSMENT',
        'NURSING_ASSESSMENT'
      ]
    }
  },
  // Add other regions with their specific requirements
  'GB-WLS': {
    // Similar structure for Wales
  },
  'GB-SCT': {
    // Similar structure for Scotland
  },
  'GB-NIR': {
    // Similar structure for Northern Ireland
  },
  'IE': {
    // Similar structure for Ireland
  }
};

export class RegionalComplianceService {
  private getRequirements(region: Region, careHomeType: CareHomeType): RegionalRequirement {
    return REGIONAL_REQUIREMENTS[region]?.[careHomeType] ?? REGIONAL_REQUIREMENTS['GB-ENG'][careHomeType];
  }

  public validateConsent(
    consent: ParentalConsent,
    region: Region,
    careHomeType: CareHomeType
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const requirements = this.getRequirements(region, careHomeType);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate consent type
    if (!requirements.allowedConsentTypes.includes(consent.consentType)) {
      errors.push(`Consent type ${consent.consentType} is not allowed in ${region} for ${careHomeType}`);
    }

    // Validate expiry
    if (requirements.maximumDuration > 0) {
      if (!consent.expiresAt) {
        errors.push('Expiry date is required');
      } else {
        const expiryDate = new Date(consent.expiresAt);
        const requestDate = new Date(consent.requestedAt);
        const durationDays = Math.floor((expiryDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (durationDays > requirements.maximumDuration) {
          errors.push(`Consent duration exceeds maximum allowed period of ${requirements.maximumDuration} days`);
        }
      }
    }

    // Validate witness requirement
    if (requirements.requiresWitness && !consent.verification?.verifiedBy) {
      errors.push('Witness verification is required');
    }

    // Validate healthcare plan
    if (requirements.requiresHealthcarePlan) {
      const hasHealthcarePlan = consent.history.some(
        h => h.action === 'HEALTHCARE_PLAN_APPROVED'
      );
      if (!hasHealthcarePlan) {
        errors.push('Healthcare plan approval is required');
      }
    }

    // Check additional documentation
    requirements.additionalDocumentation.forEach(doc => {
      const hasDoc = consent.history.some(h => h.action === `${doc}_APPROVED`);
      if (!hasDoc) {
        warnings.push(`Missing recommended documentation: ${doc}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public getExpiryNotificationDate(
    region: Region,
    careHomeType: CareHomeType,
    expiryDate: string
  ): Date {
    const requirements = this.getRequirements(region, careHomeType);
    const expiry = new Date(expiryDate);
    return new Date(expiry.getTime() - requirements.notificationPeriod * 24 * 60 * 60 * 1000);
  }

  public getRenewalDate(
    region: Region,
    careHomeType: CareHomeType,
    expiryDate: string
  ): Date {
    const requirements = this.getRequirements(region, careHomeType);
    const expiry = new Date(expiryDate);
    return new Date(expiry.getTime() - requirements.renewalPeriod * 24 * 60 * 60 * 1000);
  }

  public getRequiredDocumentation(
    region: Region,
    careHomeType: CareHomeType,
    consentType: ConsentType
  ): string[] {
    const requirements = this.getRequirements(region, careHomeType);
    return requirements.additionalDocumentation;
  }
}

export const regionalCompliance = new RegionalComplianceService();


