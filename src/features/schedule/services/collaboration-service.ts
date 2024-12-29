import { Staff } from '../types/handover';
import { EventEmitter } from 'events';

export interface CollaborationEvent {
  id: string;
  type: CollaborationEventType;
  sessionId: string;
  actor: Staff;
  timestamp: Date;
  data: any;
}

export type CollaborationEventType =
  | 'USER_JOINED'
  | 'USER_LEFT'
  | 'TASK_UPDATED'
  | 'NOTE_ADDED'
  | 'DOCUMENT_UPLOADED'
  | 'QUALITY_CHECK_UPDATED'
  | 'CURSOR_MOVED'
  | 'SELECTION_CHANGED';

export interface CollaborationUser {
  staff: Staff;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  lastActivity: Date;
  cursor?: {
    position: { x: number; y: number };
    element?: string;
  };
  selection?: {
    start: number;
    end: number;
    element: string;
  };
}

export class CollaborationService {
  private static instance: CollaborationService;
  private eventEmitter: EventEmitter;
  private activeUsers: Map<string, CollaborationUser>;
  private sessionSubscriptions: Map<string, Set<string>>;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.activeUsers = new Map();
    this.sessionSubscriptions = new Map();
  }

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  async joinSession(sessionId: string, staff: Staff): Promise<void> {
    const user: CollaborationUser = {
      staff,
      status: 'ONLINE',
      lastActivity: new Date(),
    };

    this.activeUsers.set(staff.id, user);
    
    if (!this.sessionSubscriptions.has(sessionId)) {
      this.sessionSubscriptions.set(sessionId, new Set());
    }
    this.sessionSubscriptions.get(sessionId)?.add(staff.id);

    await this.broadcastEvent({
      id: crypto.randomUUID(),
      type: 'USER_JOINED',
      sessionId,
      actor: staff,
      timestamp: new Date(),
      data: { user },
    });
  }

  async leaveSession(sessionId: string, staff: Staff): Promise<void> {
    this.activeUsers.delete(staff.id);
    this.sessionSubscriptions.get(sessionId)?.delete(staff.id);

    await this.broadcastEvent({
      id: crypto.randomUUID(),
      type: 'USER_LEFT',
      sessionId,
      actor: staff,
      timestamp: new Date(),
      data: { userId: staff.id },
    });
  }

  async updateUserStatus(
    staff: Staff,
    status: CollaborationUser['status']
  ): Promise<void> {
    const user = this.activeUsers.get(staff.id);
    if (user) {
      user.status = status;
      user.lastActivity = new Date();
      this.activeUsers.set(staff.id, user);
    }
  }

  async updateCursor(
    sessionId: string,
    staff: Staff,
    position: { x: number; y: number },
    element?: string
  ): Promise<void> {
    const user = this.activeUsers.get(staff.id);
    if (user) {
      user.cursor = { position, element };
      user.lastActivity = new Date();
      this.activeUsers.set(staff.id, user);

      await this.broadcastEvent({
        id: crypto.randomUUID(),
        type: 'CURSOR_MOVED',
        sessionId,
        actor: staff,
        timestamp: new Date(),
        data: { cursor: user.cursor },
      });
    }
  }

  async updateSelection(
    sessionId: string,
    staff: Staff,
    selection: CollaborationUser['selection']
  ): Promise<void> {
    const user = this.activeUsers.get(staff.id);
    if (user) {
      user.selection = selection;
      user.lastActivity = new Date();
      this.activeUsers.set(staff.id, user);

      await this.broadcastEvent({
        id: crypto.randomUUID(),
        type: 'SELECTION_CHANGED',
        sessionId,
        actor: staff,
        timestamp: new Date(),
        data: { selection },
      });
    }
  }

  getActiveUsers(sessionId: string): CollaborationUser[] {
    const userIds = this.sessionSubscriptions.get(sessionId) || new Set();
    return Array.from(userIds)
      .map(id => this.activeUsers.get(id))
      .filter((user): user is CollaborationUser => user !== undefined);
  }

  subscribeToEvents(
    sessionId: string,
    callback: (event: CollaborationEvent) => void
  ): () => void {
    const handler = (event: CollaborationEvent) => {
      if (event.sessionId === sessionId) {
        callback(event);
      }
    };

    this.eventEmitter.on('collaboration-event', handler);
    return () => {
      this.eventEmitter.off('collaboration-event', handler);
    };
  }

  private async broadcastEvent(event: CollaborationEvent): Promise<void> {
    this.eventEmitter.emit('collaboration-event', event);
  }

  // Periodic cleanup of inactive users
  private async cleanupInactiveUsers(): Promise<void> {
    const inactivityThreshold = 5 * 60 * 1000; // 5 minutes
    const now = new Date();

    for (const [userId, user] of this.activeUsers.entries()) {
      if (now.getTime() - user.lastActivity.getTime() > inactivityThreshold) {
        this.activeUsers.delete(userId);
        // Remove from all session subscriptions
        for (const [sessionId, users] of this.sessionSubscriptions.entries()) {
          if (users.has(userId)) {
            users.delete(userId);
            await this.broadcastEvent({
              id: crypto.randomUUID(),
              type: 'USER_LEFT',
              sessionId,
              actor: user.staff,
              timestamp: now,
              data: { userId, reason: 'INACTIVITY' },
            });
          }
        }
      }
    }
  }
}
