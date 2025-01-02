export type CareType = 
  | 'elderly-care'
  | 'mental-health'
  | 'learning-disabilities'
  | 'physical-disabilities'
  | 'domiciliary-care'
  | 'supported-living'
  | 'respite-care'
  | 'substance-misuse'
  | 'brain-injury'
  | 'autism-specific'
  | 'transitional-care';

export interface CareProvider {
  id: string;
  name: string;
  type: CareType;
  regulators: RegulatorType[];
}

export type RegulatorType = 
  | 'CQC'
  | 'OFSTED'
  | 'CIW'
  | 'CARE_INSPECTORATE'
  | 'RQIA'
  | 'HIQA';

// Base interfaces for all care types
export interface BasePerson {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  nhsNumber?: string;
  careType: CareType;
  photo?: string;
  status: 'active' | 'archived' | 'temporary';
  createdAt: Date;
  updatedAt: Date;
  // Care type specific fields
  physicalAssessment?: PhysicalAssessment;
  rehabilitationPlan?: RehabilitationPlan;
  carePackage?: CarePackage;
  homeAssessment?: HomeAssessment;
  hasEndOfLifeCare?: boolean;
  supportedLivingAssessment?: SupportedLivingAssessment;
  respiteCarePackage?: RespiteCarePackage;
  substanceMisuseAssessment?: SubstanceMisuseAssessment;
  brainInjuryAssessment?: BrainInjuryAssessment;
  autismAssessment?: AutismAssessment;
  transitionalCareAssessment?: TransitionalCareAssessment;
}

export interface BaseContact {
  id: string;
  relationship: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  isEmergencyContact: boolean;
  notes?: string;
}

export interface BaseCarePlan {
  id: string;
  personId: string;
  startDate: Date;
  reviewDate: Date;
  status: 'draft' | 'active' | 'archived';
  needs: CarePlanNeed[];
  goals: CarePlanGoal[];
  risks: RiskAssessment[];
}

interface CarePlanNeed {
  id: string;
  category: string;
  description: string;
  support: string;
  outcome: string;
}

interface CarePlanGoal {
  id: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in-progress' | 'achieved' | 'cancelled';
}

interface RiskAssessment {
  id: string;
  category: string;
  description: string;
  level: 'low' | 'medium' | 'high';
  mitigations: string[];
}

// Physical Disabilities specific types
export interface PhysicalAssessment {
  mobility: {
    status: string;
    aids: string[];
    notes: string;
  };
  activities: {
    type: string;
    independence: string;
    support: string;
  }[];
  equipment: {
    item: string;
    status: string;
    lastChecked: string;
  }[];
}

export interface RehabilitationPlan {
  goals: {
    area: string;
    description: string;
    progress: string;
    target: string;
  }[];
  therapies: {
    type: string;
    provider: string;
    frequency: string;
    notes: string;
  }[];
}

// Domiciliary Care specific types
export interface CarePackage {
  visits: {
    time: string;
    duration: string;
    tasks: string[];
    carers: string[];
  }[];
  preferences: {
    preferredTimes: string[];
    preferredCarers: string[];
    specialInstructions: string[];
  };
}

export interface HomeAssessment {
  environment: {
    area: string;
    risks: string[];
    adaptations: string[];
  }[];
  equipment: {
    item: string;
    location: string;
    status: string;
    lastChecked: string;
  }[];
}

// Supported Living specific types
export interface SupportedLivingAssessment {
  independentLiving: {
    skills: {
      area: string;
      capability: string;
      supportNeeded: string;
    }[];
    goals: {
      description: string;
      timeframe: string;
      progress: string;
    }[];
  };
  housing: {
    type: string;
    adaptations: string[];
    support: string[];
  };
  communityEngagement: {
    activities: string[];
    support: string;
    risks: string[];
  };
}

// Respite Care specific types
export interface RespiteCarePackage {
  duration: {
    startDate: string;
    endDate: string;
    frequency?: string;
  };
  primaryCarer: {
    name: string;
    relationship: string;
    contact: string;
  };
  careNeeds: {
    category: string;
    details: string[];
    specialInstructions: string[];
  }[];
}

// Substance Misuse specific types
export interface SubstanceMisuseAssessment {
  substances: {
    type: string;
    usage: string;
    history: string;
    risks: string[];
  }[];
  treatment: {
    plan: string;
    medications: {
      name: string;
      dosage: string;
      frequency: string;
    }[];
    therapies: string[];
  };
  recovery: {
    goals: string[];
    support: string[];
    triggers: string[];
  };
}

// Brain Injury specific types
export interface BrainInjuryAssessment {
  injury: {
    type: string;
    date: string;
    impact: string[];
  };
  cognitive: {
    memory: string;
    attention: string;
    processing: string;
    communication: string;
  };
  rehabilitation: {
    therapies: {
      type: string;
      frequency: string;
      goals: string[];
    }[];
    progress: string[];
  };
}

// Autism Specific types
export interface AutismAssessment {
  sensory: {
    triggers: string[];
    preferences: string[];
    strategies: string[];
  };
  communication: {
    method: string;
    support: string[];
    preferences: string[];
  };
  routine: {
    daily: string[];
    importance: string;
    changes: string[];
  };
  support: {
    areas: string[];
    strategies: string[];
    goals: string[];
  };
}

// Transitional Care specific types
export interface TransitionalCareAssessment {
  currentServices: {
    service: string;
    provider: string;
    endDate: string;
  }[];
  adultServices: {
    service: string;
    provider: string;
    startDate: string;
    requirements: string[];
  }[];
  transitionPlan: {
    timeline: {
      stage: string;
      actions: string[];
      completion: string;
    }[];
    support: string[];
    risks: string[];
  };
}

// Children's home specific interfaces
export interface ChildPerson extends BasePerson {
  careType: 'childrens';
  education?: {
    school: string;
    schoolContact: string;
    yearGroup: string;
    educationPlan?: string;
    specialNeeds?: string[];
  };
  placement?: {
    localAuthority: string;
    socialWorker: BaseContact;
    placementOrder?: string;
    placementDate: Date;
    expectedDuration?: string;
  };
  legalStatus?: {
    type: string;
    details: string;
    reviewDate?: Date;
  };
}

// Type guards
export function isChildPerson(person: BasePerson): person is ChildPerson {
  return person.careType === 'childrens';
}

// Compliance interfaces
export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  regulators: RegulatorType[];
  applicableCareTypes: CareType[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  items: ComplianceItem[];
}

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  evidence: string[];
}
