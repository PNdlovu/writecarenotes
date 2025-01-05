import { Room, CareLevel, RoomType, FloorPlan, Assignment } from '@/types/floorPlan';

interface RoomScore {
  room: Room;
  score: number;
  reasons: string[];
}

interface AssignmentCriteria {
  residentId: string;
  careLevels: CareLevel[];
  preferences?: {
    floorLevel?: number;
    nearWindow?: boolean;
    privateRoom?: boolean;
    nearNursingStation?: boolean;
  };
  accessibility?: {
    requiresWheelchairAccess: boolean;
    requiresOxygen: boolean;
    requiresSpecialEquipment: boolean;
  };
}

export class RoomAssignmentService {
  private static calculateRoomScore(
    room: Room,
    criteria: AssignmentCriteria,
    floorPlan: FloorPlan
  ): RoomScore {
    let score = 0;
    const reasons: string[] = [];

    // Check if room is available
    if (room.status !== 'VACANT') {
      return { room, score: -1, reasons: ['Room is not vacant'] };
    }

    // Care Level Compatibility
    const careLevelMatch = criteria.careLevels.every(level => 
      room.careLevels.includes(level)
    );
    if (!careLevelMatch) {
      return { room, score: -1, reasons: ['Care level incompatible'] };
    }

    // Accessibility Requirements
    if (criteria.accessibility) {
      if (criteria.accessibility.requiresWheelchairAccess && 
          !room.accessibility?.isWheelchairAccessible) {
        return { room, score: -1, reasons: ['Not wheelchair accessible'] };
      }

      if (criteria.accessibility.requiresOxygen && 
          !room.emergencyEquipment?.hasOxygenSupply) {
        return { room, score: -1, reasons: ['No oxygen supply'] };
      }
    }

    // Room Type Scoring
    if (room.type === RoomType.RESIDENT_SINGLE && criteria.preferences?.privateRoom) {
      score += 10;
      reasons.push('Private room preference met');
    }

    // Nursing Station Proximity
    if (criteria.preferences?.nearNursingStation) {
      const nearestNursingStation = floorPlan.nursingStations.reduce((nearest, station) => {
        const distance = Math.sqrt(
          Math.pow(station.x - room.coordinates.x, 2) +
          Math.pow(station.y - room.coordinates.y, 2)
        );
        return distance < nearest ? distance : nearest;
      }, Infinity);

      if (nearestNursingStation <= 50) { // Within 50 feet
        score += 5;
        reasons.push('Close to nursing station');
      }
    }

    // Care Level Specific Scoring
    if (criteria.careLevels.includes(CareLevel.SKILLED_NURSING)) {
      if (room.emergencyEquipment?.hasCallButton) score += 3;
      if (room.emergencyEquipment?.hasOxygenSupply) score += 3;
      reasons.push('Meets skilled nursing requirements');
    }

    if (criteria.careLevels.includes(CareLevel.MEMORY_CARE)) {
      const hasNearbyNursingStation = floorPlan.nursingStations.some(station => {
        const distance = Math.sqrt(
          Math.pow(station.x - room.coordinates.x, 2) +
          Math.pow(station.y - room.coordinates.y, 2)
        );
        return distance <= 30; // Within 30 feet
      });
      if (hasNearbyNursingStation) {
        score += 5;
        reasons.push('Suitable for memory care monitoring');
      }
    }

    return { room, score, reasons };
  }

  static findBestRoom(
    floorPlan: FloorPlan,
    criteria: AssignmentCriteria
  ): RoomScore | null {
    const scores = floorPlan.rooms
      .map(room => this.calculateRoomScore(room, criteria, floorPlan))
      .filter(score => score.score >= 0)
      .sort((a, b) => b.score - a.score);

    return scores.length > 0 ? scores[0] : null;
  }

  static validateAssignment(
    assignment: Assignment,
    room: Room,
    criteria: AssignmentCriteria
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Validate care level compatibility
    if (!criteria.careLevels.includes(assignment.careLevel)) {
      issues.push(`Assignment care level ${assignment.careLevel} not in resident's care levels`);
    }

    // Validate room capacity
    if (room.currentOccupancy >= room.capacity) {
      issues.push('Room is at maximum capacity');
    }

    // Validate accessibility requirements
    if (criteria.accessibility?.requiresWheelchairAccess && 
        !room.accessibility?.isWheelchairAccessible) {
      issues.push('Room does not meet wheelchair accessibility requirements');
    }

    // Validate medical equipment requirements
    if (criteria.accessibility?.requiresOxygen && 
        !room.emergencyEquipment?.hasOxygenSupply) {
      issues.push('Room does not have required oxygen supply');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  static generateAssignmentPlan(
    bestRoom: RoomScore,
    criteria: AssignmentCriteria
  ): Assignment {
    return {
      id: `assignment-${Date.now()}`,
      roomId: bestRoom.room.id,
      residentId: criteria.residentId,
      startDate: new Date(),
      careLevel: criteria.careLevels[0], // Primary care level
      status: 'SCHEDULED',
      specialRequirements: [
        ...(criteria.accessibility?.requiresWheelchairAccess ? ['Wheelchair Access'] : []),
        ...(criteria.accessibility?.requiresOxygen ? ['Oxygen Supply'] : []),
        ...(criteria.accessibility?.requiresSpecialEquipment ? ['Special Equipment'] : [])
      ]
    };
  }
}


