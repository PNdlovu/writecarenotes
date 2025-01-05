/**
 * @writecarenotes.com
 * @fileoverview BNF (British National Formulary) configuration
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Configuration settings for BNF integration, including API endpoints,
 * authentication, and data mapping settings.
 */

export class BNFConfig {
  // API Configuration
  readonly API_BASE_URL = process.env.BNF_API_BASE_URL || 'https://api.bnf.nice.org.uk/v1';
  readonly API_VERSION = 'v1';
  readonly API_TIMEOUT = 30000; // 30 seconds

  // Authentication
  readonly AUTH_TYPE = 'Bearer';
  readonly API_KEY = process.env.BNF_API_KEY;

  // Endpoints
  readonly ENDPOINTS = {
    DRUG_INFO: '/drugs',
    INTERACTIONS: '/interactions',
    ALLERGIES: '/allergies',
    CONTRAINDICATIONS: '/contraindications',
    CLASSIFICATIONS: '/classifications'
  };

  // Cache Settings
  readonly CACHE_SETTINGS = {
    DRUG_INFO: 24 * 60 * 60 * 1000, // 24 hours
    INTERACTIONS: 12 * 60 * 60 * 1000, // 12 hours
    ALLERGIES: 24 * 60 * 60 * 1000, // 24 hours
    CONTRAINDICATIONS: 24 * 60 * 60 * 1000 // 24 hours
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

  // Severity Thresholds
  readonly SEVERITY_THRESHOLDS = {
    CRITICAL: 0.9,
    HIGH: 0.7,
    MEDIUM: 0.4,
    LOW: 0.1
  };

  // Data Mapping
  readonly DATA_MAPPING = {
    DRUG_CLASSES: {
      // Common Care Home Medications
      ANALGESICS: ['analgesic', 'pain relief', 'painkiller', 'paracetamol', 'ibuprofen', 'codeine'],
      ANTIPSYCHOTICS: ['antipsychotic', 'risperidone', 'quetiapine', 'haloperidol'],
      ANTIDEPRESSANTS: ['antidepressant', 'ssri', 'snri', 'citalopram', 'sertraline', 'mirtazapine'],
      ANXIOLYTICS: ['anxiolytic', 'diazepam', 'lorazepam', 'oxazepam'],
      DEMENTIA: ['donepezil', 'memantine', 'rivastigmine', 'galantamine'],
      DIABETES: ['insulin', 'metformin', 'gliclazide', 'diabetes'],
      CARDIOVASCULAR: ['blood pressure', 'hypertension', 'heart', 'ramipril', 'amlodipine', 'bisoprolol'],
      ANTICOAGULANTS: ['warfarin', 'apixaban', 'rivaroxaban', 'anticoagulant'],
      BONE_HEALTH: ['calcium', 'vitamin d', 'alendronic', 'osteoporosis'],
      GASTROINTESTINAL: ['omeprazole', 'lansoprazole', 'laxative', 'constipation'],
      RESPIRATORY: ['inhaler', 'salbutamol', 'tiotropium', 'steroid inhaler'],
      ANTIBIOTICS: ['antibiotic', 'amoxicillin', 'clarithromycin', 'trimethoprim'],
      PARKINSONS: ['levodopa', 'co-careldopa', 'parkinsons'],
      SUPPLEMENTS: ['vitamin', 'mineral', 'supplement', 'folic acid', 'b12'],
      PRN_MEDICATIONS: ['prn', 'as required', 'when needed']
    },
    ROUTES: {
      ORAL: ['oral', 'by mouth', 'po'],
      INTRAVENOUS: ['iv', 'intravenous'],
      INTRAMUSCULAR: ['im', 'intramuscular'],
      SUBCUTANEOUS: ['sc', 'subcutaneous'],
      TOPICAL: ['topical', 'cutaneous', 'cream', 'ointment'],
      INHALED: ['inhaler', 'inhaled', 'nebuliser'],
      TRANSDERMAL: ['patch', 'transdermal'],
      SUBLINGUAL: ['sublingual', 'under tongue'],
      RECTAL: ['rectal', 'suppository'],
      EYE_DROPS: ['eye drops', 'ophthalmic'],
      EAR_DROPS: ['ear drops', 'otic']
    },
    ADMINISTRATION_TIMES: {
      MORNING: ['morning', 'am', 'breakfast'],
      NOON: ['noon', 'lunch', 'midday'],
      EVENING: ['evening', 'pm', 'dinner', 'tea'],
      NIGHT: ['night', 'bed', 'nocte'],
      WITH_FOOD: ['with food', 'after food', 'with meals'],
      BEFORE_FOOD: ['before food', 'empty stomach'],
      PRN: ['prn', 'as required', 'when needed']
    },
    SPECIAL_INSTRUCTIONS: {
      CRUSH_ALLOWED: ['can be crushed', 'crushable'],
      NO_CRUSH: ['do not crush', 'swallow whole'],
      DISSOLVE: ['dissolve', 'disperse', 'soluble'],
      CONTROLLED_DRUG: ['cd', 'controlled drug'],
      COVERT: ['covert', 'disguised'],
      HIGH_RISK: ['high risk', 'care needed'],
      VARIABLE_DOSE: ['variable', 'sliding scale', 'titrate']
    }
  };

  // Validation Settings
  readonly VALIDATION = {
    REQUIRED_FIELDS: {
      DRUG_INFO: ['name', 'form', 'strength', 'route', 'frequency'],
      INTERACTION: ['drug1', 'drug2', 'severity', 'recommendation'],
      ALLERGY: ['substance', 'reaction', 'severity'],
      CONTRAINDICATION: ['condition', 'severity', 'recommendation'],
      MAR_ENTRY: ['drug', 'dose', 'time', 'route', 'administrator']
    },
    MAX_LENGTH: {
      DRUG_NAME: 100,
      DESCRIPTION: 1000,
      NOTES: 500,
      SPECIAL_INSTRUCTIONS: 200
    }
  };

  // Error Messages
  readonly ERROR_MESSAGES = {
    API_ERROR: 'Failed to connect to BNF API',
    VALIDATION_ERROR: 'Invalid medication data format',
    AUTHENTICATION_ERROR: 'Authentication failed',
    RATE_LIMIT_ERROR: 'Rate limit exceeded',
    NOT_FOUND: 'Medication not found',
    INTERACTION_ERROR: 'Failed to check drug interactions',
    ALLERGY_ERROR: 'Failed to check allergy warnings',
    MAR_ERROR: 'Failed to record medication administration'
  };

  // Logging Settings
  readonly LOGGING = {
    ENABLED: true,
    LEVEL: 'info',
    INCLUDE_TIMESTAMPS: true,
    INCLUDE_REQUEST_ID: true
  };

  // Regional Settings
  readonly REGIONAL_SETTINGS = {
    ENGLAND: {
      REGULATORY_BODY: 'CQC',
      FORMULARY: 'BNF',
      CONTROLLED_DRUGS_REQUIREMENTS: {
        WITNESS_REQUIRED: true,
        REGISTER_REQUIRED: true,
        STORAGE_REQUIREMENTS: 'CD Cabinet compliant with The Misuse of Drugs (Safe Custody) Regulations 1973'
      },
      COVERT_MEDS_REQUIREMENTS: {
        MCA_REQUIRED: true,
        BEST_INTEREST_MEETING: true,
        DOCUMENTATION: ['MCA Assessment', 'Best Interest Decision', 'Care Plan', 'GP Authorization']
      }
    },
    WALES: {
      REGULATORY_BODY: 'CIW',
      FORMULARY: 'BNF',
      CONTROLLED_DRUGS_REQUIREMENTS: {
        WITNESS_REQUIRED: true,
        REGISTER_REQUIRED: true,
        STORAGE_REQUIREMENTS: 'CD Cabinet compliant with The Misuse of Drugs (Safe Custody) Regulations 1973'
      },
      COVERT_MEDS_REQUIREMENTS: {
        MCA_REQUIRED: true,
        BEST_INTEREST_MEETING: true,
        DOCUMENTATION: ['MCA Assessment', 'Best Interest Decision', 'Care Plan', 'GP Authorization']
      }
    },
    SCOTLAND: {
      REGULATORY_BODY: 'Care Inspectorate',
      FORMULARY: 'BNF',
      CONTROLLED_DRUGS_REQUIREMENTS: {
        WITNESS_REQUIRED: true,
        REGISTER_REQUIRED: true,
        STORAGE_REQUIREMENTS: 'CD Cabinet compliant with The Misuse of Drugs (Safe Custody) Regulations 1973'
      },
      COVERT_MEDS_REQUIREMENTS: {
        AWI_REQUIRED: true, // Adults with Incapacity (Scotland) Act 2000
        SECTION_47_REQUIRED: true,
        DOCUMENTATION: ['AWI Assessment', 'Section 47 Certificate', 'Care Plan', 'GP Authorization']
      }
    },
    IRELAND: {
      REGULATORY_BODY: 'HIQA',
      FORMULARY: 'BNF Ireland',
      CONTROLLED_DRUGS_REQUIREMENTS: {
        WITNESS_REQUIRED: true,
        REGISTER_REQUIRED: true,
        STORAGE_REQUIREMENTS: 'CD Cabinet compliant with Misuse of Drugs Regulations'
      },
      COVERT_MEDS_REQUIREMENTS: {
        CAPACITY_ASSESSMENT_REQUIRED: true,
        DOCUMENTATION: ['Capacity Assessment', 'Multidisciplinary Decision', 'Care Plan', 'GP Authorization']
      }
    },
    NORTHERN_IRELAND: {
      REGULATORY_BODY: 'RQIA',
      FORMULARY: 'BNF',
      CONTROLLED_DRUGS_REQUIREMENTS: {
        WITNESS_REQUIRED: true,
        REGISTER_REQUIRED: true,
        STORAGE_REQUIREMENTS: 'CD Cabinet compliant with The Misuse of Drugs (Safe Custody) Regulations 1973'
      },
      COVERT_MEDS_REQUIREMENTS: {
        MENTAL_CAPACITY_ACT_REQUIRED: true,
        DOCUMENTATION: ['Capacity Assessment', 'Best Interest Decision', 'Care Plan', 'GP Authorization']
      }
    }
  };

  // Regional Language Support
  readonly REGIONAL_LANGUAGES = {
    ENGLAND: ['en'],
    WALES: ['en', 'cy'], // English and Welsh
    SCOTLAND: ['en', 'gd'], // English and Scottish Gaelic
    IRELAND: ['en', 'ga'], // English and Irish
    NORTHERN_IRELAND: ['en', 'ga'] // English and Irish
  };

  // Regional Medication Names
  readonly REGIONAL_MEDICATION_NAMES = {
    UK: {
      'paracetamol': ['paracetamol', 'acetaminophen'],
      'salbutamol': ['salbutamol', 'albuterol'],
      'adrenaline': ['adrenaline', 'epinephrine']
    },
    IRELAND: {
      'paracetamol': ['paracetamol', 'acetaminophen'],
      'salbutamol': ['salbutamol', 'albuterol'],
      'adrenaline': ['adrenaline', 'epinephrine']
    }
  };

  // Regional Documentation Requirements
  readonly REGIONAL_DOCUMENTATION = {
    ENGLAND: {
      MAR_REQUIREMENTS: ['signature', 'date', 'time', 'dose', 'route'],
      CONTROLLED_DRUGS: ['witness signature', 'stock balance', 'date', 'time'],
      CARE_PLANS: ['medication details', 'risk assessment', 'consent']
    },
    WALES: {
      MAR_REQUIREMENTS: ['signature', 'date', 'time', 'dose', 'route'],
      CONTROLLED_DRUGS: ['witness signature', 'stock balance', 'date', 'time'],
      CARE_PLANS: ['medication details', 'risk assessment', 'consent', 'welsh language preference']
    },
    SCOTLAND: {
      MAR_REQUIREMENTS: ['signature', 'date', 'time', 'dose', 'route'],
      CONTROLLED_DRUGS: ['witness signature', 'stock balance', 'date', 'time'],
      CARE_PLANS: ['medication details', 'AWI details', 'Section 47 details']
    },
    IRELAND: {
      MAR_REQUIREMENTS: ['signature', 'date', 'time', 'dose', 'route', 'batch number'],
      CONTROLLED_DRUGS: ['witness signature', 'stock balance', 'date', 'time', 'batch number'],
      CARE_PLANS: ['medication details', 'risk assessment', 'consent', 'irish language preference']
    },
    NORTHERN_IRELAND: {
      MAR_REQUIREMENTS: ['signature', 'date', 'time', 'dose', 'route'],
      CONTROLLED_DRUGS: ['witness signature', 'stock balance', 'date', 'time'],
      CARE_PLANS: ['medication details', 'risk assessment', 'consent', 'irish language preference']
    }
  };

  constructor() {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.API_KEY) {
      console.warn('BNF API key not configured');
    }

    if (!this.API_BASE_URL) {
      throw new Error('BNF API base URL not configured');
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

  getSeverityLevel(score: number): string {
    if (score >= this.SEVERITY_THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (score >= this.SEVERITY_THRESHOLDS.HIGH) return 'HIGH';
    if (score >= this.SEVERITY_THRESHOLDS.MEDIUM) return 'MEDIUM';
    return 'LOW';
  }

  getRetryDelay(attempt: number): number {
    const delay = this.RETRY_SETTINGS.INITIAL_DELAY *
      Math.pow(this.RETRY_SETTINGS.BACKOFF_FACTOR, attempt);
    return Math.min(delay, this.RETRY_SETTINGS.MAX_DELAY);
  }

  validateDrugInfo(data: any): boolean {
    const requiredFields = this.VALIDATION.REQUIRED_FIELDS.DRUG_INFO;
    return requiredFields.every(field => 
      data.hasOwnProperty(field) && 
      data[field] !== null && 
      data[field] !== undefined
    );
  }

  getDrugClass(drugName: string): string[] {
    const classes: string[] = [];
    Object.entries(this.DATA_MAPPING.DRUG_CLASSES).forEach(([className, keywords]) => {
      if (keywords.some(keyword => 
        drugName.toLowerCase().includes(keyword.toLowerCase())
      )) {
        classes.push(className);
      }
    });
    return classes;
  }

  getRouteOfAdministration(route: string): string {
    for (const [standardRoute, aliases] of Object.entries(this.DATA_MAPPING.ROUTES)) {
      if (aliases.some(alias => 
        route.toLowerCase().includes(alias.toLowerCase())
      )) {
        return standardRoute;
      }
    }
    return 'OTHER';
  }
} 