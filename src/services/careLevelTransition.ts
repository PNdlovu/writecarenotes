import { Room, CareLevel, RoomType, FloorPlan } from '@/types/floorPlan';

interface CareTransition {
  residentId: string;
  fromLevel: CareLevel;
  toLevel: CareLevel;
  reason: string;
  requiredDate: Date;
  specialRequirements?: string[];
}

interface TransitionPlan {
  currentRoom: Room;
  targetRoom?: Room;
  requiresMove: boolean;
  roomModifications: string[];
  staffingChanges: {
    nurses: number;
    caregivers: number;
  };
  equipmentNeeded: string[];
  estimatedDuration: number; // in days
}

export class CareLevelTransitionService {
  private static readonly TRANSITION_REQUIREMENTS = {
    [CareLevel.INDEPENDENT]: {
      to: {
        [CareLevel.ASSISTED]: {
          assessment: true,
          equipmentNeeded: ['Mobility Aids'],
          staffingChange: { nurses: 0.1, caregivers: 0.2 }
        }
      }
    },
    [CareLevel.ASSISTED]: {
      to: {
        [CareLevel.MEMORY_CARE]: {
          assessment: true,
          equipmentNeeded: ['Security Devices', 'Monitoring Equipment'],
          staffingChange: { nurses: 0.2, caregivers: 0.3 }
        },
        [CareLevel.SKILLED_NURSING]: {
          assessment: true,
          equipmentNeeded: ['Medical Equipment', 'Monitoring Devices'],
          staffingChange: { nurses: 0.3, caregivers: 0.2 }
        }
      }
    },
    [CareLevel.MEMORY_CARE]: {
      to: {
        [CareLevel.SKILLED_NURSING]: {
          assessment: true,
          equipmentNeeded: ['Medical Equipment', 'Specialized Monitoring'],
          staffingChange: { nurses: 0.2, caregivers: 0.1 }
        }
      }
    },
    [CareLevel.SKILLED_NURSING]: {
      to: {
        [CareLevel.PALLIATIVE]: {
          assessment: true,
          equipmentNeeded: ['Pain Management Equipment', 'Comfort Devices'],
          staffingChange: { nurses: 0.4, caregivers: 0.3 }
        }
      }
    }
  };

  static async planTransition(
    transition: CareTransition,
    currentRoom: Room,
    floorPlan: FloorPlan
  ): Promise<TransitionPlan> {
    const requirements = this.TRANSITION_REQUIREMENTS[transition.fromLevel]?.to[transition.toLevel];
    if (!requirements) {
      throw new Error('Invalid care level transition path');
    }

    // Check if current room can support new care level
    const canStayInCurrentRoom = this.validateRoomForCareLevel(
      currentRoom,
      transition.toLevel
    );

    let targetRoom: Room | undefined;
    if (!canStayInCurrentRoom) {
      targetRoom = this.findSuitableRoom(floorPlan, transition);
    }

    const roomModifications: string[] = [];
    if (canStayInCurrentRoom) {
      // Determine needed modifications for current room
      roomModifications.push(...this.getRequiredModifications(
        currentRoom,
        transition.toLevel
      ));
    }

    return {
      currentRoom,
      targetRoom,
      requiresMove: !canStayInCurrentRoom,
      roomModifications,
      staffingChanges: requirements.staffingChange,
      equipmentNeeded: requirements.equipmentNeeded,
      estimatedDuration: this.estimateTransitionDuration(transition)
    };
  }

  private static validateRoomForCareLevel(
    room: Room,
    careLevel: CareLevel
  ): boolean {
    switch (careLevel) {
      case CareLevel.SKILLED_NURSING:
        return room.emergencyEquipment?.hasOxygenSupply === true &&
               room.emergencyEquipment?.hasCallButton === true &&
               room.accessibility?.isWheelchairAccessible === true;

      case CareLevel.MEMORY_CARE:
        return room.type === RoomType.RESIDENT_SINGLE &&
               room.emergencyEquipment?.hasCallButton === true;

      case CareLevel.PALLIATIVE:
        return room.type === RoomType.RESIDENT_SINGLE &&
               room.emergencyEquipment?.hasOxygenSupply === true &&
               room.emergencyEquipment?.hasCallButton === true &&
               room.accessibility?.isWheelchairAccessible === true;

      default:
        return true;
    }
  }

  private static findSuitableRoom(
    floorPlan: FloorPlan,
    transition: CareTransition
  ): Room | undefined {
    return floorPlan.rooms.find(room => 
      room.status === 'VACANT' &&
      this.validateRoomForCareLevel(room, transition.toLevel)
    );
  }

  private static getRequiredModifications(
    room: Room,
    targetCareLevel: CareLevel
  ): string[] {
    const modifications: string[] = [];

    switch (targetCareLevel) {
      case CareLevel.SKILLED_NURSING:
        if (!room.emergencyEquipment?.hasOxygenSupply) {
          modifications.push('Install oxygen supply');
        }
        if (!room.emergencyEquipment?.hasCallButton) {
          modifications.push('Install nurse call system');
        }
        if (!room.accessibility?.isWheelchairAccessible) {
          modifications.push('Modify for wheelchair accessibility');
        }
        break;

      case CareLevel.MEMORY_CARE:
        if (!room.emergencyEquipment?.hasCallButton) {
          modifications.push('Install nurse call system');
        }
        modifications.push('Install security features');
        modifications.push('Add visual cues and signage');
        break;

      case CareLevel.PALLIATIVE:
        if (!room.emergencyEquipment?.hasOxygenSupply) {
          modifications.push('Install oxygen supply');
        }
        if (!room.accessibility?.hasAdjustableBed) {
          modifications.push('Install adjustable bed');
        }
        modifications.push('Enhance comfort features');
        break;
    }

    return modifications;
  }

  private static estimateTransitionDuration(transition: CareTransition): number {
    // Base duration in days
    let duration = 1;

    // Add time for assessments
    if (this.TRANSITION_REQUIREMENTS[transition.fromLevel]?.to[transition.toLevel]?.assessment) {
      duration += 2;
    }

    // Add time based on care level change
    switch (transition.toLevel) {
      case CareLevel.MEMORY_CARE:
        duration += 7; // Adjustment period
        break;
      case CareLevel.SKILLED_NURSING:
        duration += 3; // Medical setup
        break;
      case CareLevel.PALLIATIVE:
        duration += 2; // Immediate transition
        break;
    }

    return duration;
  }

  static validateTransitionPath(
    fromLevel: CareLevel,
    toLevel: CareLevel
  ): { isValid: boolean; reason?: string } {
    // Define valid transition paths
    const validPaths = {
      [CareLevel.INDEPENDENT]: [CareLevel.ASSISTED],
      [CareLevel.ASSISTED]: [CareLevel.MEMORY_CARE, CareLevel.SKILLED_NURSING],
      [CareLevel.MEMORY_CARE]: [CareLevel.SKILLED_NURSING],
      [CareLevel.SKILLED_NURSING]: [CareLevel.PALLIATIVE],
      [CareLevel.PALLIATIVE]: []
    };

    if (!validPaths[fromLevel]?.includes(toLevel)) {
      return {
        isValid: false,
        reason: `Invalid transition from ${fromLevel} to ${toLevel}`
      };
    }

    return { isValid: true };
  }
}


