import { Room, RoomType, CareLevel, FloorPlan } from '@/types/floorPlan';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  validate: (room: Room, floorPlan: FloorPlan) => boolean;
  message: (room: Room) => string;
}

export const careHomeValidations: ValidationRule[] = [
  // Safety Validations
  {
    id: 'emergency-equipment',
    name: 'Emergency Equipment Check',
    description: 'Validates required emergency equipment based on room type',
    severity: 'ERROR',
    validate: (room: Room) => {
      if ([RoomType.RESIDENT_SINGLE, RoomType.RESIDENT_SHARED, RoomType.TREATMENT_ROOM].includes(room.type)) {
        return room.emergencyEquipment?.hasCallButton === true;
      }
      return true;
    },
    message: (room: Room) => `Room ${room.number} requires emergency call button`
  },
  {
    id: 'isolation-requirements',
    name: 'Isolation Room Requirements',
    description: 'Validates isolation room specific requirements',
    severity: 'ERROR',
    validate: (room: Room) => {
      if (room.type === RoomType.ISOLATION_ROOM) {
        return room.emergencyEquipment?.hasOxygenSupply === true &&
               room.emergencyEquipment?.hasSuctionEquipment === true;
      }
      return true;
    },
    message: (room: Room) => `Isolation room ${room.number} missing required medical equipment`
  },

  // Accessibility Validations
  {
    id: 'wheelchair-accessibility',
    name: 'Wheelchair Accessibility',
    description: 'Ensures rooms are wheelchair accessible where required',
    severity: 'ERROR',
    validate: (room: Room) => {
      if ([RoomType.RESIDENT_SHARED, RoomType.BATHROOM, RoomType.SHOWER_ROOM].includes(room.type)) {
        return room.accessibility?.isWheelchairAccessible === true;
      }
      return true;
    },
    message: (room: Room) => `Room ${room.number} must be wheelchair accessible`
  },

  // Care Level Validations
  {
    id: 'skilled-nursing-requirements',
    name: 'Skilled Nursing Requirements',
    description: 'Validates requirements for skilled nursing rooms',
    severity: 'ERROR',
    validate: (room: Room) => {
      if (room.careLevels.includes(CareLevel.SKILLED_NURSING)) {
        return room.emergencyEquipment?.hasOxygenSupply === true &&
               room.accessibility?.isWheelchairAccessible === true;
      }
      return true;
    },
    message: (room: Room) => `Room ${room.number} doesn't meet skilled nursing requirements`
  },

  // Occupancy Validations
  {
    id: 'max-occupancy',
    name: 'Maximum Occupancy',
    description: 'Validates room occupancy against maximum capacity',
    severity: 'ERROR',
    validate: (room: Room) => room.currentOccupancy <= room.capacity,
    message: (room: Room) => `Room ${room.number} exceeds maximum occupancy`
  },

  // Maintenance Validations
  {
    id: 'maintenance-schedule',
    name: 'Maintenance Schedule',
    description: 'Checks if room maintenance is up to date',
    severity: 'WARNING',
    validate: (room: Room) => {
      if (!room.lastMaintenance) return false;
      const daysSinceLastMaintenance = Math.floor(
        (Date.now() - room.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastMaintenance <= 90; // 90 days maintenance interval
    },
    message: (room: Room) => `Room ${room.number} maintenance check overdue`
  },

  // Cleaning Validations
  {
    id: 'cleaning-schedule',
    name: 'Cleaning Schedule',
    description: 'Checks if room cleaning is up to date',
    severity: 'WARNING',
    validate: (room: Room) => {
      if (!room.lastCleaned) return false;
      const hoursSinceLastCleaning = Math.floor(
        (Date.now() - room.lastCleaned.getTime()) / (1000 * 60 * 60)
      );
      return hoursSinceLastCleaning <= 24; // Daily cleaning requirement
    },
    message: (room: Room) => `Room ${room.number} cleaning check overdue`
  },

  // Nursing Station Coverage
  {
    id: 'nursing-station-coverage',
    name: 'Nursing Station Coverage',
    description: 'Validates room proximity to nursing station',
    severity: 'WARNING',
    validate: (room: Room, floorPlan: FloorPlan) => {
      if ([RoomType.RESIDENT_SINGLE, RoomType.RESIDENT_SHARED].includes(room.type)) {
        // Check if room is within coverage area of any nursing station
        return floorPlan.nursingStations.some(station => {
          const distance = Math.sqrt(
            Math.pow(station.x - room.coordinates.x, 2) +
            Math.pow(station.y - room.coordinates.y, 2)
          );
          return distance <= station.coverageArea;
        });
      }
      return true;
    },
    message: (room: Room) => `Room ${room.number} outside nursing station coverage area`
  },

  // Emergency Exit Access
  {
    id: 'emergency-exit-access',
    name: 'Emergency Exit Access',
    description: 'Validates room distance to nearest emergency exit',
    severity: 'WARNING',
    validate: (room: Room, floorPlan: FloorPlan) => {
      const MAX_DISTANCE_TO_EXIT = 100; // feet
      return floorPlan.emergencyExits.some(exit => {
        const distance = Math.sqrt(
          Math.pow(exit.x - room.coordinates.x, 2) +
          Math.pow(exit.y - room.coordinates.y, 2)
        );
        return distance <= MAX_DISTANCE_TO_EXIT;
      });
    },
    message: (room: Room) => `Room ${room.number} too far from emergency exit`
  }
];

export function validateRoom(room: Room, floorPlan: FloorPlan) {
  return careHomeValidations.map(rule => ({
    rule,
    passed: rule.validate(room, floorPlan),
    message: rule.message(room)
  }));
}


