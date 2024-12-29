import { HandoverSession, HandoverTask, Staff } from '../types/handover';
import { ComplianceService } from './compliance-service';
import { HandoverSecurity } from './handover-security';
import { TenantService } from './tenant-service';

export class HandoverSessionService {
  private complianceService: ComplianceService;
  private security: HandoverSecurity;
  private tenantService: TenantService;

  constructor() {
    this.complianceService = new ComplianceService();
    this.security = new HandoverSecurity();
    this.tenantService = new TenantService();
  }

  async createSession(data: {
    shiftType: 'DAY' | 'NIGHT';
    startTime: Date;
    endTime: Date;
    department: string;
    outgoingStaff: Staff[];
    incomingStaff: Staff[];
  }): Promise<HandoverSession> {
    await this.validateSessionCreation(data);

    const session: HandoverSession = {
      id: crypto.randomUUID(),
      shiftType: data.shiftType,
      startTime: data.startTime,
      endTime: data.endTime,
      department: data.department,
      outgoingStaff: data.outgoingStaff,
      incomingStaff: data.incomingStaff,
      status: 'IN_PROGRESS',
      tasks: [],
      qualityChecks: [],
      attachments: [],
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.security.validateSessionAccess(session, 'CREATE');
    await this.complianceService.validateSession(session);
    
    return session;
  }

  async updateSession(sessionId: string, updates: Partial<HandoverSession>): Promise<HandoverSession> {
    const session = await this.getSession(sessionId);
    await this.security.validateSessionAccess(session, 'UPDATE');

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };

    await this.complianceService.validateSession(updatedSession);
    
    return updatedSession;
  }

  async addTask(sessionId: string, task: Omit<HandoverTask, 'id'>): Promise<HandoverTask> {
    const session = await this.getSession(sessionId);
    await this.security.validateSessionAccess(session, 'UPDATE');

    const newTask: HandoverTask = {
      id: crypto.randomUUID(),
      ...task,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.complianceService.validateTask(newTask);
    session.tasks.push(newTask);

    return newTask;
  }

  async updateTask(sessionId: string, taskId: string, updates: Partial<HandoverTask>): Promise<HandoverTask> {
    const session = await this.getSession(sessionId);
    const taskIndex = session.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    await this.security.validateTaskAccess(session.tasks[taskIndex], 'UPDATE');

    const updatedTask = {
      ...session.tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };

    await this.complianceService.validateTask(updatedTask);
    session.tasks[taskIndex] = updatedTask;

    return updatedTask;
  }

  async addQualityCheck(sessionId: string, check: {
    type: string;
    description: string;
    status: 'PASSED' | 'FAILED' | 'PENDING';
    checkedBy: Staff;
  }): Promise<void> {
    const session = await this.getSession(sessionId);
    await this.security.validateSessionAccess(session, 'UPDATE');

    session.qualityChecks.push({
      id: crypto.randomUUID(),
      ...check,
      timestamp: new Date(),
    });
  }

  async addAttachment(sessionId: string, attachment: {
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedBy: Staff;
  }): Promise<void> {
    const session = await this.getSession(sessionId);
    await this.security.validateSessionAccess(session, 'UPDATE');

    session.attachments.push({
      id: crypto.randomUUID(),
      ...attachment,
      uploadedAt: new Date(),
    });
  }

  async addNote(sessionId: string, note: {
    content: string;
    author: Staff;
    category?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  }): Promise<void> {
    const session = await this.getSession(sessionId);
    await this.security.validateSessionAccess(session, 'UPDATE');

    session.notes.push({
      id: crypto.randomUUID(),
      ...note,
      timestamp: new Date(),
    });
  }

  async completeSession(sessionId: string): Promise<HandoverSession> {
    const session = await this.getSession(sessionId);
    await this.security.validateSessionAccess(session, 'UPDATE');

    // Ensure all required tasks are completed
    const incompleteTasks = session.tasks.filter(t => t.status !== 'COMPLETED');
    if (incompleteTasks.length > 0) {
      throw new Error('Cannot complete session with incomplete tasks');
    }

    // Ensure all quality checks are passed
    const failedChecks = session.qualityChecks.filter(c => c.status === 'FAILED');
    if (failedChecks.length > 0) {
      throw new Error('Cannot complete session with failed quality checks');
    }

    const completedSession = {
      ...session,
      status: 'COMPLETED' as const,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    await this.complianceService.validateSessionCompletion(completedSession);
    
    return completedSession;
  }

  private async validateSessionCreation(data: {
    shiftType: string;
    startTime: Date;
    endTime: Date;
    department: string;
    outgoingStaff: Staff[];
    incomingStaff: Staff[];
  }): Promise<void> {
    // Validate shift times
    if (data.startTime >= data.endTime) {
      throw new Error('Start time must be before end time');
    }

    // Validate staff assignments
    if (data.outgoingStaff.length === 0 || data.incomingStaff.length === 0) {
      throw new Error('Both outgoing and incoming staff must be assigned');
    }

    // Validate department exists
    const departments = await this.tenantService.getDepartments();
    if (!departments.includes(data.department)) {
      throw new Error('Invalid department');
    }
  }

  private async getSession(sessionId: string): Promise<HandoverSession> {
    // Implementation would fetch from database
    // This is a placeholder
    throw new Error('Not implemented');
  }
}
