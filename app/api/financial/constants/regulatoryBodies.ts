/**
 * @fileoverview Regulatory Bodies Constants
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Constants for regulatory bodies and their requirements
 */

export type ServiceType = 
  | 'CARE_HOME' 
  | 'NURSING_HOME' 
  | 'DOMICILIARY' 
  | 'CHILDRENS_HOME' 
  | 'FOSTERING' 
  | 'ADOPTION';

export type Region = 'ENGLAND' | 'WALES' | 'SCOTLAND' | 'NORTHERN_IRELAND' | 'IRELAND';

export type RegulatoryBody = 
  | 'CQC' 
  | 'OFSTED' 
  | 'CIW' 
  | 'CI' 
  | 'RQIA' 
  | 'HIQA';

interface RegulatoryBodyConfig {
  name: string;
  code: RegulatoryBody;
  applicableServices: ServiceType[] | ['ALL'];
  region: Region;
  financialRequirements: {
    reportingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    requiresAudit: boolean;
    retentionPeriod: number; // in years
  };
}

export const REGULATORY_BODIES: Record<Region, Record<RegulatoryBody, RegulatoryBodyConfig>> = {
  ENGLAND: {
    CQC: {
      name: 'Care Quality Commission',
      code: 'CQC',
      region: 'ENGLAND',
      applicableServices: ['CARE_HOME', 'NURSING_HOME', 'DOMICILIARY'],
      financialRequirements: {
        reportingFrequency: 'MONTHLY',
        requiresAudit: true,
        retentionPeriod: 7
      }
    },
    OFSTED: {
      name: 'Office for Standards in Education',
      code: 'OFSTED',
      region: 'ENGLAND',
      applicableServices: ['CHILDRENS_HOME', 'FOSTERING', 'ADOPTION'],
      financialRequirements: {
        reportingFrequency: 'QUARTERLY',
        requiresAudit: true,
        retentionPeriod: 7
      }
    }
  },
  WALES: {
    CIW: {
      name: 'Care Inspectorate Wales',
      code: 'CIW',
      region: 'WALES',
      applicableServices: ['ALL'],
      financialRequirements: {
        reportingFrequency: 'QUARTERLY',
        requiresAudit: true,
        retentionPeriod: 7
      }
    }
  },
  SCOTLAND: {
    CI: {
      name: 'Care Inspectorate',
      code: 'CI',
      region: 'SCOTLAND',
      applicableServices: ['ALL'],
      financialRequirements: {
        reportingFrequency: 'QUARTERLY',
        requiresAudit: true,
        retentionPeriod: 7
      }
    }
  },
  NORTHERN_IRELAND: {
    RQIA: {
      name: 'Regulation and Quality Improvement Authority',
      code: 'RQIA',
      region: 'NORTHERN_IRELAND',
      applicableServices: ['ALL'],
      financialRequirements: {
        reportingFrequency: 'QUARTERLY',
        requiresAudit: true,
        retentionPeriod: 7
      }
    }
  },
  IRELAND: {
    HIQA: {
      name: 'Health Information and Quality Authority',
      code: 'HIQA',
      region: 'IRELAND',
      applicableServices: ['ALL'],
      financialRequirements: {
        reportingFrequency: 'QUARTERLY',
        requiresAudit: true,
        retentionPeriod: 7
      }
    }
  }
}; 
