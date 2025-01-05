/**
 * Region Types and Interfaces for UK and Ireland Care Home Management
 */

export enum UKRegion {
  // England Regions
  NORTH_EAST = 'north_east',
  NORTH_WEST = 'north_west',
  YORKSHIRE_AND_HUMBER = 'yorkshire_and_humber',
  EAST_MIDLANDS = 'east_midlands',
  WEST_MIDLANDS = 'west_midlands',
  EAST_OF_ENGLAND = 'east_of_england',
  LONDON = 'london',
  SOUTH_EAST = 'south_east',
  SOUTH_WEST = 'south_west',
  
  // Wales Regions
  NORTH_WALES = 'north_wales',
  MID_WALES = 'mid_wales',
  SOUTH_WALES = 'south_wales',
  WEST_WALES = 'west_wales',
  
  // Scotland Regions
  HIGHLANDS_AND_ISLANDS = 'highlands_and_islands',
  GRAMPIAN = 'grampian',
  TAYSIDE = 'tayside',
  FIFE = 'fife',
  LOTHIAN = 'lothian',
  BORDERS = 'borders',
  CENTRAL = 'central',
  STRATHCLYDE = 'strathclyde',
  DUMFRIES_AND_GALLOWAY = 'dumfries_and_galloway',
  
  // Northern Ireland (Belfast) Regions
  ANTRIM = 'antrim',
  ARMAGH = 'armagh',
  DOWN = 'down',
  FERMANAGH = 'fermanagh',
  LONDONDERRY = 'londonderry',
  TYRONE = 'tyrone',

  // Ireland (Dublin) Regions
  DUBLIN_NORTH = 'dublin_north',
  DUBLIN_SOUTH = 'dublin_south',
  DUBLIN_CITY = 'dublin_city'
}

export interface RegionalAuthority {
  id: string;
  name: string;
  type: 'local_authority' | 'health_board' | 'trust' | 'council';
  region: UKRegion;
  jurisdiction: string[];
  contactDetails: {
    address: string;
    phone: string;
    email: string;
    website: string;
    emergencyContact: string;
  };
  operatingHours: {
    weekday: string;
    weekend: string;
    holidays: string;
  };
}

export interface RegionalRequirements {
  legislation: string[];
  policies: string[];
  guidelines: string[];
  reportingRequirements: string[];
  inspectionFrequency: 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL';
  minimumStaffingRatios: {
    nurses: number;
    careAssistants: number;
    specialists: number;
  };
  mandatoryTraining: string[];
  facilityStandards: string[];
  dataProtectionRequirements: string[];
  qualityStandards: string[];
}

export interface RegionalFunding {
  fundingBodies: string[];
  fundingRates: Record<string, number>;
  eligibilityCriteria: string[];
  applicationProcess: string;
  paymentTerms: {
    frequency: string;
    method: string;
    requirements: string[];
  };
  subsidies: {
    type: string;
    amount: number;
    criteria: string[];
  }[];
}

export interface RegionalResources {
  emergencyContacts: Record<string, string>;
  supportServices: string[];
  trainingProviders: string[];
  specialistServices: string[];
  localHealthServices: {
    hospitals: string[];
    clinics: string[];
    specialists: string[];
  };
  communityResources: string[];
}

export interface RegionalCompliance {
  regulatoryBody: string;
  standards: string[];
  requiredCertifications: string[];
  reportingSchedule: string;
  lastInspection?: Date;
  nextInspection?: Date;
  currentRating?: string;
  improvementPlans?: string[];
  complianceHistory?: {
    date: Date;
    type: string;
    outcome: string;
    actions: string[];
  }[];
  gdprCompliance: {
    dataOfficer: string;
    policies: string[];
    lastAudit: Date;
    nextAudit: Date;
  };
}

export interface Region {
  id: string;
  name: string;
  code: UKRegion;
  type: 'country' | 'region' | 'county' | 'district';
  authorities: RegionalAuthority[];
  requirements: RegionalRequirements;
  funding: RegionalFunding;
  resources: RegionalResources;
  compliance: RegionalCompliance;
  demographics: {
    population: number;
    elderlyPopulation: number;
    careHomeCapacity: number;
    waitingListSize: number;
    specializedCareNeeds: Record<string, number>;
  };
  statistics: {
    averageOccupancy: number;
    averageFees: number;
    qualityRatings: Record<string, number>;
    staffingLevels: Record<string, number>;
    incidentReports: {
      total: number;
      byType: Record<string, number>;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
  };
  language: {
    primary: string;
    supported: string[];
    translationRequirements: boolean;
    interpreterServices: string[];
  };
  timeZone: string;
  currency: string;
  localRegulations: string[];
  emergencyProtocols: {
    procedures: string[];
    contacts: string[];
    resources: string[];
  };
}
