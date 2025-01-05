import { z } from 'zod';

// Regional regulatory bodies and their requirements
export const regulatoryBodies = {
  england: {
    name: 'Care Quality Commission (CQC)',
    requirements: [
      'medication_tracking',
      'staff_qualifications',
      'care_plans',
      'incident_reporting',
      'resident_feedback',
    ],
  },
  wales: {
    name: 'Care Inspectorate Wales (CIW)',
    requirements: [
      'welsh_language_support',
      'medication_tracking',
      'staff_qualifications',
      'care_plans',
    ],
  },
  scotland: {
    name: 'Care Inspectorate Scotland',
    requirements: [
      'health_social_care_standards',
      'medication_tracking',
      'staff_qualifications',
    ],
  },
  ireland: {
    name: 'Health Information and Quality Authority (HIQA)',
    requirements: [
      'national_standards',
      'medication_tracking',
      'staff_qualifications',
      'resident_rights',
    ],
  },
  northernIreland: {
    name: 'Regulation and Quality Improvement Authority (RQIA)',
    requirements: [
      'care_standards',
      'medication_tracking',
      'staff_qualifications',
      'resident_safety',
    ],
  },
} as const;

// Validation schemas for different regions
const baseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().min(1),
  phoneNumber: z.string().regex(/^\+?[\d\s-()]+$/),
  email: z.string().email(),
  registrationNumber: z.string(),
});

export const regionalSchemas = {
  england: baseSchema.extend({
    cqcRegistration: z.string().regex(/^[0-9]{7}$/),
    lastInspection: z.date(),
    rating: z.enum(['Outstanding', 'Good', 'Requires Improvement', 'Inadequate']),
  }),
  wales: baseSchema.extend({
    ciwRegistration: z.string().regex(/^[A-Z]{3}[0-9]{4}$/),
    welshLanguageProvision: z.boolean(),
  }),
  scotland: baseSchema.extend({
    careInspectorateNumber: z.string().regex(/^CS[0-9]{10}$/),
    grading: z.number().min(1).max(6),
  }),
  ireland: baseSchema.extend({
    hiqaRegistration: z.string().regex(/^[0-9]{4}$/),
    lastInspection: z.date(),
  }),
  northernIreland: baseSchema.extend({
    rqiaRegistration: z.string().regex(/^[0-9]{5}$/),
    lastInspection: z.date(),
  }),
};

export class RegionalComplianceValidator {
  private region: keyof typeof regulatoryBodies;

  constructor(region: keyof typeof regulatoryBodies) {
    this.region = region;
  }

  /**
   * Validates facility data against regional requirements
   */
  async validateFacility(data: any) {
    const schema = regionalSchemas[this.region];
    const result = await schema.safeParseAsync(data);

    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors,
        requirements: this.getMissingRequirements(data),
      };
    }

    return {
      valid: true,
      data: result.data,
      requirements: this.getMissingRequirements(data),
    };
  }

  /**
   * Checks which regional requirements are missing
   */
  private getMissingRequirements(data: any) {
    const requirements = regulatoryBodies[this.region].requirements;
    const missing = requirements.filter(req => !this.checkRequirement(req, data));

    return {
      total: requirements.length,
      missing,
      compliance: ((requirements.length - missing.length) / requirements.length) * 100,
    };
  }

  /**
   * Checks if a specific requirement is met
   */
  private checkRequirement(requirement: string, data: any): boolean {
    switch (requirement) {
      case 'medication_tracking':
        return !!data.medicationTrackingSystem;
      case 'staff_qualifications':
        return Array.isArray(data.staffQualifications) && data.staffQualifications.length > 0;
      case 'care_plans':
        return !!data.carePlanSystem;
      case 'incident_reporting':
        return !!data.incidentReportingSystem;
      case 'resident_feedback':
        return !!data.residentFeedbackSystem;
      case 'welsh_language_support':
        return !!data.welshLanguageProvision;
      case 'health_social_care_standards':
        return !!data.healthSocialCareStandards;
      case 'national_standards':
        return !!data.nationalStandards;
      case 'resident_rights':
        return !!data.residentRightsPolicy;
      case 'resident_safety':
        return !!data.residentSafetySystem;
      default:
        return false;
    }
  }

  /**
   * Generates compliance report
   */
  async generateComplianceReport(data: any) {
    const validation = await this.validateFacility(data);
    const regulatory = regulatoryBodies[this.region];

    return {
      facility: data.name,
      timestamp: new Date().toISOString(),
      regulatoryBody: regulatory.name,
      validation,
      recommendations: this.generateRecommendations(validation),
    };
  }

  /**
   * Generates recommendations based on validation results
   */
  private generateRecommendations(validation: any) {
    if (validation.valid && validation.requirements.compliance === 100) {
      return ['Maintain current compliance standards'];
    }

    return validation.requirements.missing.map((req: string) => {
      switch (req) {
        case 'medication_tracking':
          return 'Implement a medication tracking system';
        case 'staff_qualifications':
          return 'Update staff qualification records';
        case 'care_plans':
          return 'Implement digital care plan system';
        case 'incident_reporting':
          return 'Set up incident reporting system';
        case 'resident_feedback':
          return 'Establish resident feedback mechanism';
        case 'welsh_language_support':
          return 'Provide Welsh language support';
        case 'health_social_care_standards':
          return 'Align with Health and Social Care Standards';
        case 'national_standards':
          return 'Comply with National Standards';
        case 'resident_rights':
          return 'Implement resident rights policy';
        case 'resident_safety':
          return 'Enhance resident safety system';
        default:
          return `Address ${req} requirement`;
      }
    });
  }
}


