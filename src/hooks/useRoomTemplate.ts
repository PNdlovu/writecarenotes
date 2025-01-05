import { useMemo } from 'react';
import { Room, RoomType, RoomTemplate, RoomAmenity, CareLevel } from '@/types/floorPlan';
import { roomTemplates } from '@/data/roomTemplates';

interface ValidationResult {
  isValid: boolean;
  violations: string[];
}

export function useRoomTemplate(roomType: RoomType) {
  const template = useMemo(() => roomTemplates[roomType], [roomType]);

  const validateRoom = (room: Room): ValidationResult => {
    const violations: string[] = [];

    // Check minimum area
    if (room.area < template.minimumArea) {
      violations.push(`Room area (${room.area} sq ft) is below minimum requirement (${template.minimumArea} sq ft)`);
    }

    // Check required amenities
    const missingAmenities = template.requiredAmenities.filter(
      required => !room.amenities.find(a => a.id === required.id)
    );
    if (missingAmenities.length > 0) {
      violations.push(`Missing required amenities: ${missingAmenities.map(a => a.name).join(', ')}`);
    }

    // Check capacity
    if (room.capacity < template.defaultCapacity) {
      violations.push(`Room capacity (${room.capacity}) is below minimum requirement (${template.defaultCapacity})`);
    }

    // Check care level compatibility
    if (template.careLevel.length > 0 && room.careLevels.length > 0) {
      const invalidCareLevels = room.careLevels.filter(
        level => !template.careLevel.includes(level)
      );
      if (invalidCareLevels.length > 0) {
        violations.push(`Incompatible care levels: ${invalidCareLevels.join(', ')}`);
      }
    }

    // Specific validations for different room types
    switch (roomType) {
      case RoomType.ISOLATION_ROOM:
        if (!room.emergencyEquipment?.hasOxygenSupply) {
          violations.push('Isolation room requires oxygen supply');
        }
        break;
      case RoomType.MEDICATION_ROOM:
        // Add specific medication room validations
        break;
      case RoomType.NURSING_STATION:
        if (!template.staffingRequirements) break;
        // Add nursing station specific validations
        break;
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  };

  const getRecommendedUpgrades = (room: Room): RoomAmenity[] => {
    return template.recommendedAmenities.filter(
      recommended => !room.amenities.find(a => a.id === recommended.id)
    );
  };

  const getStaffingRequirements = (careLevels: CareLevel[]) => {
    if (!template.staffingRequirements) return null;

    // Calculate staffing based on care levels
    const baseStaffing = template.staffingRequirements;
    const additionalStaff = careLevels.reduce((acc, level) => {
      switch (level) {
        case CareLevel.SKILLED_NURSING:
          return { nurses: acc.nurses + 1, caregivers: acc.caregivers };
        case CareLevel.MEMORY_CARE:
          return { nurses: acc.nurses, caregivers: acc.caregivers + 1 };
        case CareLevel.PALLIATIVE:
          return { nurses: acc.nurses + 1, caregivers: acc.caregivers + 1 };
        default:
          return acc;
      }
    }, { nurses: 0, caregivers: 0 });

    return {
      nurses: (baseStaffing.nurses || 0) + additionalStaff.nurses,
      caregivers: (baseStaffing.caregivers || 0) + additionalStaff.caregivers
    };
  };

  return {
    template,
    validateRoom,
    getRecommendedUpgrades,
    getStaffingRequirements
  };
}


