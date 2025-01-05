/**
 * @writecarenotes.com
 * @fileoverview NICE (National Institute for Health and Care Excellence) configuration
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Configuration settings for NICE integration, including API endpoints,
 * authentication, and guidance mapping settings.
 */

export class NICEConfig {
  // API Configuration
  readonly API_BASE_URL = process.env.NICE_API_BASE_URL || 'https://api.nice.org.uk/v1';
  readonly API_VERSION = 'v1';
  readonly API_TIMEOUT = 30000; // 30 seconds

  // Authentication
  readonly AUTH_TYPE = 'Bearer';
  readonly API_KEY = process.env.NICE_API_KEY;

  // Endpoints
  readonly ENDPOINTS = {
    GUIDANCE: '/guidance',
    PATHWAYS: '/pathways',
    EVIDENCE: '/evidence',
    RECOMMENDATIONS: '/recommendations',
    INDICATORS: '/indicators'
  };

  // Cache Settings
  readonly CACHE_SETTINGS = {
    GUIDANCE: 24 * 60 * 60 * 1000, // 24 hours
    PATHWAYS: 24 * 60 * 60 * 1000, // 24 hours
    EVIDENCE: 24 * 60 * 60 * 1000, // 24 hours
    RECOMMENDATIONS: 24 * 60 * 60 * 1000 // 24 hours
  };

  // Retry Settings
  readonly RETRY_SETTINGS = {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000, // 1 second
    MAX_DELAY: 5000, // 5 seconds
    BACKOFF_FACTOR: 2
  };

  // Rate Limiting
  readonly RATE_LIMIT = {
    REQUESTS_PER_MINUTE: 60,
    BURST_SIZE: 10
  };

  // Evidence Levels
  readonly EVIDENCE_LEVELS = {
    HIGH: 'HIGH',
    MODERATE: 'MODERATE',
    LOW: 'LOW',
    VERY_LOW: 'VERY_LOW'
  };

  // Recommendation Strengths
  readonly RECOMMENDATION_STRENGTHS = {
    STRONG: 'STRONG',
    MODERATE: 'MODERATE',
    CONDITIONAL: 'CONDITIONAL',
    WEAK: 'WEAK'
  };

  // Clinical Specialties
  readonly CLINICAL_SPECIALTIES = {
    ELDERLY_CARE: 'elderly-care',
    DEMENTIA: 'dementia',
    MENTAL_HEALTH: 'mental-health',
    FALLS_PREVENTION: 'falls-prevention',
    PAIN_MANAGEMENT: 'pain-management',
    END_OF_LIFE: 'end-of-life',
    DIABETES: 'diabetes',
    CARDIOVASCULAR: 'cardiovascular',
    RESPIRATORY: 'respiratory',
    INFECTION_CONTROL: 'infection-control',
    NUTRITION: 'nutrition',
    WOUND_CARE: 'wound-care',
    CONTINENCE: 'continence',
    BONE_HEALTH: 'bone-health',
    PARKINSONS: 'parkinsons'
  };

  // Care Home Specific Guidelines
  readonly CARE_HOME_GUIDELINES = {
    MEDICATION_MANAGEMENT: 'SC1',  // Safe Care Guideline 1
    COVERT_ADMINISTRATION: 'SC2',
    CONTROLLED_DRUGS: 'SC3',
    SELF_ADMINISTRATION: 'SC4',
    PRN_PROTOCOLS: 'SC5',
    HIGH_RISK_MEDICINES: 'SC6',
    MEDICATION_REVIEWS: 'SC7',
    ERROR_REPORTING: 'SC8',
    MEDICINE_STORAGE: 'SC9',
    END_OF_LIFE_MEDS: 'SC10'
  };

  // Guidance Types
  readonly GUIDANCE_TYPES = {
    CLINICAL_GUIDELINE: 'CG',
    TECHNOLOGY_APPRAISAL: 'TA',
    INTERVENTIONAL_PROCEDURES: 'IPG',
    MEDICAL_TECHNOLOGIES: 'MTG',
    QUALITY_STANDARDS: 'QS'
  };

  // Validation Settings
  readonly VALIDATION = {
    REQUIRED_FIELDS: {
      GUIDANCE: ['id', 'title', 'type', 'publishedDate', 'applicableTo'],
      RECOMMENDATION: ['id', 'text', 'strength', 'evidenceLevel', 'careHomeRelevance'],
      EVIDENCE: ['id', 'type', 'source', 'level', 'population'],
      PATHWAY: ['id', 'title', 'steps', 'careHomeConsiderations']
    },
    MAX_LENGTH: {
      TITLE: 200,
      DESCRIPTION: 2000,
      RECOMMENDATION: 1000,
      CARE_HOME_NOTES: 500
    }
  };

  // Care Home Specific Warnings
  readonly CARE_HOME_WARNINGS = {
    HIGH_RISK_MEDS: [
      'anticoagulants',
      'insulin',
      'opioids',
      'methotrexate',
      'lithium',
      'clozapine',
      'controlled drugs'
    ],
    SPECIAL_MONITORING: [
      'warfarin',
      'lithium',
      'digoxin',
      'aminoglycosides',
      'clozapine'
    ],
    CRUSHING_RESTRICTIONS: [
      'modified release',
      'enteric coated',
      'cytotoxic',
      'hormonal'
    ],
    COVERT_ADMIN_CHECKS: [
      'mental capacity',
      'best interest',
      'documentation',
      'pharmacy advice'
    ]
  };

  // Error Messages
  readonly ERROR_MESSAGES = {
    API_ERROR: 'Failed to connect to NICE API',
    VALIDATION_ERROR: 'Invalid care home guidance data',
    AUTHENTICATION_ERROR: 'Authentication failed',
    RATE_LIMIT_ERROR: 'Rate limit exceeded',
    NOT_FOUND: 'Care home guidance not found',
    PATHWAY_ERROR: 'Failed to retrieve care pathway',
    RECOMMENDATION_ERROR: 'Failed to get care home recommendations'
  };

  // Logging Settings
  readonly LOGGING = {
    ENABLED: true,
    LEVEL: 'info',
    INCLUDE_TIMESTAMPS: true,
    INCLUDE_REQUEST_ID: true
  };

  // Regional Guidelines
  readonly REGIONAL_GUIDELINES = {
    ENGLAND: {
      REGULATORY_BODY: 'CQC',
      GUIDELINES: {
        MEDICATION_MANAGEMENT: 'CQC Medicines Management',
        CONTROLLED_DRUGS: 'CQC Controlled Drugs',
        COVERT_ADMINISTRATION: 'CQC Hidden Medicines',
        SELF_ADMINISTRATION: 'CQC Self-Administration'
      },
      INSPECTION_FRAMEWORK: 'CQC Key Lines of Enquiry (KLOEs)',
      QUALITY_STANDARDS: 'CQC Fundamental Standards',
      OFSTED_REQUIREMENTS: {
        MEDICATION_POLICY: 'Children\'s Homes Regulations 2015',
        STAFF_TRAINING: 'Regulation 32',
        RECORD_KEEPING: 'Regulation 34'
      }
    },
    WALES: {
      REGULATORY_BODY: 'CIW',
      GUIDELINES: {
        MEDICATION_MANAGEMENT: 'CIW Medicines Management',
        CONTROLLED_DRUGS: 'CIW Controlled Drugs',
        COVERT_ADMINISTRATION: 'CIW Covert Administration',
        SELF_ADMINISTRATION: 'CIW Self-Administration'
      },
      INSPECTION_FRAMEWORK: 'CIW Quality Framework',
      QUALITY_STANDARDS: 'Statutory Guidance for Service Providers',
      LANGUAGE_REQUIREMENTS: {
        DOCUMENTATION: 'Welsh Language Standards',
        COMMUNICATION: 'Active Offer'
      }
    },
    SCOTLAND: {
      REGULATORY_BODY: 'Care Inspectorate',
      GUIDELINES: {
        MEDICATION_MANAGEMENT: 'Care Inspectorate Medicines Management',
        CONTROLLED_DRUGS: 'Care Inspectorate Controlled Drugs',
        COVERT_ADMINISTRATION: 'Care Inspectorate Covert Medication',
        SELF_ADMINISTRATION: 'Care Inspectorate Self-Administration'
      },
      INSPECTION_FRAMEWORK: 'Health and Social Care Standards',
      QUALITY_STANDARDS: 'National Care Standards',
      LEGISLATION: {
        ADULTS_WITH_INCAPACITY: 'AWI Act 2000',
        SECTION_47: 'Section 47 Certificate Requirements'
      }
    },
    IRELAND: {
      REGULATORY_BODY: 'HIQA',
      GUIDELINES: {
        MEDICATION_MANAGEMENT: 'HIQA Medicines Management',
        CONTROLLED_DRUGS: 'HIQA Controlled Drugs',
        COVERT_ADMINISTRATION: 'HIQA Covert Administration',
        SELF_ADMINISTRATION: 'HIQA Self-Administration'
      },
      INSPECTION_FRAMEWORK: 'National Standards for Residential Care Settings',
      QUALITY_STANDARDS: 'National Quality Standards Framework',
      LANGUAGE_REQUIREMENTS: {
        DOCUMENTATION: 'Official Languages Act',
        COMMUNICATION: 'Irish Language Provision'
      }
    },
    NORTHERN_IRELAND: {
      REGULATORY_BODY: 'RQIA',
      GUIDELINES: {
        MEDICATION_MANAGEMENT: 'RQIA Medicines Management',
        CONTROLLED_DRUGS: 'RQIA Controlled Drugs',
        COVERT_ADMINISTRATION: 'RQIA Covert Administration',
        SELF_ADMINISTRATION: 'RQIA Self-Administration'
      },
      INSPECTION_FRAMEWORK: 'RQIA Provider Guidance',
      QUALITY_STANDARDS: 'Care Standards for Nursing Homes',
      LANGUAGE_REQUIREMENTS: {
        DOCUMENTATION: 'Irish Language Provision',
        COMMUNICATION: 'Language Support'
      }
    }
  };

  // Regional Care Standards
  readonly REGIONAL_CARE_STANDARDS = {
    ENGLAND: {
      FUNDAMENTAL_STANDARDS: [
        'Safe Care and Treatment',
        'Person-Centered Care',
        'Dignity and Respect',
        'Consent',
        'Safeguarding'
      ],
      MEDICATION_STANDARDS: [
        'Regulation 12: Safe Care and Treatment',
        'Regulation 17: Good Governance'
      ]
    },
    WALES: {
      FUNDAMENTAL_STANDARDS: [
        'Personal Plan',
        'Health and Safety',
        'Safeguarding',
        'Environment',
        'Leadership'
      ],
      MEDICATION_STANDARDS: [
        'Regulation 58: Medicines',
        'Regulation 59: Storage of Medicines',
        'Regulation 60: Controlled Drugs'
      ]
    },
    SCOTLAND: {
      FUNDAMENTAL_STANDARDS: [
        'Dignity and Respect',
        'Compassion',
        'Be Included',
        'Responsive Care',
        'Wellbeing'
      ],
      MEDICATION_STANDARDS: [
        'Standard 4.17: Medication Management',
        'Standard 4.18: Medication Storage',
        'Standard 4.19: Medication Administration'
      ]
    },
    IRELAND: {
      FUNDAMENTAL_STANDARDS: [
        'Person-Centered Care',
        'Effective Services',
        'Safe Services',
        'Health and Wellbeing',
        'Leadership'
      ],
      MEDICATION_STANDARDS: [
        'Standard 4.3: Medication Management',
        'Standard 4.4: Medication Safety',
        'Regulation 29: Medicines and Pharmaceutical Services'
      ]
    },
    NORTHERN_IRELAND: {
      FUNDAMENTAL_STANDARDS: [
        'Safe and Effective Care',
        'Person-Centered Care',
        'Leadership',
        'Environment',
        'Care Records'
      ],
      MEDICATION_STANDARDS: [
        'Standard 28: Medicines Management',
        'Standard 29: Medicines Storage',
        'Standard 30: Medicines Administration'
      ]
    }
  };

  // Regional Inspection Requirements
  readonly REGIONAL_INSPECTION = {
    ENGLAND: {
      MEDICATION_RECORDS: ['MAR Charts', 'Care Plans', 'Risk Assessments', 'Audits'],
      STAFF_REQUIREMENTS: ['Training Records', 'Competency Assessments'],
      KEY_LINES_OF_ENQUIRY: ['Safe', 'Effective', 'Caring', 'Responsive', 'Well-Led']
    },
    WALES: {
      MEDICATION_RECORDS: ['MAR Charts', 'Care Plans', 'Risk Assessments', 'Audits'],
      STAFF_REQUIREMENTS: ['Training Records', 'Competency Assessments'],
      QUALITY_FRAMEWORK: ['Care and Support', 'Environment', 'Leadership', 'Management']
    },
    SCOTLAND: {
      MEDICATION_RECORDS: ['MAR Charts', 'Care Plans', 'AWI Documentation', 'Audits'],
      STAFF_REQUIREMENTS: ['Training Records', 'Competency Assessments'],
      QUALITY_THEMES: ['Care and Support', 'Environment', 'Staffing', 'Management']
    },
    IRELAND: {
      MEDICATION_RECORDS: ['MAR Charts', 'Care Plans', 'Risk Assessments', 'Audits'],
      STAFF_REQUIREMENTS: ['Training Records', 'Competency Assessments'],
      QUALITY_FRAMEWORK: ['Capacity and Capability', 'Quality and Safety']
    },
    NORTHERN_IRELAND: {
      MEDICATION_RECORDS: ['MAR Charts', 'Care Plans', 'Risk Assessments', 'Audits'],
      STAFF_REQUIREMENTS: ['Training Records', 'Competency Assessments'],
      DOMAINS: ['Is Care Safe?', 'Is Care Effective?', 'Is Care Compassionate?', 'Is Service Well Led?']
    }
  };

  constructor() {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.API_KEY) {
      console.warn('NICE API key not configured');
    }

    if (!this.API_BASE_URL) {
      throw new Error('NICE API base URL not configured');
    }
  }

  getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `${this.AUTH_TYPE} ${this.API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  getEndpointUrl(endpoint: string): string {
    return `${this.API_BASE_URL}${endpoint}`;
  }

  getRetryDelay(attempt: number): number {
    const delay = this.RETRY_SETTINGS.INITIAL_DELAY *
      Math.pow(this.RETRY_SETTINGS.BACKOFF_FACTOR, attempt);
    return Math.min(delay, this.RETRY_SETTINGS.MAX_DELAY);
  }

  validateGuidance(data: any): boolean {
    const requiredFields = this.VALIDATION.REQUIRED_FIELDS.GUIDANCE;
    return requiredFields.every(field => 
      data.hasOwnProperty(field) && 
      data[field] !== null && 
      data[field] !== undefined
    );
  }

  validateRecommendation(data: any): boolean {
    const requiredFields = this.VALIDATION.REQUIRED_FIELDS.RECOMMENDATION;
    return requiredFields.every(field => 
      data.hasOwnProperty(field) && 
      data[field] !== null && 
      data[field] !== undefined
    );
  }

  getGuidanceType(id: string): string {
    const prefix = id.split(/[0-9]/)[0].toUpperCase();
    return this.GUIDANCE_TYPES[prefix] || 'UNKNOWN';
  }

  getSpecialty(guidance: any): string {
    for (const [specialty, keyword] of Object.entries(this.CLINICAL_SPECIALTIES)) {
      if (guidance.title.toLowerCase().includes(keyword) ||
          guidance.description.toLowerCase().includes(keyword)) {
        return specialty;
      }
    }
    return 'OTHER';
  }

  isHighQualityEvidence(evidenceLevel: string): boolean {
    return evidenceLevel === this.EVIDENCE_LEVELS.HIGH ||
           evidenceLevel === this.EVIDENCE_LEVELS.MODERATE;
  }

  isStrongRecommendation(strength: string): boolean {
    return strength === this.RECOMMENDATION_STRENGTHS.STRONG ||
           strength === this.RECOMMENDATION_STRENGTHS.MODERATE;
  }
} 