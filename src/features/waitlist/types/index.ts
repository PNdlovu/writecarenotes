/**
 * WriteCareNotes.com
 * @fileoverview Waitlist Feature Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

export interface WaitlistEntry {
  id: string;
  careHomeId: string;
  residentId: string;
  priority: WaitlistPriority;
  status: WaitlistStatus;
  requestDate: string;
  preferredMoveInDate?: string;
  roomPreferences?: string[];
  careNeeds: CareNeed[];
  notes?: string;
  assessmentId?: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    version: number;
  };
}

export type WaitlistPriority = 
  | 'URGENT'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type WaitlistStatus = 
  | 'PENDING'
  | 'ASSESSMENT_SCHEDULED'
  | 'ASSESSMENT_COMPLETED'
  | 'APPROVED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'PLACED';

export type CareNeed = 
  | 'RESIDENTIAL'
  | 'NURSING'
  | 'DEMENTIA'
  | 'RESPITE'
  | 'PALLIATIVE'
  | 'MENTAL_HEALTH'
  | 'LEARNING_DISABILITY'
  | 'PHYSICAL_DISABILITY';

export interface WaitlistFilter {
  careHomeId?: string;
  residentId?: string;
  priority?: WaitlistPriority;
  status?: WaitlistStatus;
  careNeeds?: CareNeed[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface WaitlistStats {
  totalEntries: number;
  byPriority: Record<WaitlistPriority, number>;
  byStatus: Record<WaitlistStatus, number>;
  byCareNeed: Record<CareNeed, number>;
  averageWaitTime: number; // in days
  placementRate: number; // percentage
} 