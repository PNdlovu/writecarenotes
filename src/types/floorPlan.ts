export enum RoomType {
  RESIDENT_SINGLE = 'RESIDENT_SINGLE',
  RESIDENT_SHARED = 'RESIDENT_SHARED',
  NURSING_STATION = 'NURSING_STATION',
  MEDICATION_ROOM = 'MEDICATION_ROOM',
  TREATMENT_ROOM = 'TREATMENT_ROOM',
  DINING_AREA = 'DINING_AREA',
  ACTIVITY_ROOM = 'ACTIVITY_ROOM',
  STAFF_ROOM = 'STAFF_ROOM',
  STORAGE = 'STORAGE',
  BATHROOM = 'BATHROOM',
  SHOWER_ROOM = 'SHOWER_ROOM',
  ISOLATION_ROOM = 'ISOLATION_ROOM'
}

export enum RoomStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLEANING = 'CLEANING',
  ISOLATION = 'ISOLATION',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export enum CareLevel {
  INDEPENDENT = 'INDEPENDENT',
  ASSISTED = 'ASSISTED',
  MEMORY_CARE = 'MEMORY_CARE',
  SKILLED_NURSING = 'SKILLED_NURSING',
  PALLIATIVE = 'PALLIATIVE'
}

export interface RoomAmenity {
  id: string;
  name: string;
  type: 'MEDICAL' | 'COMFORT' | 'SAFETY' | 'ACCESSIBILITY';
  description?: string;
}

export interface RoomTemplate {
  type: RoomType;
  defaultCapacity: number;
  requiredAmenities: RoomAmenity[];
  recommendedAmenities: RoomAmenity[];
  minimumArea: number; // in square feet
  careLevel: CareLevel[];
  staffingRequirements?: {
    nurses?: number;
    caregivers?: number;
  };
}

export interface Room {
  id: string;
  floorPlanId: string;
  name: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
  capacity: number;
  currentOccupancy: number;
  amenities: RoomAmenity[];
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  area: number;
  careLevels: CareLevel[];
  notes?: string;
  lastCleaned?: Date;
  lastMaintenance?: Date;
  emergencyEquipment?: {
    hasCallButton: boolean;
    hasOxygenSupply: boolean;
    hasSuctionEquipment: boolean;
  };
  accessibility?: {
    isWheelchairAccessible: boolean;
    hasGrabBars: boolean;
    hasAdjustableBed: boolean;
  };
}

export interface FloorPlan {
  id: string;
  careHomeId: string;
  name: string;
  level: number;
  imageUrl?: string;
  dimensions: {
    width: number;
    height: number;
  };
  scale: number; // pixels per foot
  rooms: Room[];
  emergencyExits: {
    x: number;
    y: number;
    type: 'PRIMARY' | 'SECONDARY';
  }[];
  nursingStations: {
    id: string;
    x: number;
    y: number;
    coverageArea: number;
  }[];
  created: Date;
  updated: Date;
}

export interface Assignment {
  id: string;
  roomId: string;
  residentId: string;
  startDate: Date;
  endDate?: Date;
  careLevel: CareLevel;
  primaryNurse?: string;
  primaryCaregiver?: string;
  specialRequirements?: string[];
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}


