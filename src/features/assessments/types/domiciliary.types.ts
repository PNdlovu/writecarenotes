import { RiskLevel } from '@prisma/client';

export interface HomeEnvironmentAssessment {
  // Access and Safety
  entranceAccess: {
    steps: boolean;
    ramp: boolean;
    handrails: boolean;
    lighting: boolean;
    notes: string;
  };
  
  // Room Assessment
  roomAssessments: {
    bedroom: RoomSafetyCheck;
    bathroom: RoomSafetyCheck;
    kitchen: RoomSafetyCheck;
    livingArea: RoomSafetyCheck;
    stairs?: RoomSafetyCheck;
  };

  // Environmental Factors
  environmentalFactors: {
    lighting: RiskAssessment;
    temperature: RiskAssessment;
    ventilation: RiskAssessment;
    noise: RiskAssessment;
    cleanliness: RiskAssessment;
  };

  // Equipment and Adaptations
  equipment: {
    existing: AdaptationItem[];
    recommended: AdaptationItem[];
    maintenance: MaintenanceRecord[];
  };

  // Emergency Preparedness
  emergencyPreparedness: {
    fireAlarms: boolean;
    carbonMonoxideDetectors: boolean;
    evacuationPlan: boolean;
    emergencyContacts: boolean;
    notes: string;
  };
}

interface RoomSafetyCheck {
  hazards: string[];
  trippingRisks: boolean;
  adequateLighting: boolean;
  accessibility: boolean;
  recommendations: string[];
  riskLevel: RiskLevel;
}

interface RiskAssessment {
  status: 'ADEQUATE' | 'INADEQUATE' | 'NEEDS_IMPROVEMENT';
  riskLevel: RiskLevel;
  notes: string;
  recommendations: string[];
}

interface AdaptationItem {
  type: string;
  description: string;
  installationDate?: Date;
  lastInspectionDate?: Date;
  status: 'WORKING' | 'NEEDS_REPAIR' | 'NEEDS_REPLACEMENT';
  notes: string;
}

interface MaintenanceRecord {
  equipmentId: string;
  maintenanceDate: Date;
  maintenanceType: 'ROUTINE' | 'REPAIR' | 'REPLACEMENT';
  performedBy: string;
  notes: string;
  nextMaintenanceDate: Date;
}
