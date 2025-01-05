/**
 * @writecarenotes.com
 * @fileoverview Tests for Schedule Repository
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { prisma } from '../../../../../src/lib/prisma';
import { ScheduleRepository } from '../ScheduleRepository';
import { Schedule, ScheduleStatus, ScheduleType } from '../../types';

// Mock Prisma client
jest.mock('../../../../../src/lib/prisma', () => ({
  prisma: {
    onCallSchedule: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback()),
  },
}));

describe('ScheduleRepository', () => {
  let repository: ScheduleRepository;
  const mockSchedule: Schedule = {
    id: '1',
    staffId: 'staff_1',
    type: 'regular' as ScheduleType,
    status: 'active' as ScheduleStatus,
    startTime: new Date('2024-03-21T09:00:00Z'),
    endTime: new Date('2024-03-21T17:00:00Z'),
    organizationId: 'org_1',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repository = ScheduleRepository.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = ScheduleRepository.getInstance();
      const instance2 = ScheduleRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createSchedule', () => {
    it('should create a schedule record', async () => {
      const { id, createdAt, updatedAt, ...createData } = mockSchedule;
      (prisma.onCallSchedule.create as jest.Mock).mockResolvedValue(mockSchedule);

      const result = await repository.createSchedule(createData);

      expect(prisma.onCallSchedule.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockSchedule);
    });

    it('should validate time range', async () => {
      const { id, createdAt, updatedAt, ...createData } = mockSchedule;
      const invalidData = {
        ...createData,
        startTime: new Date('2024-03-21T17:00:00Z'),
        endTime: new Date('2024-03-21T09:00:00Z'),
      };

      await expect(repository.createSchedule(invalidData)).rejects.toThrow(
        'End time must be after start time'
      );
    });
  });

  describe('updateSchedule', () => {
    it('should update a schedule record', async () => {
      const updates = { status: 'completed' as ScheduleStatus };
      const updatedSchedule = { ...mockSchedule, ...updates };
      (prisma.onCallSchedule.update as jest.Mock).mockResolvedValue(updatedSchedule);

      const result = await repository.updateSchedule(mockSchedule.id, updates);

      expect(prisma.onCallSchedule.update).toHaveBeenCalledWith({
        where: { id: mockSchedule.id },
        data: {
          ...updates,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedSchedule);
    });
  });

  describe('getScheduleById', () => {
    it('should find schedule by id', async () => {
      (prisma.onCallSchedule.findUnique as jest.Mock).mockResolvedValue(mockSchedule);

      const result = await repository.getScheduleById(mockSchedule.id);

      expect(prisma.onCallSchedule.findUnique).toHaveBeenCalledWith({
        where: { id: mockSchedule.id },
      });
      expect(result).toEqual(mockSchedule);
    });

    it('should return null if schedule not found', async () => {
      (prisma.onCallSchedule.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getScheduleById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('listSchedules', () => {
    it('should list schedules with filters', async () => {
      const filters = {
        staffId: 'staff_1',
        status: 'active' as ScheduleStatus,
      };
      const schedules = [mockSchedule];
      (prisma.onCallSchedule.findMany as jest.Mock).mockResolvedValue(schedules);

      const result = await repository.listSchedules(filters);

      expect(prisma.onCallSchedule.findMany).toHaveBeenCalledWith({
        where: filters,
        orderBy: { startTime: 'asc' },
      });
      expect(result).toEqual(schedules);
    });

    it('should apply date range filters', async () => {
      const startDate = new Date('2024-03-21');
      const endDate = new Date('2024-03-22');
      const filters = {
        staffId: 'staff_1',
        startDate,
        endDate,
      };
      const schedules = [mockSchedule];
      (prisma.onCallSchedule.findMany as jest.Mock).mockResolvedValue(schedules);

      const result = await repository.listSchedules(filters);

      expect(prisma.onCallSchedule.findMany).toHaveBeenCalledWith({
        where: {
          staffId: 'staff_1',
          AND: [
            { startTime: { gte: startDate } },
            { endTime: { lte: endDate } },
          ],
        },
        orderBy: { startTime: 'asc' },
      });
      expect(result).toEqual(schedules);
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule record', async () => {
      await repository.deleteSchedule(mockSchedule.id);

      expect(prisma.onCallSchedule.delete).toHaveBeenCalledWith({
        where: { id: mockSchedule.id },
      });
    });
  });

  describe('getActiveSchedulesByStaff', () => {
    it('should get active schedules for staff member', async () => {
      const staffId = 'staff_1';
      const now = new Date();
      const activeSchedules = [mockSchedule];
      (prisma.onCallSchedule.findMany as jest.Mock).mockResolvedValue(activeSchedules);

      const result = await repository.getActiveSchedulesByStaff(staffId);

      expect(prisma.onCallSchedule.findMany).toHaveBeenCalledWith({
        where: {
          staffId,
          status: 'active',
          startTime: { lte: expect.any(Date) },
          endTime: { gte: expect.any(Date) },
        },
        orderBy: { startTime: 'asc' },
      });
      expect(result).toEqual(activeSchedules);
    });
  });

  describe('getOverlappingSchedules', () => {
    it('should find overlapping schedules', async () => {
      const startTime = new Date('2024-03-21T08:00:00Z');
      const endTime = new Date('2024-03-21T16:00:00Z');
      const overlappingSchedules = [mockSchedule];
      (prisma.onCallSchedule.findMany as jest.Mock).mockResolvedValue(overlappingSchedules);

      const result = await repository.getOverlappingSchedules(startTime, endTime, 'staff_1');

      expect(prisma.onCallSchedule.findMany).toHaveBeenCalledWith({
        where: {
          staffId: 'staff_1',
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });
      expect(result).toEqual(overlappingSchedules);
    });
  });
}); 