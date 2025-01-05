export type Region = 'ENGLAND' | 'WALES' | 'SCOTLAND' | 'NORTHERN_IRELAND' | 'IRELAND';

export interface RegulatoryBody {
  name: string;
  code: string;
  region: Region;
  standards: string[];
  reportingRequirements: string[];
}

export interface CQCRequirements {
  kloes: {
    safe: boolean;
    effective: boolean;
    caring: boolean;
    responsive: boolean;
    wellLed: boolean;
  };
  pirData: {
    lastSubmission: Date;
    nextDue: Date;
    metrics: Record<string, any>;
  };
  ratings: {
    overall: string;
    safe: string;
    effective: string;
    caring: string;
    responsive: string;
    wellLed: string;
  };
}

export interface CIWRequirements {
  welshActiveOffer: {
    status: 'FULL' | 'PARTIAL' | 'NONE';
    documentation: string[];
    staffLanguageCapabilities: Record<string, string[]>;
  };
  onlineServices: {
    lastSync: Date;
    pendingSubmissions: string[];
    notifications: string[];
  };
  inspectionHistory: {
    date: Date;
    outcome: string;
    actionPlan?: string;
  }[];
}

export interface CareInspectorateRequirements {
  healthAndSocialCareStandards: {
    dignity: boolean;
    privacy: boolean;
    choice: boolean;
    safety: boolean;
    realisation: boolean;
    equality: boolean;
    compassion: boolean;
  };
  hubIntegration: {
    lastSync: Date;
    notifications: string[];
    submissions: {
      id: string;
      type: string;
      status: string;
      date: Date;
    }[];
  };
}

export interface RQIARequirements {
  qualityFramework: {
    isRegistered: boolean;
    registrationNumber: string;
    serviceType: string;
    lastAssessment: Date;
    standards: Record<string, boolean>;
  };
  hscTrust: {
    trustName: string;
    contractDetails: string;
    requirements: string[];
  };
  inspections: {
    date: Date;
    type: string;
    outcome: string;
    recommendations: string[];
  }[];
}

export interface HIQARequirements {
  nationalStandards: {
    residentialCare: {
      rights: boolean;
      health: boolean;
      safety: boolean;
      environment: boolean;
      workforce: boolean;
      governance: boolean;
    };
    qualityFramework: {
      lastAssessment: Date;
      improvements: string[];
      compliance: Record<string, boolean>;
    };
  };
  inspections: {
    date: Date;
    type: 'ANNOUNCED' | 'UNANNOUNCED';
    findings: string[];
    actionPlan?: string;
  }[];
}

export interface OfstedRequirements {
  registration: {
    registrationNumber: string;
    registrationDate: Date;
    registrationType: 'FULL' | 'PROVISIONAL' | 'SUSPENDED';
    conditions: string[];
  };
  inspections: {
    date: Date;
    type: 'FULL' | 'INTERIM' | 'MONITORING' | 'EMERGENCY';
    overallEffectiveness: 'OUTSTANDING' | 'GOOD' | 'REQUIRES_IMPROVEMENT' | 'INADEQUATE';
    outcomes: {
      overallExperiences: string;
      qualityOfCare: string;
      safeguarding: string;
      leadership: string;
      education: string;
    };
    recommendations: string[];
    requirements: string[];
  }[];
  qualityStandards: {
    statement: {
      lastUpdated: Date;
      content: string;
      approved: boolean;
    };
    childrensGuide: {
      lastUpdated: Date;
      formats: string[];
      accessible: boolean;
    };
    staffQualifications: {
      role: string;
      requiredQualifications: string[];
      completedQualifications: string[];
      inProgress: string[];
    }[];
  };
  safeguarding: {
    designatedLead: {
      name: string;
      qualification: string;
      lastTraining: Date;
    };
    policies: {
      name: string;
      lastReviewed: Date;
      nextReview: Date;
      version: string;
    }[];
    training: {
      type: string;
      completedBy: string[];
      dueBy: string[];
      refreshDate: Date;
    }[];
  };
  educationProvision: {
    arrangements: {
      type: 'ON_SITE' | 'LOCAL_SCHOOL' | 'SPECIALIST_PROVISION' | 'MIXED';
      providers: {
        name: string;
        dfENumber?: string;
        ofstedRating?: string;
        lastInspection?: Date;
      }[];
    };
    monitoring: {
      attendance: {
        period: string;
        percentage: number;
        issues: string[];
      }[];
      progress: {
        subject: string;
        level: string;
        achievements: string[];
      }[];
    };
  };
  healthAndWellbeing: {
    medicalOfficer: {
      name: string;
      qualification: string;
      registrationNumber: string;
    };
    healthAssessments: {
      type: string;
      frequency: string;
      lastCompleted: Date;
      nextDue: Date;
    }[];
    mentalHealthSupport: {
      type: string;
      provider: string;
      frequency: string;
      lastReview: Date;
    }[];
  };
}

export interface BasePerson {
  // ... existing properties ...
  ofstedRequirements?: OfstedRequirements;
}
