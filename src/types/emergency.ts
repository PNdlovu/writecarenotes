export enum EmergencyType {
  MEDICAL = 'MEDICAL',
  FIRE = 'FIRE',
  SECURITY = 'SECURITY',
  CARE_HOME = 'CARE_HOME',
  WEATHER = 'WEATHER',
  OTHER = 'OTHER'
}

export enum EmergencyStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  ARCHIVED = 'ARCHIVED'
}

export enum EmergencyPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isOnCall: boolean;
  department: string;
  priority: number; // Order in which to contact
  availability: {
    start: string; // Time in 24hr format "HH:mm"
    end: string;
  }[];
}

export interface EmergencyProtocol {
  id: string;
  type: EmergencyType;
  title: string;
  description: string;
  steps: {
    order: number;
    instruction: string;
    assignedRole?: string;
    estimatedDuration?: number; // in minutes
  }[];
  requiredResources: string[];
  contactSequence: string[]; // Array of contact IDs in order
  lastUpdated: string;
  version: string;
}

export interface EmergencyIncident {
  id: string;
  type: EmergencyType;
  status: EmergencyStatus;
  priority: EmergencyPriority;
  title: string;
  description: string;
  location: {
    building: string;
    floor: string;
    room?: string;
    coordinates?: {
      x: number;
      y: number;
    };
  };
  reportedBy: {
    id: string;
    name: string;
    role: string;
  };
  reportedAt: string;
  affectedResidents?: string[]; // Array of resident IDs
  protocol?: string; // Protocol ID being followed
  currentStep?: number; // Current step in the protocol
  responders: {
    id: string;
    name: string;
    role: string;
    status: 'ASSIGNED' | 'EN_ROUTE' | 'ON_SCENE' | 'COMPLETED';
    assignedAt: string;
    arrivedAt?: string;
    completedAt?: string;
    notes?: string;
  }[];
  timeline: {
    timestamp: string;
    action: string;
    performedBy: string;
    notes?: string;
  }[];
  resources: {
    id: string;
    type: string;
    status: 'REQUESTED' | 'ALLOCATED' | 'IN_USE' | 'RETURNED';
    requestedAt: string;
    allocatedAt?: string;
    returnedAt?: string;
  }[];
  resolvedAt?: string;
  resolutionNotes?: string;
  afterActionReport?: {
    summary: string;
    effectiveness: number;
    challenges: string[];
    improvements: string[];
    reviewedBy: string;
    reviewedAt: string;
  };
}

export interface EmergencyResource {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DEPLETED';
  quantity: number;
  lastChecked: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

export interface EmergencyDrillRecord {
  id: string;
  type: EmergencyType;
  date: string;
  duration: number; // in minutes
  participants: {
    id: string;
    name: string;
    role: string;
    performance: 'EXCELLENT' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
    notes?: string;
  }[];
  protocol: string; // Protocol ID used
  objectives: string[];
  completedObjectives: string[];
  observations: string[];
  improvements: string[];
  conductedBy: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface EmergencyStats {
  totalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  averageResponseTime: number; // in minutes
  incidentsByType: Record<EmergencyType, number>;
  incidentsByPriority: Record<EmergencyPriority, number>;
  responseTimesByType: Record<EmergencyType, number>;
  mostCommonLocations: {
    location: string;
    count: number;
  }[];
  resourceUtilization: {
    resourceType: string;
    usageCount: number;
    averageDuration: number;
  }[];
  staffPerformance: {
    staffId: string;
    responseCount: number;
    averageResponseTime: number;
    successRate: number;
  }[];
}
