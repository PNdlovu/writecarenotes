export interface Visit {
  id: string;
  residentId: string;
  visitorIds: string[];
  type: VisitType;
  status: VisitStatus;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  location: VisitLocation;
  notes?: string;
  recurrence?: VisitRecurrence;
  restrictions?: VisitRestriction[];
}

export type VisitType =
  | 'IN_PERSON'
  | 'VIDEO_CALL'
  | 'EXTERNAL_ACTIVITY'
  | 'SPECIAL_EVENT';

export type VisitStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'MISSED';

export interface VisitLocation {
  type: 'CARE_HOME' | 'EXTERNAL';
  name: string;
  details?: {
    room?: string;
    floor?: string;
    building?: string;
    address?: string;
  };
}

export interface VisitRecurrence {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  exceptions?: Date[];
}

export interface VisitRestriction {
  type: 'COVID' | 'HEALTH' | 'SAFETY' | 'OTHER';
  description: string;
  startDate: Date;
  endDate?: Date;
  imposedBy: {
    id: string;
    name: string;
    role: string;
  };
}


