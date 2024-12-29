export type Region = 'EN' | 'WL' | 'SC' | 'NI' | 'IE';

export type RegulatoryBody = 'CQC' | 'CIW' | 'CARE_INSPECTORATE' | 'RQIA' | 'HIQA' | 'OFSTED';

export type CareHomeType = 
  // Elderly Care Services
  | 'ELDERLY_RESIDENTIAL'
  | 'ELDERLY_NURSING'
  | 'ELDERLY_DEMENTIA'
  | 'ELDERLY_RESPITE'
  | 'ELDERLY_DAY_CARE'
  | 'ELDERLY_PALLIATIVE'
  | 'ELDERLY_COMPLEX_NEEDS'
  
  // Children's Services
  | 'CHILDRENS_HOME'
  | 'CHILDRENS_RESIDENTIAL_SCHOOL'
  | 'CHILDRENS_SECURE_UNIT'
  | 'CHILDRENS_SHORT_BREAKS'
  | 'CHILDRENS_EMERGENCY'
  | 'CHILDRENS_THERAPEUTIC'
  | 'CHILDRENS_COMPLEX_NEEDS'
  | 'CHILDRENS_TRANSITIONAL'
  
  // Specialist Care Services
  | 'LEARNING_DISABILITIES'
  | 'PHYSICAL_DISABILITIES'
  | 'MENTAL_HEALTH'
  | 'AUTISM_SUPPORT'
  | 'BRAIN_INJURY'
  | 'SUBSTANCE_MISUSE'
  | 'EATING_DISORDERS'
  | 'GENDER_IDENTITY'
  | 'CULTURAL_SPECIFIC'
  | 'FORENSIC_MENTAL_HEALTH'
  
  // Modern Care Types
  | 'SUPPORTED_LIVING'
  | 'EXTRA_CARE_HOUSING'
  | 'SHELTERED_HOUSING'
  | 'DOMICILIARY_CARE'
  | 'SHARED_LIVES'
  | 'REHABILITATION_CENTER'
  | 'TELECARE_SERVICES'
  | 'REMOTE_MONITORING'
  | 'HYBRID_CARE'
  | 'SMART_HOME_CARE';

export interface DigitalHealthIntegration {
  nhsSpineConnection?: boolean;
  ehealthRecords?: boolean;
  eprescribing?: boolean;
  telemedicine?: boolean;
  remoteMonitoring?: boolean;
  aiAssistance?: boolean;
}

export interface ModernCareRequirements {
  digitalSkills: boolean;
  telehealth: boolean;
  remoteWorking: boolean;
  dataProtection: boolean;
  cyberSecurity: boolean;
}

export interface TenantContext {
  tenantId: string;
  region: Region;
  regulatoryBody: RegulatoryBody;
  organizationId: string;
  careHomeType: CareHomeType;
  registrationNumber: string;
  registeredBeds?: number;
  specialistServices?: string[];
  digitalIntegration?: DigitalHealthIntegration;
  modernRequirements?: ModernCareRequirements;
  sustainabilityMeasures?: boolean;
  infectionControlLevel?: 'standard' | 'enhanced' | 'specialist';
  covidStatus?: {
    vaccinationRequired: boolean;
    testingProtocol: string;
    isolationFacilities: boolean;
  };
}

export interface AccessSettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: boolean;
  textToSpeech: boolean;
  language: string;
}

export interface AccessContextType {
  settings: AccessSettings;
  tenant: TenantContext;
  updateSettings: (settings: Partial<AccessSettings>) => void;
  resetSettings: () => void;
  hasAccess: (resource: string, action: string) => boolean;
  checkPermission: (permission: string) => boolean;
}

export const DEFAULT_SETTINGS: AccessSettings = {
  highContrast: false,
  fontSize: 'medium',
  reduceMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  colorBlindMode: false,
  textToSpeech: false,
  language: 'en'
};

export const REGULATORY_REQUIREMENTS = {
  CQC: {
    requiredRoles: ['registered-manager', 'deputy-manager', 'senior-carer', 'carer', 'nurse'],
    auditFrequency: 'daily',
    dataRetention: '6-years',
    applicableTypes: [
      'ELDERLY_RESIDENTIAL', 'ELDERLY_NURSING', 'ELDERLY_DEMENTIA', 'ELDERLY_RESPITE',
      'LEARNING_DISABILITIES', 'PHYSICAL_DISABILITIES', 'MENTAL_HEALTH', 'AUTISM_SUPPORT',
      'SUPPORTED_LIVING', 'EXTRA_CARE_HOUSING', 'DOMICILIARY_CARE', 'REHABILITATION_CENTER'
    ],
    staffingRequirements: {
      nursingHomes: {
        registeredNurse: '24/7',
        minimumStaffRatio: '1:8'
      },
      residentialHomes: {
        minimumStaffRatio: '1:6'
      }
    }
  },
  CIW: {
    requiredRoles: ['responsible-individual', 'registered-manager', 'senior-care-worker', 'care-worker'],
    auditFrequency: 'daily',
    dataRetention: '5-years',
    applicableTypes: [
      'ELDERLY_RESIDENTIAL', 'ELDERLY_NURSING', 'ELDERLY_DEMENTIA',
      'LEARNING_DISABILITIES', 'PHYSICAL_DISABILITIES', 'MENTAL_HEALTH',
      'SUPPORTED_LIVING', 'DOMICILIARY_CARE'
    ],
    welshLanguageRequirements: true
  },
  CARE_INSPECTORATE: {
    requiredRoles: ['service-manager', 'deputy-manager', 'senior-practitioner', 'care-staff'],
    auditFrequency: 'daily',
    dataRetention: '5-years',
    applicableTypes: [
      'ELDERLY_RESIDENTIAL', 'ELDERLY_NURSING', 'ELDERLY_DEMENTIA',
      'LEARNING_DISABILITIES', 'PHYSICAL_DISABILITIES', 'MENTAL_HEALTH',
      'SUPPORTED_LIVING', 'SHELTERED_HOUSING', 'REHABILITATION_CENTER'
    ],
    scottishQualifications: true
  },
  RQIA: {
    requiredRoles: ['registered-manager', 'deputy-manager', 'senior-care-assistant', 'care-assistant'],
    auditFrequency: 'daily',
    dataRetention: '8-years',
    applicableTypes: [
      'ELDERLY_RESIDENTIAL', 'ELDERLY_NURSING', 'ELDERLY_DEMENTIA',
      'LEARNING_DISABILITIES', 'PHYSICAL_DISABILITIES', 'MENTAL_HEALTH',
      'SUPPORTED_LIVING', 'DOMICILIARY_CARE'
    ],
    northernIrelandRequirements: true
  },
  HIQA: {
    requiredRoles: ['person-in-charge', 'clinical-nurse-manager', 'staff-nurse', 'healthcare-assistant'],
    auditFrequency: 'daily',
    dataRetention: '6-years',
    applicableTypes: [
      'ELDERLY_RESIDENTIAL', 'ELDERLY_NURSING', 'ELDERLY_DEMENTIA',
      'LEARNING_DISABILITIES', 'PHYSICAL_DISABILITIES', 'MENTAL_HEALTH',
      'REHABILITATION_CENTER'
    ],
    irishLanguageSupport: true
  },
  OFSTED: {
    requiredRoles: [
      'registered-manager',
      'deputy-manager',
      'childrens-social-worker',
      'residential-childcare-worker',
      'team-leader',
      'therapeutic-worker'
    ],
    auditFrequency: 'daily',
    dataRetention: '75-years',
    applicableTypes: [
      'CHILDRENS_HOME',
      'CHILDRENS_RESIDENTIAL_SCHOOL',
      'CHILDRENS_SECURE_UNIT',
      'CHILDRENS_SHORT_BREAKS',
      'CHILDRENS_EMERGENCY',
      'CHILDRENS_THERAPEUTIC'
    ],
    additionalRequirements: {
      dbs: 'enhanced',
      safeguarding: 'level-3',
      qualifications: [
        'Level 5 Diploma in Leadership and Management for Residential Childcare',
        'Level 3 Diploma for Residential Childcare',
        'Social Work Degree'
      ],
      staffRatios: {
        day: '1:3',
        night: '1:5',
        secureUnit: '1:2',
        emergencyPlacement: '1:1'
      },
      mandatoryTraining: [
        'safeguarding',
        'behavior-management',
        'first-aid',
        'mental-health',
        'child-development',
        'trauma-informed-care',
        'therapeutic-crisis-intervention'
      ],
      specialistRequirements: {
        secureUnit: ['restraint-training', 'security-protocols'],
        therapeutic: ['therapeutic-qualifications', 'clinical-supervision']
      }
    }
  },
  MODERN_REQUIREMENTS: {
    digitalHealth: {
      mandatoryTraining: [
        'data-protection',
        'cyber-security',
        'digital-record-keeping',
        'telehealth-systems',
        'remote-monitoring'
      ],
      requiredIntegrations: [
        'ehealth-records',
        'eprescribing',
        'remote-monitoring'
      ],
      staffingRequirements: {
        digitalCareCoordinator: true,
        itSupport: '24/7',
        dataProtectionOfficer: true
      }
    },
    infectionControl: {
      covidProtocols: true,
      isolationFacilities: true,
      ppe: 'enhanced',
      airFiltration: true,
      visitationTechnology: true
    },
    sustainability: {
      energyEfficiency: true,
      wasteManagement: true,
      sustainablePractices: true,
      carbonReduction: true
    },
    culturalCompetency: {
      training: true,
      translationServices: true,
      culturalDietaryProvision: true,
      religiousAccommodation: true
    }
  }
}; 