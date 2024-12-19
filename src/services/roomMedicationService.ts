import { Room, RoomType } from '@/types/floorPlan';
import { MedicationSchedule, MedicationStatus } from '@/types/medication';

interface MedicationZone {
  roomId: string;
  scheduleCount: number;
  nextSchedule?: Date;
  requiresRefrigeration: boolean;
  requiresControlledStorage: boolean;
}

interface MedicationRoute {
  zones: MedicationZone[];
  optimizedPath: Room[];
  estimatedDuration: number; // in minutes
}

export class RoomMedicationService {
  static async getMedicationZones(
    rooms: Room[],
    medicationSchedules: MedicationSchedule[]
  ): Promise<MedicationZone[]> {
    return rooms
      .filter(room => room.type === RoomType.RESIDENT_SINGLE || 
                     room.type === RoomType.RESIDENT_SHARED)
      .map(room => {
        const roomSchedules = medicationSchedules.filter(
          schedule => schedule.roomId === room.id
        );

        return {
          roomId: room.id,
          scheduleCount: roomSchedules.length,
          nextSchedule: this.getNextSchedule(roomSchedules),
          requiresRefrigeration: roomSchedules.some(s => s.requiresRefrigeration),
          requiresControlledStorage: roomSchedules.some(s => s.isControlled)
        };
      })
      .filter(zone => zone.scheduleCount > 0);
  }

  private static getNextSchedule(schedules: MedicationSchedule[]): Date | undefined {
    const upcoming = schedules
      .filter(s => s.status === MedicationStatus.SCHEDULED)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
    return upcoming[0]?.scheduledTime;
  }

  static async optimizeMedicationRoute(
    rooms: Room[],
    medicationZones: MedicationZone[]
  ): Promise<MedicationRoute> {
    // Start from medication room
    const medicationRoom = rooms.find(r => r.type === RoomType.MEDICATION_ROOM);
    if (!medicationRoom) {
      throw new Error('No medication room found in floor plan');
    }

    // Sort zones by priority and proximity
    const sortedZones = [...medicationZones].sort((a, b) => {
      // First sort by schedule time
      if (a.nextSchedule && b.nextSchedule) {
        return a.nextSchedule.getTime() - b.nextSchedule.getTime();
      }
      return 0;
    });

    // Calculate optimal path
    const path = [medicationRoom];
    let currentRoom = medicationRoom;
    const remainingZones = new Set(sortedZones.map(z => z.roomId));

    while (remainingZones.size > 0) {
      let nearestRoom = this.findNearestRoom(
        currentRoom,
        rooms.filter(r => remainingZones.has(r.id))
      );
      if (nearestRoom) {
        path.push(nearestRoom);
        remainingZones.delete(nearestRoom.id);
        currentRoom = nearestRoom;
      }
    }

    // Return to medication room
    path.push(medicationRoom);

    return {
      zones: sortedZones,
      optimizedPath: path,
      estimatedDuration: this.calculateRouteDuration(path, sortedZones)
    };
  }

  private static findNearestRoom(current: Room, candidates: Room[]): Room | null {
    return candidates.reduce((nearest, room) => {
      const distance = Math.sqrt(
        Math.pow(room.coordinates.x - current.coordinates.x, 2) +
        Math.pow(room.coordinates.y - current.coordinates.y, 2)
      );
      
      if (!nearest || distance < this.calculateDistance(current, nearest)) {
        return room;
      }
      return nearest;
    }, null as Room | null);
  }

  private static calculateDistance(room1: Room, room2: Room): number {
    return Math.sqrt(
      Math.pow(room2.coordinates.x - room1.coordinates.x, 2) +
      Math.pow(room2.coordinates.y - room1.coordinates.y, 2)
    );
  }

  private static calculateRouteDuration(
    path: Room[],
    zones: MedicationZone[]
  ): number {
    const AVERAGE_WALKING_SPEED = 3; // feet per second
    const AVERAGE_MEDICATION_TIME = 3; // minutes per room

    let totalDuration = 0;

    // Calculate walking time
    for (let i = 0; i < path.length - 1; i++) {
      const distance = this.calculateDistance(path[i], path[i + 1]);
      totalDuration += (distance / AVERAGE_WALKING_SPEED) / 60; // Convert to minutes
    }

    // Add medication administration time
    totalDuration += zones.length * AVERAGE_MEDICATION_TIME;

    return Math.ceil(totalDuration);
  }

  static validateMedicationStorage(room: Room): string[] {
    const issues: string[] = [];

    if (room.type === RoomType.MEDICATION_ROOM) {
      if (!room.emergencyEquipment?.hasCallButton) {
        issues.push('Medication room requires emergency call button');
      }

      // Temperature monitoring
      if (!room.amenities.some(a => a.id === 'temp-monitor')) {
        issues.push('Temperature monitoring system required');
      }

      // Controlled substance storage
      if (!room.amenities.some(a => a.id === 'controlled-cabinet')) {
        issues.push('Controlled substance storage cabinet required');
      }

      // Refrigeration
      if (!room.amenities.some(a => a.id === 'med-fridge')) {
        issues.push('Medication refrigerator required');
      }
    }

    return issues;
  }
}


