import { Room, RoomType, FloorPlan, CareLevel } from '@/types/floorPlan';

export interface EmergencyRoute {
  path: { x: number; y: number }[];
  distance: number;
  isAccessible: boolean;
}

export interface EmergencyZone {
  id: string;
  level: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  rooms: Room[];
  nursingStation?: { x: number; y: number };
  emergencyExit: { x: number; y: number };
}

export interface EmergencyResponse {
  zones: EmergencyZone[];
  evacuationRoutes: Map<string, EmergencyRoute>;
  priorityRooms: Room[];
}

export class EmergencyResponseService {
  private static calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  private static getPriorityScore(room: Room): number {
    let score = 0;

    // Care level priorities
    if (room.careLevels.includes(CareLevel.SKILLED_NURSING)) score += 5;
    if (room.careLevels.includes(CareLevel.PALLIATIVE)) score += 5;
    if (room.careLevels.includes(CareLevel.MEMORY_CARE)) score += 4;
    if (room.careLevels.includes(CareLevel.ASSISTED)) score += 3;
    
    // Occupancy factor
    score += room.currentOccupancy;

    // Mobility factor
    if (room.accessibility?.isWheelchairAccessible) score += 2;

    return score;
  }

  static generateEmergencyPlan(floorPlan: FloorPlan): EmergencyResponse {
    const zones: EmergencyZone[] = [];
    const evacuationRoutes = new Map<string, EmergencyRoute>();
    const priorityRooms: Room[] = [];

    // Sort rooms by priority
    const sortedRooms = [...floorPlan.rooms].sort((a, b) => 
      this.getPriorityScore(b) - this.getPriorityScore(a)
    );

    // Assign zones based on proximity to emergency exits
    floorPlan.emergencyExits.forEach((exit, index) => {
      const nearbyRooms = sortedRooms.filter(room => 
        this.calculateDistance(exit, room.coordinates) <= 100
      );

      const nearestNursingStation = floorPlan.nursingStations.reduce((nearest, station) => {
        const distanceToExit = this.calculateDistance(exit, station);
        const currentNearest = nearest ? this.calculateDistance(exit, nearest) : Infinity;
        return distanceToExit < currentNearest ? station : nearest;
      }, null);

      zones.push({
        id: `zone-${index + 1}`,
        level: index === 0 ? 'PRIMARY' : 'SECONDARY',
        rooms: nearbyRooms,
        nursingStation: nearestNursingStation,
        emergencyExit: exit
      });
    });

    // Generate evacuation routes for each room
    floorPlan.rooms.forEach(room => {
      const nearestExit = floorPlan.emergencyExits.reduce((nearest, exit) => {
        const distance = this.calculateDistance(room.coordinates, exit);
        const currentNearest = nearest ? 
          this.calculateDistance(room.coordinates, nearest) : Infinity;
        return distance < currentNearest ? exit : nearest;
      });

      if (nearestExit) {
        const route: EmergencyRoute = {
          path: [
            { x: room.coordinates.x, y: room.coordinates.y },
            { x: nearestExit.x, y: nearestExit.y }
          ],
          distance: this.calculateDistance(room.coordinates, nearestExit),
          isAccessible: room.accessibility?.isWheelchairAccessible || false
        };
        evacuationRoutes.set(room.id, route);
      }
    });

    // Identify priority rooms
    priorityRooms.push(
      ...sortedRooms.filter(room => 
        room.type === RoomType.ISOLATION_ROOM ||
        room.careLevels.includes(CareLevel.SKILLED_NURSING) ||
        room.careLevels.includes(CareLevel.PALLIATIVE)
      )
    );

    return {
      zones,
      evacuationRoutes,
      priorityRooms
    };
  }

  static getEmergencyInstructions(room: Room, floorPlan: FloorPlan): string[] {
    const instructions: string[] = [];
    const route = this.generateEmergencyPlan(floorPlan).evacuationRoutes.get(room.id);

    if (!route) {
      instructions.push('ERROR: No evacuation route found');
      return instructions;
    }

    // Basic instructions
    instructions.push(`1. Remain calm and assess the situation`);
    instructions.push(`2. Check room occupants' mobility status`);

    // Room-specific instructions
    switch (room.type) {
      case RoomType.ISOLATION_ROOM:
        instructions.push(`3. Don appropriate PPE before entering`);
        instructions.push(`4. Follow isolation protocols during evacuation`);
        break;
      case RoomType.RESIDENT_SHARED:
        instructions.push(`3. Account for all residents`);
        instructions.push(`4. Assist less mobile residents first`);
        break;
      case RoomType.MEDICATION_ROOM:
        instructions.push(`3. Secure all medications if possible`);
        instructions.push(`4. Lock medication storage units`);
        break;
    }

    // Evacuation instructions
    instructions.push(`5. Distance to nearest exit: ${Math.round(route.distance)} feet`);
    instructions.push(`6. Exit location: ${route.path[route.path.length - 1].x}, ${route.path[route.path.length - 1].y}`);
    
    if (room.accessibility?.isWheelchairAccessible) {
      instructions.push(`7. Use wheelchair evacuation route`);
    }

    // Care level specific instructions
    if (room.careLevels.includes(CareLevel.SKILLED_NURSING)) {
      instructions.push(`8. Priority evacuation required`);
      instructions.push(`9. Medical equipment: Ensure portable oxygen if needed`);
    }

    return instructions;
  }
}


