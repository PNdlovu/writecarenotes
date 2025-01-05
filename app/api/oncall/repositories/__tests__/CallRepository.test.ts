/**
 * @writecarenotes.com
 * @fileoverview Tests for Call Repository
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { prisma } from '../../../../../src/lib/prisma';
import { CallRepository } from '../CallRepository';
import { Call, CallStatus, Region } from '../../types';

// Mock Prisma client
jest.mock('../../../../../src/lib/prisma', () => ({
  prisma: {
    onCallCall: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback()),
  },
}));

describe('CallRepository', () => {
  let repository: CallRepository;
  const mockCall: Call = {
    id: '1',
    phoneNumber: '+447700900000',
    region: 'england',
    priority: 'normal',
    status: 'pending',
    startTime: new Date(),
    organizationId: 'org_1',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repository = CallRepository.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = CallRepository.getInstance();
      const instance2 = CallRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createCall', () => {
    it('should create a call record', async () => {
      const { id, createdAt, updatedAt, ...createData } = mockCall;
      (prisma.onCallCall.create as jest.Mock).mockResolvedValue(mockCall);

      const result = await repository.createCall(createData);

      expect(prisma.onCallCall.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockCall);
    });
  });

  describe('updateCall', () => {
    it('should update a call record', async () => {
      const updates = { status: 'active' as CallStatus };
      const updatedCall = { ...mockCall, ...updates };
      (prisma.onCallCall.update as jest.Mock).mockResolvedValue(updatedCall);

      const result = await repository.updateCall(mockCall.id, updates);

      expect(prisma.onCallCall.update).toHaveBeenCalledWith({
        where: { id: mockCall.id },
        data: {
          ...updates,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedCall);
    });
  });

  describe('getCallById', () => {
    it('should find call by id', async () => {
      (prisma.onCallCall.findUnique as jest.Mock).mockResolvedValue(mockCall);

      const result = await repository.getCallById(mockCall.id);

      expect(prisma.onCallCall.findUnique).toHaveBeenCalledWith({
        where: { id: mockCall.id },
      });
      expect(result).toEqual(mockCall);
    });

    it('should return null if call not found', async () => {
      (prisma.onCallCall.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getCallById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('listCalls', () => {
    it('should list calls with filters', async () => {
      const filters = {
        region: 'england' as Region,
        status: 'pending' as CallStatus,
      };
      const calls = [mockCall];
      (prisma.onCallCall.findMany as jest.Mock).mockResolvedValue(calls);

      const result = await repository.listCalls(filters);

      expect(prisma.onCallCall.findMany).toHaveBeenCalledWith({
        where: filters,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(calls);
    });

    it('should apply date range filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const filters = {
        region: 'england' as Region,
        startDate,
        endDate,
      };
      const calls = [mockCall];
      (prisma.onCallCall.findMany as jest.Mock).mockResolvedValue(calls);

      const result = await repository.listCalls(filters);

      expect(prisma.onCallCall.findMany).toHaveBeenCalledWith({
        where: {
          region: 'england',
          AND: [
            { startTime: { gte: startDate } },
            { endTime: { lte: endDate } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(calls);
    });
  });

  describe('deleteCall', () => {
    it('should delete a call record', async () => {
      await repository.deleteCall(mockCall.id);

      expect(prisma.onCallCall.delete).toHaveBeenCalledWith({
        where: { id: mockCall.id },
      });
    });
  });

  describe('getActiveCallsByStaff', () => {
    it('should get active calls for staff member', async () => {
      const staffId = 'staff_1';
      const activeCalls = [mockCall];
      (prisma.onCallCall.findMany as jest.Mock).mockResolvedValue(activeCalls);

      const result = await repository.getActiveCallsByStaff(staffId);

      expect(prisma.onCallCall.findMany).toHaveBeenCalledWith({
        where: {
          staffId,
          status: 'active',
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(activeCalls);
    });
  });

  describe('getEmergencyCalls', () => {
    it('should get emergency calls for region', async () => {
      const region = 'england' as Region;
      const emergencyCalls = [{ ...mockCall, priority: 'emergency' }];
      (prisma.onCallCall.findMany as jest.Mock).mockResolvedValue(emergencyCalls);

      const result = await repository.getEmergencyCalls(region);

      expect(prisma.onCallCall.findMany).toHaveBeenCalledWith({
        where: {
          region,
          priority: 'emergency',
          status: { not: 'completed' },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(emergencyCalls);
    });
  });
}); 