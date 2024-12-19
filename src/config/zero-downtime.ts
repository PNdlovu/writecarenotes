import { API_VERSIONS, type ApiVersion } from './api-versions';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  regions: string[];
}

export const REGIONS = {
  ENGLAND: 'england',
  WALES: 'wales',
  SCOTLAND: 'scotland',
  NORTHERN_IRELAND: 'northern-ireland',
  IRELAND: 'ireland',
} as const;

export type Region = typeof REGIONS[keyof typeof REGIONS];

export interface MigrationStep {
  id: string;
  description: string;
  version: ApiVersion;
  regions: Region[];
  requiresDataMigration: boolean;
  dataValidator?: () => Promise<boolean>;
}

export const MIGRATION_STEPS: MigrationStep[] = [
  {
    id: 'v1-to-v2-resident-schema',
    description: 'Update resident schema with enhanced care needs tracking',
    version: API_VERSIONS.V2,
    regions: [REGIONS.ENGLAND, REGIONS.WALES],
    requiresDataMigration: true,
  },
  {
    id: 'v2-compliance-tracking',
    description: 'Add regional compliance tracking for different care standards',
    version: API_VERSIONS.V2,
    regions: Object.values(REGIONS),
    requiresDataMigration: false,
  },
];

export const FEATURE_FLAGS: FeatureFlag[] = [
  {
    name: 'enhanced-care-needs',
    enabled: true,
    rolloutPercentage: 100,
    regions: [REGIONS.ENGLAND, REGIONS.WALES],
  },
  {
    name: 'regional-compliance',
    enabled: true,
    rolloutPercentage: 50,
    regions: Object.values(REGIONS),
  },
];

export interface RegionalConfig {
  region: Region;
  regulatoryBody: string;
  complianceStandards: string[];
  terminology: {
    resident: string;
    careHome: string;
    staff: string;
  };
}

export const REGIONAL_CONFIGS: Record<Region, RegionalConfig> = {
  [REGIONS.ENGLAND]: {
    region: REGIONS.ENGLAND,
    regulatoryBody: 'CQC',
    complianceStandards: ['CQC Care Standards', 'Health and Social Care Act'],
    terminology: {
      resident: 'Resident',
      careHome: 'Care Home',
      staff: 'Care Staff',
    },
  },
  [REGIONS.WALES]: {
    region: REGIONS.WALES,
    regulatoryBody: 'CIW',
    complianceStandards: ['Regulation and Inspection of Social Care Act'],
    terminology: {
      resident: 'Resident',
      careHome: 'Care Home',
      staff: 'Care Staff',
    },
  },
  [REGIONS.SCOTLAND]: {
    region: REGIONS.SCOTLAND,
    regulatoryBody: 'Care Inspectorate',
    complianceStandards: ['National Care Standards'],
    terminology: {
      resident: 'Resident',
      careHome: 'Care Home',
      staff: 'Care Staff',
    },
  },
  [REGIONS.NORTHERN_IRELAND]: {
    region: REGIONS.NORTHERN_IRELAND,
    regulatoryBody: 'RQIA',
    complianceStandards: ['Care Standards for Nursing Homes'],
    terminology: {
      resident: 'Resident',
      careHome: 'Care Home',
      staff: 'Care Staff',
    },
  },
  [REGIONS.IRELAND]: {
    region: REGIONS.IRELAND,
    regulatoryBody: 'HIQA',
    complianceStandards: ['National Standards for Residential Care Settings'],
    terminology: {
      resident: 'Resident',
      careHome: 'Care Home',
      staff: 'Care Staff',
    },
  },
};


