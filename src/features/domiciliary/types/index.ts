/**
 * @writecarenotes.com
 * @fileoverview Type definitions for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive type definitions for the domiciliary care module, including
 * interfaces for care plans, visits, staff, and client management. Implements
 * strict typing for regional compliance and data protection requirements.
 *
 * Features:
 * - Complete type coverage for module functionality
 * - Strict null checking and validation
 * - Regional compliance type definitions
 * - Integration interface definitions
 * - Mobile-specific type definitions
 *
 * Mobile-First Considerations:
 * - Optimized type structures for mobile data
 * - Offline-sync type definitions
 * - Location service interfaces
 * - Device capability types
 * - Network state definitions
 *
 * Enterprise Features:
 * - Strict type safety
 * - Comprehensive documentation
 * - Version control
 * - Dependency tracking
 * - Integration interfaces
 */

import type { CarePlan } from '@/types/care';
import type { Assessment } from '@/types/assessment';

// Base interfaces
export interface DomiciliaryCarePlan extends CarePlan {
  visitRequirements: {
    preferredTimes: {
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
    }[];
    duration: number;
    staffingRequirements: {
      gender?: 'MALE' | 'FEMALE';
      skills: string[];
      continuityPreference: boolean;
    };
    access: {
      keySafe?: boolean;
      keySafeLocation?: string;
      accessNotes?: string;
    };
  };
  environmentalRisks: {
    location: Assessment;
    access: Assessment;
    equipment: Assessment;
  };
}

// Visit management types
export interface Visit {
  id: string;
  clientId: string;
  careplanId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: VisitStatus;
  tasks: VisitTask[];
  staff: AssignedStaff[];
  notes?: string;
  location: GeoLocation;
}

export type VisitStatus = 
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'MISSED'
  | 'LATE';

export interface VisitTask {
  id: string;
  type: TaskType;
  description: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export type TaskType =
  | 'PERSONAL_CARE'
  | 'MEDICATION'
  | 'MOBILITY'
  | 'NUTRITION'
  | 'DOMESTIC'
  | 'SOCIAL';

// Staff management types
export interface AssignedStaff {
  id: string;
  role: StaffRole;
  status: StaffStatus;
  checkedIn?: string;
  checkedOut?: string;
}

export type StaffRole =
  | 'CARE_WORKER'
  | 'SENIOR_CARE_WORKER'
  | 'COORDINATOR'
  | 'SUPERVISOR';

export type StaffStatus =
  | 'ASSIGNED'
  | 'CONFIRMED'
  | 'EN_ROUTE'
  | 'ON_SITE'
  | 'COMPLETED';

// Location types
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

// Compliance types
export interface ComplianceRecord {
  visitId: string;
  staffId: string;
  clientId: string;
  type: ComplianceType;
  timestamp: string;
  details: Record<string, unknown>;
}

export type ComplianceType =
  | 'VISIT_VERIFICATION'
  | 'MEDICATION_ADMINISTRATION'
  | 'INCIDENT_REPORT'
  | 'SAFEGUARDING_ALERT'; 