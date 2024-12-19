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


