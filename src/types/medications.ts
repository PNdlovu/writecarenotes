export type AdministrationRoute = 
  | 'ORAL'
  | 'TOPICAL'
  | 'INJECTION'
  | 'INHALATION'
  | 'SUBLINGUAL'
  | 'RECTAL'
  | 'TRANSDERMAL'
  | 'OPHTHALMIC'
  | 'OTIC'
  | 'NASAL'
  | 'OTHER';

export type AdministrationFrequency =
  | 'ONCE_DAILY'
  | 'TWICE_DAILY'
  | 'THREE_TIMES_DAILY'
  | 'FOUR_TIMES_DAILY'
  | 'EVERY_MORNING'
  | 'EVERY_NIGHT'
  | 'EVERY_4_HOURS'
  | 'AS_NEEDED'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'OTHER';

export type AdministrationStatus =
  | 'COMPLETED'
  | 'MISSED'
  | 'REFUSED'
  | 'HELD'
  | 'UNAVAILABLE'
  | 'PENDING'
  | 'LATE';

export type MedicationType = 
  | 'REGULAR'
  | 'PRN'
  | 'CONTROLLED'
  | 'OVER_THE_COUNTER';

export type MedicationStatus =
  | 'SCHEDULED'
  | 'DISCONTINUED'
  | 'ON_HOLD'
  | 'PENDING_APPROVAL'
  | 'PENDING_REFILL';

export interface AdministrationRecord {
  id: string;
  medicationId: string;
  residentId: string;
  scheduledTime: string;
  administeredTime?: string;
  status: AdministrationStatus;
  administeredBy?: {
    id: string;
    name: string;
  };
  notes?: string;
  witness?: {
    id: string;
    name: string;
  };
  reason?: string; // For missed/refused/held medications
}

export interface PRNRecord extends AdministrationRecord {
  reason: string; // Required for PRN
  effectiveness?: {
    time: string;
    rating: 1 | 2 | 3 | 4 | 5;
    notes: string;
  };
  followUp?: {
    time: string;
    notes: string;
    by: {
      id: string;
      name: string;
    };
  };
}

export interface MedicationRoute {
  route: AdministrationRoute;
  instructions?: string;
  siteRotation?: boolean; // For injections, patches, etc.
  site?: string;
}

export interface MedicationSchedule {
  frequency: AdministrationFrequency;
  times: string[]; // 24-hour format HH:mm
  startDate: string;
  endDate?: string;
  daysOfWeek?: number[]; // 0-6 for weekly medications
  dayOfMonth?: number; // 1-31 for monthly medications
  instructions?: string;
}

export interface MedicationError {
  id: string;
  medicationId: string;
  residentId: string;
  timestamp: string;
  type: 'WRONG_MEDICATION' | 'WRONG_DOSE' | 'WRONG_TIME' | 'WRONG_RESIDENT' | 'WRONG_ROUTE' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  actionTaken: string;
  reportedBy: {
    id: string;
    name: string;
  };
  witnessedBy?: {
    id: string;
    name: string;
  };
  followUp?: {
    required: boolean;
    description?: string;
    dueDate?: string;
    completedDate?: string;
    completedBy?: {
      id: string;
      name: string;
    };
  };
}


