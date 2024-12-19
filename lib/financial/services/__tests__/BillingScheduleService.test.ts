import { PrismaClient } from '@prisma/client';
import { BillingScheduleService } from '../BillingScheduleService';
import { FinancialError } from '../../utils/errors';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

jest.mock('@prisma/client');

describe('BillingScheduleService', () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let service: BillingScheduleService;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    service = new BillingScheduleService(prisma);
  });

  afterEach(() => {
    mockReset(prisma);
  });

  describe('createSchedule', () => {
    const mockSchedule = {
      id: '1',
      tenantId: 'tenant1',
      residentId: 'resident1',
      scheduleType: 'ROOM_RATE',
      frequency: 'MONTHLY',
      dayOfMonth: 1,
      nextRun: new Date('2024-01-01'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a monthly schedule successfully', async () => {
      prisma.billingSchedule.create.mockResolvedValue(mockSchedule);

      const result = await service.createSchedule('tenant1', {
        residentId: 'resident1',
        scheduleType: 'ROOM_RATE',
        frequency: 'MONTHLY',
        dayOfMonth: 1,
        nextRun: new Date('2024-01-01'),
        isActive: true,
      });

      expect(result).toEqual(mockSchedule);
      expect(prisma.billingSchedule.create).toHaveBeenCalledWith({
        data: expect.any(Object),
      });
    });

    it('should throw error when creating schedule with invalid parameters', async () => {
      await expect(
        service.createSchedule('tenant1', {
          residentId: 'resident1',
          scheduleType: 'ROOM_RATE',
          frequency: 'MONTHLY',
          dayOfWeek: 1, // Invalid for monthly schedule
          nextRun: new Date('2024-01-01'),
          isActive: true,
        })
      ).rejects.toThrow();
    });
  });

  describe('updateSchedule', () => {
    const mockSchedule = {
      id: '1',
      tenantId: 'tenant1',
      residentId: 'resident1',
      scheduleType: 'ROOM_RATE',
      frequency: 'WEEKLY',
      dayOfWeek: 1,
      nextRun: new Date('2024-01-01'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update schedule successfully', async () => {
      prisma.billingSchedule.update.mockResolvedValue({
        ...mockSchedule,
        dayOfWeek: 2,
      });

      const result = await service.updateSchedule('1', {
        dayOfWeek: 2,
      });

      expect(result.dayOfWeek).toBe(2);
      expect(prisma.billingSchedule.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.any(Object),
      });
    });

    it('should throw error when updating with invalid frequency parameters', async () => {
      await expect(
        service.updateSchedule('1', {
          frequency: 'MONTHLY',
          dayOfWeek: 1, // Invalid for monthly schedule
        })
      ).rejects.toThrow();
    });
  });

  describe('calculateNextRunDate', () => {
    it('should calculate next run date for weekly schedule', () => {
      const baseDate = new Date('2024-01-01'); // Tuesday
      const result = service.calculateNextRunDate('WEEKLY', undefined, 4, baseDate); // Thursday

      expect(result.getDay()).toBe(4); // Should be Thursday
      expect(result.getTime()).toBeGreaterThan(baseDate.getTime());
    });

    it('should calculate next run date for monthly schedule', () => {
      const baseDate = new Date('2024-01-15');
      const result = service.calculateNextRunDate('MONTHLY', 10, undefined, baseDate);

      expect(result.getDate()).toBe(10);
      expect(result.getMonth()).toBe(1); // February
    });

    it('should calculate next run date for quarterly schedule', () => {
      const baseDate = new Date('2024-01-15');
      const result = service.calculateNextRunDate('QUARTERLY', 10, undefined, baseDate);

      expect(result.getDate()).toBe(10);
      expect(result.getMonth()).toBe(3); // April
    });

    it('should calculate next run date for annual schedule', () => {
      const baseDate = new Date('2024-01-15');
      const result = service.calculateNextRunDate('ANNUALLY', 10, undefined, baseDate);

      expect(result.getDate()).toBe(10);
      expect(result.getFullYear()).toBe(2025);
    });

    it('should handle month end dates correctly', () => {
      const baseDate = new Date('2024-01-31');
      const result = service.calculateNextRunDate('MONTHLY', 31, undefined, baseDate);

      // February should return the 29th (2024 is a leap year)
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(29);
    });

    it('should throw error for invalid frequency', () => {
      expect(() => {
        service.calculateNextRunDate('INVALID' as any, 1, undefined);
      }).toThrow();
    });
  });

  describe('getDueSchedules', () => {
    const mockSchedules = [
      {
        id: '1',
        nextRun: new Date('2024-01-01'),
        isActive: true,
      },
      {
        id: '2',
        nextRun: new Date('2024-02-01'),
        isActive: true,
      },
    ];

    it('should return schedules due for processing', async () => {
      prisma.billingSchedule.findMany.mockResolvedValue(mockSchedules);

      const result = await service.getDueSchedules(new Date('2024-01-15'));

      expect(result).toEqual(mockSchedules);
      expect(prisma.billingSchedule.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        orderBy: { nextRun: 'asc' },
      });
    });
  });

  describe('updateNextRunDate', () => {
    const mockSchedule = {
      id: '1',
      frequency: 'MONTHLY',
      dayOfMonth: 15,
      nextRun: new Date('2024-01-15'),
    };

    it('should update next run date successfully', async () => {
      prisma.billingSchedule.findUnique.mockResolvedValue(mockSchedule);
      prisma.billingSchedule.update.mockResolvedValue({
        ...mockSchedule,
        lastRun: new Date(),
        nextRun: new Date('2024-02-15'),
      });

      const result = await service.updateNextRunDate('1');

      expect(result.nextRun.getMonth()).toBe(1); // February
      expect(result.nextRun.getDate()).toBe(15);
      expect(prisma.billingSchedule.update).toHaveBeenCalled();
    });

    it('should throw error when schedule not found', async () => {
      prisma.billingSchedule.findUnique.mockResolvedValue(null);

      await expect(service.updateNextRunDate('1')).rejects.toThrow();
    });
  });
});
