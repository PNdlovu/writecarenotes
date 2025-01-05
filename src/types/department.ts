import { CareLevel } from './floorPlan';

export type DepartmentType = 
  | 'NURSING'
  | 'RESIDENTIAL'
  | 'MEMORY_CARE'
  | 'REHABILITATION'
  | 'PALLIATIVE'
  | 'SPECIALIZED';

export type StaffRole = 
  | 'NURSE'
  | 'CAREGIVER'
  | 'SPECIALIST'
  | 'PHYSICIAN'
  | 'THERAPIST'
  | 'COORDINATOR';

export interface Department {
  id: string;
  tenantId: string;
  careHomeId: string;
  name: string;
  type: DepartmentType;
  description?: string;
  careLevels: CareLevel[];
  capacity: {
    residents: number;
    staffing: {
      role: StaffRole;
      minCount: number;
      currentCount: number;
    }[];
  };
  operatingHours: {
    [key: string]: {
      start: string;
      end: string;
      minimumStaff: {
        role: StaffRole;
        count: number;
      }[];
    };
  };
  features: {
    medicationManagement: boolean;
    specializedCare: boolean;
    rehabilitation: boolean;
    activities: boolean;
    monitoring: boolean;
  };
  location: {
    floor: number;
    wing?: string;
    zones: string[];
  };
  contacts: {
    primary: {
      name: string;
      role: StaffRole;
      phone: string;
      email: string;
    };
    emergency: {
      name: string;
      role: StaffRole;
      phone: string;
    };
  };
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  metadata?: Record<string, any>;
}

export interface DepartmentStats {
  id: string;
  departmentId: string;
  timestamp: Date;
  occupancy: {
    current: number;
    capacity: number;
    percentage: number;
  };
  staffing: {
    role: StaffRole;
    required: number;
    present: number;
    onLeave: number;
  }[];
  incidents: {
    total: number;
    critical: number;
    pending: number;
  };
  medications: {
    scheduled: number;
    administered: number;
    missed: number;
    delayed: number;
  };
  activities: {
    scheduled: number;
    completed: number;
    participation: number;
  };
}


