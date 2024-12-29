export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
export type BedType = 'STANDARD' | 'BARIATRIC' | 'ELECTRIC' | 'LOW' | 'SPECIALTY';
export type WaitlistStatus = 'PENDING' | 'APPROVED' | 'CANCELLED' | 'COMPLETED';
export type WaitlistPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Bed {
  id: string;
  number: string;
  type: BedType;
  status: BedStatus;
  roomId: string;
  floorId: string;
  careHomeId: string;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaitlistEntry {
  id: string;
  residentId: string;
  priority: WaitlistPriority;
  status: WaitlistStatus;
  requestDate: Date;
  requiredBedType: BedType;
  specialRequirements?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 