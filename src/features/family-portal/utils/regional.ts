/**
 * @fileoverview Regional Compliance Utilities
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Utilities for handling regional compliance requirements
 */

export const REGIONS = {
  UK_ENGLAND: 'UK_ENGLAND',
  UK_WALES: 'UK_WALES',
  UK_SCOTLAND: 'UK_SCOTLAND',
  UK_NORTHERN_IRELAND: 'UK_NORTHERN_IRELAND',
  IRELAND: 'IRELAND'
} as const;

export type Region = typeof REGIONS[keyof typeof REGIONS];

export const REGULATORY_BODIES = {
  [REGIONS.UK_ENGLAND]: 'CQC',
  [REGIONS.UK_WALES]: 'CIW',
  [REGIONS.UK_SCOTLAND]: 'Care Inspectorate',
  [REGIONS.UK_NORTHERN_IRELAND]: 'RQIA',
  [REGIONS.IRELAND]: 'HIQA'
} as const;

export const LANGUAGES = {
  [REGIONS.UK_ENGLAND]: ['en'],
  [REGIONS.UK_WALES]: ['en', 'cy'],
  [REGIONS.UK_SCOTLAND]: ['en', 'gd'],
  [REGIONS.UK_NORTHERN_IRELAND]: ['en', 'ga'],
  [REGIONS.IRELAND]: ['en', 'ga']
} as const;

export interface ComplianceRequirement {
  region: Region;
  category: string;
  requirements: string[];
  dataProtection: string[];
  retentionPeriod: number; // in months
  requiredConsent: string[];
}

export const COMPLIANCE_REQUIREMENTS: Record<Region, Record<string, ComplianceRequirement>> = {
  [REGIONS.UK_ENGLAND]: {
    medical: {
      region: REGIONS.UK_ENGLAND,
      category: 'medical',
      requirements: ['CQC_MEDICAL_RECORDS', 'NHS_GUIDELINES'],
      dataProtection: ['GDPR', 'UK_DPA_2018'],
      retentionPeriod: 96, // 8 years
      requiredConsent: ['PATIENT', 'NEXT_OF_KIN']
    },
    care: {
      region: REGIONS.UK_ENGLAND,
      category: 'care',
      requirements: ['CQC_CARE_STANDARDS'],
      dataProtection: ['GDPR', 'UK_DPA_2018'],
      retentionPeriod: 36, // 3 years
      requiredConsent: ['PATIENT']
    }
  },
  // Similar structures for other regions...
};

export function getRegionalRequirements(region: Region, category: string): ComplianceRequirement {
  const requirements = COMPLIANCE_REQUIREMENTS[region]?.[category];
  if (!requirements) {
    throw new Error(`No compliance requirements found for region ${region} and category ${category}`);
  }
  return requirements;
}

export function validateRegionalCompliance(
  data: any,
  region: Region,
  category: string
): { valid: boolean; issues?: string[] } {
  const requirements = getRegionalRequirements(region, category);
  const issues: string[] = [];

  // Check data protection requirements
  if (!data.dataProtectionNotice) {
    issues.push(`Missing data protection notice for ${requirements.dataProtection.join(', ')}`);
  }

  // Check consent requirements
  if (requirements.requiredConsent.some(consent => !data.consents?.[consent])) {
    issues.push(`Missing required consents: ${requirements.requiredConsent.join(', ')}`);
  }

  // Check retention period
  if (data.retentionPeriod < requirements.retentionPeriod) {
    issues.push(`Retention period must be at least ${requirements.retentionPeriod} months`);
  }

  return {
    valid: issues.length === 0,
    issues: issues.length > 0 ? issues : undefined
  };
}

export function getRegionalLanguages(region: Region): string[] {
  return LANGUAGES[region] || ['en'];
}

export function getRegulatorContact(region: Region): string {
  const regulators = {
    [REGIONS.UK_ENGLAND]: {
      name: 'Care Quality Commission',
      phone: '03000 616161',
      email: 'enquiries@cqc.org.uk'
    },
    [REGIONS.UK_WALES]: {
      name: 'Care Inspectorate Wales',
      phone: '0300 7900 126',
      email: 'CIW@gov.wales'
    },
    // Add other regulators...
  };

  return regulators[region]?.phone || '';
}

export function formatRegionalDate(date: Date, region: Region): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const locale = region === REGIONS.UK_WALES ? 'cy' : 'en-GB';
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function getRegionalPolicies(region: Region): string[] {
  const policies = {
    [REGIONS.UK_ENGLAND]: [
      'CQC Fundamental Standards',
      'Health and Social Care Act 2008',
      'Mental Capacity Act 2005'
    ],
    [REGIONS.UK_WALES]: [
      'Regulation and Inspection of Social Care Act 2016',
      'Social Services and Well-being Act 2014'
    ],
    // Add other regional policies...
  };

  return policies[region] || [];
}


