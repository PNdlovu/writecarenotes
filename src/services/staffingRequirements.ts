import { Room, CareLevel, RoomType, FloorPlan } from '@/types/floorPlan';

interface StaffMember {
  id: string;
  type: 'NURSE' | 'CAREGIVER' | 'SPECIALIST';
  shift: 'DAY' | 'EVENING' | 'NIGHT';
  specializations?: string[];
}

interface StaffingRequirement {
  nurses: number;
  caregivers: number;
  specialists?: {
    type: string;
    count: number;
  }[];
}

interface ShiftCoverage {
  shift: 'DAY' | 'EVENING' | 'NIGHT';
  requirements: StaffingRequirement;
  zones: {
    zoneId: string;
    requirements: StaffingRequirement;
  }[];
}

export class StaffingRequirementsService {
  private static readonly CARE_LEVEL_RATIOS = {
    [CareLevel.INDEPENDENT]: {
      nurses: 1/30,    // 1 nurse per 30 residents
      caregivers: 1/15 // 1 caregiver per 15 residents
    },
    [CareLevel.ASSISTED]: {
      nurses: 1/20,
      caregivers: 1/10
    },
    [CareLevel.MEMORY_CARE]: {
      nurses: 1/15,
      caregivers: 1/8
    },
    [CareLevel.SKILLED_NURSING]: {
      nurses: 1/10,
      caregivers: 1/6
    },
    [CareLevel.PALLIATIVE]: {
      nurses: 1/5,
      caregivers: 1/3
    }
  };

  private static readonly SHIFT_FACTORS = {
    DAY: 1,
    EVENING: 0.8,
    NIGHT: 0.6
  };

  private static calculateBaseRequirements(rooms: Room[]): StaffingRequirement {
    let totalNurses = 0;
    let totalCaregivers = 0;
    const specialists = new Map<string, number>();

    rooms.forEach(room => {
      // Calculate requirements based on care levels
      room.careLevels.forEach(careLevel => {
        const ratio = this.CARE_LEVEL_RATIOS[careLevel];
        totalNurses += room.currentOccupancy * ratio.nurses;
        totalCaregivers += room.currentOccupancy * ratio.caregivers;
      });

      // Add room-specific requirements
      switch (room.type) {
        case RoomType.ISOLATION_ROOM:
          if (room.currentOccupancy > 0) {
            totalNurses += 0.5; // Additional 0.5 nurse for isolation rooms
          }
          break;
        case RoomType.TREATMENT_ROOM:
          specialists.set('Physical Therapist', 
            (specialists.get('Physical Therapist') || 0) + 0.25);
          break;
        case RoomType.MEDICATION_ROOM:
          specialists.set('Pharmacist', 
            (specialists.get('Pharmacist') || 0) + 0.2);
          break;
      }
    });

    return {
      nurses: Math.ceil(totalNurses),
      caregivers: Math.ceil(totalCaregivers),
      specialists: Array.from(specialists.entries()).map(([type, count]) => ({
        type,
        count: Math.ceil(count)
      }))
    };
  }

  static calculateShiftRequirements(floorPlan: FloorPlan): ShiftCoverage[] {
    const shifts: ('DAY' | 'EVENING' | 'NIGHT')[] = ['DAY', 'EVENING', 'NIGHT'];
    
    return shifts.map(shift => {
      const baseRequirements = this.calculateBaseRequirements(floorPlan.rooms);
      const shiftFactor = this.SHIFT_FACTORS[shift];

      // Calculate zone-specific requirements
      const zones = this.calculateZoneRequirements(floorPlan, shift);

      return {
        shift,
        requirements: {
          nurses: Math.ceil(baseRequirements.nurses * shiftFactor),
          caregivers: Math.ceil(baseRequirements.caregivers * shiftFactor),
          specialists: baseRequirements.specialists?.map(spec => ({
            type: spec.type,
            count: Math.ceil(spec.count * shiftFactor)
          }))
        },
        zones
      };
    });
  }

  private static calculateZoneRequirements(
    floorPlan: FloorPlan,
    shift: 'DAY' | 'EVENING' | 'NIGHT'
  ) {
    // Group rooms by nursing station coverage
    const zones = floorPlan.nursingStations.map(station => {
      const nearbyRooms = floorPlan.rooms.filter(room => {
        const distance = Math.sqrt(
          Math.pow(station.x - room.coordinates.x, 2) +
          Math.pow(station.y - room.coordinates.y, 2)
        );
        return distance <= station.coverageArea;
      });

      const zoneRequirements = this.calculateBaseRequirements(nearbyRooms);
      const shiftFactor = this.SHIFT_FACTORS[shift];

      return {
        zoneId: station.id,
        requirements: {
          nurses: Math.ceil(zoneRequirements.nurses * shiftFactor),
          caregivers: Math.ceil(zoneRequirements.caregivers * shiftFactor),
          specialists: zoneRequirements.specialists?.map(spec => ({
            type: spec.type,
            count: Math.ceil(spec.count * shiftFactor)
          }))
        }
      };
    });

    return zones;
  }

  static validateStaffingLevel(
    floorPlan: FloorPlan,
    currentStaff: StaffMember[],
    shift: 'DAY' | 'EVENING' | 'NIGHT'
  ): { 
    isValid: boolean;
    shortages: StaffingRequirement;
    recommendations: string[];
  } {
    const requirements = this.calculateShiftRequirements(floorPlan)
      .find(s => s.shift === shift)!;

    const currentNurses = currentStaff.filter(s => 
      s.type === 'NURSE' && s.shift === shift).length;
    const currentCaregivers = currentStaff.filter(s => 
      s.type === 'CAREGIVER' && s.shift === shift).length;
    const currentSpecialists = currentStaff.filter(s => 
      s.type === 'SPECIALIST' && s.shift === shift);

    const shortages = {
      nurses: Math.max(0, requirements.requirements.nurses - currentNurses),
      caregivers: Math.max(0, requirements.requirements.caregivers - currentCaregivers),
      specialists: requirements.requirements.specialists?.map(req => ({
        type: req.type,
        count: Math.max(0, req.count - 
          currentSpecialists.filter(s => 
            s.specializations?.includes(req.type)).length)
      })).filter(s => s.count > 0)
    };

    const recommendations: string[] = [];
    
    if (shortages.nurses > 0) {
      recommendations.push(`Need ${shortages.nurses} more nurses for ${shift} shift`);
    }
    if (shortages.caregivers > 0) {
      recommendations.push(`Need ${shortages.caregivers} more caregivers for ${shift} shift`);
    }
    shortages.specialists?.forEach(shortage => {
      recommendations.push(`Need ${shortage.count} more ${shortage.type}s for ${shift} shift`);
    });

    // Zone-specific recommendations
    requirements.zones.forEach(zone => {
      const zoneStaff = currentStaff.filter(s => 
        s.shift === shift /* && s.zoneId === zone.zoneId */);
      const zoneNurses = zoneStaff.filter(s => s.type === 'NURSE').length;
      const zoneCaregivers = zoneStaff.filter(s => s.type === 'CAREGIVER').length;

      if (zoneNurses < zone.requirements.nurses) {
        recommendations.push(
          `Zone ${zone.zoneId} needs ${zone.requirements.nurses - zoneNurses} more nurses`
        );
      }
      if (zoneCaregivers < zone.requirements.caregivers) {
        recommendations.push(
          `Zone ${zone.zoneId} needs ${zone.requirements.caregivers - zoneCaregivers} more caregivers`
        );
      }
    });

    return {
      isValid: Object.values(shortages).every(v => 
        typeof v === 'number' ? v === 0 : v?.length === 0),
      shortages,
      recommendations
    };
  }
}


