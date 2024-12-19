import { Room, RoomType, CareLevel } from '@/types/floorPlan';

interface VisitorPolicy {
  maxVisitors: number;
  allowedTimes: {
    start: string; // HH:mm format
    end: string;
  };
  restrictions: string[];
  requiresScreening: boolean;
}

interface VisitorSchedule {
  roomId: string;
  visitorCount: number;
  startTime: Date;
  endTime: Date;
  screened: boolean;
}

export class VisitorManagementService {
  private static readonly DEFAULT_POLICIES: Record<CareLevel, VisitorPolicy> = {
    [CareLevel.INDEPENDENT]: {
      maxVisitors: 4,
      allowedTimes: { start: '08:00', end: '20:00' },
      restrictions: ['Must sign in at front desk'],
      requiresScreening: false
    },
    [CareLevel.ASSISTED]: {
      maxVisitors: 3,
      allowedTimes: { start: '09:00', end: '19:00' },
      restrictions: ['Must sign in at front desk', 'Staff notification required'],
      requiresScreening: false
    },
    [CareLevel.MEMORY_CARE]: {
      maxVisitors: 2,
      allowedTimes: { start: '10:00', end: '18:00' },
      restrictions: [
        'Must be accompanied by staff',
        'Familiar visitors only',
        'Quiet hours must be respected'
      ],
      requiresScreening: true
    },
    [CareLevel.SKILLED_NURSING]: {
      maxVisitors: 2,
      allowedTimes: { start: '10:00', end: '18:00' },
      restrictions: [
        'Must sign in at nursing station',
        'PPE may be required',
        'Staff supervision required'
      ],
      requiresScreening: true
    },
    [CareLevel.PALLIATIVE]: {
      maxVisitors: 4,
      allowedTimes: { start: '00:00', end: '23:59' },
      restrictions: [
        'Must sign in at nursing station',
        'PPE may be required'
      ],
      requiresScreening: true
    }
  };

  static getVisitorPolicy(room: Room): VisitorPolicy {
    // Get most restrictive care level policy
    return room.careLevels.reduce((policy, careLevel) => {
      const levelPolicy = this.DEFAULT_POLICIES[careLevel];
      return {
        maxVisitors: Math.min(policy.maxVisitors, levelPolicy.maxVisitors),
        allowedTimes: {
          start: policy.allowedTimes.start > levelPolicy.allowedTimes.start ? 
            policy.allowedTimes.start : levelPolicy.allowedTimes.start,
          end: policy.allowedTimes.end < levelPolicy.allowedTimes.end ?
            policy.allowedTimes.end : levelPolicy.allowedTimes.end
        },
        restrictions: [...new Set([...policy.restrictions, ...levelPolicy.restrictions])],
        requiresScreening: policy.requiresScreening || levelPolicy.requiresScreening
      };
    }, this.DEFAULT_POLICIES[room.careLevels[0]]);
  }

  static validateVisitorSchedule(
    room: Room,
    schedule: VisitorSchedule
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    const policy = this.getVisitorPolicy(room);

    // Check visitor count
    if (schedule.visitorCount > policy.maxVisitors) {
      issues.push(`Exceeds maximum visitor limit of ${policy.maxVisitors}`);
    }

    // Check timing
    const scheduleStart = schedule.startTime.getHours() * 60 + 
                         schedule.startTime.getMinutes();
    const scheduleEnd = schedule.endTime.getHours() * 60 + 
                       schedule.endTime.getMinutes();
    const policyStart = parseInt(policy.allowedTimes.start.split(':')[0]) * 60 +
                       parseInt(policy.allowedTimes.start.split(':')[1]);
    const policyEnd = parseInt(policy.allowedTimes.end.split(':')[0]) * 60 +
                     parseInt(policy.allowedTimes.end.split(':')[1]);

    if (scheduleStart < policyStart || scheduleEnd > policyEnd) {
      issues.push(`Visit time outside allowed hours (${policy.allowedTimes.start} - ${policy.allowedTimes.end})`);
    }

    // Check screening requirement
    if (policy.requiresScreening && !schedule.screened) {
      issues.push('Health screening required before visit');
    }

    // Room specific checks
    if (room.status === 'ISOLATION') {
      issues.push('Room is under isolation protocols - special approval required');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  static getVisitorInstructions(room: Room): string[] {
    const policy = this.getVisitorPolicy(room);
    const instructions = [
      `Maximum ${policy.maxVisitors} visitors allowed`,
      `Visiting hours: ${policy.allowedTimes.start} - ${policy.allowedTimes.end}`,
      ...policy.restrictions
    ];

    if (policy.requiresScreening) {
      instructions.unshift('Health screening required at check-in');
    }

    // Room specific instructions
    if (room.type === RoomType.RESIDENT_SHARED) {
      instructions.push('Please be mindful of other resident\'s privacy');
    }

    // Care level specific instructions
    if (room.careLevels.includes(CareLevel.MEMORY_CARE)) {
      instructions.push(
        'Please avoid overwhelming the resident',
        'Maintain familiar routines',
        'Staff available to assist with communication'
      );
    }

    if (room.careLevels.includes(CareLevel.SKILLED_NURSING)) {
      instructions.push(
        'Hand hygiene required',
        'Check with nursing staff before bringing food/drinks'
      );
    }

    return instructions;
  }

  static calculateVisitorCapacity(rooms: Room[]): {
    current: number;
    maximum: number;
    availableRooms: Room[];
  } {
    let currentVisitors = 0;
    let maximumCapacity = 0;
    const availableRooms: Room[] = [];

    rooms.forEach(room => {
      if (room.type === RoomType.RESIDENT_SINGLE || 
          room.type === RoomType.RESIDENT_SHARED) {
        const policy = this.getVisitorPolicy(room);
        maximumCapacity += policy.maxVisitors;

        if (room.status !== 'ISOLATION' && room.status !== 'OUT_OF_SERVICE') {
          availableRooms.push(room);
        }
      }
    });

    return {
      current: currentVisitors,
      maximum: maximumCapacity,
      availableRooms
    };
  }
}


