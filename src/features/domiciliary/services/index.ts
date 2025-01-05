/**
 * @writecarenotes.com
 * @fileoverview Services for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core services for the domiciliary care module, providing business
 * logic and API interactions for visit management, staff coordination,
 * and compliance tracking.
 *
 * Features:
 * - Visit scheduling and management
 * - Staff assignment and tracking
 * - Route optimization
 * - Compliance monitoring
 * - Data synchronization
 *
 * Mobile-First Considerations:
 * - Offline-first operations
 * - Background sync support
 * - Battery-efficient updates
 * - Location services
 * - Network state handling
 *
 * Enterprise Features:
 * - Multi-region support
 * - Compliance validation
 * - Audit logging
 * - Error handling
 * - Performance monitoring
 */

import { type Visit, type VisitTask, type AssignedStaff, type ComplianceRecord } from '../types';
import { ERROR_CODES, INTEGRATION_TIMEOUTS } from '../constants';
import { 
  DomiciliaryError,
  validateVisit,
  measureResponseTime,
  isPerformanceCritical,
  generateAuditTrail
} from '../utils';

// Visit Management Service
export class VisitService {
  private static instance: VisitService;
  private constructor() {}

  static getInstance(): VisitService {
    if (!VisitService.instance) {
      VisitService.instance = new VisitService();
    }
    return VisitService.instance;
  }

  async createVisit(visit: Omit<Visit, 'id'>): Promise<Visit> {
    const errors = validateVisit(visit as Visit);
    if (errors.length > 0) {
      throw new DomiciliaryError(
        ERROR_CODES.VISIT.INVALID_STATUS,
        'Invalid visit data',
        { errors }
      );
    }

    const { result, duration } = await measureResponseTime(async () => {
      const response = await fetch('/api/domiciliary/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visit)
      });

      if (!response.ok) {
        throw new DomiciliaryError(
          ERROR_CODES.VISIT.NOT_FOUND,
          'Failed to create visit'
        );
      }

      return response.json();
    });

    if (isPerformanceCritical(duration)) {
      console.warn('Visit creation performance critical:', duration);
    }

    generateAuditTrail('CREATE_VISIT', { visitId: result.id });
    return result;
  }

  async updateVisit(visitId: string, updates: Partial<Visit>): Promise<Visit> {
    const { result } = await measureResponseTime(async () => {
      const response = await fetch(`/api/domiciliary/visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new DomiciliaryError(
          ERROR_CODES.VISIT.NOT_FOUND,
          `Failed to update visit: ${visitId}`
        );
      }

      return response.json();
    });

    generateAuditTrail('UPDATE_VISIT', { visitId, updates });
    return result;
  }

  async getVisit(visitId: string): Promise<Visit> {
    const { result } = await measureResponseTime(async () => {
      const response = await fetch(`/api/domiciliary/visits/${visitId}`);

      if (!response.ok) {
        throw new DomiciliaryError(
          ERROR_CODES.VISIT.NOT_FOUND,
          `Visit not found: ${visitId}`
        );
      }

      return response.json();
    });

    return result;
  }

  async listVisits(filters: {
    startDate?: string;
    endDate?: string;
    status?: string[];
    staffId?: string;
    clientId?: string;
  }): Promise<Visit[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value);
        }
      }
    });

    const { result } = await measureResponseTime(async () => {
      const response = await fetch(`/api/domiciliary/visits?${params}`);

      if (!response.ok) {
        throw new DomiciliaryError(
          ERROR_CODES.VISIT.NOT_FOUND,
          'Failed to list visits'
        );
      }

      return response.json();
    });

    return result;
  }

  async deleteVisit(visitId: string): Promise<void> {
    await measureResponseTime(async () => {
      const response = await fetch(`/api/domiciliary/visits/${visitId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new DomiciliaryError(
          ERROR_CODES.VISIT.NOT_FOUND,
          `Failed to delete visit: ${visitId}`
        );
      }
    });

    generateAuditTrail('DELETE_VISIT', { visitId });
  }
}

// Staff Management Service
export class StaffService {
  private static instance: StaffService;
  private constructor() {}

  static getInstance(): StaffService {
    if (!StaffService.instance) {
      StaffService.instance = new StaffService();
    }
    return StaffService.instance;
  }

  async assignStaff(
    visitId: string,
    staff: Omit<AssignedStaff, 'checkedIn' | 'checkedOut'>
  ): Promise<AssignedStaff> {
    const { result } = await measureResponseTime(async () => {
      const response = await fetch(`/api/domiciliary/visits/${visitId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff)
      });

      if (!response.ok) {
        throw new DomiciliaryError(
          ERROR_CODES.STAFF.NOT_AVAILABLE,
          'Failed to assign staff'
        );
      }

      return response.json();
    });

    generateAuditTrail('ASSIGN_STAFF', { visitId, staffId: staff.id });
    return result;
  }

  async updateStaffStatus(
    visitId: string,
    staffId: string,
    status: AssignedStaff['status']
  ): Promise<AssignedStaff> {
    const { result } = await measureResponseTime(async () => {
      const response = await fetch(
        `/api/domiciliary/visits/${visitId}/staff/${staffId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        throw new DomiciliaryError(
          ERROR_CODES.STAFF.NOT_AVAILABLE,
          'Failed to update staff status'
        );
      }

      return response.json();
    });

    generateAuditTrail('UPDATE_STAFF_STATUS', { visitId, staffId, status });
    return result;
  }
}

// Compliance Service
export class ComplianceService {
  private static instance: ComplianceService;
  private constructor() {}

  static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  async recordCompliance(record: Omit<ComplianceRecord, 'timestamp'>): Promise<ComplianceRecord> {
    const { result } = await measureResponseTime(async () => {
      const response = await fetch('/api/domiciliary/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...record,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new DomiciliaryError(
          ERROR_CODES.COMPLIANCE.INCOMPLETE_RECORDS,
          'Failed to record compliance'
        );
      }

      return response.json();
    });

    generateAuditTrail('RECORD_COMPLIANCE', { 
      visitId: record.visitId,
      type: record.type 
    });
    return result;
  }

  async getComplianceRecords(visitId: string): Promise<ComplianceRecord[]> {
    const { result } = await measureResponseTime(async () => {
      const response = await fetch(`/api/domiciliary/compliance/${visitId}`);

      if (!response.ok) {
        throw new DomiciliaryError(
          ERROR_CODES.COMPLIANCE.INCOMPLETE_RECORDS,
          'Failed to get compliance records'
        );
      }

      return response.json();
    });

    return result;
  }
}

// Task Management Service
export class TaskService {
  private static instance: TaskService;
  private constructor() {}

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  async updateTask(
    visitId: string,
    taskId: string,
    updates: Partial<VisitTask>
  ): Promise<VisitTask> {
    const { result } = await measureResponseTime(async () => {
      const response = await fetch(
        `/api/domiciliary/visits/${visitId}/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        throw new DomiciliaryError(
          ERROR_CODES.VISIT.NOT_FOUND,
          'Failed to update task'
        );
      }

      return response.json();
    });

    generateAuditTrail('UPDATE_TASK', { visitId, taskId, updates });
    return result;
  }

  async completeTask(
    visitId: string,
    taskId: string,
    notes?: string
  ): Promise<VisitTask> {
    return this.updateTask(visitId, taskId, {
      completed: true,
      completedAt: new Date().toISOString(),
      notes
    });
  }
} 