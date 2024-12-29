import { HandoverTask, HandoverSession, Staff } from '../../types/handover';

export const mockStaff: Staff = {
  id: 'staff-1',
  name: 'John Doe',
  role: 'Nurse',
  email: 'john@example.com',
  shifts: [],
  preferences: {},
};

export const mockTask: HandoverTask = {
  id: 'task-1',
  title: 'Check vital signs',
  description: 'Monitor and record patient vital signs',
  status: 'PENDING',
  priority: 'HIGH',
  assignedTo: mockStaff,
  dueDate: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  attachments: [],
  comments: [],
};

export const mockSession: HandoverSession = {
  id: 'session-1',
  shift: {
    id: 'shift-1',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    staff: [mockStaff],
    type: 'DAY',
  },
  tasks: [mockTask],
  notes: [],
  status: 'IN_PROGRESS',
  qualityChecks: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function createMockTask(overrides?: Partial<HandoverTask>): HandoverTask {
  return {
    ...mockTask,
    id: `task-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides,
  };
}

export function createMockSession(overrides?: Partial<HandoverSession>): HandoverSession {
  return {
    ...mockSession,
    id: `session-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides,
  };
}

export function createMockStaff(overrides?: Partial<Staff>): Staff {
  return {
    ...mockStaff,
    id: `staff-${Math.random().toString(36).substr(2, 9)}`,
    ...overrides,
  };
}
